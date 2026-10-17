// Version anglaise des textes propres à l'outil soignant (#/demo). Fichier séparé de en.ts pour
// rester dans le paquet chargé à la demande de l'outil soignant. Les textes français de référence
// restent dans aiApi.ts, timelineFixture.ts, server/timeline.js et shared/identifiers.js.
import { FALLBACK_REASONS } from './aiApi'
import type { Lang } from './i18n'
import { TIMELINE_FIXTURE, type TimelineResult } from './timelineFixture'

// Outil soignant : raisons affichées quand l'IA en direct est indisponible ou qu'une suggestion est écartée.
export const FALLBACK_REASONS_EN: Record<string, string> = {
  'not-configured': 'no AI endpoint configured on this server',
  unreachable: 'AI server unreachable',
  timeout: 'the AI server took too long to respond',
  unauthorized: 'AI server key rejected',
  upstream: 'AI server error',
  empty: 'empty AI response',
  truncated: 'truncated AI response',
  'invalid-json': 'unreadable AI response',
  'bad-shape': 'AI response in the wrong format',
  'rate-limited': 'too many requests, try again in a minute',
  'too-long': 'notes too long',
}
export const fallbackReason = (lang: Lang, key: string): string | undefined =>
  lang === 'en' ? FALLBACK_REASONS_EN[key] : FALLBACK_REASONS[key]

// Motifs des garde-fous (server/timeline.js) et étiquettes d'identifiants (shared/identifiers.js).
export const REMOVED_REASON_EN: Record<string, string> = {
  'citation introuvable dans les notes (non étayé)': 'quote not found in the notes (unsupported)',
  'source introuvable dans les notes (non étayé)': 'source not found in the notes (unsupported)',
  'désignation de coupable': 'names a perpetrator',
  'jugement de crédibilité': 'credibility judgment',
  'score sur la personne': 'score about the person',
  'jugement du récit': 'judgment of the account',
  'qualification juridique': 'legal characterization',
  'diagnostic médical': 'medical diagnosis',
}
export const IDENTIFIER_LABEL_EN: Record<string, string> = {
  courriel: 'email', "numéro d'assurance maladie": 'health insurance number', 'téléphone': 'phone number',
  'date de naissance': 'date of birth', 'code postal': 'postal code', adresse: 'address',
}
export const removedReason = (lang: Lang, fr: string) => (lang === 'en' ? REMOVED_REASON_EN[fr] ?? fr : fr)
export const identifierLabel = (lang: Lang, fr: string) => (lang === 'en' ? IDENTIFIER_LABEL_EN[fr] ?? fr : fr)

// Réponse pré-enregistrée en anglais. Les citations (source, sources) restent en français :
// ce sont des extraits mot pour mot des notes du dossier, qui restent en français.
export const TIMELINE_FIXTURE_EN: TimelineResult = {
  events: [
    { time: 'Oct. 2, ~22:00', description: 'Arrives at a party', origin: 'Patient’s account' },
    { time: 'Oct. 2, ~22:45', description: 'Accepts a drink offered to her', origin: 'Patient’s account' },
    { time: 'Oct. 2, shortly after 22:45', description: 'Feels dizzy', origin: 'Patient’s account' },
    { time: 'Oct. 3, ~1:30', description: 'Wakes up in an unfamiliar apartment', origin: 'Patient’s account' },
    { time: 'Oct. 3, ~2:15', description: 'Returns home by taxi; no shower', origin: 'Patient’s account' },
    { time: 'Oct. 4, 4:20', description: 'Arrives at the emergency department, accompanied', origin: 'Triage note' },
    { time: 'Oct. 4, 4:40', description: 'Consent to the exam obtained', origin: 'Nursing note' },
  ].map((e, i) => ({ ...e, source: TIMELINE_FIXTURE.events[i].source })),
  gaps: [
    {
      from: 'Oct. 2, ~22:45',
      to: 'Oct. 3, ~1:30',
      note: 'Information not available (about 2 h 45 min). Common after trauma or the effect of a substance: this is not an indicator of reliability. Relevant for toxicology.',
    },
  ],
  inconsistencies: [
    {
      description: 'Record: the urine sample is timestamped 4:05, before arrival (4:20) and before consent (4:40).',
      sources: TIMELINE_FIXTURE.inconsistencies[0].sources,
      suggestion: 'Check and correct the sample time before sealing: a timestamp error can weaken the chain of custody.',
    },
  ],
}
export const timelineFixture = (lang: Lang) => (lang === 'en' ? TIMELINE_FIXTURE_EN : TIMELINE_FIXTURE)
