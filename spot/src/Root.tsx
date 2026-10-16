import { Composition } from "remotion";
import { BoussoleSpot } from "./boussole/BoussoleSpot";
import { DUREE_IMAGES, FPS } from "./boussole/temps";

export const RemotionRoot: React.FC = () => (
  <>
    {/* Spot Boussole : 60 images par seconde, minutage calé sur la voix (src/boussole/minutage.json). */}
    <Composition id="BoussoleSpot16x9" component={BoussoleSpot} durationInFrames={DUREE_IMAGES} fps={FPS} width={1920} height={1080} />
  </>
);
