import { describe, expect, it } from 'vitest'
import { applyGuardrails, hasShape } from '../../server/timeline.js'
import { DEMO_NOTES } from './demoCase'
import { pseudonymize } from './pseudonymize'
import { TIMELINE_FIXTURE } from './timelineFixture'

describe('réponse pré-enregistrée', () => {
  it('respecte le schéma et passe tous les garde-fous sur les notes pseudonymisées', () => {
    expect(hasShape(TIMELINE_FIXTURE)).toBe(true)
    const { removed } = applyGuardrails(TIMELINE_FIXTURE, pseudonymize(DEMO_NOTES).text)
    expect(removed).toEqual([])
  })
})
