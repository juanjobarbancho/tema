import '@fontsource/poppins/600.css';
import '@fontsource/poppins/800.css';
import {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender} from 'remotion';
import {Chevron, Logo} from './componentes/Marca';
import {C, FUENTE} from './tema';

// Portada del reel. Todo lo importante entre y=240 e y=1680 (lo que enseña el recorte 3:4 del perfil).
export const Portada: React.FC = () => {
  const [espera] = useState(() => delayRender('Cargando fuentes'));
  useEffect(() => {
    Promise.all(['600 40px Poppins', '800 40px Poppins'].map((f) => document.fonts.load(f, 'ÁÉÍÓÚ¿?')))
      .then(() => continueRender(espera))
      .catch(() => continueRender(espera));
  }, [espera]);

  return (
    <AbsoluteFill style={{background: C.magenta, fontFamily: FUENTE, color: C.blanco, textAlign: 'center'}}>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: 0.13}}>
        <Chevron ancho={1500} color={C.blanco} style={{transform: 'translateY(40px)'}} />
      </AbsoluteFill>
      <div style={{position: 'absolute', top: 470, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <div style={{position: 'relative', fontSize: 70, fontWeight: 600, letterSpacing: -1}}>
          NADA DE ALERTAS.
          <div style={{position: 'absolute', left: -12, right: -12, top: '52%', height: 9, borderRadius: 5, background: C.negro}} />
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          top: 610,
          left: 0,
          right: 0,
          fontSize: 164,
          fontWeight: 800,
          lineHeight: 0.95,
          letterSpacing: -6,
          textShadow: '0 12px 40px rgba(80,0,40,0.35)',
        }}
      >
        TE
        <br />
        LLAMAMOS.
      </div>
      <div style={{position: 'absolute', top: 1260, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <Logo ancho={300} colorChevron={C.blanco} />
      </div>
    </AbsoluteFill>
  );
};
