import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';

// Transición con forma de tejado: el mismo ángulo de 45° del chevron del logo de Barin.
const PICO = 0.28;

const poligonoTejado = (p: number) => {
  const y = interpolate(p, [0, 1], [1, -PICO]) * 100;
  const base = y + PICO * 100;
  return `polygon(0% 100%, 0% ${base}%, 50% ${y}%, 100% ${base}%, 100% 100%)`;
};

const suave = Easing.bezier(0.72, 0, 0.28, 1);

export const Tejado: React.FC<{
  children: React.ReactNode;
  fondo: string;
  acento?: string;
  duracion?: number;
}> = ({children, fondo, acento, duracion = 14}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, duracion], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: suave,
  });
  const pAcento = interpolate(frame, [0, duracion - 4], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: suave,
  });
  const cubierto = p >= 1;

  return (
    <AbsoluteFill>
      {acento && !cubierto ? (
        <AbsoluteFill style={{background: acento, clipPath: poligonoTejado(pAcento)}} />
      ) : null}
      <AbsoluteFill
        style={{
          background: fondo,
          clipPath: cubierto ? undefined : poligonoTejado(p),
          overflow: 'hidden',
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
