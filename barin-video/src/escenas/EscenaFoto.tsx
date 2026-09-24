import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Tejado} from '../componentes/Tejado';
import {clamp, tramo} from '../componentes/anim';
import {C, FUENTE} from '../tema';

// Foto real de Barin con una etiqueta en caja, como el "¡Te ayudamos!" de sus propias piezas.
export const EscenaFoto: React.FC<{
  imagen: string;
  encuadre: string;
  caja: string[];
  cajaDesde: number;
  cajaFondo: string;
  cajaColor: string;
}> = ({imagen, encuadre, caja, cajaDesde, cajaFondo, cajaColor}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const zoom = interpolate(frame, [0, durationInFrames], [1.06, 1.18]);
  const deriva = interpolate(frame, [0, durationInFrames], [10, -20]);

  return (
    <Tejado fondo={C.negro} acento={C.magenta}>
      <AbsoluteFill style={{transform: `scale(${zoom}) translateY(${deriva}px)`}}>
        <Img src={staticFile(imagen)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: encuadre}} />
      </AbsoluteFill>
      <AbsoluteFill
        style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.25) 24%, rgba(0,0,0,0) 40%, rgba(0,0,0,0) 75%, rgba(0,0,0,0.35) 100%)'}}
      />
      <div style={{position: 'absolute', top: 250, left: 70, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 14}}>
        {caja.map((linea, k) => {
          const desde = cajaDesde + k * 5;
          const p = tramo(frame, desde, 10);
          return (
            <div
              key={k}
              style={{
                background: cajaFondo,
                color: cajaColor,
                fontFamily: FUENTE,
                fontSize: 104,
                fontWeight: 800,
                padding: '8px 34px 14px',
                letterSpacing: -3,
                lineHeight: 1.05,
                opacity: interpolate(frame, [desde, desde + 2], [0, 1], clamp),
                clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`,
              }}
            >
              {linea}
            </div>
          );
        })}
      </div>
    </Tejado>
  );
};
