import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Check} from '../componentes/Iconos';
import {Chevron} from '../componentes/Marca';
import {Tejado} from '../componentes/Tejado';
import {clamp, entrada, muelle, tramo} from '../componentes/anim';
import {C, FUENTE, MANO} from '../tema';
import {useToma} from '../contexto';

const ITEMS = [
  '3 dormitorios + despacho',
  'Que entre luz por la mañana',
  'Cerca del cole de los niños',
  'Nada de quintos sin ascensor',
  'Que se sientan en casa',
];

const FILA = 100;
const ITEMS_TOP = 232;

// Texto que se "escribe" de izquierda a derecha.
const Escrito: React.FC<{frame: number; desde: number; dur: number; children: React.ReactNode; style?: React.CSSProperties}> = ({
  frame,
  desde,
  dur,
  children,
  style,
}) => {
  const p = interpolate(frame, [desde, desde + dur], [0, 1], clamp);
  return (
    <div style={{...style, clipPath: `inset(-20% ${(1 - p) * 100}% -20% -2%)`, whiteSpace: 'nowrap'}}>{children}</div>
  );
};

export const EscenaNotas: React.FC = () => {
  const frame = useCurrentFrame();
  const {eventos} = useToma();
  const items = eventos.notasItems;
  const escribir = eventos.notasEscribir;
  const libreta = muelle(frame, 4, {damping: 16, stiffness: 140});
  const subrayado = tramo(frame, 14, 12);

  return (
    <Tejado fondo={C.papel} acento={C.magenta}>
      <AbsoluteFill style={{fontFamily: FUENTE, color: C.tinta}}>
        <div style={{position: 'absolute', top: 170, left: 0, right: 0, textAlign: 'center', letterSpacing: -2}}>
          <div style={{fontSize: 96, fontWeight: 800, lineHeight: 1.05, ...entrada(frame, 6, 50)}}>SABEMOS</div>
          <div style={{position: 'relative', display: 'inline-block', ...entrada(frame, 10, 50)}}>
            <div style={{fontSize: 96, fontWeight: 800, lineHeight: 1.1, color: C.magenta}}>LO QUE BUSCAS.</div>
            <svg
              width="100%"
              height="40"
              viewBox="0 0 600 40"
              preserveAspectRatio="none"
              style={{position: 'absolute', left: 0, bottom: -18}}
            >
              <path
                d="M6 26 C 120 12, 260 10, 360 16 S 540 28, 594 14"
                fill="none"
                stroke={C.tinta}
                strokeWidth={7}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - subrayado}
              />
            </svg>
          </div>
        </div>

        {/* Libreta con las notas de la llamada */}
        <div
          style={{
            position: 'absolute',
            left: 80,
            top: 560,
            width: 920,
            height: 830,
            borderRadius: 22,
            background: '#FFFEFA',
            boxShadow: '0 30px 70px rgba(60,30,10,0.18), 0 4px 10px rgba(0,0,0,0.06)',
            transform: `rotate(-1.4deg) translateY(${(1 - libreta) * 140}px) scale(${0.9 + 0.1 * libreta})`,
            opacity: interpolate(frame, [4, 10], [0, 1], clamp),
            overflow: 'hidden',
          }}
        >
          {/* Líneas de libreta */}
          {Array.from({length: 5}).map((_, k) => (
            <div
              key={k}
              style={{position: 'absolute', left: 50, right: 50, top: ITEMS_TOP + FILA * k + 80, height: 2, background: '#E4DED4'}}
            />
          ))}
          <div style={{position: 'absolute', left: 70, top: 56, display: 'flex', alignItems: 'center', gap: 16}}>
            <Chevron ancho={52} />
            <span style={{fontSize: 26, fontWeight: 600, letterSpacing: 3, color: '#8a8580'}}>NOTAS DE LA LLAMADA</span>
          </div>
          <Escrito
            frame={frame}
            desde={4}
            dur={10}
            style={{position: 'absolute', left: 68, top: 100, fontFamily: MANO, fontWeight: 700, fontSize: 88, color: C.tinta}}
          >
            Lucía y Javi
          </Escrito>

          {ITEMS.map((texto, k) => {
            const desde = items[k];
            const check = tramo(frame, desde + escribir - 2, 8);
            return (
              <div key={k} style={{position: 'absolute', left: 70, right: 60, top: ITEMS_TOP + FILA * k, height: FILA, display: 'flex', alignItems: 'center'}}>
                <Escrito
                  frame={frame}
                  desde={desde}
                  dur={escribir}
                  style={{fontFamily: MANO, fontWeight: 600, fontSize: 66, color: k === ITEMS.length - 1 ? C.magenta : C.tinta}}
                >
                  {texto}
                </Escrito>
                <div style={{position: 'absolute', right: 0, top: 16, opacity: check > 0 ? 1 : 0}}>
                  <Check tam={64} p={check} color={C.magenta} />
                </div>
              </div>
            );
          })}
        </div>

      </AbsoluteFill>
    </Tejado>
  );
};
