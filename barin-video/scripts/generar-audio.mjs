// Mezcla la banda sonora de una toma: voz + música generada + efectos, todo sincronizado con
// las marcas de src/voz/<toma>.json. Sin samples ni música de terceros → sin problemas de derechos.
//
// uso: node scripts/generar-audio.mjs laomedeia   → public/audio/laomedeia.wav
//
// - La música baja 9 dB mientras habla la voz (y los efectos, 8 dB).
// - Parón justo antes de "Te llaman" y golpe en "llaman".
// - Master a -14 LUFS con el pico en -1,5 dBTP (loudnorm de ffmpeg, dos pasadas).
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const raiz = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const nombre = process.argv[2];
if (!nombre) throw new Error('Indica la toma: node scripts/generar-audio.mjs laomedeia');
const T = JSON.parse(fs.readFileSync(path.join(raiz, 'src/voz', `${nombre}.json`), 'utf8'));
const M = T.marcas;
const E = T.eventos;
const S = T.escenas;

const SR = 44100;
const FPS = T.fps;
const N = Math.ceil((T.total / FPS) * SR);
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

const bus = () => ({L: new Float32Array(N), R: new Float32Array(N)});
const MUSICA = bus();
const EFECTOS = bus(); // bajan un poco cuando habla la voz
const GOLPES = bus(); // transiciones y golpes: no se tocan

const mezclarEn = (destino) => (seg, buf, ganancia = 1, pan = 0) => {
  const gl = ganancia * Math.cos(((pan + 1) * Math.PI) / 4);
  const gr = ganancia * Math.sin(((pan + 1) * Math.PI) / 4);
  const i0 = Math.round(seg * SR);
  for (let i = 0; i < buf.length; i++) {
    const j = i0 + i;
    if (j < 0 || j >= N) continue;
    destino.L[j] += buf[i] * gl;
    destino.R[j] += buf[i] * gr;
  }
};
const musica = mezclarEn(MUSICA);
const efecto = mezclarEn(EFECTOS);
const golpeo = mezclarEn(GOLPES);

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


// ---------- Voz ----------

const leerWav = (archivo) => {
  const b = fs.readFileSync(archivo);
  let o = 12;
  let canales = 2;
  let bits = 16;
  while (o < b.length) {
    const id = b.toString('ascii', o, o + 4);
    const tam = b.readUInt32LE(o + 4);
    if (id === 'fmt ') {
      canales = b.readUInt16LE(o + 10);
      bits = b.readUInt16LE(o + 22);
    }
    if (id === 'data') {
      const n = tam / (bits / 8) / canales;
      const l = new Float32Array(n);
      const r = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        l[i] = b.readInt16LE(o + 8 + i * canales * 2) / 32768;
        r[i] = canales > 1 ? b.readInt16LE(o + 8 + i * canales * 2 + 2) / 32768 : l[i];
      }
      return {l, r};
    }
    o += 8 + tam;
  }
  throw new Error(`WAV sin datos: ${archivo}`);
};

const voz = leerWav(path.join(raiz, 'public/voz', `${nombre}.wav`));
const VOZ = bus();
let picoVoz = 0;
for (let i = 0; i < voz.l.length; i++) picoVoz = Math.max(picoVoz, Math.abs(voz.l[i]), Math.abs(voz.r[i]));
for (let i = 0; i < Math.min(N, voz.l.length); i++) {
  VOZ.L[i] = (voz.l[i] / picoVoz) * 0.8;
  VOZ.R[i] = (voz.r[i] / picoVoz) * 0.8;
}

// Envolvente de la voz para el ducking (bloques de 10 ms, con 60 ms de anticipación).
const BLOQUE = SR / 100;
const bloques = Math.ceil(N / BLOQUE);
const activa = new Float32Array(bloques);
for (let k = 0; k < bloques; k++) {
  let suma = 0;
  for (let i = k * BLOQUE; i < Math.min(N, (k + 1) * BLOQUE); i++) suma += VOZ.L[i] * VOZ.L[i];
  activa[k] = Math.sqrt(suma / BLOQUE) > 0.02 ? 1 : 0;
}
const anticipada = new Float32Array(bloques);
for (let k = 0; k < bloques; k++) {
  for (let d = 0; d <= 6 && k + d < bloques; d++) anticipada[k] = Math.max(anticipada[k], activa[k + d]);
}
const curvaDucking = (reduccionDb) => {
  const minimo = Math.pow(10, -reduccionDb / 20);
  const g = new Float32Array(N);
  let actual = 1;
  const ataque = 1 - Math.exp(-1 / (0.03 * SR));
  const suelta = 1 - Math.exp(-1 / (0.35 * SR));
  for (let i = 0; i < N; i++) {
    const objetivo = anticipada[Math.floor(i / BLOQUE)] ? minimo : 1;
    actual += (objetivo - actual) * (objetivo < actual ? ataque : suelta);
    g[i] = actual;
  }
  return g;
};

// ---------- Música ----------

// Compás calculado para que 5 compases vayan de "llaman" al logo: el acorde final cae en el logo.
const inicioCalido = f2s(M.llaman);
const compas = (f2s(M.cta) - inicioCalido) / 5;
const corchea = compas / 8;

// Intro: pulso grave en Re, tenso, hasta el parón.
const parón = f2s(M.teLlaman) - 0.3;
for (let t = 0, j = 0; t < parón - 0.05; t += corchea, j++) {
  const acento = j % 8 === 0 ? 1 : j % 2 === 0 ? 0.7 : 0.5;
  musica(t, punteo(nota(50), Math.min(0.5, parón - t)), 0.14 * acento, j % 2 ? 0.2 : -0.2);
  if (j % 4 === 2) musica(t, charles(), 0.05, 0.3);
}
musica(0, bajo(nota(38), parón), 0.1);

const PROGRESION = [
  ACORDES[0], // D
  ACORDES[1], // Bm
  ACORDES[2], // G
  {bajo: 40, notas: [55, 59, 62, 64]}, // Em7
  ACORDES[3], // A
];
PROGRESION.forEach((acorde, k) => {
  const t0 = inicioCalido + k * compas;
  for (const n of acorde.notas) musica(t0, pad(nota(n), compas + 0.6), 0.05, (n % 5) / 5 - 0.4);
  musica(t0, bajo(nota(acorde.bajo), compas), 0.27);
  musica(t0 + compas / 2, bajo(nota(acorde.bajo), compas / 2), 0.16);
  const orden = [0, 1, 2, 3, 2, 1, 2, 3];
  orden.forEach((o, j) => musica(t0 + j * corchea, punteo(nota(acorde.notas[o] + 12)), (k === 0 ? 0.12 : 0.18) * (j % 2 ? 0.75 : 1), j % 2 ? 0.35 : -0.35));
  if (k >= 1) {
    for (let b = 0; b < 4; b++) {
      if (b % 2 === 0) musica(t0 + b * (compas / 4), bombo(), 0.45);
      musica(t0 + b * (compas / 4) + compas / 8, charles(), 0.09, 0.3);
    }
  }
});

// Resolución en el logo y final tranquilo para que el bucle empiece limpio.
const tLogo = f2s(M.cta);
const tFin = T.total / FPS;
ACORDES[0].notas.forEach((n, j) => musica(tLogo + j * 0.07, punteo(nota(n + 12), 3), 0.2, j % 2 ? 0.3 : -0.3));
for (const n of ACORDES[0].notas) musica(tLogo, pad(nota(n), tFin - tLogo), 0.045, (n % 5) / 5 - 0.4);
musica(tLogo, bajo(nota(38), tFin - tLogo), 0.22);
golpeo(tLogo + f2s(E.cierre.logo + 5), campana(nota(86)), 0.9);

// ---------- Efectos ----------

// 1 · Alertas: cada notificación suena y vibra.
T.notificaciones
  .filter((f) => f >= 0)
  .forEach((f, i) => {
    const agudo = i % 2 === 0;
    efecto(f2s(f), ding(agudo ? 1568 : 1397, agudo ? 2093 : 1865), 0.3 - Math.min(0.1, i * 0.008), i % 2 ? 0.25 : -0.25);
    efecto(f2s(f), zumbido(), 0.4);
  });
golpeo(f2s(E.barrido), soplido(0.45, 600, 6000), 0.8, 0.4);

// Tono de llamada (motivo propio en Re mayor) + vibración.
const MOTIVO = [74, 81, 78, 81, 74, 81, 78, 86];
const sonarLlamada = (f) => {
  MOTIVO.forEach((n, j) => efecto(f2s(f) + j * 0.11, marimba(nota(n)), 0.24));
  efecto(f2s(f), zumbido(0.7), 0.3);
};
E.tonos.forEach(sonarLlamada);
efecto(f2s(E.toque), toque(), 0.8);

// 2 · Te llamamos.
golpeo(f2s(S.teLlamamos[0]) - 0.1, soplido(0.45), 0.8);
golpeo(f2s(M.llaman), golpe(), 1);

// 3 · Notas: bolígrafo y checks.
const [notas0] = S.notas;
golpeo(f2s(notas0), soplido(0.5, 400, 4000), 0.6, -0.3);
efecto(f2s(notas0 + 4), garabato(0.35), 0.8);
E.notasItems.forEach((f) => {
  efecto(f2s(notas0 + f), garabato(f2s(E.notasEscribir)), 0.85, 0.1);
  efecto(f2s(notas0 + f + E.notasEscribir), pop(1200), 0.3, 0.2);
});

// 4 · Persona.
golpeo(f2s(S.persona[0]), soplido(0.5), 0.7, 0.3);

// 5 · Datos.
const [datos0] = S.datos;
golpeo(f2s(datos0), soplido(0.5), 0.7);
[E.datos.oficinas, E.datos.profesionales, E.datos.anio + 10, E.datos.ciudades].forEach((f, i) => efecto(f2s(datos0 + f), pop(760 + i * 90), 0.4));

// 6 · Logo.
golpeo(f2s(S.cierre[0]), soplido(0.55, 300, 3500), 0.7);
golpeo(f2s(S.cierre[0] + E.cierre.logo + 5), golpe(), 0.45);

// 7 · Bucle: vuelven las alertas… y suena la llamada.
const [bucle0] = S.bucle;
golpeo(f2s(bucle0), soplido(0.45), 0.6);
E.bucle.notificaciones.forEach((f, i) => {
  efecto(f2s(bucle0 + f), ding(i % 2 ? 1397 : 1568, i % 2 ? 1865 : 2093), 0.2);
  efecto(f2s(bucle0 + f), zumbido(), 0.3);
});
E.bucle.tonos.forEach((f) => sonarLlamada(bucle0 + f));

// ---------- Mezcla y master ----------

const duckMusica = curvaDucking(9);
const duckEfectos = curvaDucking(8);
const MEZCLA = bus();
const fundido = Math.round(0.35 * SR);
for (let i = 0; i < N; i++) {
  const fin = i > N - fundido ? (N - i) / fundido : 1;
  for (const c of ['L', 'R']) {
    MEZCLA[c][i] = (VOZ[c][i] + MUSICA[c][i] * 0.75 * duckMusica[i] + EFECTOS[c][i] * duckEfectos[i] + GOLPES[c][i] * 0.8) * fin;
  }
}

const escribirWav = (archivo, {L, R}) => {
  let pico = 0;
  for (let i = 0; i < N; i++) pico = Math.max(pico, Math.abs(L[i]), Math.abs(R[i]));
  const g = pico > 0.98 ? 0.98 / pico : 1;
  const datos = Buffer.alloc(N * 4);
  for (let i = 0; i < N; i++) {
    datos.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * g)) * 32767), i * 4);
    datos.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * g)) * 32767), i * 4 + 2);
  }
  const cab = Buffer.alloc(44);
  cab.write('RIFF', 0);
  cab.writeUInt32LE(36 + datos.length, 4);
  cab.write('WAVE', 8);
  cab.write('fmt ', 12);
  cab.writeUInt32LE(16, 16);
  cab.writeUInt16LE(1, 20);
  cab.writeUInt16LE(2, 22);
  cab.writeUInt32LE(SR, 24);
  cab.writeUInt32LE(SR * 4, 28);
  cab.writeUInt16LE(4, 32);
  cab.writeUInt16LE(16, 34);
  cab.write('data', 36);
  cab.writeUInt32LE(datos.length, 40);
  fs.writeFileSync(archivo, Buffer.concat([cab, datos]));
};

fs.mkdirSync(path.join(raiz, 'public/audio'), {recursive: true});
const bruto = path.join(raiz, 'public/audio', `${nombre}.bruto.wav`);
const salida = path.join(raiz, 'public/audio', `${nombre}.wav`);
escribirWav(bruto, MEZCLA);

// Loudnorm en dos pasadas: -14 LUFS integrados, pico real -1,5 dBTP.
const bin = path.join(raiz, 'node_modules/@remotion/compositor-linux-x64-gnu');
const ff = (args) =>
  execFileSync(path.join(bin, 'ffmpeg'), args, {env: {...process.env, LD_LIBRARY_PATH: bin}, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']});
// loudnorm escribe su medida (JSON) en stderr.
const medirLoudness = (archivo) => {
  const log = execFileSync('bash', ['-c', `LD_LIBRARY_PATH="${bin}" "${bin}/ffmpeg" -hide_banner -i "${archivo}" -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1`], {
    encoding: 'utf8',
  });
  return JSON.parse(log.slice(log.lastIndexOf('{'), log.lastIndexOf('}') + 1));
};
const medida = medirLoudness(bruto);
ff([
  '-loglevel',
  'error',
  '-y',
  '-i',
  bruto,
  '-af',
  `loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=${medida.input_i}:measured_TP=${medida.input_tp}:measured_LRA=${medida.input_lra}:measured_thresh=${medida.input_thresh}:offset=${medida.target_offset}:linear=true,aresample=44100`,
  '-c:a',
  'pcm_s16le',
  salida,
]);
fs.rmSync(bruto);

const final = medirLoudness(salida);
console.log(`Banda sonora ${nombre}: ${(N / SR).toFixed(2)} s · ${final.input_i} LUFS · pico ${final.input_tp} dBTP`);
