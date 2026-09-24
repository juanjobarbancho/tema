import {AbsoluteFill, Easing, interpolate, spring} from 'remotion';
import {C, FUENTE} from '../tema';
import {IconoCandado, IconoCasa, IconoTelefono} from './Iconos';
import {Chevron, Logo} from './Marca';
import {clamp, tramo} from './anim';

export const MOVIL = {x: 220, y: 610, w: 640, h: 1290, bisel: 16, radio: 92};
const PANTALLA = {w: MOVIL.w - MOVIL.bisel * 2, h: MOVIL.h - MOVIL.bisel * 2, radio: 78};
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
      background: 'rgba(62, 54, 60, 0.92)',
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

const PantallaBloqueo: React.FC<{frame: number; notificaciones: number[]; barrido?: number}> = ({frame, notificaciones, barrido}) => {
  const progreso = (s: number) =>
    s <= frame ? spring({frame: frame - s, fps: 30, config: {damping: 16, stiffness: 190, mass: 0.7}}) : 0;

  return (
    <AbsoluteFill style={{background: 'radial-gradient(120% 70% at 50% 0%, #4a1233 0%, #1a0b14 55%, #0b0b0b 100%)'}}>
      <div style={{position: 'absolute', top: 120, width: '100%', textAlign: 'center', color: C.blanco, fontFamily: FUENTE}}>
        <div style={{display: 'flex', justifyContent: 'center', opacity: 0.8}}>
          <IconoCandado tam={34} />
        </div>
        <div style={{fontSize: 148, fontWeight: 600, lineHeight: 1, marginTop: 10, letterSpacing: -4}}>10:27</div>
      </div>
      {notificaciones.map((s, i) => {
        if (s > frame) return null;
        // Las nuevas entran arriba y empujan hacia abajo al resto.
        const posicion = notificaciones.filter((o) => o > s).reduce((acc, o) => acc + progreso(o), 0);
        if (posicion > 6.5) return null;
        const e = progreso(s);
        const salida = barrido === undefined ? 0 : tramo(frame, barrido + Math.round(posicion) * 1.3, 11, Easing.in(Easing.cubic));
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: TARJETA.lado,
              right: TARJETA.lado,
              top: TARJETA.top + posicion * (TARJETA.alto + TARJETA.hueco),
              opacity: e * (1 - salida),
              transform: `translateY(${(1 - e) * -50}px) translateX(${salida * 700}px) scale(${0.92 + 0.08 * e})`,
            }}
          >
            <Notificacion aviso={AVISOS[i % AVISOS.length]} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const BotonLlamada: React.FC<{color: string; colgar?: boolean; escala: number; etiqueta: string}> = ({color, colgar, escala, etiqueta}) => (
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
      }}
    >
      <IconoTelefono tam={64} colgar={colgar} />
    </div>
    <div style={{fontSize: 26, opacity: 0.8}}>{etiqueta}</div>
  </div>
);

const PantallaLlamada: React.FC<{frame: number; entra: number; toque?: number}> = ({frame, entra, toque}) => {
  const p = tramo(frame, entra, 12, Easing.bezier(0.2, 0.9, 0.2, 1));
  const aceptada = toque !== undefined && frame >= toque + 3;
  const pulso = aceptada ? 1 : 1 + 0.06 * Math.sin((frame - entra) * 0.35);
  const dt = toque === undefined ? -1 : frame - toque;
  const escalaToque = dt >= 0 && dt < 8 ? interpolate(dt, [0, 3, 8], [1, 0.86, 1], clamp) : 1;

  return (
    <AbsoluteFill
      style={{
        transform: `translateY(${(1 - p) * -100}%)`,
        background: 'linear-gradient(180deg, #3a0c25 0%, #140a10 55%, #0b0b0b 100%)',
        color: C.blanco,
        fontFamily: FUENTE,
        textAlign: 'center',
      }}
    >
      <div style={{position: 'absolute', top: 118, width: '100%', fontSize: 30, opacity: 0.7}}>
        {aceptada ? '00:00' : 'llamada entrante…'}
      </div>
      {/* Logo oficial de Barin como nombre del contacto */}
      <div style={{position: 'absolute', top: 170, width: '100%', display: 'flex', justifyContent: 'center'}}>
        <Logo ancho={300} />
      </div>
      <div style={{position: 'absolute', top: 440, width: '100%', fontSize: 30, opacity: 0.75}}>Tu agente de siempre</div>

      <div style={{position: 'absolute', top: 540, left: '50%', width: 0, height: 0}}>
        {[0, 1, 2].map((k) => {
          const q = (((frame - entra - k * 10) % 30) + 30) % 30 / 30;
          return aceptada ? null : (
            <div
              key={k}
              style={{
                position: 'absolute',
                left: -115,
                top: 0,
                width: 230,
                height: 230,
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
            left: -115,
            top: 0,
            width: 230,
            height: 230,
            borderRadius: '50%',
            background: '#141414',
            border: `5px solid ${C.magenta}`,
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Chevron ancho={140} />
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          top: 900,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'space-around',
          opacity: aceptada && toque !== undefined ? interpolate(frame, [toque + 3, toque + 9], [1, 0], clamp) : 1,
        }}
      >
        <BotonLlamada color="#FF3B30" colgar escala={1} etiqueta="Rechazar" />
        <div style={{position: 'relative'}}>
          <BotonLlamada color="#34C759" escala={pulso * escalaToque} etiqueta="Aceptar" />
          {dt >= 0 && dt < 14 ? (
            <div
              style={{
                position: 'absolute',
                left: 8,
                top: 8,
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.55)',
                opacity: interpolate(dt, [0, 14], [0.9, 0], clamp),
                transform: `scale(${interpolate(dt, [0, 14], [0.3, 1.8], clamp)})`,
              }}
            />
          ) : null}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Movil: React.FC<{
  frame: number;
  notificaciones: number[];
  barrido?: number;
  llamada?: number;
  toque?: number;
  tonos?: number[];
  subida?: number; // 0 → fuera de cuadro abajo, 1 → en su sitio
}> = ({frame, notificaciones, barrido, llamada, toque, tonos = [], subida = 1}) => {
  // Vibración: cada notificación sacude el móvil, y también cada tono de llamada.
  let amplitud = 0;
  for (const s of notificaciones) {
    const d = frame - s;
    if (s >= 0 && d >= 0 && d < 10) amplitud += (1 - d / 10) * 9;
  }
  for (const s of tonos) {
    const d = frame - s;
    if (d >= 0 && d < 22) amplitud += 6;
  }
  amplitud = Math.min(amplitud, 16);
  const dx = Math.sin(frame * 2.9) * amplitud;
  const giro = Math.sin(frame * 2.3) * amplitud * 0.09;
  const zoom = llamada === undefined ? 1 : interpolate(frame, [llamada, llamada + 40], [1, 1.03], clamp);

  return (
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
        transform: `translateY(${(1 - subida) * 1400}px) translateX(${dx}px) rotate(${giro}deg) scale(${zoom})`,
        transformOrigin: '50% 30%',
      }}
    >
      <div style={{position: 'relative', width: PANTALLA.w, height: PANTALLA.h, borderRadius: PANTALLA.radio, overflow: 'hidden', background: '#000'}}>
        <PantallaBloqueo frame={frame} notificaciones={notificaciones} barrido={barrido} />
        {llamada !== undefined && frame >= llamada ? <PantallaLlamada frame={frame} entra={llamada} toque={toque} /> : null}
        <div style={{position: 'absolute', top: 22, left: '50%', width: 190, height: 54, marginLeft: -95, borderRadius: 30, background: '#000'}} />
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
          <span style={{width: 44, height: 22, borderRadius: 7, border: '2px solid rgba(255,255,255,0.7)', padding: 2, boxSizing: 'border-box'}}>
            <span style={{display: 'block', width: '70%', height: '100%', borderRadius: 3, background: C.blanco}} />
          </span>
        </div>
      </div>
    </div>
  );
};

// Rótulo grande en mayúsculas sobre el móvil (3–5 palabras como mucho).
export const Rotulo: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <div
    style={{
      position: 'absolute',
      left: 50,
      right: 50,
      top: 170,
      height: 400,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      fontFamily: FUENTE,
      fontWeight: 800,
      color: C.blanco,
      letterSpacing: -3,
      lineHeight: 1,
      ...style,
    }}
  >
    {children}
  </div>
);

// Resplandor magenta de fondo detrás del móvil.
export const FondoMovil: React.FC = () => (
  <AbsoluteFill style={{background: 'radial-gradient(60% 40% at 50% 62%, rgba(226,0,122,0.22) 0%, rgba(226,0,122,0) 70%)'}} />
);
