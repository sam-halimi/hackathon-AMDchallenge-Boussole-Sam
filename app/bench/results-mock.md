# Benchmark Boussole · 2026-10-12

> **FAUX SERVEUR LOCAL (mock)** : valide le banc de mesure, ne mesure ni un modèle ni du matériel AMD.

- Endpoint : **FAUX SERVEUR LOCAL (mock)** · modèle `mock-model`
- 3 notes fictives × 2 passages par niveau de concurrence, après un échauffement.
- `response_format` JSON schema : oui · température 0 · max 3000 jetons.

| Concurrence | Requêtes OK | Latence p50 | Latence p95 | Jetons/s par requête | Débit total (jetons/s) | Requêtes/min | Garde-fous (événements) |
|---|---|---|---|---|---|---|---|
| 1 | 6/6 | 1.16 s | 1.66 s | 386 | 387 | 51.1 | 60 gardés / 0 retirés |
| 4 | 6/6 | 1.16 s | 1.66 s | 386 | 970 | 127.8 | 60 gardés / 0 retirés |

Latence = requête complète (non diffusée en continu), mesurée côté client. Jetons comptés par l'endpoint (`usage`).
