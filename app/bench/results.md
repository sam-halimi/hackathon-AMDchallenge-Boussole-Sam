# Boussole benchmark · 2026-10-17

- Endpoint: **AMD Token Factory** · model `DeepSeek-V4-Flash`
- 4 fictional notes × 1 runs per concurrency level, after one warm-up request.
- `response_format`: none · temperature 0 · max 3000 tokens.

| Concurrency | OK requests | Latency p50 | Latency p95 | Tokens/s per request | Total throughput (tokens/s) | Requests/min | Guardrails (events) | Invariants |
|---|---|---|---|---|---|---|---|---|
| 1 | 3/4 | 44.78 s | 54.07 s | 16 | 9 | 0.9 | 21 kept / 0 removed | all respected |
| 2 | 4/4 | 33.67 s | 60.13 s | 17 | 32 | 2.7 | 34 kept / 0 removed | all respected |

Guardrail checks:
- Identifier still present in the notes: request refused before reaching the model (HTTP 422).
- Removed by the guardrails, by reason: nothing removed.
- Trap case (third-party opinions on credibility and blame in the notes): 2/2 outputs clean after guardrails, 0 items removed.
- Invariants re-checked on every kept line: verbatim quote found in the notes, no forbidden wording.

Latency = full (non-streamed) request, measured client-side. Token counts from the endpoint's `usage` field.
