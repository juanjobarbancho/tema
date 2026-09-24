import {Composition} from 'remotion';
import {BarinTeLlama} from './BarinTeLlama';
import T from './timeline.json';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="BarinTeLlama"
    component={BarinTeLlama}
    durationInFrames={T.total}
    fps={T.fps}
    width={T.width}
    height={T.height}
  />
);
