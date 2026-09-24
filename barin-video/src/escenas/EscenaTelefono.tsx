import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame} from 'remotion';
import {Chevron} from '../componentes/Marca';
import {IconoCandado, IconoCasa, IconoTelefono} from '../componentes/Iconos';
import {clamp, entrada, muelle, tramo} from '../componentes/anim';
import {C, FUENTE} from '../tema';
import T from '../timeline.json';

const E = T.telefono;

// Teléfono
const MOVIL = {x: 220, y: 610, w: 640, h: 1290, bisel: 16, radio: 92};
const PANTALLA = {w: MOVIL.w - MOVIL.bisel * 2, h: MOVIL.h - MOVIL.bisel * 2, radio: 78};

// Notificaciones
const TARJETA = {top: 350, lado: 20, alto: 164, hueco: 14};

// Textos genéricos: no imitan a ningún portal real.
const AVISOS = [
  {t: 'Nuevo piso en tu zona', d: '3 hab · 2 baños · 185.000 €'},
  {t: '¡Bajada de precio!', d: 'Un piso que viste hace 2 meses baja 1.000 €'},
  {t: '12 anuncios nuevos', d: 'Coinciden con tu búsqueda guardada'},
  {t: 'Te lo recomendamos', d: 'Chalet a 40 minutos (tú buscabas centro)'},
  {t: '¿Sigues buscando?', d: 'Completa tu perfil para recibir más alertas'},
  {t: 'Nuevo piso en tu zona', d: 'Quinto sin ascensor · para reformar'},
  {t: '¡No te lo pierdas!', d: '43 personas han visto este anuncio hoy'},
  {t: 'Alerta de alquiler', d: 'Estudio de 28 m² · 900 €/mes'},
];

const Notificacion: React.FC<{aviso: (typeof AVISOS)[number]}> = ({aviso}) => (
  <div
    style={{
      height: TARJETA.alto,
      borderRadius: 34,
      background: 'rgba(62, 54, 60, 0.9)',
      boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
      display: 'flex',
      gap: 18,
      padding: '22px 24px',
      boxSizing: 'border-box',
      fontFamily: FUENTE,
      color: C.blanco,
    }}
  >
    <div
      style={{
        width: 64,
        height: 64,
        borderRadius: 16,
        flexShrink: 0,
        background: 'linear-gradient(160deg, #6E7B88, #4A5561)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <IconoCasa tam={40} />
    </div>
    <div style={{flex: 1, minWidth: 0}}>
      <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 20, opacity: 0.6, letterSpacing: 1}}>
        <span>ALERTAS DE PISOS</span>
        <span>ahora</span>
      </div>
      <div style={{fontSize: 27, fontWeight: 600, marginTop: 2, lineHeight: 1.2}}>{aviso.t}</div>
      <div
        style={{
          fontSize: 23,
          opacity: 0.85,
          lineHeight: 1.25,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {aviso.d}
      </div>
    </div>
  </div>
);

const PantallaBloqueo: React.FC<{frame: number}> = ({frame}) => {
  const tiempos = E.notificaciones;
  const visibles = tiempos.map((s, i) => ({s, i})).filter(({s}) => s <= frame);
  const progreso = (s: number) =>
    s <= frame ? spring({frame: frame - s, fps: 30, config: {damping: 16, stiffness: 190, mass: 0.7}}) : 0;

  return (
    <AbsoluteFill
      style={{
        background: 'radial-gradient(120% 70% at 50% 0%, #4a1233 0%, #1a0b14 55%, #0b0b0b 100%)',
      }}
    >
      <div style={{position: 'absolute', top: 120, width: '100%', textAlign: 'center', color: C.blanco, fontFamily: FUENTE}}>
        <div style={{display: 'flex', justifyContent: 'center', opacity: 0.8}}>
          <IconoCandado tam={34} />
        </div>
        <div style={{fontSize: 148, fontWeight: 600, lineHeight: 1, marginTop: 10, letterSpacing: -4}}>10:27</div>
      </div>
      {visibles.map(({s, i}) => {
        // Las nuevas entran arriba y empujan hacia abajo al resto.
        const posicion = tiempos.filter((o) => o > s).reduce((acc, o) => acc + progreso(o), 0);
        if (posicion > 6.5) return null;
        const e = progreso(s);
        const indiceVisual = Math.round(posicion);
        const barrido = tramo(frame, E.barrido + indiceVisual * 1.3, 11, Easing.in(Easing.cubic));
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: TARJETA.lado,
              right: TARJETA.lado,
              top: TARJETA.top + posicion * (TARJETA.alto + TARJETA.hueco),
              opacity: e * (1 - barrido),
              transform: `translateY(${(1 - e) * -50}px) translateX(${barrido * 700}px) scale(${0.92 + 0.08 * e})`,
            }}
          >
            <Notificacion aviso={AVISOS[i % AVISOS.length]} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const BotonLlamada: React.FC<{color: string; colgar?: boolean; escala: number; etiqueta: string}> = ({
  color,
  colgar,
  escala,
  etiqueta,
}) => (
  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16}}>
    <div
      style={{
        width: 136,
        height: 136,
        borderRadius: '50%',
        background: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: `scale(${escala})`,
        boxShadow: `0 0 0 0 ${color}`,
      }}
    >
      <IconoTelefono tam={64} colgar={colgar} />
    </div>
    <div style={{fontSize: 26, opacity: 0.8}}>{etiqueta}</div>
  </div>
);

const PantallaLlamada: React.FC<{frame: number}> = ({frame}) => {
  const entra = tramo(frame, E.llamadaEntra, 12, Easing.bezier(0.2, 0.9, 0.2, 1));
  const aceptada = frame >= E.toque + 3;
  const pulsoAceptar = aceptada ? 1 : 1 + 0.06 * Math.sin((frame - E.llamadaEntra) * 0.35);
  const toque = frame - E.toque;
  const escalaToque = toque >= 0 && toque < 8 ? interpolate(toque, [0, 3, 8], [1, 0.86, 1], clamp) : 1;
  const segundos = Math.max(0, Math.floor((frame - E.toque - 3) / 30));

  return (
    <AbsoluteFill
      style={{
        transform: `translateY(${(1 - entra) * -100}%)`,
        background: 'linear-gradient(180deg, #3a0c25 0%, #140a10 55%, #0b0b0b 100%)',
        color: C.blanco,
        fontFamily: FUENTE,
        textAlign: 'center',
      }}
    >
      <div style={{position: 'absolute', top: 120, width: '100%', fontSize: 30, opacity: 0.7}}>
        {aceptada ? `00:0${segundos}` : 'llamada entrante…'}
      </div>
      <div style={{position: 'absolute', top: 170, width: '100%', fontSize: 104, fontWeight: 700, letterSpacing: -2}}>
        Barin
      </div>
      <div style={{position: 'absolute', top: 310, width: '100%', fontSize: 32, opacity: 0.75}}>Tu agente de siempre</div>

      {/* Avatar con ondas */}
      <div style={{position: 'absolute', top: 470, left: '50%', width: 0, height: 0}}>
        {[0, 1, 2].map((k) => {
          const ciclo = ((frame - E.llamadaEntra - k * 10) % 30 + 30) % 30;
          const q = ciclo / 30;
          return aceptada ? null : (
            <div
              key={k}
              style={{
                position: 'absolute',
                left: -125,
                top: 0,
                width: 250,
                height: 250,
                borderRadius: '50%',
                border: `4px solid ${C.magenta}`,
                opacity: (1 - q) * 0.7,
                transform: `scale(${1 + q * 0.75})`,
              }}
            />
          );
        })}
        <div
          style={{
            position: 'absolute',
            left: -125,
            top: 0,
            width: 250,
            height: 250,
            borderRadius: '50%',
            background: '#141414',
            border: `5px solid ${C.magenta}`,
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Chevron ancho={150} />
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          top: 880,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'space-around',
          opacity: aceptada ? interpolate(frame, [E.toque + 3, E.toque + 9], [1, 0], clamp) : 1,
        }}
      >
        <BotonLlamada color="#FF3B30" colgar escala={1} etiqueta="Rechazar" />
        <div style={{position: 'relative'}}>
          <BotonLlamada color="#34C759" escala={pulsoAceptar * escalaToque} etiqueta="Aceptar" />
          {toque >= 0 && toque < 14 ? (
            <div
              style={{
                position: 'absolute',
                left: 68 - 60,
                top: 68 - 60,
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.55)',
                opacity: interpolate(toque, [0, 14], [0.9, 0], clamp),
                transform: `scale(${interpolate(toque, [0, 14], [0.3, 1.8], clamp)})`,
              }}
            />
          ) : null}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Titulares: React.FC<{frame: number}> = ({frame}) => {
  const contador = 12 + Math.round(35 * interpolate(frame, [0, 86], [0, 1], {...clamp, easing: Easing.in(Easing.quad)}));
  const sale1 = tramo(frame, E.titular2 - 4, 10);
  const sale2 = tramo(frame, E.barrido, 8);
  const base: React.CSSProperties = {
    position: 'absolute',
    left: 60,
    right: 60,
    top: 150,
    height: 430,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    fontFamily: FUENTE,
    color: C.blanco,
    letterSpacing: -2,
  };
  return (
    <>
      {frame < E.titular2 + 8 ? (
        <div style={{...base, opacity: 1 - sale1, transform: `translateY(${-sale1 * 50}px)`}}>
          <div style={{fontSize: 70, fontWeight: 600, lineHeight: 1.1}}>Hoy te han llegado</div>
          <div style={{fontSize: 84, fontWeight: 800, lineHeight: 1.1}}>
            <span style={{color: C.magenta, fontVariantNumeric: 'tabular-nums'}}>{contador} alertas</span>
            <br />
            de pisos.
          </div>
        </div>
      ) : null}
      {frame >= E.titular2 && frame < E.barrido + 10 ? (
        <div style={{...base, opacity: 1 - sale2}}>
          <div style={{fontSize: 108, fontWeight: 800, lineHeight: 1.02, ...entrada(frame, E.titular2, 80)}}>
            Y <span style={{color: C.magenta}}>ninguna</span>
            <br />
            es tu casa.
          </div>
        </div>
      ) : null}
      {frame >= E.titularLlamada ? (
        <div style={base}>
          <div style={{fontSize: 74, fontWeight: 700, lineHeight: 1.08, ...entrada(frame, E.titularLlamada, 60)}}>
            En Barin, las alertas
          </div>
          <div
            style={{
              fontSize: 104,
              fontWeight: 800,
              lineHeight: 1.08,
              color: C.magenta,
              ...entrada(frame, E.titularLlamada + 8, 60),
            }}
          >
            suenan así:
          </div>
        </div>
      ) : null}
    </>
  );
};

export const EscenaTelefono: React.FC = () => {
  const frame = useCurrentFrame();

  // Vibración: cada notificación sacude el móvil, y también cada tono de llamada.
  let amplitud = 0;
  for (const s of E.notificaciones) {
    const d = frame - s;
    if (s >= 0 && d >= 0 && d < 10) amplitud += (1 - d / 10) * 9;
  }
  for (const s of E.tonos) {
    const d = frame - s;
    if (d >= 0 && d < 22) amplitud += 6;
  }
  amplitud = Math.min(amplitud, 16);
  const dx = Math.sin(frame * 2.9) * amplitud;
  const giro = Math.sin(frame * 2.3) * amplitud * 0.09;

  // Leve acercamiento cuando entra la llamada.
  const zoom = interpolate(frame, [E.llamadaEntra, E.llamadaEntra + 40], [1, 1.03], clamp);
  const aparece = muelle(frame, -6, {damping: 20});

  return (
    <AbsoluteFill style={{background: C.negro}}>
      <AbsoluteFill
        style={{
          background: 'radial-gradient(60% 40% at 50% 62%, rgba(226,0,122,0.22) 0%, rgba(226,0,122,0) 70%)',
        }}
      />
      <Titulares frame={frame} />
      <div
        style={{
          position: 'absolute',
          left: MOVIL.x,
          top: MOVIL.y,
          width: MOVIL.w,
          height: MOVIL.h,
          borderRadius: MOVIL.radio,
          background: 'linear-gradient(145deg, #3a3a3a, #121212 40%, #262626)',
          padding: MOVIL.bisel,
          boxSizing: 'border-box',
          boxShadow: '0 40px 90px rgba(0,0,0,0.6), inset 0 0 0 2px #4a4a4a',
          transform: `translateX(${dx}px) rotate(${giro}deg) scale(${zoom * (0.94 + 0.06 * aparece)})`,
          transformOrigin: '50% 30%',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: PANTALLA.w,
            height: PANTALLA.h,
            borderRadius: PANTALLA.radio,
            overflow: 'hidden',
            background: '#000',
          }}
        >
          <PantallaBloqueo frame={frame} />
          {frame >= E.llamadaEntra ? <PantallaLlamada frame={frame} /> : null}
          {/* Barra de estado + isla */}
          <div
            style={{
              position: 'absolute',
              top: 22,
              left: '50%',
              width: 190,
              height: 54,
              marginLeft: -95,
              borderRadius: 30,
              background: '#000',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 30,
              left: 58,
              right: 58,
              display: 'flex',
              justifyContent: 'space-between',
              color: C.blanco,
              fontFamily: FUENTE,
              fontWeight: 600,
              fontSize: 26,
            }}
          >
            <span>10:27</span>
            <span style={{display: 'flex', alignItems: 'center', gap: 6}}>
              <span style={{width: 44, height: 22, borderRadius: 7, border: '2px solid rgba(255,255,255,0.7)', padding: 2, boxSizing: 'border-box'}}>
                <span style={{display: 'block', width: '70%', height: '100%', borderRadius: 3, background: C.blanco}} />
              </span>
            </span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
