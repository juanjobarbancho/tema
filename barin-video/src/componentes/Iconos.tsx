// Iconos dibujados a mano en SVG (sin emojis: el render headless no siempre tiene fuente de emoji).

export const IconoTelefono: React.FC<{tam: number; color?: string; colgar?: boolean}> = ({
  tam,
  color = '#fff',
  colgar = false,
}) => (
  <svg width={tam} height={tam} viewBox="0 0 24 24" style={{transform: colgar ? 'rotate(135deg)' : undefined}}>
    <path
      fill={color}
      d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.61 21 3 13.39 3 4c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
    />
  </svg>
);

export const IconoCasa: React.FC<{tam: number; color?: string}> = ({tam, color = '#fff'}) => (
  <svg width={tam} height={tam} viewBox="0 0 24 24">
    <path
      fill="none"
      stroke={color}
      strokeWidth={2.2}
      strokeLinejoin="round"
      strokeLinecap="round"
      d="M3.5 11.2 12 4l8.5 7.2M6 9.5V20h4.2v-5.2h3.6V20H18V9.5"
    />
  </svg>
);

export const IconoCandado: React.FC<{tam: number; color?: string}> = ({tam, color = '#fff'}) => (
  <svg width={tam} height={tam} viewBox="0 0 24 24">
    <rect x="5" y="10.5" width="14" height="10" rx="2.4" fill={color} />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" fill="none" stroke={color} strokeWidth={2.2} />
  </svg>
);

// Check trazado a mano, con dibujo progresivo (p: 0 → 1).
export const Check: React.FC<{tam: number; p: number; color: string}> = ({tam, p, color}) => (
  <svg width={tam} height={tam * 0.85} viewBox="0 0 40 34" style={{overflow: 'visible'}}>
    <path
      d="M4 18.5 C8 21 11 25 14.5 29.5 C20 19 27 10 37 3.5"
      fill="none"
      stroke={color}
      strokeWidth={5.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      pathLength={1}
      strokeDasharray={1}
      strokeDashoffset={1 - p}
    />
  </svg>
);
