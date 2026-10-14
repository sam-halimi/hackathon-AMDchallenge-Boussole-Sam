import { describe, expect, it } from 'vitest'
import { nextReview, RESOURCES_VERIFIED } from './site'

describe('vérification des ressources', () => {
  it('prévoit la prochaine revue trois mois après la dernière', () => {
    expect(nextReview('2026-10-04').toISOString().slice(0, 10)).toBe('2027-01-04')
  })
  it('a une date de vérification valide', () => {
    expect(Number.isNaN(new Date(RESOURCES_VERIFIED).getTime())).toBe(false)
  })
})
