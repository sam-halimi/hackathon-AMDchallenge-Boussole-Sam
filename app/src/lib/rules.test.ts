import { describe, expect, it } from 'vitest'
import { computeChecklist, fromTri, RULES_VERSION, type Intake } from './rules'

const base: Intake = { hoursSince: 30, substance: false, exposure: false, pregnancyRisk: false, injuries: false, showered: true }
const ids = (i: Intake) => computeChecklist(i).map((c) => c.id)

describe('moteur de règles', () => {
  it('affiche toujours la mention « non validées cliniquement »', () => {
    expect(RULES_VERSION).toMatch(/non validées cliniquement/)
  })
  it('n’inclut que les règles sans condition quand tout est « non »', () => {
    expect(ids(base).sort()).toEqual(['itss', 'trousse'])
  })
  it('ajoute la toxicologie si une substance est soupçonnée', () => {
    expect(ids({ ...base, substance: true })).toEqual(expect.arrayContaining(['tox-sang', 'tox-urine']))
  })
  it('« ne sait pas » inclut la règle par prudence et la marque à confirmer', () => {
    const list = computeChecklist({ ...base, substance: null, showered: null })
    const tox = list.find((c) => c.id === 'tox-sang')!
    expect(tox.uncertain).toBe(true)
    expect(list.find((c) => c.id === 'cutane')?.uncertain).toBe(true)
    expect(list.find((c) => c.id === 'trousse')?.uncertain).toBe(false)
  })
  it('« oui » n’est pas marqué à confirmer', () => {
    expect(computeChecklist({ ...base, substance: true }).find((c) => c.id === 'tox-sang')?.uncertain).toBe(false)
  })
  it('prélèvements cutanés : inclus sans douche, exclus après une douche', () => {
    expect(ids({ ...base, showered: false })).toContain('cutane')
    expect(ids({ ...base, showered: true })).not.toContain('cutane')
  })
  it('calcule le temps restant et le statut', () => {
    const l = computeChecklist({ ...base, hoursSince: 30, substance: true })
    expect(l.find((c) => c.id === 'tox-sang')).toMatchObject({ remainingH: -6, status: 'depasse' })
    expect(l.find((c) => c.id === 'tox-urine')).toMatchObject({ remainingH: 90, status: 'possible' })
    expect(l.find((c) => c.id === 'trousse')).toMatchObject({ remainingH: 90, status: 'possible' })
    expect(computeChecklist({ ...base, hoursSince: 80 }).find((c) => c.id === 'trousse')).toMatchObject({ remainingH: 40, status: 'urgent' })
  })
  it('trie : urgent, possible, sans délai, dépassé', () => {
    const order = computeChecklist({ hoursSince: 30, substance: true, exposure: true, pregnancyRisk: true, injuries: true, showered: false }).map((c) => c.status)
    const rank = { urgent: 0, possible: 1, 'sans-delai': 2, depasse: 3 }
    expect(order.map((s) => rank[s])).toEqual([...order.map((s) => rank[s])].sort((a, b) => a - b))
  })
  it('convertit les réponses de la fiche (vide = non, « je ne sais pas » = null)', () => {
    expect([fromTri('oui'), fromTri('non'), fromTri('nsp'), fromTri('')]).toEqual([true, false, null, false])
  })
})
