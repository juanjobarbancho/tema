import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FondoMovil, Movil, Rotulo} from '../componentes/Movil';
import {entrada, muelle, tramo} from '../componentes/anim';
import {useToma} from '../contexto';
import {C} from '../tema';

export const EscenaTelefono: React.FC = () => {
  const frame = useCurrentFrame();
  const {marcas: M, eventos: E, notificaciones} = useToma();
  const sale = tramo(frame, E.barrido, 8);
  // "¿TE SUENA?" late con cada vibración.
  const latido = notificaciones.reduce((acc, s) => {
    const d = frame - s;
    return s >= 0 && d >= 0 && d < 6 ? Math.max(acc, 1 - d / 6) : acc;
  }, 0);

  return (
    <AbsoluteFill style={{background: C.negro}}>
      <FondoMovil />
      {frame < E.barrido + 10 ? (
        <Rotulo style={{opacity: 1 - sale, transform: `translateY(${-sale * 60}px) scale(${1 + latido * 0.04})`}}>
          <div style={{fontSize: 150}}>
            ¿TE <span style={{color: C.magenta}}>SUENA</span>?
          </div>
        </Rotulo>
      ) : null}
      {frame >= M.barin ? (
        <Rotulo>
          <div style={{fontSize: 150, color: C.magenta, ...entrada(frame, M.barin, 70), transform: `${entrada(frame, M.barin, 70).transform} scale(${0.9 + 0.1 * muelle(frame, M.barin)})`}}>
            ESTA SÍ.
          </div>
        </Rotulo>
      ) : null}
      <Movil
        frame={frame}
        notificaciones={notificaciones}
        barrido={E.barrido}
        llamada={E.llamada}
        toque={E.toque}
        tonos={E.tonos}
      />
    </AbsoluteFill>
  );
};
