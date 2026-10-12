import type { TimelineResult } from './timelineFixture'

// Route IA : même origine par défaut ; VITE_API_URL pour un serveur séparé (CORS : ALLOWED_ORIGINS).
export const API_TIMELINE = `${(import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '')}/api/timeline`

export type Removed = { kind: 'event' | 'gap' | 'inconsistency'; text: string; reason: string }

export type TimelineApiResponse =
  | { live: true; label: string; model: string; latencyMs: number; result: TimelineResult; removed: Removed[] }
  | { live: false; error: string; found?: { label: string; count: number }[] }

export type AiMeta = {
  label?: string
  model?: string
  latencyMs?: number
  removed?: Removed[]
  reason?: string
  found?: { label: string; count: number }[]
}

// Raison affichée quand la réponse pré-enregistrée remplace l'IA en direct.
export const FALLBACK_REASONS: Record<string, string> = {
  'not-configured': 'aucun endpoint IA configuré sur ce serveur',
  unreachable: 'serveur IA injoignable',
  timeout: 'le serveur IA a mis trop de temps à répondre',
  unauthorized: 'clé du serveur IA refusée',
  upstream: 'erreur du serveur IA',
  empty: 'réponse IA vide',
  truncated: 'réponse IA tronquée',
  'invalid-json': 'réponse IA illisible',
  'bad-shape': 'réponse IA hors format',
  'rate-limited': 'trop de demandes, réessayez dans une minute',
  'too-long': 'notes trop longues',
}
