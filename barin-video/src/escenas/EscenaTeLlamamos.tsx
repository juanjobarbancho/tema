import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Chevron, Logo} from '../componentes/Marca';
import {Tejado} from '../componentes/Tejado';
import {clamp, muelle} from '../componentes/anim';
import {useToma} from '../contexto';
import {C, FUENTE} from '../tema';

export const EscenaTeLlamamos: React.FC = () => {
  const frame = useCurrentFrame();
  const {marcas: M} = useToma();
  const golpe = M.llaman - M.teLlaman; // la palabra "llaman"
  const p = muelle(frame, golpe, {damping: 11, stiffness: 210, mass: 0.9});
  const deriva = interpolate(frame, [0, 45], [120, -40]);

  return (
    <Tejado fondo={C.magenta} acento={C.blanco} duracion={10}>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: 0.13}}>
        <Chevron ancho={1500} color={C.blanco} style={{transform: `translateY(${deriva}px)`}} />
      </AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', paddingBottom: 120}}>
        <div
          style={{
            fontFamily: FUENTE,
            color: C.blanco,
            textAlign: 'center',
            fontSize: 156,
            fontWeight: 800,
            lineHeight: 0.95,
            letterSpacing: -6,
            opacity: interpolate(frame, [golpe - 2, golpe + 2], [0, 1], clamp),
            transform: `scale(${1.7 - 0.7 * p})`,
            textShadow: '0 12px 40px rgba(80,0,40,0.35)',
          }}
        >
          TE
          <br />
          LLAMAMOS.
        </div>
      </AbsoluteFill>
      <div style={{position: 'absolute', top: 1400, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: interpolate(frame, [golpe + 4, golpe + 10], [0, 1], clamp)}}>
        <Logo ancho={250} colorChevron={C.blanco} />
      </div>
    </Tejado>
  );
};
