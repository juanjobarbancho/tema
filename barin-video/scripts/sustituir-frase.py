"""Sustituye una frase de una toma de voz por la misma frase regenerada aparte (p. ej. para
corregir una pronunciación) sin tocar el resto de la toma.

Localiza por energía dónde empieza y acaba la frase, la cambia por la nueva con el nivel igualado
y conserva exactamente las pausas de antes y de después de la toma original. Si la toma base se aceleró con ajustar-voz.py, pasa el mismo --tempo
para que el recorte nuevo vaya al mismo ritmo.

uso:
  python3 scripts/sustituir-frase.py BASE.wav BASE.json RECORTE.wav RECORTE.json SALIDA.wav \
      --desde es --hasta barin [--tempo 1.1]
(BASE.json y RECORTE.json son los tiempos por palabra de scripts/transcribir.py)
"""
import argparse
import json
import os
import subprocess
import tempfile
import unicodedata
import wave

import numpy as np

p = argparse.ArgumentParser()
for a in ("base", "base_json", "recorte", "recorte_json", "salida"):
    p.add_argument(a)
p.add_argument("--desde", required=True, help="primera palabra de la frase")
p.add_argument("--hasta", required=True, help="última palabra de la frase")
p.add_argument("--tempo", type=float, default=1.0)
a = p.parse_args()

BIN = os.path.join(os.path.dirname(__file__), "..", "node_modules", "@remotion", "compositor-linux-x64-gnu")


def normal(w):
    w = unicodedata.normalize("NFD", w.lower())
    return "".join(c for c in w if c.isalnum() and not unicodedata.combining(c))


def leer(f):
    w = wave.open(f)
    sr, ch = w.getframerate(), w.getnchannels()
    x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768
    return (x.reshape(-1, ch).mean(1) if ch > 1 else x), sr


def tramo(palabras, desde, hasta):
    """Devuelve (fin de la palabra anterior, inicio de la frase, fin de la frase, inicio de la siguiente)."""
    # La frase más corta que acaba en `hasta` (así "es" no casa con otro "es" de más atrás).
    n = [normal(p["w"]) for p in palabras]
    for j in range(len(n)):
        if n[j] == hasta:
            i = next((k for k in range(j, -1, -1) if n[k] == desde), None)
            if i is not None:
                antes = palabras[i - 1]["fin"] if i > 0 else 0.0
                despues = palabras[j + 1]["ini"] if j + 1 < len(palabras) else None
                return antes, palabras[i]["ini"], palabras[j]["fin"], despues
    raise SystemExit(f"No encuentro «{desde} … {hasta}»")


def punto_silencioso(x, sr, ini, fin):
    """Muestra más silenciosa (ventanas de 20 ms) dentro de [ini, fin]."""
    a, b = int(ini * sr), int(fin * sr)
    v = int(0.02 * sr)
    if b - a <= v:
        return (a + b) // 2
    energia = [np.sqrt(np.mean(x[k : k + v] ** 2)) for k in range(a, b - v, v // 4)]
    return a + int(np.argmin(energia)) * (v // 4) + v // 2


def nivel(x, sr):
    v = int(0.02 * sr)
    db = np.array([20 * np.log10(np.sqrt(np.mean(x[k : k + v] ** 2)) + 1e-9) for k in range(0, len(x) - v, v)])
    return np.percentile(db, 90)


base, sr = leer(a.base)
recorte, sr2 = leer(a.recorte)
if sr2 != sr:
    raise SystemExit(f"Frecuencias distintas: {sr} vs {sr2}")

pal_recorte = json.load(open(a.recorte_json))["palabras"]
if a.tempo != 1.0:
    with tempfile.TemporaryDirectory() as tmp:
        salida_tmp = os.path.join(tmp, "r.wav")
        env = dict(os.environ, LD_LIBRARY_PATH=BIN)
        subprocess.run([os.path.join(BIN, "ffmpeg"), "-loglevel", "error", "-y", "-i", a.recorte, "-af", f"atempo={a.tempo}", salida_tmp], env=env, check=True)
        recorte, _ = leer(salida_tmp)
    pal_recorte = [{**q, "ini": q["ini"] / a.tempo, "fin": q["fin"] / a.tempo} for q in pal_recorte]

b_antes, b_ini, b_fin, b_despues = tramo(json.load(open(a.base_json))["palabras"], a.desde, a.hasta)
r_antes, r_ini, r_fin, r_despues = tramo(pal_recorte, a.desde, a.hasta)

# Bordes reales de la voz (por energía): así se conservan las pausas exactas de la toma original.
v10 = int(0.01 * sr)


def db_en(x, k):
    return 20 * np.log10(np.sqrt(np.mean(x[k : k + v10] ** 2)) + 1e-9)


def primer_sonido(x, ini, fin, umbral):
    for k in range(int(ini * sr), int(fin * sr), v10 // 2):
        if db_en(x, k) > umbral:
            return k
    return int(fin * sr)


def ultimo_sonido(x, ini, fin, umbral):
    for k in range(int(fin * sr), int(ini * sr), -(v10 // 2)):
        if db_en(x, k) > umbral:
            return k + v10
    return int(ini * sr)


ub = nivel(base, sr) - 38
ur = nivel(recorte, sr) - 38
c1 = punto_silencioso(base, sr, b_antes, b_ini) / sr
c2 = punto_silencioso(base, sr, b_fin, b_despues) / sr
fin_anterior = ultimo_sonido(base, b_antes - 0.15, c1, ub)  # la voz de antes se apaga aquí
ini_frase = primer_sonido(base, c1, b_ini + 0.15, ub)
fin_frase = ultimo_sonido(base, b_fin - 0.15, c2, ub)
ini_siguiente = primer_sonido(base, c2, b_despues + 0.15, ub)

d1 = punto_silencioso(recorte, sr, r_antes, r_ini) / sr
d2 = punto_silencioso(recorte, sr, r_fin, r_despues if r_despues else len(recorte) / sr) / sr
nuevo_ini = primer_sonido(recorte, d1, r_ini + 0.15, ur)
nuevo_fin = ultimo_sonido(recorte, r_fin - 0.15, d2, ur)

margen = int(0.03 * sr)
nuevo = recorte[nuevo_ini - margen : nuevo_fin + margen].copy()
ganancia = 10 ** ((nivel(base[ini_frase:fin_frase], sr) - nivel(nuevo, sr)) / 20)
nuevo *= ganancia

# Misma pausa antes y después que en la toma original.
pausa_antes = ini_frase - fin_anterior
pausa_despues = ini_siguiente - fin_frase
izq = base[: fin_anterior + margen]
der = base[ini_siguiente - margen :]
hueco1 = np.zeros(max(0, pausa_antes - 2 * margen))
hueco2 = np.zeros(max(0, pausa_despues - 2 * margen))

f = int(0.01 * sr)
rampa = np.linspace(0, 1, f)
nuevo[:f] *= rampa
nuevo[-f:] *= rampa[::-1]
izq = izq.copy()
der = der.copy()
izq[-f:] *= rampa[::-1]
der[:f] *= rampa
salida = np.concatenate([izq, hueco1, nuevo, hueco2, der])

o = wave.open(a.salida, "wb")
o.setnchannels(1)
o.setsampwidth(2)
o.setframerate(sr)
o.writeframes((np.clip(salida, -1, 1) * 32767).astype(np.int16).tobytes())
o.close()
print(
    f"Frase original {ini_frase / sr:.2f}–{fin_frase / sr:.2f} s ({(fin_frase - ini_frase) / sr:.2f} s) → nueva {len(nuevo) / sr - 0.06:.2f} s · "
    f"pausas {pausa_antes / sr:.2f} / {pausa_despues / sr:.2f} s conservadas · ganancia {20 * np.log10(ganancia):+.1f} dB · total {len(salida) / sr:.2f} s"
)
