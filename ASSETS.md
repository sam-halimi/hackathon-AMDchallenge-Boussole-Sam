# Fichiers lourds exclus du dépôt

Les rendus vidéo, l'audio, les captures brutes et le deck PowerPoint ne sont pas versionnés (voir `.gitignore`). Tous existent dans le dépôt source public **[sam-halimi/hackathon-codeML-SAA](https://github.com/sam-halimi/hackathon-codeML-SAA/tree/boussole/boussole)**, branche `boussole`, dossier `boussole/`, au même chemin relatif. Pour les récupérer tels quels :

```bash
git clone --depth 1 --branch boussole https://github.com/sam-halimi/hackathon-codeML-SAA.git /tmp/saa
cp -r /tmp/saa/boussole/<chemin> ./<chemin>
```

Sinon, voici comment les régénérer.

| Fichier(s) exclu(s) | Taille | Régénération |
|---|---|---|
| `pitch/deck/Boussole-pitch.pptx` | 0,8 Mo | `npm i pptxgenjs` puis `NODE_PATH=$(npm root) node pitch/deck/build.js` |
| `pitch/assets/video/boussole-demo.mp4`, `boussole-demo-light.mp4`, `boussole-15s.mp4` | 31 + 7 + 10 Mo | `cd video && npm i && npx remotion render BoussoleDemo out/boussole-demo.mp4` (et `BoussoleShort out/boussole-15s.mp4`). Il faut d'abord `video/public/rec/demo.webm` (ligne suivante). Voir `pitch/VIDEO.md`. |
| `video/public/rec/demo.webm` | 3,4 Mo | Enregistrement Playwright réel de `#/demo` (paramètres dans `pitch/VIDEO.md`, section « Capture Playwright »). Aucun script dédié dans le dépôt source : à récupérer dans le dépôt source ou à réenregistrer. |
| `video/public/ad/mix.wav` | 7,6 Mo | Mix du spot v1 : `spot-v1/build/audio/{music,sfx,mix}.py`, puis copie de `stems/mix.wav` (voir `spot-v1/README.md`, « Refaire le film »). Demande la prise de voix ci-dessous. |
| `video/public/ad/rec/*.png`, `spot-v1/assets_in/rec/16x9/*.png` | 7 Mo chacun | Captures réelles de `#/demo` : `cd spot-v1/build/rec && npm i && node capture.mjs` (appli lancée sur `:5173`). |
| `video/public/ad/grain.png` | 1 Mo | Texture de grain du spot v1. Origine non documentée dans le dépôt source : à récupérer dans le dépôt source. |
| `spot-v1/voice/takes/soraya_2takes.mp3` | 0,9 Mo | Prise de voix générée (Higgsfield, moteur ElevenLabs). **Non régénérable à l'identique** : à récupérer dans le dépôt source. |
| `spot-v1/renders/preview/*` (MP4 + planche contact) | 24 + 1,5 Mo | `spot-v1/README.md`, étape 5 (`npx remotion render BoussoleAd16x9 ...`). |
| `spot-v2/capture/sheets/*.jpg` | 1,1 Mo | `spot-v2/capture/sheets.sh` après `node capture.mjs 16x9` / `9x16` (voir `spot-v2/README.md`). |
| `video/.claude/skills/` | 25 Mo | Skills Remotion tiers (vidéos d'exemple incluses). Sources listées dans `video/skills-lock.json`. Inutiles pour faire tourner l'appli. |

## Ce qui reste versionné

- Les captures d'écran choisies pour le pitch (`pitch/assets/screens/`, `pitch/assets/app/`) : petites et utiles pour les slides et la cover.
- Les polices de la vidéo (`video/public/ad/fonts/`, licence OFL) et le QR code.

## Vérification des secrets

Aucune clé n'est versionnée. Les scripts qui en ont besoin la lisent dans l'environnement (`ELEVENLABS_API_KEY` dans `spot-v2/voice/eleven.py`, `VLLM_API_KEY` côté serveur de l'appli). Les données des démos sont fictives (cas « Léa », compte « Alex », numéros en 555).
