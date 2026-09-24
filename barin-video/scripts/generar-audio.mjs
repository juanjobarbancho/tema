// Genera public/audio/banda-sonora.wav: efectos + música sintetizados desde cero,
// sincronizados con src/timeline.json. Sin samples externos → sin problemas de licencia.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const raiz = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const T = JSON.parse(fs.readFileSync(path.join(raiz, 'src/timeline.json'), 'utf8'));

const SR = 44100;
const FPS = T.fps;
const N = Math.ceil((T.total / FPS) * SR);
const L = new Float32Array(N);
const R = new Float32Array(N);
const f2s = (f) => f / FPS;
const TAU = Math.PI * 2;

// PRNG determinista para que el audio sea idéntico en cada render.
let semilla = 20260924;
const azar = () => {
  semilla |= 0;
  semilla = (semilla + 0x6d2b79f5) | 0;
  let t = Math.imul(semilla ^ (semilla >>> 15), 1 | semilla);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const ruido = () => azar() * 2 - 1;

const mezclar = (seg, buf, ganancia = 1, pan = 0) => {
  const gl = ganancia * Math.cos(((pan + 1) * Math.PI) / 4);
  const gr = ganancia * Math.sin(((pan + 1) * Math.PI) / 4);
  const i0 = Math.round(seg * SR);
  for (let i = 0; i < buf.length; i++) {
    const j = i0 + i;
    if (j < 0 || j >= N) continue;
    L[j] += buf[i] * gl;
    R[j] += buf[i] * gr;
  }
};

const buffer = (dur, fn) => {
  const b = new Float32Array(Math.round(dur * SR));
  for (let i = 0; i < b.length; i++) b[i] = fn(i / SR, i);
  return b;
};

const ataque = (t, a) => Math.min(1, t / a);

// ---------- Efectos ----------

// "Ding" de notificación: dos notas brillantes.
const ding = (f1, f2) =>
  buffer(0.6, (t) => {
    let s = Math.sin(TAU * f1 * t) * Math.exp(-t / 0.07) * ataque(t, 0.002);
    const t2 = t - 0.075;
    if (t2 > 0) s += Math.sin(TAU * f2 * t2) * Math.exp(-t2 / 0.18) * ataque(t2, 0.002) + 0.25 * Math.sin(TAU * 2 * f2 * t2) * Math.exp(-t2 / 0.06);
    return s * 0.5;
  });

// Vibración del móvil sobre la mesa.
const zumbido = (dur = 0.32) =>
  buffer(dur, (t) => {
    const env = ataque(t, 0.012) * Math.min(1, (dur - t) / 0.05);
    const base = Math.sin(TAU * 172 * t) + 0.5 * Math.sin(TAU * 344 * t) + 0.35 * Math.sign(Math.sin(TAU * 172 * t));
    const traqueteo = 0.65 + 0.35 * Math.sin(TAU * 31 * t);
    return base * traqueteo * env * 0.22;
  });

// Nota de marimba.
const marimba = (f, dur = 0.7) =>
  buffer(dur, (t) => {
    const a = ataque(t, 0.003);
    return (
      a *
      (Math.sin(TAU * f * t) * Math.exp(-t / 0.3) +
        0.3 * Math.sin(TAU * 3.99 * f * t) * Math.exp(-t / 0.045) +
        0.12 * Math.sin(TAU * 9.9 * f * t) * Math.exp(-t / 0.015))
    );
  });

// Soplido (transiciones): ruido filtrado con barrido de frecuencia.
const soplido = (dur = 0.5, desde = 300, hasta = 5200) => {
  let lp = 0,
    bp = 0;
  return buffer(dur, (t) => {
    const q = t / dur;
    const fc = desde * Math.pow(hasta / desde, Math.sin((q * Math.PI) / 2));
    const f = 2 * Math.sin((Math.PI * Math.min(fc, 8000)) / SR);
    const x = ruido();
    lp += f * bp;
    const hp = x - lp - 0.7 * bp;
    bp += f * hp;
    return bp * Math.pow(Math.sin(Math.PI * q), 2) * 0.55;
  });
};

// Golpe grave para "Te llamamos".
const golpe = () => {
  let fase = 0,
    lp = 0;
  return buffer(1.1, (t) => {
    const f = 42 + 90 * Math.exp(-t / 0.07);
    fase += (TAU * f) / SR;
    const sub = Math.sin(fase) * Math.exp(-t / 0.4);
    lp += 0.08 * (ruido() - lp);
    const cuerpo = lp * Math.exp(-t / 0.09) * 1.6;
    const clic = t < 0.004 ? ruido() * (1 - t / 0.004) : 0;
    return (sub * 0.9 + cuerpo + clic * 0.5) * 0.85;
  });
};

// Toque en la pantalla.
const toque = () => buffer(0.08, (t) => (Math.sin(TAU * 1900 * t) * 0.5 + ruido() * 0.4) * Math.exp(-t / 0.012) * 0.5);

// Bolígrafo sobre papel.
const garabato = (dur) => {
  let lp = 0,
    lp2 = 0;
  return buffer(dur, (t) => {
    const x = ruido();
    lp += 0.45 * (x - lp);
    lp2 += 0.08 * (x - lp2);
    const hp = lp - lp2;
    const trazos = Math.abs(Math.sin(TAU * 6.3 * t) * 0.6 + Math.sin(TAU * 10.7 * t + 1.3) * 0.4);
    const env = ataque(t, 0.02) * Math.min(1, (dur - t) / 0.05);
    return hp * trazos * env * 0.5;
  });
};

// "Pop" corto para cifras y checks.
const pop = (f = 900) =>
  buffer(0.14, (t) => Math.sin(TAU * (f - 350 * Math.min(1, t / 0.05)) * t) * Math.exp(-t / 0.035) * ataque(t, 0.002) * 0.55);

// Campana final (logo).
const campana = (f) =>
  buffer(3.2, (t) => {
    const a = ataque(t, 0.004);
    return (
      a *
      (Math.sin(TAU * f * t) * Math.exp(-t / 1.2) +
        0.5 * Math.sin(TAU * 2.76 * f * t) * Math.exp(-t / 0.5) +
        0.25 * Math.sin(TAU * 5.4 * f * t) * Math.exp(-t / 0.2)) *
      0.3
    );
  });

// ---------- Música ----------

const nota = (n) => 440 * Math.pow(2, (n - 69) / 12); // MIDI → Hz

// Pad cálido: armónicos suaves con leve desafinado.
const pad = (f, dur) =>
  buffer(dur, (t) => {
    const env = ataque(t, 0.7) * Math.min(1, (dur - t) / 0.9);
    let s = 0;
    for (let h = 1; h <= 6; h++) {
      const a = 1 / Math.pow(h, 1.7);
      s += a * (Math.sin(TAU * f * h * t * 1.0015) + Math.sin(TAU * f * h * t * 0.9985));
    }
    return s * env * 0.5 * (0.85 + 0.15 * Math.sin(TAU * 0.4 * t));
  });

// Punteo tipo guitarra (Karplus-Strong).
const punteo = (f, dur = 1.6) => {
  const periodo = Math.round(SR / f);
  const linea = new Float32Array(periodo);
  let prev = 0;
  for (let i = 0; i < periodo; i++) {
    prev = 0.5 * prev + 0.5 * ruido();
    linea[i] = prev;
  }
  let idx = 0;
  return buffer(dur, (t) => {
    const siguiente = (idx + 1) % periodo;
    const v = linea[idx];
    linea[idx] = 0.996 * 0.5 * (linea[idx] + linea[siguiente]);
    idx = siguiente;
    return v * Math.min(1, (dur - t) / 0.2);
  });
};

const bajo = (f, dur) =>
  buffer(dur, (t) => (Math.sin(TAU * f * t) + 0.35 * Math.sin(TAU * 2 * f * t)) * ataque(t, 0.01) * Math.exp(-t / 1.4) * Math.min(1, (dur - t) / 0.1));

const bombo = () => {
  let fase = 0;
  return buffer(0.4, (t) => {
    fase += (TAU * (48 + 110 * Math.exp(-t / 0.03))) / SR;
    return Math.sin(fase) * Math.exp(-t / 0.13);
  });
};

const charles = () => {
  let prev = 0;
  return buffer(0.06, (t) => {
    const x = ruido();
    const hp = x - prev;
    prev = x;
    return hp * Math.exp(-t / 0.012);
  });
};

// Progresión en Re mayor: D – Bm – G – A.
const ACORDES = [
  {bajo: 38, notas: [62, 66, 69, 73]}, // Dmaj7
  {bajo: 35, notas: [59, 62, 66, 69]}, // Bm7
  {bajo: 43, notas: [55, 59, 62, 66]}, // Gmaj7
  {bajo: 45, notas: [57, 61, 64, 66]}, // A6
];

const componerMusica = () => {
  // La música va ~4 dB por encima de lo que daría la suma "en crudo" para que empaste con los efectos.
  const m = (seg, buf, ganancia = 1, pan = 0) => mezclar(seg, buf, ganancia * 1.6, pan);
  const inicio = f2s(T.musica.inicio);
  const compas = f2s(T.musica.compas);
  const corchea = compas / 8;
  const final = T.total / FPS;
  const compases = Math.round((f2s(T.escenas.cierre[0] + T.cierre.logo + 8) - inicio) / compas);

  for (let k = 0; k <= compases; k++) {
    const t0 = inicio + k * compas;
    const ultimo = k === compases;
    const acorde = ultimo ? ACORDES[0] : ACORDES[k % 4];
    const dur = ultimo ? final - t0 : compas + 0.6;

    for (const n of acorde.notas) m(t0, pad(nota(n), dur), 0.03, (n % 5) / 5 - 0.4);
    m(t0, bajo(nota(acorde.bajo), Math.min(dur, compas)), 0.17);
    if (!ultimo) m(t0 + compas / 2, bajo(nota(acorde.bajo), compas / 2), 0.1);

    // Arpegio desde el segundo compás.
    if (k >= 1 && !ultimo) {
      const orden = [0, 1, 2, 3, 2, 1, 2, 3];
      const vol = k < 3 ? 0.09 : 0.12;
      orden.forEach((o, j) => {
        m(t0 + j * corchea, punteo(nota(acorde.notas[o] + 12)), vol * (j % 2 ? 0.75 : 1), j % 2 ? 0.35 : -0.35);
      });
    }

    // Percusión suave del compás 2 al penúltimo (el último antes del logo queda sin batería).
    if (k >= 2 && k < compases - 1) {
      for (let b = 0; b < 4; b++) {
        if (b % 2 === 0) m(t0 + b * (compas / 4), bombo(), 0.3);
        m(t0 + b * (compas / 4) + compas / 8, charles(), 0.06, 0.3);
      }
    }

    // Acorde final arpegiado lento + campana.
    if (ultimo) {
      acorde.notas.forEach((n, j) => m(t0 + j * 0.07, punteo(nota(n + 12), 3), 0.14, j % 2 ? 0.3 : -0.3));
      m(t0, campana(nota(86)), 0.9);
      m(t0, bajo(nota(38), final - t0), 0.18);
    }
  }
};

// ---------- Línea de tiempo ----------

const tel = T.telefono;
const [notasDesde] = T.escenas.notas;

// 1 · Alertas: cada notificación suena y vibra.
tel.notificaciones
  .filter((f) => f >= 0)
  .forEach((f, i) => {
    const t = f2s(f);
    const agudo = i % 2 === 0;
    mezclar(t, ding(agudo ? 1568 : 1397, agudo ? 2093 : 1865), 0.55 - Math.min(0.2, i * 0.012), i % 2 ? 0.25 : -0.25);
    mezclar(t, zumbido(), 0.9);
  });

// Barrido de notificaciones.
mezclar(f2s(tel.barrido), soplido(0.45, 600, 6000), 0.9, 0.4);

// Tono de llamada (motivo propio en Re mayor) + vibración.
const MOTIVO = [74, 81, 78, 81, 74, 81, 78, 86];
tel.tonos.forEach((f) => {
  const t = f2s(f);
  MOTIVO.forEach((n, j) => mezclar(t + j * 0.11, marimba(nota(n)), 0.35));
  mezclar(t, zumbido(0.7), 0.7);
});

// Toque en "Aceptar".
mezclar(f2s(tel.toque), toque(), 0.8);

// 2 · Te llamamos.
const [tlDesde] = T.escenas.teLlamamos;
mezclar(f2s(tlDesde), soplido(0.5), 0.9);
mezclar(f2s(tlDesde + T.teLlamamos.golpe), golpe(), 1);
mezclar(f2s(tlDesde + T.teLlamamos.sub1), pop(700), 0.35);

// 3 · Notas: transición, garabatos y checks.
mezclar(f2s(notasDesde), soplido(0.5, 400, 4000), 0.75, -0.3);
mezclar(f2s(notasDesde + 20), garabato(0.4), 0.9);
T.notas.items.forEach((f) => {
  mezclar(f2s(notasDesde + f), garabato(f2s(T.notas.escribir)), 0.9, 0.1);
  mezclar(f2s(notasDesde + f + T.notas.escribir), pop(1200), 0.35, 0.2);
});
mezclar(f2s(notasDesde + T.notas.barra), golpe(), 0.45);

// 4-5 · Fotos.
mezclar(f2s(T.escenas.foto1[0]), soplido(0.5), 0.8, 0.3);
mezclar(f2s(T.escenas.foto2[0]), soplido(0.5), 0.8, -0.3);

// 6 · Datos.
const [datosDesde] = T.escenas.datos;
mezclar(f2s(datosDesde), soplido(0.5), 0.8);
T.datos.filas.forEach((f, i) => mezclar(f2s(datosDesde + f), pop(760 + i * 90), 0.4));

// 7 · Cierre.
const [cierreDesde] = T.escenas.cierre;
mezclar(f2s(cierreDesde), soplido(0.55, 300, 3500), 0.8);
mezclar(f2s(cierreDesde + T.cierre.logo + 6), golpe(), 0.55);

componerMusica();

// ---------- Master ----------
let pico = 0;
for (let i = 0; i < N; i++) {
  L[i] = Math.tanh(L[i] * 1.1);
  R[i] = Math.tanh(R[i] * 1.1);
  pico = Math.max(pico, Math.abs(L[i]), Math.abs(R[i]));
}
const norm = 0.89 / pico;
const fundido = Math.round(0.6 * SR);

const datos = Buffer.alloc(N * 4);
for (let i = 0; i < N; i++) {
  const f = i > N - fundido ? (N - i) / fundido : 1;
  datos.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * norm * f)) * 32767), i * 4);
  datos.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * norm * f)) * 32767), i * 4 + 2);
}

const cabecera = Buffer.alloc(44);
cabecera.write('RIFF', 0);
cabecera.writeUInt32LE(36 + datos.length, 4);
cabecera.write('WAVE', 8);
cabecera.write('fmt ', 12);
cabecera.writeUInt32LE(16, 16);
cabecera.writeUInt16LE(1, 20);
cabecera.writeUInt16LE(2, 22);
cabecera.writeUInt32LE(SR, 24);
cabecera.writeUInt32LE(SR * 4, 28);
cabecera.writeUInt16LE(4, 32);
cabecera.writeUInt16LE(16, 34);
cabecera.write('data', 36);
cabecera.writeUInt32LE(datos.length, 40);

const salida = path.join(raiz, 'public/audio/banda-sonora.wav');
fs.mkdirSync(path.dirname(salida), {recursive: true});
fs.writeFileSync(salida, Buffer.concat([cabecera, datos]));
console.log(`Banda sonora: ${salida} (${(N / SR).toFixed(2)} s)`);
