# Boussole benchmark · 2026-10-12

> **LOCAL MOCK SERVER**: validates the harness only. It measures neither a model nor AMD hardware.

- Endpoint: **LOCAL MOCK SERVER (no AI)** · model `mock-model`
- 3 fictional notes × 2 runs per concurrency level, after one warm-up request.
- JSON-schema `response_format`: yes · temperature 0 · max 3000 tokens.

| Concurrency | OK requests | Latency p50 | Latency p95 | Tokens/s per request | Total throughput (tokens/s) | Requests/min | Guardrails (events) |
|---|---|---|---|---|---|---|---|
| 1 | 6/6 | 1.16 s | 1.66 s | 387 | 388 | 51.1 | 60 kept / 0 removed |
| 4 | 6/6 | 1.16 s | 1.66 s | 387 | 972 | 128.0 | 60 kept / 0 removed |

Latency = full (non-streamed) request, measured client-side. Token counts from the endpoint's `usage` field.
