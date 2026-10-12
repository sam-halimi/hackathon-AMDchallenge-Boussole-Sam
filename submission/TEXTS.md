# Submission texts (lablab.ai, AMD Developer Hackathon: ACT III)

Copy-paste ready. Lengths are checked by `node submission/check.mjs`.

## Project title (≤ 50 characters)

<!-- title -->
Boussole: AI guidance after sexual assault
<!-- /title -->

## Short description (≤ 255 characters)

<!-- short -->
Boussole guides survivors of sexual assault in Montréal step by step: where to go, telling their story once, building a file if they choose. An open-source LLM on AMD Instinct GPUs structures care notes; humans validate every line.
<!-- /short -->

## Long description (≥ 100 words)

<!-- long -->
After a sexual assault, the first hours matter and the path is confusing. People do not know where to go, drug traces fade from blood within about a day and from urine within about five, and survivors retell their story to one professional after another while care teams rebuild a timeline from scattered notes.

Boussole is an installable, mobile-first web app with two sides. For the person, it shows the official care steps in order, a map of verified Montréal resources, a private story encrypted on the device, and, only if they decide, a file prepared for a free legal-advice service with explicit consent and double confirmation. No AI touches this side.

For the care team at a designated centre, Boussole offers per-item consent, a rule engine for sample time windows, and an AI-assisted timeline. The AI runs on an open-source model served by vLLM on an AMD Instinct MI300X GPU (ROCm) on AMD Developer Cloud. Notes are pseudonymised in the browser and checked again on the server; the model's JSON output is accepted only when every line quotes the notes verbatim, and any culprit, credibility, score or diagnosis wording is removed and shown. A human validates every line, and each decision is sealed in a SHA-256 hash-chained log.

Uncertainty stays visible: live or pre-recorded AI answers are labelled with the reason, "don't know" remains its own answer, rules are marked as not clinically validated, and unconfirmed resources carry a "to confirm" badge. The AI guides, the human decides.
<!-- /long -->

## Technology tags

<!-- tags -->
AMD Developer Cloud, AMD Instinct MI300X, ROCm, vLLM, Qwen2.5, OpenAI-compatible API, React, TypeScript, Vite, Tailwind CSS, Progressive Web App, Service Worker, Node.js, Web Crypto API, Leaflet, OpenStreetMap, Vitest
<!-- /tags -->

If you serve another model than `Qwen/Qwen2.5-7B-Instruct`, replace the `Qwen2.5` tag and the model name everywhere (`README.md`, `GUIDE_AMD.md`, `app/.env.example`).

## Track

Health and Wellbeing

## For the judges: how the project evolves after the hackathon

<!-- future -->
Boussole is a prototype on fictional data. What comes next, in order:

1. **Clinical and community validation.** Have the rule engine's time windows reviewed against the Québec medico-social protocol by clinicians, and co-design the person's journey with survivors, sexual-assault support centres (CALACS) and designated-centre teams. Nothing goes near real data before that.
2. **Stronger privacy.** Replace pattern-based pseudonymisation with named-entity recognition plus institution-specific lists, run a privacy impact assessment under Québec's Law 25, and host in Canada. Self-hosting an open-source model on AMD GPUs is what makes this possible: clinical notes never go to a third-party AI service.
3. **Measured AI quality.** Build a consented evaluation set and track citation accuracy, omissions and guardrail removals per model, then pick the model size on AMD hardware with evidence, not guesswork.
4. **A 3-month pilot** with one designated centre, measuring repeated retellings, samples taken within their time windows and administrative time. Payer hypothesis: the health institutions that host designated centres; always free for survivors.
5. **Reach.** English interface, accessibility audit, other Québec regions, then other Canadian provinces' sexual-assault programs, with jurisdiction-specific rules and resources.
<!-- /future -->
