# Barin · "Te llamamos" — Reel narrado (Remotion)

Reel de ~30 s en 1080×1920 para **Inmobiliaria Barin** (Córdoba, Málaga y Costa del Sol, Sevilla, Murcia).
Sigue el método de los vídeos de historia de Pawer y Weddea: una voz que te lo cuenta como una amiga, el vídeo montado sobre la voz y poco texto en pantalla.

**Idea:** las apps te bombardean con alertas de pisos. En Barin no hacen falta: te llaman, porque saben lo que buscas.

| Archivo | Qué es |
|---|---|
| `out/barin-mujer.mp4` | Versión principal, voz de mujer (Laomedeia) · 29,3 s |
| `out/barin-hombre.mp4` | Versión para test A/B, voz de hombre (Achird) · 30,5 s |
| `out/portada.png` | Portada (lo importante entre y=240 e y=1680) |

## Guion

**OBJETIVO:** notoriedad y confianza (que te guarden y te llamen).
**PALANCA:** identificación ("a mí también me pasa con las alertas") y patrón roto (la alerta que suena es una llamada).
**ÁNGULO:** ninguna app sabe lo que buscas; una persona, sí.

**HOOK (0–3 s)**
- Voz (12 palabras): "Cuarenta y siete alertas de pisos hoy. Y ninguna es tu casa."
- Pantalla: "¿TE SUENA?"
- Fotograma 1: el móvil vibrando mientras le entran notificaciones.

| Seg | Voz | Pantalla | Visual |
|---|---|---|---|
| 0–4 | Hook | ¿TE SUENA? | Notificaciones cada vez más seguidas y el móvil vibrando |
| 4–7 | "Hasta que el móvil suena distinto. Es Barin." | ESTA SÍ. | Las alertas salen de la pantalla. **En el segundo 5,5 entra la llamada de Barin** con su logo. |
| 7–10 | "No te mandan alertas. Te llaman." | TE LLAMAMOS. | Se pulsa "Aceptar", transición en forma de tejado (el chevron del logo) y golpe en "llaman" |
| 10–18 | "Y se acuerdan de todo: la luz por la mañana, el cole de los niños… y nada de quintos sin ascensor. Eso no lo sabe un algoritmo." | SABEMOS LO QUE BUSCAS. | Notas de la llamada escritas a mano. Cada línea se escribe cuando la voz la nombra, y la última ("Que se sientan en casa") no la dice la voz. |
| 18–20 | "Lo sabe una persona." | QUE TE ESCUCHA. | Foto real de sus oficinas |
| 20–23 | "Llevan cogiendo el teléfono desde el noventa y cuatro." | 12 OFICINAS · +50 PROFESIONALES · DESDE 1994 | Pared de chevrones de madera, como la de sus oficinas |
| 23–25,5 | "Cuéntales qué buscas. Ya te llaman ellos." | LA DIFERENCIA ENTRE BUSCAR Y ENCONTRAR. | Cae el logo y aparecen los teléfonos de Córdoba y Málaga |
| 25,5–29,5 | "Cuarenta y siete alertas… o una llamada." | ¿TE SUENA? → ¿CUÁL COGES? | Vuelve el móvil del principio y suena Barin |

- **CTA:** "Cuéntales qué buscas. Ya te llaman ellos."
- **LOOP:** "Cuarenta y siete alertas… o una llamada." enlaza con "Cuarenta y siete alertas de pisos hoy". El último plano es el mismo móvil del fotograma 1.
- **SONIDO:** pulso grave y tenso durante las alertas, parón justo antes de "Te llaman", golpe en "llaman" y música cálida en Re mayor que resuelve cuando cae el logo. Efectos: notificaciones, vibración, tono de llamada propio, bolígrafo y pops.

## Voz: ¿hombre o mujer?

Recomiendo **mujer** para la principal:
- en la foto real de Barin que sale en el vídeo aparecen dos mujeres en su oficina, así que la voz casa con la imagen;
- el mensaje es cercanía y "alguien que te escucha", que es el mismo registro de voz de amiga que usáis en Weddea.

La de hombre está lista para el test A/B: mismo montaje y misma música, solo cambia la voz. Se sube una versión cada vez y se compara el hook rate a las 24–48 h.

**Cómo se hizo**
- Gemini 2.5 Pro TTS (vía Magnific), una sola toma del guion entero, con esta instrucción:

```
Lee el guion como una narradora española de unos treinta años que le cuenta algo a una amiga
que lleva meses buscando piso, tomando un café. Voz cálida y con sonrisa, nada de locutora ni
de anuncio. Empieza con energía y un punto de ironía en lo de las alertas. Ritmo vivo en lo
gracioso, más lento, bajo y sincero en «Eso no lo sabe un algoritmo. Lo sabe una persona».
Haz una pausa corta antes de cada giro y remata las frases finales con seguridad, sin subir el
tono como si fuera una pregunta. Acento de España, natural. La marca Bárin es una palabra
llana: el acento va en la primera sílaba, BÁ-rin, igual que en «Carmen» o «joven». Nunca digas
ba-RÍN. Las indicaciones entre corchetes son dirección: no las leas.
```

- La toma de hombre salía en 34 s. Se le han recortado las pausas largas y se ha acelerado un 10 % sin cambiar el tono (`scripts/ajustar-voz.py`). La original está en `voz-tomas/achird-original.wav`.
- **Pronunciación:** es BÁ-rin, con el acento en "Ba". En las dos tomas se ha regenerado solo la frase "Es Barin", escrita «Es Bárin» para forzar el acento, y se ha empalmado en su sitio con `scripts/sustituir-frase.py`. El script conserva las pausas originales e iguala el nivel. El resto de cada toma es el de siempre: `voz-tomas/*-original.wav` son las tomas sin tocar, y `voz-tomas/barin/` los recortes elegidos.

## Marca

- Logo oficial en SVG (`public/logo-barin.svg`). Sale en la llamada, en "TE LLAMAMOS", en el cierre y en la portada, y el chevron se anima aparte.
- Magenta corporativo `#E2007A`, negro, blanco y tonos madera.
- Poppins (la de sus creatividades) y Caveat para lo escrito a mano.
- La foto (`public/img/asesoramiento.jpg`) y el logo salen de su web.

## Cómo se produce

Los tiempos salen de la voz, no al revés.

1. **Voz.** Toma en Gemini, guardada en `voz-tomas/<toma>.wav`.
2. **Tiempos.** `python3 scripts/transcribir.py voz-tomas/<toma>.wav voz-tomas/<toma>.json` saca el tiempo de cada palabra con Whisper. Necesita `pip install faster-whisper`.
3. **Marcas.** `node scripts/preparar-voz.mjs <toma>` genera `src/voz/<toma>.json`, que son las marcas de cada escena en frames.
   - Para corregir una sola frase, se regenera aparte, se empalma con `scripts/sustituir-frase.py` (`--desde es --hasta barin`) y se repiten los pasos 2 y 3.
4. **Audio.** `node scripts/generar-audio.mjs <toma>` mezcla voz, música y efectos:
   - la música baja 9 dB y los efectos 8 dB mientras habla la voz;
   - el master queda a -14 LUFS con el pico en -1,5 dBTP.
5. **Vídeo.** `npm run render:mujer`, `npm run render:hombre` y `npm run portada`.

`npm run studio` abre Remotion Studio para retocar. En entornos sin descarga de Chrome, se le indica uno con `REMOTION_CHROME=/ruta/a/headless_shell`.

Para añadir otra toma de voz:
1. Pasa los pasos 1–3.
2. Añádela en `src/voz/index.ts` y en `src/Root.tsx`.

## Texto para el post

> ¿Cuántas alertas de pisos te han llegado hoy?
> En Barin no te mandamos alertas: te llamamos. Porque sabemos lo que buscas, y también lo que no (hola, quinto sin ascensor).
> Desde 1994 en Córdoba, Málaga y la Costa del Sol. Cuéntanos qué buscas y te llamamos nosotros.
>
> #InmobiliariaBarin #Córdoba #Málaga #CostaDelSol #BuscarPiso #ComprarCasa #Inmobiliaria

## Variantes de hook para test

En cada test se cambia una sola cosa. Solo hay que regrabar la frase del hook con la misma voz e instrucción y volver a renderizar.

1. **Voz:** "Tu móvil ha sonado cuarenta y siete veces hoy. Ninguna era tu casa." · **Pantalla:** "¿TE SUENA?" · **Fotograma 1:** el móvil vibrando sobre la mesa.
2. **Voz:** "Si estás buscando piso, esto te va a sonar. Y mucho." · **Pantalla:** "47 ALERTAS HOY" · **Fotograma 1:** el contador de notificaciones subiendo.
3. **Voz:** "Hay una inmobiliaria en Córdoba que no te manda alertas. Te llama." · **Pantalla:** "SÍ, TODAVÍA EXISTE" · **Fotograma 1:** el móvil sonando con el logo de Barin.
4. **Voz:** "Borra ya las alertas de pisos del móvil. Te explico por qué." · **Pantalla:** "EN 30 SEGUNDOS" · **Fotograma 1:** un pulgar que barre las notificaciones.

Los hooks que se queden por debajo del 25 % de hook rate se descartan. Los que lo pasen se escalan, con más variantes de esa misma familia.
