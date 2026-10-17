import { Composition } from "remotion";
import { BoussoleSpot } from "./boussole/BoussoleSpot";
import { DUREE_IMAGES, FPS } from "./boussole/temps";
import { SpotEN } from "./en/SpotEN";
import { DUREE_IMAGES as DUREE_EN, FPS as FPS_EN } from "./en/temps";

export const RemotionRoot: React.FC = () => (
  <>
    {/* Spot Boussole : 60 images par seconde, minutage calé sur la voix (src/boussole/minutage.json). */}
    <Composition id="BoussoleSpot16x9" component={BoussoleSpot} durationInFrames={DUREE_IMAGES} fps={FPS} width={1920} height={1080} />
    {/* English spot: timing from src/en/minutage.json. */}
    <Composition id="BoussoleSpotEN16x9" component={SpotEN} durationInFrames={DUREE_EN} fps={FPS_EN} width={1920} height={1080} />
  </>
);
