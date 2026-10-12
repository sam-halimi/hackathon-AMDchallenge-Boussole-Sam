// @ts-check
import { describe, expect, it } from 'vitest'
import { applyGuardrails, hasShape, isQuoted } from './timeline.js'

const NOTES = `Récit de la patiente : A accepté un verre offert vers 22 h 45. Ne s'est pas douchée.

Note infirmière : consentement à l'examen recueilli à 4 h 40. Prélèvement urinaire (toxicologie) noté à 4 h 05.`

const ev = (/** @type {Partial<{time:string,description:string,source:string,origin:string}>} */ o) => ({ time: '22 h 45', description: 'Verre offert', source: 'A accepté un verre offert vers 22 h 45.', origin: 'Récit', ...o })

describe('citations', () => {
  it('accepte une citation exacte, malgré apostrophes typographiques et espaces', () => {
    expect(isQuoted('Ne s’est pas  douchée', NOTES)).toBe(true)
  })
  it('refuse une citation absente ou reformulée', () => {
    expect(isQuoted('Elle a bu un verre à 22 h 45.', NOTES)).toBe(false)
    expect(isQuoted('', NOTES)).toBe(false)
  })
})

describe('garde-fous', () => {
  it('garde un événement étayé', () => {
    const { result, removed } = applyGuardrails({ events: [ev({})], gaps: [], inconsistencies: [] }, NOTES)
    expect(result.events).toHaveLength(1)
    expect(removed).toHaveLength(0)
  })
  it('retire un événement non étayé (citation inventée)', () => {
    const { result, removed } = applyGuardrails({ events: [ev({ source: 'Elle a rencontré un homme à 23 h.' })], gaps: [], inconsistencies: [] }, NOTES)
    expect(result.events).toHaveLength(0)
    expect(removed[0].reason).toMatch(/non étayé/)
  })
  it.each([
    ['désignation de coupable', 'Le coupable lui a offert un verre'],
    ['désignation de coupable', 'Un suspect lui offre un verre'],
    ['jugement de crédibilité', 'Récit peu fiable'],
    ['jugement de crédibilité', 'La personne exagère probablement'],
    ['jugement de crédibilité', 'Crédibilité moyenne'],
    ['score sur la personne', 'Score de cohérence 4/10'],
    ['qualification juridique', 'Ce geste constitue une agression sexuelle'],
    ['diagnostic médical', 'Diagnostic : intoxication au GHB'],
  ])('retire : %s (« %s »)', (reason, description) => {
    const { result, removed } = applyGuardrails({ events: [ev({ description })], gaps: [], inconsistencies: [] }, NOTES)
    expect(result.events).toHaveLength(0)
    expect(removed[0].reason).toBe(reason)
  })
  it('ne confond pas « substance suspectée » avec la désignation d’un suspect', () => {
    const { result } = applyGuardrails({ events: [ev({ description: 'Verre offert, substance suspectée' })], gaps: [], inconsistencies: [] }, NOTES)
    expect(result.events).toHaveLength(1)
  })
  it('retire une incohérence dont une source n’est pas citée', () => {
    const inc = { description: 'Dossier : horodatage', sources: ['Prélèvement urinaire (toxicologie) noté à 4 h 05.', 'arrivée à 3 h'], suggestion: 'Vérifier' }
    const { result, removed } = applyGuardrails({ events: [], gaps: [], inconsistencies: [inc] }, NOTES)
    expect(result.inconsistencies).toHaveLength(0)
    expect(removed[0].kind).toBe('inconsistency')
  })
  it('retire un trou de mémoire présenté comme un problème de fiabilité', () => {
    const { result } = applyGuardrails({ events: [], gaps: [{ from: 'a', to: 'b', note: 'Récit peu fiable sur cette période' }], inconsistencies: [] }, NOTES)
    expect(result.gaps).toHaveLength(0)
  })
})

describe('forme de la sortie', () => {
  it('valide le schéma', () => {
    expect(hasShape({ events: [ev({})], gaps: [], inconsistencies: [] })).toBe(true)
    expect(hasShape({ events: [{ time: 1 }], gaps: [], inconsistencies: [] })).toBe(false)
    expect(hasShape({ events: [] })).toBe(false)
    expect(hasShape(null)).toBe(false)
  })
})
