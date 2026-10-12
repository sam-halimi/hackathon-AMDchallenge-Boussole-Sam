// MOTEUR DE RÈGLES — aucune IA. Délais PROTOTYPE, À VALIDER PAR SOURCES MÉDICALES
// et par le protocole de l'établissement (ex. protocole médicosocial MSSS).
export const RULES_VERSION = 'règles-prototype v0.2 (non validées cliniquement)'
export const RULES_WARNING = 'Règles non validées cliniquement : délais indicatifs du prototype. La décision revient à l’équipe médicale, selon le protocole de l’établissement.'

// true = oui, false = non, null = « ne sait pas ».
export type Answer = boolean | null

export type Intake = {
  hoursSince: number
  substance: Answer
  exposure: Answer // exposition possible à des liquides biologiques
  pregnancyRisk: Answer
  injuries: Answer
  showered: Answer
}

type Flag = Exclude<keyof Intake, 'hoursSince'>

export type Rule = {
  id: string
  label: string
  windowH: number | null // null = sans délai fixe
  why: string
  // Réponse qui déclenche la règle. Une réponse « ne sait pas » la déclenche aussi, par prudence.
  when?: { flag: Flag; is: boolean }
}

export const RULES: Rule[] = [
  { id: 'tox-sang', label: 'Toxicologie, prélèvement sanguin', windowH: 24, why: 'La plupart des substances ne sont plus détectables dans le sang après ~24 h.', when: { flag: 'substance', is: true } },
  { id: 'tox-urine', label: 'Toxicologie, prélèvement urinaire', windowH: 120, why: "L'urine peut prolonger la détection jusqu'à ~120 h.", when: { flag: 'substance', is: true } },
  { id: 'ppe-vih', label: 'Évaluation prophylaxie post-exposition (VIH)', windowH: 72, why: 'À débuter le plus tôt possible, au plus tard ~72 h.', when: { flag: 'exposure', is: true } },
  { id: 'cutane', label: 'Prélèvements cutanés (trousse)', windowH: 48, why: 'Fenêtre courte, surtout si douche.', when: { flag: 'showered', is: false } },
  { id: 'trousse', label: 'Trousse médicolégale complète', windowH: 120, why: 'Au Québec : faits datant de 5 jours ou moins (révision en cours).' },
  { id: 'contraception', label: "Contraception d'urgence", windowH: 120, why: "Efficacité décroissante, jusqu'à ~120 h selon la méthode.", when: { flag: 'pregnancyRisk', is: true } },
  { id: 'photos', label: 'Photos des lésions', windowH: null, why: 'Dès que possible, avec consentement spécifique.', when: { flag: 'injuries', is: true } },
  { id: 'itss', label: 'Dépistage ITSS et suivi', windowH: null, why: 'Selon protocole, avec rendez-vous de suivi.' },
]

export type Status = 'urgent' | 'possible' | 'depasse' | 'sans-delai'

// uncertain : la règle n'est là que parce qu'une réponse est « ne sait pas » (à confirmer avec la personne).
export type ChecklistItem = Rule & { remainingH: number | null; status: Status; uncertain: boolean }

export function computeChecklist(intake: Intake): ChecklistItem[] {
  const order: Record<Status, number> = { urgent: 0, possible: 1, 'sans-delai': 2, depasse: 3 }
  return RULES.filter((r) => !r.when || intake[r.when.flag] === null || intake[r.when.flag] === r.when.is)
    .map((r) => {
      const remainingH = r.windowH === null ? null : r.windowH - intake.hoursSince
      const status: Status =
        remainingH === null ? 'sans-delai' : remainingH < 0 ? 'depasse' : remainingH <= 48 ? 'urgent' : 'possible'
      const uncertain = !!r.when && intake[r.when.flag] === null
      return { ...r, remainingH, status, uncertain }
    })
    .sort((a, b) => order[a.status] - order[b.status] || (a.remainingH ?? 1e9) - (b.remainingH ?? 1e9))
}

// Réponse « Oui / Non / Je ne sais pas » de la fiche de la personne → réponse des règles.
// Une question laissée vide garde le comportement d'avant (non) ; « Je ne sais pas » devient null.
export const fromTri = (v: 'oui' | 'non' | 'nsp' | ''): Answer => (v === 'oui' ? true : v === 'nsp' ? null : false)
