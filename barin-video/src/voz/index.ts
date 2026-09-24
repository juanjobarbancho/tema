import achird from './achird.json';
import laomedeia from './laomedeia.json';

// Tomas de voz disponibles. Cada JSON lo genera scripts/preparar-voz.mjs.
export const TOMAS = {laomedeia, achird};
export type NombreToma = keyof typeof TOMAS;
export type Toma = (typeof TOMAS)[NombreToma];
export type Marcas = Toma['marcas'];
