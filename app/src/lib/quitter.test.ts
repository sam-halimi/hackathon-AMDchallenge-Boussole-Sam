import { describe, expect, it } from 'vitest'
import { quitter, SITE_NEUTRE } from './quitter'

describe('quitter rapidement', () => {
  it('verrouille avant de partir vers le site neutre', () => {
    const ordre: string[] = []
    quitter(() => ordre.push('verrou'), (url) => ordre.push(url))
    expect(ordre).toEqual(['verrou', SITE_NEUTRE])
  })

  it('part quand même si le verrouillage échoue', () => {
    const vus: string[] = []
    expect(() => quitter(() => { throw new Error('stockage indisponible') }, (url) => vus.push(url))).toThrow()
    expect(vus).toEqual([SITE_NEUTRE])
  })

  it('mène à une page sans rapport avec Boussole, en HTTPS', () => {
    expect(SITE_NEUTRE.startsWith('https://')).toBe(true)
    expect(SITE_NEUTRE.toLowerCase()).not.toMatch(/boussole|agression|violence|aide/)
  })
})
