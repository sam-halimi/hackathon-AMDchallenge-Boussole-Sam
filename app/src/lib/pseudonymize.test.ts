import { describe, expect, it } from 'vitest'
import { findIdentifiers } from '../../shared/identifiers.js'
import { DEMO_IDENTITY, DEMO_NOTES } from './demoCase'
import { pseudonymize } from './pseudonymize'

describe('pseudonymize', () => {
  it('masque tous les identifiants du cas de démonstration', () => {
    const { text, count } = pseudonymize(DEMO_NOTES)
    for (const v of [DEMO_IDENTITY.name, DEMO_IDENTITY.firstName, DEMO_IDENTITY.lastName, DEMO_IDENTITY.address, DEMO_IDENTITY.dob, DEMO_IDENTITY.phone]) {
      expect(text).not.toContain(v)
    }
    expect(text).toContain('[PATIENTE], née le [DATE]')
    expect(text).toContain('au [LIEU]')
    expect(text).toContain('[TÉLÉPHONE]')
    expect(count).toBe(4)
  })
  it('laisse un texte sans aucun identifiant détectable par le contrôle serveur', () => {
    expect(findIdentifiers(pseudonymize(DEMO_NOTES).text)).toEqual([])
  })
  it.each([
    ['courriel', 'Écrire à lea.t@example.com demain', '[COURRIEL]'],
    ['téléphone (parenthèses)', 'Appeler le (438) 555-0199', '[TÉLÉPHONE]'],
    ['téléphone (+1)', 'Contact +1 514 555 0147', '[TÉLÉPHONE]'],
    ['RAMQ', 'Carte TREL 0403 1299', '[RAMQ]'],
    ['code postal', 'Domicile H2L 4M1', '[CODE POSTAL]'],
    ['adresse', 'Habite au 45, avenue du Parc', '[LIEU]'],
    ['date de naissance', 'DDN : 01/02/2003', 'DDN : [DATE]'],
  ])('masque un %s non connu du dossier', (_, input, tag) => {
    const { text } = pseudonymize(input, { name: '', firstName: '', lastName: '', address: '' })
    expect(text).toContain(tag)
    expect(findIdentifiers(text)).toEqual([])
  })
  it('ne masque pas un prénom inclus dans un autre mot', () => {
    expect(pseudonymize('Léandre est venu', DEMO_IDENTITY).text).toBe('Léandre est venu')
  })
  it('ne touche pas aux heures ni aux dates des faits', () => {
    const s = 'Arrivée le 4 octobre à 4 h 20. Prélèvement à 16 h 05.'
    expect(pseudonymize(s, { name: '', firstName: '', lastName: '', address: '' }).text).toBe(s)
  })
})
