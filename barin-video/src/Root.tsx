import {Composition, Still} from 'remotion';
import {BarinTeLlama, type PropsBarin} from './BarinTeLlama';
import {Portada} from './Portada';
import {TOMAS, type NombreToma} from './voz';

// Una composición por toma de voz: la duración sale de la propia voz.
const COMPOSICIONES: {id: string; toma: NombreToma}[] = [
  {id: 'Barin-Mujer', toma: 'laomedeia'},
  {id: 'Barin-Hombre', toma: 'achird'},
];

export const RemotionRoot: React.FC = () => (
  <>
    {COMPOSICIONES.map(({id, toma}) => (
      <Composition
        key={id}
        id={id}
        component={BarinTeLlama}
        durationInFrames={TOMAS[toma].total}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{toma} satisfies PropsBarin}
      />
    ))}
    <Still id="Portada" component={Portada} width={1080} height={1920} />
  </>
);
