import { describe, expect, it } from 'vitest'
import { CARE_STEPS } from './careSteps'
import { BESOINS, SYMPTOMES, TRI, VETEMENTS } from './fiche'
import { RESOURCES } from './resources'
import { RULES } from './rules'
import { careStep, OPTION_EN, resource, RESOURCES_EN, RULE_LABEL_EN, RULE_WHY_EN } from './en'
import { FALLBACK_REASONS } from './aiApi'
import { FALLBACK_REASONS_EN, TIMELINE_FIXTURE_EN } from './enDemo'
import { TIMELINE_FIXTURE } from './timelineFixture'

const digits = (s?: string) => (s ?? '').replace(/\D/g, '')

describe('version anglaise', () => {
  it('traduit chaque ressource sans toucher aux numéros, adresses ni repères', () => {
    for (const r of RESOURCES) {
      const e = resource('en', r)
      expect(RESOURCES_EN[r.id]?.what, r.id).toBeTruthy()
      expect(RESOURCES_EN[r.id]?.hours, r.id).toBeTruthy()
      expect(digits(e.phoneLabel)).toBe(digits(r.phoneLabel))
      expect([e.phone, e.address, e.lat, e.lng, e.url, e.kind]).toEqual([r.phone, r.address, r.lat, r.lng, r.url, r.kind])
      expect(Boolean(e.toConfirm)).toBe(Boolean(r.toConfirm))
      expect(Boolean(e.note)).toBe(Boolean(r.note))
    }
  })

  it('garde les étapes de prise en charge dans le même ordre, avec les mêmes liens', () => {
    CARE_STEPS.forEach((s, i) => {
      const e = careStep('en', i)
      expect([e.icon, e.tint, e.source, e.action?.href, e.action?.tab, e.action?.filter]).toEqual([s.icon, s.tint, s.source, s.action?.href, s.action?.tab, s.action?.filter])
      expect(Boolean(e.timing)).toBe(Boolean(s.timing))
      expect(e.tips?.length).toBe(s.tips?.length)
    })
  })

  it('a un libellé anglais pour chaque réponse et chaque règle', () => {
    for (const o of [...SYMPTOMES, ...BESOINS, ...VETEMENTS, ...TRI.map(([, l]) => l)]) expect(OPTION_EN[o], o).toBeTruthy()
    for (const r of RULES) expect(RULE_LABEL_EN[r.id], r.id).toBeTruthy()
    for (const r of RULES) expect(RULE_WHY_EN[r.id], r.id).toBeTruthy()
  })

  it('outil soignant : réponse pré-enregistrée de même forme, citations françaises intactes', () => {
    const fr = TIMELINE_FIXTURE, en = TIMELINE_FIXTURE_EN
    expect(en.events.map((e) => e.source)).toEqual(fr.events.map((e) => e.source))
    expect(en.gaps.length).toBe(fr.gaps.length)
    expect(en.inconsistencies.map((c) => c.sources)).toEqual(fr.inconsistencies.map((c) => c.sources))
    expect(Object.keys(FALLBACK_REASONS_EN).sort()).toEqual(Object.keys(FALLBACK_REASONS).sort())
  })
})
