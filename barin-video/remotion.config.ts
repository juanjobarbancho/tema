import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setCodec('h264');
Config.setCrf(17);
Config.setPixelFormat('yuv420p');
Config.setOverwriteOutput(true);

// En entornos sin descarga de Chrome se puede indicar un navegador ya instalado:
// REMOTION_CHROME=/ruta/a/headless_shell npm run render
if (process.env.REMOTION_CHROME) {
  Config.setBrowserExecutable(process.env.REMOTION_CHROME);
}
