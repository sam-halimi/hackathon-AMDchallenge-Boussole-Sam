# Formulaire lablab · Boussole (équipe Boussole-Sam)

AMD Developer Hackathon: ACT III · deadline dimanche 18 octobre, 6 h 00 (Montréal). Chaque bloc se copie tel quel.

## Project title (48/50)
```
Boussole: step-by-step help after sexual assault
```

## Short description (241/255)
```
Boussole guides survivors of sexual assault in Montréal step by step, in French and English. For care teams, an open model on AMD Token Factory turns pseudonymised notes into a timeline; every line quotes its source and a human validates it.
```

## Long description (309 mots, ≥ 100)
```
After a sexual assault, the first hours matter and the path is confusing. People do not know where to go, drug traces fade from blood within about a day and from urine within about five, and survivors retell their story to one professional after another while care teams rebuild a timeline from scattered notes.

Boussole is an installable, mobile-first web app in French and English, with two sides. For the person, it shows help first (the 24/7 support line and 911), then the official care steps in order with their deadlines and sources, a map of verified Montréal resources, a private story encrypted on the device, and, only if they decide, a file prepared for a free legal-advice service with double consent. No AI touches this side, and the story never leaves the phone.

For the care team at a designated centre, Boussole offers per-item consent, a rule engine that sorts forensic samples by time window, and an AI-assisted timeline. The AI is the open model DeepSeek-V4-Flash, served by AMD Token Factory on AMD GPUs through an OpenAI-compatible API, called server-side only. Notes are pseudonymised in the browser and checked again on the server, which refuses to send anything that still contains an identifier. A line is kept only if it quotes the notes verbatim; culprit, credibility, score or diagnosis wording is removed and shown; a human validates every line, and each action is sealed in a SHA-256 hash-chained log. On fictional notes, a timeline typically takes 35 to 60 seconds on this trial endpoint, and every line kept by the guardrails quotes the notes verbatim.

Uncertainty stays visible: the live answer is labelled with the provider and model, and if the AI is unavailable a pre-recorded answer is shown and labelled as such, with the reason. The demo uses fictional data only. The AI guides, the human decides.
```

## Technology tags
```
AMD Token Factory, AMD GPUs, DeepSeek-V4-Flash, OpenAI-compatible API, React, TypeScript, Vite, Tailwind CSS, Progressive Web App, Service Worker, Node.js, Vercel, Web Crypto API, Leaflet, OpenStreetMap, Vitest
```

## Track / category
```
Health and Wellbeing
```

## Team name
```
Boussole-Sam
```

## Cover image (16:9)
Fichier : `submission/cover.png` (envoyé avec ce formulaire).

## Video presentation
```
https://youtu.be/ggqeiTztmYw
```

## Slide presentation
Le PDF exporté du deck anglais (43 diapos).

## Demo application URL
```
https://boussole-ux-v2.vercel.app
```
L'outil soignant avec l'IA en direct : https://boussole-ux-v2.vercel.app/#/demo (étape 4, « Generate the timeline »).

## GitHub repository
```
https://github.com/sam-halimi/hackathon-AMDchallenge-Boussole-Sam
```
À passer en **public** avant d'envoyer le formulaire.

## How the project evolves after the hackathon (si le champ existe)
```
Boussole is a prototype on fictional data. What comes next, in order:

1. **Clinical and community validation.** Have the rule engine's time windows reviewed against the Québec medico-social protocol by clinicians, and co-design the person's journey with survivors, sexual-assault support centres (CALACS) and designated-centre teams. Nothing goes near real data before that.
2. **Stronger privacy.** Replace pattern-based pseudonymisation with named-entity recognition plus institution-specific lists, run a privacy impact assessment under Québec's Law 25, and move from the trial endpoint (which keeps prompts for about two days and forbids real health data) to a contractual, Canadian-hosted deployment of an open model on AMD GPUs, so real clinical notes never leave a controlled environment.
3. **Measured AI quality.** Build a consented evaluation set and track citation accuracy, omissions and guardrail removals per model, then pick the model size on AMD hardware with evidence, not guesswork.
4. **A 3-month pilot** with one designated centre, measuring repeated retellings, samples taken within their time windows and administrative time. Payer hypothesis: the health institutions that host designated centres; always free for survivors.
5. **Reach.** The app already exists in French and English. Next: accessibility audit, other Québec regions, then other Canadian provinces' sexual-assault programs, with jurisdiction-specific rules and resources and a local partner in each.
```

## Avant de cliquer sur « Submit »
- Dépôt GitHub en public, branche par défaut `ux-v2`.
- Vidéo YouTube en non répertoriée (OK).
- PDF des slides joint, couverture jointe.
