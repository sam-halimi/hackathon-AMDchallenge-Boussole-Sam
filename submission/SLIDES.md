# Slides : trame (anglais, 10 diapos, ~4 min à l'oral)

Style : celui de l'appli (crème `#FFF9F3`, violet `#6A4CE0`, corail `#FF8A65`, Nunito), une idée par diapo, captures réelles. Les chiffres viennent des sources du `README.md` ; ne pas en ajouter d'autres sans source.

| # | Titre | Contenu | Visuel |
|---|---|---|---|
| 1 | **Boussole** · The AI guides, the human decides | Step-by-step guidance after sexual assault in Montréal · Health & Wellbeing · AMD Developer Hackathon ACT III | `cover.png` |
| 2 | The first hours decide a lot | Where to go? (3 hospitals before a kit, 2020) · evidence expires (blood ~24 h, urine ~120 h) · about 6% reported to police · retelling the story again and again | 3 icônes, sources en bas de diapo |
| 3 | For the person: no AI, just clarity | Care steps in order (official sources) · verified resources map with "À confirmer" badges · story encrypted on the device · file only if they decide, double confirmation | Captures téléphone : étapes, carte, dossier (`pitch/assets/app/`) |
| 4 | For the care team: rules + AI + human | Per-item consent · rule engine (not clinically validated, labelled) · AI timeline with verbatim quotes · SHA-256 custody log | Captures de `#/demo` |
| 5 | **Running on AMD** | Open-source LLM (Qwen2.5-7B-Instruct) served by vLLM on AMD Instinct MI300X, ROCm, AMD Developer Cloud · OpenAI-compatible · key server-side · JSON schema output | Schéma d'architecture du README + capture `rocm-smi` + bandeau « Réponse IA en direct · AMD… » |
| 6 | Guardrails you can see | Pseudonymised in the browser, refused on the server if an identifier slips · quote not found → removed · culprit / credibility / diagnosis wording → removed · removed items shown · human validates every line | Capture « Ce que l'IA voit » + liste « écartées par les garde-fous » |
| 7 | Uncertainty stays visible | Live vs. pre-recorded label with reason · "don't know" kept and flagged · rules not clinically validated · unconfirmed resources badged | 3 petites captures |
| 8 | Benchmark on MI300X | Tableau de `app/bench/results.md` : latence p50/p95, jetons/s, requêtes/min, concurrence 1 et 4 | Tableau (**à remplir après le benchmark AMD**) |
| 9 | Business value | Payer: institutions hosting designated centres (licence hypothesis) · free for survivors, always · police receive, never pay · next: 3-month pilot, measured outcomes | 4 blocs |
| 10 | What's next | Clinical + survivor co-design · NER pseudonymisation, Law 25, Canadian hosting on AMD · evaluation set · pilot · English UI | Liens : repo, app, vidéo |

Notes : dire « fictional data » à l'oral ; ne jamais présenter les délais comme validés ; ne pas citer le cas Cornell du pitch précédent (faits allégués, procédure en cours).
