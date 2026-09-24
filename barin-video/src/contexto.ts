import {createContext, useContext} from 'react';
import type {Toma} from './voz';

export const TomaContext = createContext<Toma | null>(null);

export const useToma = (): Toma => {
  const toma = useContext(TomaContext);
  if (!toma) throw new Error('Falta TomaContext');
  return toma;
};
