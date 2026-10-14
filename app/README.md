# Boussole · application (bêta de test)

**On vous accompagne, pas à pas.** Application pour les personnes victimes d'agression sexuelle à Montréal, et outil pour les soignants des centres désignés. Données fictives uniquement. Application web installable (PWA), pensée d'abord pour le téléphone, utilisable hors ligne.

Ancienne bêta statique (sans IA en direct) : https://boussole-beta.vercel.app

## Parcours
- `#/` : arrivée directe en cinq diapos colorées, puis création d'un compte (prénom ou surnom, courriel, mot de passe ; données chiffrées sur l'appareil), puis la fenêtre des étapes de prise en charge, puis les onglets :
  - **Accueil** : ligne d'écoute 24 h/24, quatre accès qui ouvrent directement ce qu'ils annoncent, rappel « repères, pas d'avis médical », installation facultative ;
  - **Mon récit** : fiche guidée, enregistrée automatiquement et chiffrée sur l'appareil (« Je ne sais pas » est une réponse) ;
  - **Où aller** : carte de Montréal (examens, soutien psychologique, juridique), organismes vérifiés, badge « À confirmer » sur ce qu'aucune source officielle n'a confirmé ;
  - **Mon dossier** : sections au choix, aperçu lisible, export, envoi **simulé** à Rebâtir avec double confirmation, puis choix d'un créneau de rappel ;
  - **Vie privée** : les promesses, concrètement, avec « Verrouiller » et « Tout effacer » ;
  - **Quitter**, en haut de chaque écran : verrouille l'espace et remplace la page par une recherche météo.
- `#/demo` : outil soignant (consentement, dossier guidé à trois réponses Oui / Non / Ne sait pas, checklist par règles non validées cliniquement, chronologie IA sur AMD avec garde-fous, journal SHA-256).

## Code
| Fichier | Rôle |
|---|---|
| `src/components/Espace.tsx` | coquille de l'espace : session, enregistrement chiffré, en-tête, onglets |
| `src/components/Intro.tsx`, `Compte.tsx` | diapos d'arrivée ; création du compte et connexion |
| `src/components/Accueil.tsx`, `Recit.tsx`, `Aller.tsx`, `Dossier.tsx`, `ViePrivee.tsx` | les cinq onglets (le récit se remplit une question à la fois) |
| `src/components/ui.tsx` | composants partagés : ligne d'aide, champs, cases, réponses en ligne |
| `src/components/Quitter.tsx`, `src/lib/quitter.ts` | bouton « Quitter rapidement » |
| `src/lib/fiche.ts`, `src/lib/useDialog.ts` | type de la fiche chiffrée ; gestion du focus des fenêtres |
| `src/components/Etapes.tsx` | fenêtre des étapes après connexion (sans défilement, jusqu'à 360×640) |
| `src/components/Rappel.tsx` | choix du créneau de rappel |
| `src/components/Illustrations.tsx` | illustrations SVG |
| `src/components/ResourceMap.tsx` | carte Leaflet / OpenStreetMap |
| `src/components/Demo.tsx` | outil soignant |
| `src/components/Pwa.tsx` | bandeau hors ligne, proposition d'installation |
| `src/lib/vault.ts` | comptes locaux chiffrés (courriel + mot de passe, PBKDF2 + AES-GCM) |
| `src/lib/careSteps.ts` | ordre de prise en charge, sourcé |
| `src/lib/resources.ts` | ressources montréalaises, sources, champ `toConfirm` |
| `src/lib/research-resources.md` | recherche : sources, ressources vérifiées, points à confirmer |
| `src/lib/rules.ts` | délais de prélèvement (prototype, non validés cliniquement), réponse « ne sait pas » |
| `src/lib/pseudonymize.ts` | pseudonymisation avant envoi à l'IA |
| `src/lib/aiApi.ts` | appel de `/api/timeline`, raisons du repli |
| `shared/identifiers.js` | motifs d'identifiants : pseudonymisation (appli) et refus (serveur) |
| `server/llm.js` | fournisseur LLM compatible OpenAI (endpoint vLLM sur AMD Developer Cloud) |
| `server/timeline.js` | consigne, schéma JSON et garde-fous de la chronologie |
| `server/handler.js` | routes `/api/timeline` et `/api/health` |
| `server/vitePlugin.js`, `api/`, `server/standalone.js` | ces routes dans le serveur de dev, en fonctions serverless, en serveur Node autonome |
| `pwa/sw.js`, `scripts/swPlugin.js` | service worker (gabarit) et sa génération au build |
| `public/manifest.webmanifest`, `public/icons/`, `public/offline.html` | PWA : manifeste, icônes, page hors ligne |
| `scripts/mock-vllm.js`, `scripts/bench.js`, `scripts/bench-cases.js` | faux serveur compatible OpenAI, benchmark, notes fictives |
| `scripts/icons.mjs` | régénère les icônes PNG depuis les SVG du logo |

## Lancer
Node 22.9 ou plus.

```bash
npm ci
npm run dev        # http://localhost:5173  ·  outil soignant : /#/demo
```

IA en direct pour l'outil soignant : copier `.env.example` en `.env` et renseigner l'endpoint vLLM (voir `../GUIDE_AMD.md`). Sans endpoint joignable, une réponse pré-enregistrée, étiquetée comme telle (avec la raison), est utilisée.

Sans GPU : `npm run mock` (faux serveur, aucune IA) puis `.env` pointé sur `http://127.0.0.1:8001/v1` avec `VLLM_MODEL=mock-model`.

```bash
npm test                     # pseudonymisation, règles, ressources, garde-fous, route IA, sortie rapide
npm run lint
npm run bench                # latence et débit de l'endpoint → bench/results.md
npm run build && npm start   # serveur autonome : appli + /api sur :8080
```

La PWA (service worker) n'est active qu'en build (`npm run build` puis `npm start` ou `npm run preview`), et l'installation demande HTTPS (ou `localhost`).

## Déployer
Le déploiement statique (`dist/` seul) n'a pas de route IA : l'outil soignant affichera la réponse pré-enregistrée. Pour l'IA en direct : serveur autonome (`npm start`) ou projet Vercel à la racine `app/` (fonctions `api/`, variables `VLLM_*` dans le projet). Détails et précautions : `../GUIDE_AMD.md`, section 8. Garde-fous : `../SAFETY.md`.
