"""Acorta los silencios largos de una toma y, si hace falta, la acelera un poco (sin cambiar el tono).

uso: python3 scripts/ajustar-voz.py voz-tomas/achird.wav voz-tomas/achird-ajustada.wav --max-pausa 0.42 --tempo 1.06
"""
import argparse
import math
import os
import struct
import subprocess
import wave

p = argparse.ArgumentParser()
p.add_argument("entrada")
p.add_argument("salida")
p.add_argument("--max-pausa", type=float, default=0.42, help="segundos máximos de silencio entre frases")
p.add_argument("--tempo", type=float, default=1.0)
a = p.parse_args()

w = wave.open(a.entrada)
sr, n, ch = w.getframerate(), w.getnframes(), w.getnchannels()
datos = struct.unpack("<%dh" % (n * ch), w.readframes(n))
mono = datos[::ch]

# Energía en bloques de 10 ms.
bloque = sr // 100
rms = []
for i in range(0, len(mono), bloque):
    b = mono[i : i + bloque]
    rms.append(math.sqrt(sum(x * x for x in b) / max(1, len(b))))
pico = max(rms)
umbral = pico * 10 ** (-38 / 20)
silencio = [r < umbral for r in rms]

# Silencios largos → se recortan por el centro dejando max_pausa.
guardar = [True] * len(rms)
i = 0
while i < len(silencio):
    if silencio[i]:
        j = i
        while j < len(silencio) and silencio[j]:
            j += 1
        largo = j - i
        maximo = int(a.max_pausa * 100)
        if largo > maximo and i > 0 and j < len(silencio):
            quitar = largo - maximo
            ini = i + (largo - quitar) // 2
            for k in range(ini, ini + quitar):
                guardar[k] = False
        i = j
    else:
        i += 1

muestras = []
for k, g in enumerate(guardar):
    if g:
        muestras.extend(mono[k * bloque : (k + 1) * bloque])

tmp = a.salida + ".tmp.wav"
o = wave.open(tmp, "wb")
o.setnchannels(1)
o.setsampwidth(2)
o.setframerate(sr)
o.writeframes(struct.pack("<%dh" % len(muestras), *muestras))
o.close()

bin_ = os.path.join(os.path.dirname(__file__), "..", "node_modules", "@remotion", "compositor-linux-x64-gnu")
env = dict(os.environ, LD_LIBRARY_PATH=bin_)
subprocess.run(
    [os.path.join(bin_, "ffmpeg"), "-loglevel", "error", "-y", "-i", tmp, "-af", f"atempo={a.tempo}", a.salida],
    env=env,
    check=True,
)
os.remove(tmp)
print(f"{n / sr:.2f} s → {len(muestras) / sr / a.tempo:.2f} s")
