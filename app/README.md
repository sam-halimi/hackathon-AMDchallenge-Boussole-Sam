# Boussole · application (bêta de test)

**On vous accompagne, pas à pas.** Application pour les personnes victimes d'agression sexuelle à Montréal, et outil pour les soignants des centres désignés. Données fictives uniquement.

En ligne : https://boussole-beta.vercel.app

## Parcours
- `#/` : arrivée directe en diapos colorées (5 étapes), puis création d'un compte (prénom ou surnom, courriel, mot de passe ; données chiffrées sur l'appareil), puis la fenêtre des étapes de prise en charge, puis les onglets :
  - **Accueil** : ligne d'écoute 24 h/24 et accès rapides illustrés ;
  - **Mon récit** : fiche guidée, enregistrée automatiquement et chiffrée sur l'appareil ;
  - **Où aller** : carte de Montréal (examens, soutien psychologique, juridique), organismes vérifiés ;
  - **Mon dossier** : assemblage, aperçu, export, envoi **simulé** à Rebâtir avec double confirmation, puis choix d'un créneau de rappel (aujourd'hui ou demain) ;
  - **Vie privée** : les promesses, concrètement.
- `#/demo` : outil soignant (consentement, checklist par règles, chronologie IA, journal SHA-256).

## Code
| Fichier | Rôle |
|---|---|
| `src/components/Espace.tsx` | parcours de la personne (diapos, compte, onglets) |
| `src/components/Illustrations.tsx` | illustrations SVG |
| `src/components/ResourceMap.tsx` | carte Leaflet / OpenStreetMap |
| `src/components/Demo.tsx` | outil soignant |
| `src/lib/vault.ts` | comptes locaux chiffrés (courriel + mot de passe, PBKDF2 + AES-GCM) |
| `src/lib/careSteps.ts` | ordre de prise en charge, sourcé |
| `src/lib/research-resources.md` | recherche : sources, ressources vérifiées, points à confirmer |
| `src/components/Etapes.tsx` | fenêtre des étapes après connexion |
| `src/components/Rappel.tsx` | choix du créneau de rappel |
| `src/lib/resources.ts` | ressources montréalaises et sources |
| `src/lib/rules.ts` | délais de prélèvement (prototype, à valider) |
| `server/llm.js` | fournisseur LLM compatible OpenAI (endpoint vLLM sur AMD Developer Cloud) |
| `server/timeline.js` | consigne, schéma JSON et garde-fous de la chronologie |
| `server/handler.js` | route `/api/timeline` (dev Vite, `api/` serverless, `server/standalone.js`) |
| `shared/identifiers.js` | motifs d'identifiants : pseudonymisation (appli) et refus (serveur) |
| `scripts/mock-vllm.js`, `scripts/bench.js` | faux serveur compatible OpenAI, benchmark |

## Lancer
```bash
npm install
npm run dev        # http://localhost:5173
```
IA en direct pour l'outil soignant : copier `.env.example` en `.env` et renseigner l'endpoint vLLM (voir `../GUIDE_AMD.md`). Sans endpoint joignable, une réponse pré-enregistrée, étiquetée comme telle, est utilisée.

Sans GPU : `npm run mock` (faux serveur, aucune IA) puis `.env` pointé sur `http://127.0.0.1:8001/v1`.

```bash
npm test           # pseudonymisation, règles, garde-fous, route IA
npm run bench      # latence et débit de l'endpoint
npm run build && npm start   # serveur autonome : appli + /api/timeline sur :8080
```

## Déployer
Le déploiement statique (`dist/` seul) n'a pas de route IA. Pour l'IA en direct : serveur autonome (`npm start`) ou projet Vercel à la racine `app/` (fonctions `api/`), voir `../GUIDE_AMD.md`.
