import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FondoMovil, Movil, Rotulo} from '../componentes/Movil';
import {Tejado} from '../componentes/Tejado';
import {entrada, muelle, tramo} from '../componentes/anim';
import {useToma} from '../contexto';
import {C} from '../tema';

// "Cuarenta y siete alertas… o una llamada." Vuelve el móvil del principio: el vídeo se ve en bucle.
export const EscenaBucle: React.FC = () => {
  const frame = useCurrentFrame();
  const {eventos} = useToma();
  const E = eventos.bucle;
  const subida = muelle(frame, 0, {damping: 18, stiffness: 120});
  const sale = tramo(frame, E.rotulo - 4, 8);

  return (
    <Tejado fondo={C.negro} acento={C.magenta}>
      <FondoMovil />
      {frame < E.rotulo + 6 ? (
        <Rotulo style={{opacity: 1 - sale, transform: `translateY(${-sale * 60}px)`}}>
          <div style={{fontSize: 150, ...entrada(frame, 6, 60)}}>
            ¿TE <span style={{color: C.magenta}}>SUENA</span>?
          </div>
        </Rotulo>
      ) : null}
      {frame >= E.rotulo ? (
        <Rotulo>
          <div style={{fontSize: 136, ...entrada(frame, E.rotulo, 70)}}>
            ¿CUÁL
            <br />
            <span style={{color: C.magenta}}>COGES?</span>
          </div>
        </Rotulo>
      ) : null}
      <Movil frame={frame} notificaciones={E.notificaciones} llamada={E.llamada} tonos={E.tonos} subida={subida} />
    </Tejado>
  );
};
