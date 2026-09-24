import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '@fontsource/poppins/800.css';
import '@fontsource/caveat/600.css';
import '@fontsource/caveat/700.css';
import {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, Sequence, continueRender, delayRender, staticFile} from 'remotion';
import {TomaContext} from './contexto';
import {EscenaBucle} from './escenas/EscenaBucle';
import {EscenaCierre} from './escenas/EscenaCierre';
import {EscenaDatos} from './escenas/EscenaDatos';
import {EscenaFoto} from './escenas/EscenaFoto';
import {EscenaNotas} from './escenas/EscenaNotas';
import {EscenaTeLlamamos} from './escenas/EscenaTeLlamamos';
import {EscenaTelefono} from './escenas/EscenaTelefono';
import {C} from './tema';
import {TOMAS, type NombreToma} from './voz';

const FUENTES = ['400 40px Poppins', '500 40px Poppins', '600 40px Poppins', '700 40px Poppins', '800 40px Poppins', '600 40px Caveat', '700 40px Caveat'];

export type PropsBarin = {toma: NombreToma};

export const BarinTeLlama: React.FC<PropsBarin> = ({toma}) => {
  const [espera] = useState(() => delayRender('Cargando fuentes'));
  useEffect(() => {
    Promise.all(FUENTES.map((f) => document.fonts.load(f, 'áéíóúñ¿¡ABC')))
      .then(() => continueRender(espera))
      .catch(() => continueRender(espera));
  }, [espera]);

  const datos = TOMAS[toma];
  const S = datos.escenas;
  const M = datos.marcas;

  return (
    <TomaContext.Provider value={datos}>
      <AbsoluteFill style={{background: C.negro}}>
        <Sequence from={S.telefono[0]} durationInFrames={S.telefono[1]} name="1 · Alertas y llamada">
          <EscenaTelefono />
        </Sequence>
        <Sequence from={S.teLlamamos[0]} durationInFrames={S.teLlamamos[1]} name="2 · Te llamamos">
          <EscenaTeLlamamos />
        </Sequence>
        <Sequence from={S.notas[0]} durationInFrames={S.notas[1]} name="3 · Lo que buscas">
          <EscenaNotas />
        </Sequence>
        <Sequence from={S.persona[0]} durationInFrames={S.persona[1]} name="4 · Una persona">
          <EscenaFoto
            imagen="img/asesoramiento.jpg"
            encuadre="40% 50%"
            caja={['QUE TE', 'ESCUCHA.']}
            cajaDesde={M.persona - S.persona[0] + 12}
            cajaFondo={C.blanco}
            cajaColor={C.negro}
          />
        </Sequence>
        <Sequence from={S.datos[0]} durationInFrames={S.datos[1]} name="5 · Datos">
          <EscenaDatos />
        </Sequence>
        <Sequence from={S.cierre[0]} durationInFrames={S.cierre[1]} name="6 · Logo">
          <EscenaCierre />
        </Sequence>
        <Sequence from={S.bucle[0]} durationInFrames={S.bucle[1]} name="7 · Bucle">
          <EscenaBucle />
        </Sequence>
        <Audio src={staticFile(`audio/${toma}.wav`)} />
      </AbsoluteFill>
    </TomaContext.Provider>
  );
};
