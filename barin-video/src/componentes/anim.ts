import {Easing, interpolate, spring} from 'remotion';

const FPS = 30;

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Progreso 0→1 entre dos frames con curva suave.
export const tramo = (frame: number, desde: number, dur: number, easing = Easing.bezier(0.33, 1, 0.68, 1)) =>
  interpolate(frame, [desde, desde + dur], [0, 1], {...clamp, easing});

// Muelle con retardo, pensado para textos que "entran con golpe".
export const muelle = (frame: number, desde: number, config: {damping?: number; stiffness?: number; mass?: number} = {}) =>
  spring({frame: frame - desde, fps: FPS, config: {damping: 14, stiffness: 160, mass: 0.8, ...config}});

// Estilo de entrada estándar: sube y aparece.
export const entrada = (frame: number, desde: number, distancia = 60): React.CSSProperties => {
  const p = muelle(frame, desde, {damping: 18, stiffness: 170});
  return {
    opacity: interpolate(frame, [desde, desde + 6], [0, 1], clamp),
    transform: `translateY(${(1 - p) * distancia}px)`,
  };
};
