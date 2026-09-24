import {CHEVRON_PATH} from '../chevronPath';
import {LETRAS_SVG} from '../logoPaths';
import {C} from '../tema';

// Caja del chevron dentro del viewBox del logo (0 0 260.81 218.06).
export const CHEVRON_CAJA = {x: 67.9, y: 0, w: 126.7, h: 76.8};

export const Chevron: React.FC<{
  ancho: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ancho, color = C.magenta, style}) => {
  const {x, y, w, h} = CHEVRON_CAJA;
  return (
    <svg
      width={ancho}
      height={(ancho * h) / w}
      viewBox={`${x} ${y} ${w} ${h}`}
      style={{display: 'block', overflow: 'visible', ...style}}
    >
      <path d={CHEVRON_PATH} fill={color} />
    </svg>
  );
};

// Logo oficial con el chevron separable para animarlo aparte.
export const Logo: React.FC<{
  ancho: number;
  colorLetras?: string;
  colorChevron?: string;
  chevronY?: number;
  chevronEscala?: number;
  letrasOpacidad?: number;
  letrasY?: number;
}> = ({
  ancho,
  colorLetras = C.blanco,
  colorChevron = C.magenta,
  chevronY = 0,
  chevronEscala = 1,
  letrasOpacidad = 1,
  letrasY = 0,
}) => {
  const cx = CHEVRON_CAJA.x + CHEVRON_CAJA.w / 2;
  const cy = CHEVRON_CAJA.h / 2;
  return (
    <svg
      width={ancho}
      height={(ancho * 218.06) / 260.81}
      viewBox="0 0 260.81 218.06"
      style={{display: 'block', overflow: 'visible'}}
    >
      <g
        fill={colorLetras}
        opacity={letrasOpacidad}
        transform={`translate(0 ${letrasY})`}
        dangerouslySetInnerHTML={{__html: LETRAS_SVG}}
      />
      <path
        d={CHEVRON_PATH}
        fill={colorChevron}
        transform={`translate(${cx} ${cy + chevronY}) scale(${chevronEscala}) translate(${-cx} ${-cy})`}
      />
    </svg>
  );
};
