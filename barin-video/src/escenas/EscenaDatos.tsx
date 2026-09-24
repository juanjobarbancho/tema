import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {CHEVRON_PATH} from '../chevronPath';
import {Tejado} from '../componentes/Tejado';
import {clamp, entrada, muelle} from '../componentes/anim';
import {useToma} from '../contexto';
import {C, FUENTE} from '../tema';

// Pared de chevrones de madera, como la de sus oficinas.
const M = [C.madera1, C.madera2, C.madera3, C.madera4];
const PARED: {x: number; y: number; s: number; r: number; c: string}[] = [
  {x: 120, y: 150, s: 1.5, r: 0, c: M[0]},
  {x: 340, y: 110, s: 1.2, r: 0, c: M[1]},
  {x: 575, y: 175, s: 1.6, r: 180, c: M[2]},
  {x: 800, y: 105, s: 1.3, r: 0, c: C.magenta},
  {x: 1000, y: 185, s: 1.4, r: 0, c: M[1]},
  {x: 50, y: 345, s: 1.3, r: 180, c: M[3]},
  {x: 260, y: 320, s: 1.6, r: 0, c: M[2]},
  {x: 480, y: 370, s: 1.2, r: 0, c: M[1]},
  {x: 715, y: 330, s: 1.5, r: 0, c: M[0]},
  {x: 950, y: 365, s: 1.3, r: 180, c: M[3]},
  {x: 150, y: 525, s: 1.2, r: 0, c: M[1]},
  {x: 385, y: 545, s: 1.7, r: 180, c: C.negro},
  {x: 650, y: 515, s: 1.3, r: 0, c: M[3]},
  {x: 880, y: 550, s: 1.5, r: 0, c: M[2]},
];

const Pared: React.FC<{frame: number}> = ({frame}) => {
  const {durationInFrames} = useVideoConfig();
  const deriva = interpolate(frame, [0, durationInFrames], [20, -40]);
  return (
    <svg width={1080} height={760} viewBox="0 0 1080 760" style={{position: 'absolute', top: 0, left: 0, transform: `translateY(${deriva}px)`}}>
      {PARED.map((p, i) => {
        const e = muelle(frame, 2 + i * 1.2, {damping: 12, stiffness: 180});
        return (
          <path
            key={i}
            d={CHEVRON_PATH}
            fill={p.c}
            style={{filter: 'drop-shadow(0 8px 10px rgba(60,30,10,0.22))'}}
            transform={`translate(${p.x} ${p.y}) rotate(${p.r + (1 - e) * 25}) scale(${p.s * e}) translate(-131.3 -38.4)`}
          />
        );
      })}
    </svg>
  );
};

const Cifra: React.FC<{frame: number; desde: number; numero: string; texto: string}> = ({frame, desde, numero, texto}) => (
  <div style={{flex: 1, ...entrada(frame, desde, 60)}}>
    <div style={{fontSize: 170, fontWeight: 800, lineHeight: 1, color: C.magenta, letterSpacing: -7}}>{numero}</div>
    <div style={{fontSize: 44, fontWeight: 700, marginTop: 4, letterSpacing: 1}}>{texto}</div>
  </div>
);

export const EscenaDatos: React.FC = () => {
  const frame = useCurrentFrame();
  const {eventos} = useToma();
  const D = eventos.datos;
  const anio = Math.round(interpolate(frame, [D.anio, D.anio + 10], [1960, 1994], clamp));

  return (
    <Tejado fondo={C.pared} acento={C.magenta}>
      <Pared frame={frame} />
      <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(250,247,242,0) 34%, ${C.pared} 44%)`}} />
      <AbsoluteFill style={{fontFamily: FUENTE, color: C.tinta}}>
        <div style={{position: 'absolute', top: 780, left: 80, right: 80, display: 'flex', gap: 40}}>
          <Cifra frame={frame} desde={D.oficinas} numero="12" texto="OFICINAS" />
          <Cifra frame={frame} desde={D.profesionales} numero="+50" texto="PROFESIONALES" />
        </div>
        <div style={{position: 'absolute', top: 1060, left: 80, right: 80, ...entrada(frame, D.anio, 60)}}>
          <div style={{fontSize: 44, fontWeight: 700, letterSpacing: 1}}>DESDE</div>
          <div style={{fontSize: 230, fontWeight: 800, lineHeight: 0.9, letterSpacing: -10, fontVariantNumeric: 'tabular-nums'}}>{anio}</div>
        </div>
        <div style={{position: 'absolute', top: 1400, left: 60, right: 60, display: 'flex', justifyContent: 'center', ...entrada(frame, D.ciudades, 40)}}>
          <div style={{background: C.negro, color: C.blanco, borderRadius: 60, padding: '18px 38px', fontSize: 34, fontWeight: 700, letterSpacing: 1, whiteSpace: 'nowrap'}}>
            CÓRDOBA · MÁLAGA · SEVILLA · MURCIA
          </div>
        </div>
      </AbsoluteFill>
    </Tejado>
  );
};
