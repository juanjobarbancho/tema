import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Logo} from '../componentes/Marca';
import {Tejado} from '../componentes/Tejado';
import {clamp, entrada, muelle, tramo} from '../componentes/anim';
import {C, FUENTE} from '../tema';
import T from '../timeline.json';

const E = T.cierre;

export const EscenaCierre: React.FC = () => {
  const frame = useCurrentFrame();
  const salida = tramo(frame, E.salida, 10);
  const caida = muelle(frame, E.logo, {damping: 10, stiffness: 150, mass: 0.9});
  const letras = tramo(frame, E.logo + 4, 12);
  const brillo = interpolate(frame, [E.logo + 6, E.logo + 30], [0.55, 0], clamp);

  return (
    <Tejado fondo={C.negro} acento={C.magenta}>
      <AbsoluteFill style={{fontFamily: FUENTE, color: C.blanco, textAlign: 'center'}}>
        {/* Buscar vs. encontrar */}
        {salida < 1 ? (
          <AbsoluteFill
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              paddingBottom: 120,
              opacity: 1 - salida,
              transform: `translateY(${-salida * 120}px) scale(${1 - salida * 0.08})`,
              letterSpacing: -2,
            }}
          >
            <div style={{color: '#8f8f8f', ...entrada(frame, E.linea1, 50)}}>
              <div style={{fontSize: 64, fontWeight: 600}}>Una app te hace</div>
              <div style={{fontSize: 128, fontWeight: 800, lineHeight: 1, letterSpacing: -5}}>buscar.</div>
            </div>
            <div style={{marginTop: 70, ...entrada(frame, E.linea2, 50)}}>
              <div style={{fontSize: 64, fontWeight: 600}}>Una llamada te hace</div>
              <div style={{fontSize: 128, fontWeight: 800, lineHeight: 1, letterSpacing: -5, color: C.magenta}}>encontrar.</div>
            </div>
          </AbsoluteFill>
        ) : null}

        {/* Logo */}
        {frame >= E.logo ? (
          <>
            <AbsoluteFill
              style={{
                background: `radial-gradient(45% 25% at 50% 36%, rgba(226,0,122,${brillo}) 0%, rgba(226,0,122,0) 100%)`,
              }}
            />
            <div style={{position: 'absolute', top: 380, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
              <Logo ancho={600} chevronY={(1 - caida) * -260} letrasOpacidad={letras} letrasY={(1 - letras) * 14} />
            </div>
            <div style={{position: 'absolute', top: 960, left: 60, right: 60, fontSize: 52, fontWeight: 500, lineHeight: 1.25, ...entrada(frame, E.tagline, 40)}}>
              La diferencia entre
              <br />
              buscar y <span style={{color: C.magenta, fontWeight: 700}}>encontrar.</span>
            </div>
            <div style={{position: 'absolute', top: 1170, left: 60, right: 60, ...entrada(frame, E.cta, 40)}}>
              <div style={{width: 120, height: 4, background: C.magenta, margin: '0 auto 40px', borderRadius: 2}} />
              <div style={{fontSize: 44, fontWeight: 700}}>Cuéntanos qué buscas.</div>
              <div style={{fontSize: 44, fontWeight: 700, color: C.magenta}}>Nosotros te llamamos.</div>
              <div style={{marginTop: 34, fontSize: 32, fontWeight: 500, opacity: 0.85, display: 'flex', justifyContent: 'center', gap: 40}}>
                <span>Córdoba · 957 76 76 66</span>
                <span>Málaga · 952 06 24 12</span>
              </div>
              <div style={{marginTop: 12, fontSize: 30, fontWeight: 500, opacity: 0.6}}>inmobiliariabarin.com</div>
            </div>
          </>
        ) : null}
      </AbsoluteFill>
    </Tejado>
  );
};
