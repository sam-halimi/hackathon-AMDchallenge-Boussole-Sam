# Dossier de soumission (lablab.ai · AMD Developer Hackathon: ACT III)

| Fichier | Contenu |
|---|---|
| [`TEXTS.md`](TEXTS.md) | titre, résumé court, description longue, tags, track, texte « après le hackathon » (anglais, prêts à coller) |
| [`check.mjs`](check.mjs) | vérifie les longueurs : `node submission/check.mjs` |
| [`COVER.md`](COVER.md), `cover.html`, `cover.png` | couverture 16:9 et son texte |
| [`SLIDES.md`](SLIDES.md) | trame des 10 slides |
| [`VIDEO.md`](VIDEO.md) | consignes d'export (≤ 5 min, < 300 Mo) et trame de la démo |

## Checklist de soumission

Légende : ✅ prêt · 🟡 prêt mais à compléter · ❌ à faire (par toi).

| Élément demandé | État | Ce qui manque |
|---|---|---|
| Titre (≤ 50 car.) | ✅ | 42 caractères |
| Résumé court (≤ 255 car.) | ✅ | 231 caractères |
| Description longue (≥ 100 mots) | ✅ | 249 mots |
| Tags techno | 🟡 | Ajuster `Qwen2.5` si tu sers un autre modèle |
| Track | ✅ | Health and Wellbeing |
| Texte « évolution après le hackathon » | ✅ | — |
| **Partie réelle sur AMD** | ❌ | Créer le compte AMD Developer Cloud, le droplet MI300X et l'endpoint vLLM (`GUIDE_AMD.md`), remplir `app/.env`, vérifier le bandeau « Réponse IA en direct · AMD… » |
| Benchmark sur AMD dans le README | ❌ | `cd app && npm run bench`, coller `app/bench/results.md` dans la section Benchmark du `README.md` (remplacer la ligne « results to be pasted here ») |
| Prototype fonctionnel | 🟡 | Code prêt, testé (build, lint, tests) ; il manque l'endpoint AMD en direct |
| URL de l'appli | ❌ | Déployer quand tu le décides (`GUIDE_AMD.md` §8 : droplet AMD ou Vercel + AMD), en HTTPS pour l'installation PWA ; mettre l'URL dans le `README.md` (« Public URL: to be added ») |
| Cover image 16:9 | ✅ | `cover.png` ; à régénérer si le modèle ou le GPU change |
| Vidéo de démo | ❌ | Enregistrer selon `VIDEO.md` ; ne pas réutiliser les anciennes voix off qui citent Claude |
| Slides | 🟡 | Trame prête (`SLIDES.md`) ; deck à monter, diapo 8 à remplir avec le benchmark AMD |
| Repo GitHub public | ❌ | Passer `sam-halimi/hackathon-AMDchallenge-Samsam` en public (après avoir relu qu'aucun `.env` n'est versionné : `git ls-files | grep -i env` doit ne montrer que `app/.env.example`) |
| Dépôts liés mentionnés | ✅ | `README.md`, section « Repositories and links » |
| Équipe | ❌ | Noms et rôles des membres sur lablab (non renseignés ici) |

## Rappels

- Données fictives uniquement, dans la vidéo comme dans les captures.
- Ne pas présenter les délais médicaux comme validés, ni les ressources « À confirmer » comme sûres.
- Masquer l'IP du droplet et la clé vLLM dans toute capture.
- Détruire le droplet après le jugement (facturation).
