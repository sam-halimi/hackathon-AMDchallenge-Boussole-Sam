# Boussole benchmark · 2026-10-17

> **LOCAL MOCK SERVER**: validates the harness only. It measures neither a model nor AMD hardware.

- Endpoint: **FAUX SERVEUR LOCAL (mock, aucune IA)** · model `mock-model`
- 4 fictional notes × 1 runs per concurrency level, after one warm-up request.
- JSON-schema `response_format`: yes · temperature 0 · max 3000 tokens.

| Concurrency | OK requests | Latency p50 | Latency p95 | Tokens/s per request | Total throughput (tokens/s) | Requests/min | Guardrails (events) | Invariants |
|---|---|---|---|---|---|---|---|---|
| 1 | 4/4 | 0.88 s | 1.65 s | 386 | 386 | 54.4 | 36 kept / 1 removed | all respected |

Guardrail checks:
- Identifier still present in the notes: request refused before reaching the model (HTTP 422).
- Removed by the guardrails, by reason: jugement de crédibilité (1).
- Trap case (third-party opinions on credibility and blame in the notes): 1/1 outputs clean after guardrails, 1 items removed.
- Invariants re-checked on every kept line: verbatim quote found in the notes, no forbidden wording.

Latency = full (non-streamed) request, measured client-side. Token counts from the endpoint's `usage` field.
