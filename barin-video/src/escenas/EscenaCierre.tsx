import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {IconoTelefono} from '../componentes/Iconos';
import {Logo} from '../componentes/Marca';
import {Tejado} from '../componentes/Tejado';
import {clamp, entrada, muelle, tramo} from '../componentes/anim';
import {useToma} from '../contexto';
import {C, FUENTE} from '../tema';

const Telefono: React.FC<{ciudad: string; numero: string}> = ({ciudad, numero}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 18, justifyContent: 'center'}}>
    <div style={{width: 58, height: 58, borderRadius: '50%', background: C.magenta, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <IconoTelefono tam={32} />
    </div>
    <span style={{fontSize: 46, fontWeight: 700, letterSpacing: 0.5}}>{numero}</span>
    <span style={{fontSize: 30, fontWeight: 600, opacity: 0.6, letterSpacing: 2}}>{ciudad}</span>
  </div>
);

export const EscenaCierre: React.FC = () => {
  const frame = useCurrentFrame();
  const {eventos} = useToma();
  const E = eventos.cierre;
  const caida = muelle(frame, E.logo, {damping: 10, stiffness: 150, mass: 0.9});
  const letras = tramo(frame, E.logo + 4, 12);
  const brillo = interpolate(frame, [E.logo + 6, E.logo + 30], [0.55, 0], clamp);

  return (
    <Tejado fondo={C.negro} acento={C.magenta}>
      <AbsoluteFill style={{background: `radial-gradient(45% 25% at 50% 30%, rgba(226,0,122,${brillo}) 0%, rgba(226,0,122,0) 100%)`}} />
      <AbsoluteFill style={{fontFamily: FUENTE, color: C.blanco, textAlign: 'center'}}>
        <div style={{position: 'absolute', top: 330, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
          <Logo ancho={600} chevronY={(1 - caida) * -260} letrasOpacidad={letras} letrasY={(1 - letras) * 14} />
        </div>
        <div style={{position: 'absolute', top: 930, left: 60, right: 60, fontSize: 58, fontWeight: 800, lineHeight: 1.1, letterSpacing: -1.5, ...entrada(frame, E.tagline, 40)}}>
          LA DIFERENCIA ENTRE
          <br />
          BUSCAR Y <span style={{color: C.magenta}}>ENCONTRAR.</span>
        </div>
        <div style={{position: 'absolute', top: 1180, left: 60, right: 60, display: 'flex', flexDirection: 'column', gap: 26}}>
          <div style={entrada(frame, E.telefonos, 40)}>
            <Telefono numero="957 76 76 66" ciudad="CÓRDOBA" />
          </div>
          <div style={entrada(frame, E.telefonos + 5, 40)}>
            <Telefono numero="952 06 24 12" ciudad="MÁLAGA" />
          </div>
          <div style={{fontSize: 32, fontWeight: 500, opacity: 0.6, marginTop: 8, ...entrada(frame, E.telefonos + 10, 30)}}>inmobiliariabarin.com</div>
        </div>
      </AbsoluteFill>
    </Tejado>
  );
};
