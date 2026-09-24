# Barin · "Te llamamos" — Reel vertical (Remotion)

Vídeo de ~31 s en 1080×1920 para Reels/TikTok/Shorts de **Inmobiliaria Barin** (Córdoba, Málaga y Costa del Sol, Sevilla, Murcia).
Idea: las apps te bombardean con alertas de pisos; en Barin no hacen falta, **te llaman**, porque saben lo que buscas.

- Vídeo final: `out/barin-te-llama.mp4`
- Portada para el post: `out/portada.png`

## Guion

| Tiempo | Escena | Qué pasa |
|---|---|---|
| 0–4 s | Gancho | Móvil saturado de notificaciones y vibrando. "Hoy te han llegado **47 alertas** de pisos." → "Y **ninguna** es tu casa." |
| 4–7,5 s | Giro | Las alertas salen de la pantalla y entra una llamada: **Barin**. "En Barin, las alertas **suenan así:**" |
| 7,5–10 s | Mensaje | Transición en forma de tejado (el chevron del logo). "~~Nada de alertas.~~ **Te llamamos.** Por teléfono. Como toda la vida." |
| 10–17 s | Prueba | Notas escritas a mano de la llamada: 3 dormitorios + despacho, luz por la mañana, cerca del cole, nada de quintos sin ascensor, que se sientan en casa. "Eso no lo sabe **ningún algoritmo**." |
| 17–22 s | Personas | Fotos reales de sus oficinas: "Lo sabe una persona. Que te escucha." / "Y te llama cuando aparece **tu casa**." |
| 22–26 s | Datos | Pared de chevrones de madera (como en sus oficinas). "Llamando a sus clientes desde **1994**", **12** oficinas, **+50** profesionales *(que cogen el teléfono)*. |
| 26–31 s | Cierre | "Una app te hace buscar. Una llamada te hace **encontrar**." → logo → su eslogan *La diferencia entre buscar y encontrar* + CTA y teléfonos. |

## Marca

Sacada de [inmobiliariabarin.com](https://www.inmobiliariabarin.com) y de las fotos de sus oficinas:

- Magenta corporativo `#E2007A`, negro, blanco y tonos madera.
- Logo oficial en SVG (`public/logo-barin.svg`); el chevron se anima por separado.
- Poppins (la que usan en sus creatividades) y Caveat para lo escrito a mano.
- Recurso gráfico: el chevron/tejado del logo y la pared de chevrones de sus oficinas, usados como transición y fondo.
- Fotos: `public/img/` (de su web).

## Sonido

`scripts/generar-audio.mjs` sintetiza toda la banda sonora desde cero y la sincroniza con `src/timeline.json`: dings y vibración de las notificaciones, tono de llamada propio, soplidos en las transiciones, bolígrafo sobre papel y una base musical cálida en Re mayor que entra al coger la llamada. Sin samples ni música de terceros, así que no hay problemas de licencia.
Si se quiere usar un audio en tendencia, se puede bajar el volumen del original en la propia app.

## Uso

```bash
npm install
npm run studio        # previsualizar y editar en el navegador
npm run render        # genera out/barin-te-llama.mp4
npm run portada       # genera out/portada.png
```

Los tiempos de cada escena están en `src/timeline.json`; el vídeo y el audio los leen de ahí.
En entornos sin descarga de Chrome: `REMOTION_CHROME=/ruta/a/headless_shell npm run render`.

## Texto sugerido para el post

> ¿Cuántas alertas de pisos te han llegado hoy? 📲
> En Barin no te mandamos alertas: te llamamos. Porque sabemos lo que buscas (y lo que no).
> Desde 1994 en Córdoba, y también en Málaga y la Costa del Sol.
> Cuéntanos qué buscas y nosotros te llamamos. ☎️
>
> #InmobiliariaBarin #Córdoba #Málaga #CostaDelSol #BuscarCasa #Inmobiliaria
