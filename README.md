# Boussole

**We walk with you, step by step.** Boussole ("compass" in French) guides a person after a sexual assault in Montréal: where to go, how to tell their story only once, and, if they decide to, how to build a file for a legal service. A second screen helps the care team at a designated centre structure the night's notes. **The AI guides, the human decides.**

AMD Developer Hackathon: ACT III (lablab.ai) · Track: **Health and Wellbeing** · Fictional data only, not a medical device.

| | |
|---|---|
| App (PWA, French and English UI) | `app/` · run it locally in under 5 minutes (below). Public URL: https://boussole-ux-v2.vercel.app |
| AI on AMD | Open model **DeepSeek-V4-Flash** served by **AMD Token Factory** (OpenAI-compatible API, AMD GPUs), care-team timeline only · benchmark below |
| Video (2 min) | https://youtu.be/ggqeiTztmYw |
| Safety | [`SAFETY.md`](SAFETY.md): wrong or unsupported answers, sensitive data, uncertainty, risky decisions |
| Submission kit | [`submission/`](submission/) |

---

## The problem

After a sexual assault, the first hours decide a lot, and the path is confusing:

- **Where to go?** In 2020, a woman went to three Montréal hospitals before getting a forensic kit ([Noovo](https://www.noovo.info/nouvelle/pourquoi-une-femme-francophone-sest-vu-refuser-une-trousse-medicolegale.html)).
- **Evidence expires.** Most drugs are no longer detectable in blood after about 24 hours, in urine after about 120 hours ([SOFT DFSA fact sheet](https://www.soft-tox.org/assets/docs/DFSA_Fact_Sheet.pdf)).
- **Few cases move forward.** About 6% of sexual assaults are reported to police ([Statistics Canada, 2019 victimization](https://www150.statcan.gc.ca/pub/85-002-x/2021001/article/00014-fra.htm)); of 1,000 police-reported sexual assault incidents, 640 end without a charge ([Statistics Canada, 2015–2019](https://www150.statcan.gc.ca/n1/pub/11-627-m/11-627-m2024051-fra.htm)).
- **People retell their story again and again**, to different professionals, while care teams rebuild a timeline from scattered notes.

## The solution

**For the person (`#/`)**, no AI involved:

1. Five calm intro slides, then a local account: the story is **encrypted on the device** (AES-256-GCM, key from the password). No server receives it.
2. **The care steps, in order**, from official Québec and Montréal sources: safety (911), Info-aide violence sexuelle, preserving evidence, designated centres, care time windows, the forensic-kit choice, support, rights.
3. **My story**, once, at their own pace ("I don't know" is a valid answer).
4. **Where to go**: map of verified Montréal resources; anything not confirmed by an official source is badged **"À confirmer"**.
5. **My file**: they choose the sections, give explicit consent and confirm twice before a (simulated) transmission to Rebâtir, the free legal-advice service for survivors.

**For the care team (`#/demo`)**: per-item consent, guided intake, a **deterministic rule engine** for sample time windows (no AI), an **AI-assisted timeline** in which every line quotes its source and waits for human validation, and a SHA-256 hash-chained custody log.

**Installable PWA**, mobile first, works offline (the encrypted space opens without network; the offline page shows emergency numbers).

## Architecture

```mermaid
flowchart LR
  subgraph Phone["Browser / installed PWA"]
    P["Person's space<br/>rules + sourced content<br/>AES-GCM local vault"]
    C["Care-team tool<br/>pseudonymises notes<br/>before sending"]
  end
  subgraph Server["Boussole API (Node)<br/>Vite dev · Vercel function · standalone server"]
    H["/api/timeline<br/>1. refuses leftover identifiers<br/>2. calls the LLM<br/>3. guardrails: schema, verbatim quotes,<br/>forbidden judgements"]
  end
  subgraph AMD["AMD Token Factory"]
    V["OpenAI-compatible API<br/>open model DeepSeek-V4-Flash"]
  end
  C -- "pseudonymised notes only" --> H
  H -- "Bearer key (server-side)" --> V
  H -- "validated suggestions + removed items" --> C
```

| Path | Role |
|---|---|
| `app/src/` | React 19 + Vite + Tailwind app (person's space, care-team tool, PWA) |
| `app/src/lib/rules.ts` | Rule engine (time windows), labelled *not clinically validated* |
| `app/src/lib/pseudonymize.ts`, `app/shared/identifiers.js` | Client pseudonymisation and the server's second check |
| `app/server/llm.js` | OpenAI-compatible provider (fetch only), configured by `AI_BASE_URL`, `AI_MODEL`, `AI_API_KEY`, `AI_LABEL` (server-side only) |
| `app/server/timeline.js` | Prompt, JSON schema and guardrails |
| `app/server/handler.js` | `/api/timeline` and `/api/health`, mounted by Vite, `app/api/` (serverless) and `app/server/standalone.js` |
| `app/scripts/mock-vllm.js`, `app/scripts/bench.js` | Fake OpenAI-compatible server for tests; benchmark and guardrail checks |
| `pitch/`, `video/`, `spot-v1/`, `spot-v2/` | Earlier pitch, Remotion demo video and ad spots (French) |

## How AMD is used

The AI part of the product, the care-team **timeline**, calls the open model **DeepSeek-V4-Flash** served by **AMD Token Factory** on AMD GPUs, through its OpenAI-compatible Chat Completions API (`https://developer.amd.com.cn/radeon/api/v1`).

- **Why this model**: chosen after comparing several open models of the AMD Token Factory catalogue on the same fictional notes. It was the fastest to return a complete timeline, and every quote it produced was found verbatim in the notes (nothing removed by the guardrails).
- **Output format**: DeepSeek-V4-Flash returns HTTP 500 with `response_format: json_object`, so the JSON schema is given in the instructions and the shape is checked on the server (`AI_RESPONSE_FORMAT=none`).
- **Progressive display**: the answer is streamed. Each timeline line is shown as soon as it is complete **and** has passed the guardrails (verbatim quote, no forbidden wording), in about 6 s for the first line instead of waiting 35 to 60 s for the whole answer. The "Live AI response" banner and the Validate buttons appear only when the full call has succeeded; if it fails midway, the partial lines are dropped and the labelled pre-recorded answer is shown.
- **Limits respected**: 30 requests/min per key and at most 2 requests at a time (server-side queue), retries only on 429/502/503 with `Retry-After` or exponential backoff with jitter, 90 s total timeout.
- Configured by environment variables only (`AI_BASE_URL`, `AI_MODEL`, `AI_API_KEY`, `AI_LABEL`), read server-side. The key never reaches the browser and is never committed.
- Generation is constrained by a **JSON schema** (`response_format`, can be turned off with `AI_JSON_SCHEMA=0` if the endpoint refuses it), temperature 0.
- The server sends **pseudonymised notes only** and refuses anything that still contains a direct identifier.
- The banner **"Live AI answer"** appears only after a real call succeeded and passed the guardrails. If the endpoint is down, slow, misconfigured or refuses the key, the app shows a **clearly labelled pre-recorded answer** and says why.

## Benchmark

`cd app && npm run bench` sends 4 fictional notes (including a trap case with third-party opinions on credibility and blame) several times at concurrency 1 and 4. It records latency, tokens/s, what the guardrails kept or removed and why, re-checks the guardrail invariants on every kept line, and verifies that notes with a leftover identifier are refused before reaching the model.

**AMD Token Factory · DeepSeek-V4-Flash** (2026-10-17, fictional notes only, throttled: 1 run per case at concurrency 1 and 2):

| Concurrency | OK requests | Latency p50 | Latency p95 | Tokens/s per request | Total throughput (tokens/s) | Requests/min | Guardrails (events) | Invariants |
|---|---|---|---|---|---|---|---|---|
| 1 | 3/4 | 44.78 s | 54.07 s | 16 | 9 | 0.9 | 21 kept / 0 removed | all respected |
| 2 | 4/4 | 33.67 s | 60.13 s | 17 | 32 | 2.7 | 34 kept / 0 removed | all respected |

- The failed request was an HTTP 500 from the endpoint after 77 s on the longest note (not retried: only 429/502/503 are). In the app, such a failure shows the labelled pre-recorded answer.
- Identifier still present in the notes: refused before reaching the model (HTTP 422).
- Trap case (a third party says "she may be exaggerating" and names someone "responsible"): both outputs clean, nothing to remove; the model kept only facts.
- This is a trial endpoint without SLA: latency is dominated by generation speed (about 16 tokens/s), not by Boussole.

Harness check against the **local mock server** (no model, no AI: these numbers say nothing about AMD):

| Concurrency | OK requests | Latency p50 | Latency p95 | Tokens/s per request | Total throughput (tokens/s) | Requests/min | Guardrails (events) | Invariants |
|---|---|---|---|---|---|---|---|---|
| 1 | 4/4 | 0.88 s | 1.65 s | 386 | 386 | 54.4 | 36 kept / 1 removed | all respected |

## Safety in one table

Full details: [`SAFETY.md`](SAFETY.md).

| Concern | What Boussole does |
|---|---|
| Wrong or unsupported AI output | Schema check; every line must quote the notes **verbatim**, or it is removed; culprit, credibility, score, diagnosis and legal-qualification wording is removed; removed items are shown; a human validates every line |
| Sensitive information | Pseudonymisation in the browser, second check on the server (HTTP 422, nothing sent), key server-side, no note content in logs, API never cached, the person's story encrypted on the device only |
| Uncertain results | Live vs. pre-recorded label with the reason; "don't know" kept as its own answer and flagged "to confirm"; rules labelled *not clinically validated*; unconfirmed resources badged "À confirmer" |
| Risky decisions | Per-item consent; police transmission off by default and only by the person; double confirmation before sending a file; 911 and Info-aide one tap away |

## Limits

- Prototype on **fictional data**. Rules not clinically validated; not tested with survivors or care teams yet.
- Pattern-based pseudonymisation is not named-entity recognition; the citation check proves a quote exists, not that the summary is faithful (hence human validation).
- The model has not been evaluated on real clinical notes; the benchmark measures speed, not clinical quality.
- Sending a file to Rebâtir is **simulated**. The person's account lives on one device (a forgotten password makes the story unreadable).
- The UI is in French (Montréal, Québec); this README and the safety docs are in English for the jury.

## Run it in under 5 minutes

Requirements: Node.js 22.9 or newer.

```bash
git clone https://github.com/sam-halimi/hackathon-AMDchallenge-Boussole-Sam.git
cd hackathon-AMDchallenge-Boussole-Sam/app
npm ci
npm run dev            # http://localhost:5173  (person's space)  ·  /#/demo  (care-team tool)
```

Without an AI endpoint the timeline uses the labelled pre-recorded answer. To see the live path without any AI:

```bash
npm run mock           # terminal 1: fake OpenAI-compatible server on :8001 (no AI)
cp .env.example .env   # then set AI_BASE_URL=http://127.0.0.1:8001/v1 and AI_MODEL=mock-model
npm run dev            # terminal 2
```

With the AMD endpoint: set `AI_BASE_URL`, `AI_MODEL` and `AI_API_KEY` in `.env` (values from AMD Token Factory; see `.env.example`), then `npm run bench -- --runs 1 --concurrency 1` for a quick check.

Other commands (in `app/`): `npm test` (pseudonymisation, rules, resources, guardrails, API, English content), `npm run lint`, `npm run build`, `npm start` (standalone server: built app + API on :8080), `npm run bench`.

## Business value

- **Who pays**: health institutions (CISSS/CIUSSS) that host designated centres; Québec counted 77 designated centres in 17 regions in a 2011 study (to be re-checked with the ministry). Hypothesis: yearly licence per centre plus setup and training; co-funding possible from victim-support funds.
- **Who uses it**: nurses, physicians and social workers at designated centres; survivors, **always free**.
- **Who receives, never pays**: police and prosecutors, only with the person's consent, a deliberate trust choice.
- **Next step**: a 3-month pilot with one designated centre, measuring repeated retellings, samples taken within time windows and administrative time.

## Repositories and links

- This repository: [sam-halimi/hackathon-AMDchallenge-Boussole-Sam](https://github.com/sam-halimi/hackathon-AMDchallenge-Boussole-Sam) (everything needed to run and judge the project).
- Origin of the code: [sam-halimi/hackathon-codeML-SAA](https://github.com/sam-halimi/hackathon-codeML-SAA/tree/boussole/boussole), branch `boussole`, folder `boussole/` (earlier version built for another challenge; it also holds the heavy media excluded here, see [`ASSETS.md`](ASSETS.md)).
- Earlier static beta, without live AI: https://boussole-beta.vercel.app
- Research behind every resource and time window: [`app/src/lib/research-resources.md`](app/src/lib/research-resources.md) (French, with URLs).
