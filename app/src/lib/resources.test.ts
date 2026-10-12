import { describe, expect, it } from 'vitest'
import { RESOURCES } from './resources'

// Garde-fou : aucun numéro ni aucune adresse ne change sans source officielle.
// Toute modification de cette liste doit citer sa source dans research-resources.md.
const PHONES: Record<string, string | undefined> = {
  cdvasim: '+15144138999', 'cvasm-jour': '+15147318531', 'cvasm-soir': '+15149348090', 'sainte-justine': '+15143454931', children: undefined,
  'info-aide': '+18889339007', cvasm: '+15147318531', cavac: '+15142779860', treve: '+15142510323', consenti: '+15146842198', mcvi: '+15142789383',
  criphase: '+15145295567', 'marie-vincent': '+15142850505', interligne: '+18885051010', cpsm: '+18662773553', 'tel-aide': '+15149351101',
  'info-social': '811', opq: undefined, rebatir: '+18337322847', ivac: '+15149063019', 'info-justice': '+15142273782', juripop: '+15147051637',
  dpcp: '+18775473727', spvm: '911',
}

describe('ressources', () => {
  it('garde exactement les numéros vérifiés', () => {
    expect(Object.fromEntries(RESOURCES.map((r) => [r.id, r.phone]))).toEqual(PHONES)
  })
  it('signale les informations à confirmer de la recherche (CAVAC, Trêve pour Elles, Hôpital de Montréal pour enfants)', () => {
    for (const id of ['cavac', 'treve', 'children', 'cvasm-soir']) expect(RESOURCES.find((r) => r.id === id)?.toConfirm, id).toBeTruthy()
  })
  it('n’affiche aucune adresse pour les organismes à adresse confidentielle', () => {
    for (const id of ['treve', 'consenti', 'mcvi']) expect(RESOURCES.find((r) => r.id === id)?.address, id).toBeUndefined()
  })
  it('ne présente aucun horaire générique non sourcé', () => {
    for (const r of RESOURCES) expect(r.hours, r.id).not.toMatch(/^Jours ouvrables$/)
  })
})
