"""Transcribe una toma de voz con Whisper y guarda el tiempo de cada palabra.

uso: python3 scripts/transcribir.py voz-tomas/toma.wav salida.json
"""
import json
import sys

from faster_whisper import WhisperModel

GUION = (
    "Cuarenta y siete alertas de pisos hoy. Y ninguna es tu casa. "
    "Hasta que el móvil suena distinto. Es Barin. No te mandan alertas. Te llaman. "
    "Y se acuerdan de todo: la luz por la mañana, el cole de los niños y nada de quintos sin ascensor. "
    "Eso no lo sabe un algoritmo. Lo sabe una persona. Llevan cogiendo el teléfono desde el noventa y cuatro. "
    "Cuéntales qué buscas. Ya te llaman ellos. Cuarenta y siete alertas o una llamada."
)

entrada, salida = sys.argv[1], sys.argv[2]
modelo = WhisperModel("small", device="cpu", compute_type="int8")
segmentos, info = modelo.transcribe(
    entrada, language="es", word_timestamps=True, initial_prompt=GUION, vad_filter=False, beam_size=5
)
palabras = []
for s in segmentos:
    for w in s.words:
        palabras.append({"w": w.word.strip(), "ini": round(w.start, 3), "fin": round(w.end, 3)})
json.dump({"duracion": round(info.duration, 3), "palabras": palabras}, open(salida, "w"), ensure_ascii=False, indent=1)
print(" ".join(p["w"] for p in palabras))
print(f"{len(palabras)} palabras, {info.duration:.2f} s")
