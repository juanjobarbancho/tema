import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Tejado} from '../componentes/Tejado';
import {clamp, entrada, tramo} from '../componentes/anim';
import {C, FUENTE} from '../tema';
import T from '../timeline.json';

const E = T.fotos;

// Etiqueta en caja, como el "¡Te ayudamos!" de sus propias piezas.
const Caja: React.FC<{frame: number; desde: number; fondo: string; color: string; children: React.ReactNode; tam: number}> = ({
  frame,
  desde,
  fondo,
  color,
  children,
  tam,
}) => {
  const p = tramo(frame, desde, 10);
  return (
    <div style={{display: 'inline-block', position: 'relative', marginTop: 18}}>
      <div
        style={{
          background: fondo,
          color,
          fontSize: tam,
          fontWeight: 800,
          padding: '8px 30px 12px',
          letterSpacing: -2,
          lineHeight: 1.1,
          clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const EscenaFoto: React.FC<{
  imagen: string;
  encuadre: string;
  lineas: string[];
  caja: string;
  cajaFondo: string;
  cajaColor: string;
}> = ({imagen, encuadre, lineas, caja, cajaFondo, cajaColor}) => {
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
        style={{
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.55) 26%, rgba(0,0,0,0) 48%, rgba(0,0,0,0) 72%, rgba(0,0,0,0.45) 100%)',
        }}
      />
      <AbsoluteFill style={{fontFamily: FUENTE, color: C.blanco, padding: '170px 70px 0', textAlign: 'left'}}>
        {lineas.map((l, k) => (
          <div
            key={k}
            style={{fontSize: 92, fontWeight: 800, lineHeight: 1.04, letterSpacing: -3, ...entrada(frame, E.titular + k * 5, 50)}}
          >
            {l}
          </div>
        ))}
        <div style={{opacity: interpolate(frame, [E.caja, E.caja + 2], [0, 1], clamp)}}>
          <Caja frame={frame} desde={E.caja} fondo={cajaFondo} color={cajaColor} tam={80}>
            {caja}
          </Caja>
        </div>
      </AbsoluteFill>
    </Tejado>
  );
};
