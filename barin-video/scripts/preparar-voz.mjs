// Convierte una toma de voz (wav + tiempos de Whisper) en las marcas que usa el montaje.
// El vídeo se monta sobre la voz: cada aparición cae en la palabra que la nombra.
//
// uso: node scripts/preparar-voz.mjs laomedeia
//   lee  voz-tomas/<toma>.wav y voz-tomas/<toma>.json (de scripts/transcribir.py)
//   crea public/voz/<toma>.wav (44,1 kHz) y src/voz/<toma>.json (marcas en frames)
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const raiz = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const toma = process.argv[2];
if (!toma) throw new Error('Indica la toma: node scripts/preparar-voz.mjs laomedeia');

const FPS = 30;
const COLA = 1.7; // segundos de imagen después de la última palabra (el teléfono sonando antes del bucle)
const ADELANTO = 2; // frames: lo visual entra un pelín antes que la palabra

const whisper = JSON.parse(fs.readFileSync(path.join(raiz, 'voz-tomas', `${toma}.json`), 'utf8'));
const normal = (w) =>
  w
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '');
const palabras = whisper.palabras.map((p) => ({...p, n: normal(p.w)}));

// Cada marca es una secuencia de palabras del guion; se buscan en orden.
const MARCAS = [
  ['inicio', ['cuarenta', 'y', 'siete']],
  ['ninguna', ['ninguna']],
  ['hasta', ['hasta', 'que']],
  ['distinto', ['distinto']],
  ['barin', ['es', 'barin']],
  ['noAlertas', ['no', 'te', 'mandan']],
  ['teLlaman', ['te', 'llaman']],
  ['llaman', ['llaman']],
  ['acuerdan', ['y', 'se', 'acuerdan']],
  ['luz', ['la', 'luz']],
  ['cole', ['el', 'cole']],
  ['quintos', ['nada', 'de', 'quintos']],
  ['algoritmo', ['eso', 'no', 'lo', 'sabe']],
  ['persona', ['lo', 'sabe', 'una', 'persona']],
  ['llevan', ['llevan']],
  ['noventa', ['noventa']],
  ['cta', ['cuentales']],
  ['yaTeLlaman', ['ya', 'te', 'llaman']],
  ['cierre', ['cuarenta', 'y', 'siete']],
  ['llamada', ['una', 'llamada']],
];

const marcas = {};
let desde = 0;
for (const [nombre, secuencia] of MARCAS) {
  let encontrado = -1;
  for (let i = desde; i <= palabras.length - secuencia.length; i++) {
    if (secuencia.every((s, k) => palabras[i + k].n === s)) {
      encontrado = i;
      break;
    }
  }
  if (encontrado < 0) throw new Error(`No encuentro «${secuencia.join(' ')}» en la toma ${toma}`);
  // "llaman" es el golpe exacto: sin adelanto.
  const adelanto = nombre === 'llaman' ? 0 : ADELANTO;
  marcas[nombre] = Math.max(0, Math.round(palabras[encontrado].ini * FPS) - adelanto);
  desde = encontrado + 1;
}

const ultima = palabras[palabras.length - 1];
marcas.finVoz = Math.round(ultima.fin * FPS);
const total = Math.ceil((ultima.fin + COLA) * FPS);

// Notificaciones: cada vez más seguidas hasta que el móvil "suena distinto".
const notificaciones = [-40, -20];
let f = 0;
let hueco = 13;
while (f < marcas.hasta - 10) {
  notificaciones.push(Math.round(f));
  f += hueco;
  hueco = Math.max(3.2, hueco * 0.86);
}

// Escenas [desde, duración] y eventos, todo derivado de la voz. Remotion y la mezcla de audio leen lo mismo.
const M = marcas;
const TEJADO = 14; // lo que tarda la transición en cubrir la pantalla
const hasta = (siguiente) => siguiente + TEJADO;
const llamada = M.distinto - 10;
const toque = M.teLlaman - 4;
const tonos = [];
for (let t = llamada + 2; t < toque - 16; t += 36) tonos.push(t);
const inicioNotas = M.acuerdan + 4;

const escenas = {
  telefono: [0, hasta(M.teLlaman)],
  teLlamamos: [M.teLlaman, hasta(inicioNotas) - M.teLlaman],
  notas: [inicioNotas, hasta(M.persona) - inicioNotas],
  persona: [M.persona, hasta(M.llevan) - M.persona],
  datos: [M.llevan, hasta(M.cta) - M.llevan],
  cierre: [M.cta, hasta(M.cierre) - M.cta],
  bucle: [M.cierre, total - M.cierre],
};

const bucleLlamada = M.llamada - M.cierre - 6;
const eventos = {
  // absolutos
  barrido: M.hasta,
  llamada,
  toque,
  tonos,
  // relativos a su escena
  notasItems: [8, M.luz - inicioNotas, M.cole - inicioNotas, M.quintos - inicioNotas, M.algoritmo - inicioNotas],
  notasEscribir: 16,
  datos: {oficinas: 6, profesionales: 16, anio: M.noventa - M.llevan - 8, ciudades: M.noventa - M.llevan + 10},
  cierre: {logo: 2, tagline: 16, telefonos: M.yaTeLlaman - M.cta},
  bucle: {
    notificaciones: [2, 9, 15, 20, 24, 28, 31, 34],
    llamada: bucleLlamada,
    tonos: [bucleLlamada + 2, bucleLlamada + 38],
    rotulo: M.llamada - M.cierre,
  },
};

const salida = {toma, fps: FPS, total, duracionVoz: whisper.duracion, marcas, notificaciones, escenas, eventos};
fs.mkdirSync(path.join(raiz, 'src/voz'), {recursive: true});
fs.writeFileSync(path.join(raiz, 'src/voz', `${toma}.json`), JSON.stringify(salida, null, 2) + '\n');

// Voz a 44,1 kHz estéreo para mezclar.
const bin = path.join(raiz, 'node_modules/@remotion/compositor-linux-x64-gnu');
fs.mkdirSync(path.join(raiz, 'public/voz'), {recursive: true});
execFileSync(
  path.join(bin, 'ffmpeg'),
  ['-loglevel', 'error', '-y', '-i', path.join(raiz, 'voz-tomas', `${toma}.wav`), '-ar', '44100', '-ac', '2', '-c:a', 'pcm_s16le', path.join(raiz, 'public/voz', `${toma}.wav`)],
  {env: {...process.env, LD_LIBRARY_PATH: bin}},
);

console.log(`Toma ${toma}: ${(total / FPS).toFixed(2)} s (${total} frames)`);
console.log(Object.entries(marcas).map(([k, v]) => `${k}=${v}`).join('  '));
