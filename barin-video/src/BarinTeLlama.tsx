import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '@fontsource/poppins/800.css';
import '@fontsource/caveat/600.css';
import '@fontsource/caveat/700.css';
import {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, Sequence, continueRender, delayRender, staticFile} from 'remotion';
import {EscenaCierre} from './escenas/EscenaCierre';
import {EscenaDatos} from './escenas/EscenaDatos';
import {EscenaFoto} from './escenas/EscenaFoto';
import {EscenaNotas} from './escenas/EscenaNotas';
import {EscenaTeLlamamos} from './escenas/EscenaTeLlamamos';
import {EscenaTelefono} from './escenas/EscenaTelefono';
import {C} from './tema';
import T from './timeline.json';

const FUENTES = [
  '400 40px Poppins',
  '500 40px Poppins',
  '600 40px Poppins',
  '700 40px Poppins',
  '800 40px Poppins',
  '600 40px Caveat',
  '700 40px Caveat',
];

const S = T.escenas;

export const BarinTeLlama: React.FC = () => {
  const [espera] = useState(() => delayRender('Cargando fuentes'));
  useEffect(() => {
    Promise.all(FUENTES.map((f) => document.fonts.load(f, 'áéíóúñ¿¡ABC')))
      .then(() => continueRender(espera))
      .catch(() => continueRender(espera));
  }, [espera]);

  return (
    <AbsoluteFill style={{background: C.negro}}>
      <Sequence from={S.telefono[0]} durationInFrames={S.telefono[1]} name="1 · Alertas y llamada">
        <EscenaTelefono />
      </Sequence>
      <Sequence from={S.teLlamamos[0]} durationInFrames={S.teLlamamos[1]} name="2 · Te llamamos">
        <EscenaTeLlamamos />
      </Sequence>
      <Sequence from={S.notas[0]} durationInFrames={S.notas[1]} name="3 · Notas de la llamada">
        <EscenaNotas />
      </Sequence>
      <Sequence from={S.foto1[0]} durationInFrames={S.foto1[1]} name="4 · Una persona">
        <EscenaFoto
          imagen="img/asesoramiento.jpg"
          encuadre="40% 50%"
          lineas={['Lo sabe', 'una persona.']}
          caja="Que te escucha."
          cajaFondo={C.blanco}
          cajaColor={C.negro}
        />
      </Sequence>
      <Sequence from={S.foto2[0]} durationInFrames={S.foto2[1]} name="5 · Tu casa">
        <EscenaFoto
          imagen="img/entrega-llaves.jpg"
          encuadre="52% 50%"
          lineas={['Y te llama', 'cuando aparece']}
          caja="tu casa."
          cajaFondo={C.magenta}
          cajaColor={C.blanco}
        />
      </Sequence>
      <Sequence from={S.datos[0]} durationInFrames={S.datos[1]} name="6 · Datos">
        <EscenaDatos />
      </Sequence>
      <Sequence from={S.cierre[0]} durationInFrames={S.cierre[1]} name="7 · Cierre">
        <EscenaCierre />
      </Sequence>
      <Audio src={staticFile('audio/banda-sonora.wav')} />
    </AbsoluteFill>
  );
};
