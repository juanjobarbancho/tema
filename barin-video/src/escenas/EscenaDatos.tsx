import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {CHEVRON_PATH} from '../chevronPath';
import {Tejado} from '../componentes/Tejado';
import {clamp, entrada, muelle} from '../componentes/anim';
import {C, FUENTE, MANO} from '../tema';
import T from '../timeline.json';

const E = T.datos;

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
  {x: 60, y: 705, s: 1.4, r: 0, c: M[0]},
  {x: 290, y: 710, s: 1.2, r: 0, c: M[3]},
  {x: 540, y: 705, s: 1.4, r: 180, c: M[1]},
  {x: 770, y: 700, s: 1.2, r: 0, c: C.magenta},
  {x: 1000, y: 715, s: 1.4, r: 0, c: M[0]},
];

const Pared: React.FC<{frame: number}> = ({frame}) => {
  const deriva = interpolate(frame, [0, 127], [20, -40]);
  return (
    <svg width={1080} height={880} viewBox="0 0 1080 880" style={{position: 'absolute', top: 0, left: 0, transform: `translateY(${deriva}px)`}}>
      {PARED.map((p, i) => {
        const e = muelle(frame, 6 + i * 1.3, {damping: 12, stiffness: 180});
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
    <div style={{fontSize: 150, fontWeight: 800, lineHeight: 1, color: C.magenta, letterSpacing: -6}}>{numero}</div>
    <div style={{fontSize: 46, fontWeight: 600, marginTop: 6}}>{texto}</div>
  </div>
);

export const EscenaDatos: React.FC = () => {
  const frame = useCurrentFrame();
  const [f1, f2, f3, f4, f5] = E.filas;
  const anio = Math.round(interpolate(frame, [f1, f1 + 16], [1960, 1994], clamp));

  return (
    <Tejado fondo={C.pared} acento={C.magenta}>
      <Pared frame={frame} />
      <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(250,247,242,0) 38%, ${C.pared} 50%)`}} />
      <AbsoluteFill style={{fontFamily: FUENTE, color: C.tinta, padding: '0 80px'}}>
        <div style={{position: 'absolute', top: 820, left: 80, right: 80, ...entrada(frame, f1, 60)}}>
          <div style={{fontSize: 46, fontWeight: 600}}>Llamando a sus clientes desde</div>
          <div style={{fontSize: 200, fontWeight: 800, lineHeight: 0.95, letterSpacing: -8, fontVariantNumeric: 'tabular-nums'}}>
            {anio}
          </div>
        </div>
        <div style={{position: 'absolute', top: 1110, left: 80, right: 80, display: 'flex', gap: 40}}>
          <Cifra frame={frame} desde={f2} numero="12" texto="oficinas" />
          <Cifra frame={frame} desde={f3} numero="+50" texto="profesionales" />
        </div>
        <div
          style={{
            position: 'absolute',
            top: 1330,
            left: 560,
            fontFamily: MANO,
            fontWeight: 700,
            fontSize: 58,
            color: C.magenta,
            transform: 'rotate(-4deg)',
            ...entrada(frame, f4, 30),
          }}
        >
          (que cogen el teléfono)
        </div>
        <div
          style={{
            position: 'absolute',
            top: 1440,
            left: 60,
            right: 60,
            display: 'flex',
            justifyContent: 'center',
            ...entrada(frame, f5, 40),
          }}
        >
          <div
            style={{
              background: C.negro,
              color: C.blanco,
              borderRadius: 60,
              padding: '18px 36px',
              fontSize: 31,
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}
          >
            Córdoba · Málaga · Costa del Sol · Sevilla · Murcia
          </div>
        </div>
      </AbsoluteFill>
    </Tejado>
  );
};
