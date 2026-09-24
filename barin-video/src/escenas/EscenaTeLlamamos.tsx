import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Chevron} from '../componentes/Marca';
import {Tejado} from '../componentes/Tejado';
import {clamp, entrada, muelle, tramo} from '../componentes/anim';
import {C, FUENTE} from '../tema';
import T from '../timeline.json';

const E = T.teLlamamos;

export const EscenaTeLlamamos: React.FC = () => {
  const frame = useCurrentFrame();
  const golpe = muelle(frame, E.golpe, {damping: 11, stiffness: 210, mass: 0.9});
  const tachado = tramo(frame, E.nada + 10, 8);
  const deriva = interpolate(frame, [0, 82], [120, -80]);

  return (
    <Tejado fondo={C.magenta} acento={C.blanco}>
      {/* Chevron gigante de fondo */}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: 0.13}}>
        <Chevron ancho={1500} color={C.blanco} style={{transform: `translateY(${deriva}px)`}} />
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          fontFamily: FUENTE,
          color: C.blanco,
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          flexDirection: 'column',
          paddingBottom: 60,
        }}
      >
        <div style={{position: 'relative', fontSize: 64, fontWeight: 600, marginBottom: 40, ...entrada(frame, E.nada, 40)}}>
          Nada de alertas.
          <div
            style={{
              position: 'absolute',
              left: -10,
              top: '54%',
              height: 8,
              borderRadius: 4,
              background: C.negro,
              width: `calc(${tachado * 100}% + ${tachado * 20}px)`,
            }}
          />
        </div>
        <div
          style={{
            fontSize: 172,
            fontWeight: 800,
            lineHeight: 0.98,
            letterSpacing: -6,
            opacity: interpolate(frame, [E.golpe, E.golpe + 3], [0, 1], clamp),
            transform: `scale(${1.7 - 0.7 * golpe})`,
            textShadow: '0 12px 40px rgba(80,0,40,0.35)',
          }}
        >
          Te
          <br />
          llamamos.
        </div>
        <div style={{marginTop: 60, fontSize: 56, fontWeight: 500, lineHeight: 1.25}}>
          <div style={entrada(frame, E.sub1, 40)}>Por teléfono.</div>
          <div style={{...entrada(frame, E.sub2, 40), fontWeight: 700}}>Como toda la vida.</div>
        </div>
      </AbsoluteFill>
    </Tejado>
  );
};
