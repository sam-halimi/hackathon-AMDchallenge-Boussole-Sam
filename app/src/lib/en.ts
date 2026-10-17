// Version anglaise des contenus. Les textes français de référence restent dans resources.ts,
// careSteps.ts, rules.ts et fiche.ts : ce fichier ne fait que les traduire, sans rien changer
// aux numéros, adresses, délais ni sources. Traduction à faire relire par une personne bilingue.
import { CARE_STEPS, type CareStep } from './careSteps'
import type { Resource } from './resources'
import { RULES_VERSION, RULES_WARNING, type ChecklistItem } from './rules'
import type { Lang } from './i18n'

// Réponses enregistrées dans la fiche (en français) → libellé affiché en anglais.
export const OPTION_EN: Record<string, string> = {
  'Étourdissements': 'Dizziness', 'Trous de mémoire': 'Memory gaps', 'Somnolence inhabituelle': 'Unusual drowsiness', 'Nausées': 'Nausea',
  'Douleurs': 'Pain', 'Blessures visibles': 'Visible injuries', 'Aucun': 'None',
  'Parler à quelqu’un': 'Talk to someone', 'Un examen médical': 'A medical exam', 'Un conseil juridique': 'Legal advice', 'Rien pour l’instant': 'Nothing for now',
  'Gardés tels quels': 'Kept as they are', 'Lavés': 'Washed', 'Je ne sais pas': 'I don’t know',
  'Oui': 'Yes', 'Non': 'No',
  'Une avocate (femme) si possible': 'A woman lawyer, if possible', 'Un ou une interprète': 'An interpreter',
  'Une personne de confiance peut être présente': 'A trusted person may be present', 'Pas de message vocal laissé': 'No voicemail left',
}
export const option = (lang: Lang, fr: string) => (lang === 'en' ? OPTION_EN[fr] ?? fr : fr)

export const RULES_WARNING_EN = 'Rules not clinically validated: approximate time frames from the prototype. The decision belongs to the medical team, according to the facility’s protocol.'
export const RULE_LABEL_EN: Record<string, string> = {
  'tox-sang': 'Toxicology, blood sample', 'tox-urine': 'Toxicology, urine sample', 'ppe-vih': 'Post-exposure prophylaxis assessment (HIV)',
  cutane: 'Skin swabs (kit)', trousse: 'Complete forensic kit', contraception: 'Emergency contraception', photos: 'Photos of injuries', itss: 'STBBI testing and follow-up',
}
export const RULES_VERSION_EN = 'prototype rules v0.2 (not clinically validated)'
export const RULE_WHY_EN: Record<string, string> = {
  'tox-sang': 'Most substances are no longer detectable in blood after ~24 h.',
  'tox-urine': 'Urine can extend detection up to ~120 h.',
  'ppe-vih': 'Start as early as possible, no later than ~72 h.',
  cutane: 'Short window, especially after a shower.',
  trousse: 'In Québec: events dating back 5 days or less (under review).',
  contraception: 'Effectiveness decreases over time, up to ~120 h depending on the method.',
  photos: 'As soon as possible, with specific consent.',
  itss: 'According to protocol, with a follow-up appointment.',
}
export const rulesWarning = (lang: Lang) => (lang === 'en' ? RULES_WARNING_EN : RULES_WARNING)
export const rulesVersion = (lang: Lang) => (lang === 'en' ? RULES_VERSION_EN : RULES_VERSION)
export const ruleLabel = (lang: Lang, id: string, fr: string) => (lang === 'en' ? RULE_LABEL_EN[id] ?? fr : fr)
export const ruleWhy = (lang: Lang, id: string, fr: string) => (lang === 'en' ? RULE_WHY_EN[id] ?? fr : fr)
// Élément de checklist avec libellé et explication dans la langue de l'interface (délais inchangés).
export const localizeRule = (lang: Lang, c: ChecklistItem): ChecklistItem =>
  lang === 'en' ? { ...c, label: ruleLabel(lang, c.id, c.label), why: ruleWhy(lang, c.id, c.why) } : c


type StepText = Pick<CareStep, 'title' | 'text' | 'timing' | 'tips'> & { actionLabel?: string }
export const CARE_STEPS_EN: StepText[] = [
  { title: 'Get to safety', text: 'If you are in danger or seriously hurt, call 911. Otherwise, go somewhere you feel safe, with someone you trust if you wish.', actionLabel: 'Call 911' },
  { title: 'Call Info-aide', text: 'Info-aide violence sexuelle: free, confidential, bilingual, 24/7. A support worker listens and tells you where to go. You can also chat online.' },
  { title: 'Preserve evidence, if you can', text: 'These steps help if you choose the forensic kit. If you have already done them, it’s okay: come anyway.',
    tips: ['Avoid washing, urinating, eating or drinking, if you can.', 'Keep unwashed clothes in a paper bag, not a plastic one.', 'Bring a change of clothes.'] },
  { title: 'Go to a designated centre', text: 'A trained team welcomes you: support worker, doctor, nurse. Free and confidential, no health card, no referral and no police report required. You can come with someone.',
    timing: 'As soon as possible: as an emergency within 5 to 7 days, by appointment after that.', actionLabel: 'See the centres on the map' },
  { title: 'Receive care', text: 'Care for injuries, testing and prevention of infections, emergency contraception. Care is offered even if you refuse the kit or don’t report to the police.',
    timing: 'HIV prevention: within 72 hours. Emergency contraception: up to 5 days.' },
  { title: 'Choose the kit, or not', text: 'The forensic kit collects evidence. You can have it done without having decided to report: it is kept while you decide. You can refuse each sample.',
    timing: 'Kit: up to 5 to 7 days depending on sources. Drug testing: as soon as possible.' },
  { title: 'Support, over time', text: 'A support worker is with you from the designated centre on. Afterwards, the CALACS, CAVAC, MCVI or Criphase offer free support. Help is available even years later.', actionLabel: 'Find support near me' },
  { title: 'Your rights, at your pace', text: 'Reporting to the police is your decision, no matter how much time has passed. Rebâtir offers free legal advice. IVAC can pay for therapy or compensate lost income, with no time limit for sexual violence.', actionLabel: 'Prepare my file' },
]
export function careStep(lang: Lang, i: number): CareStep {
  const s = CARE_STEPS[i]
  if (lang === 'fr') return s
  const e = CARE_STEPS_EN[i]
  return { ...s, title: e.title, text: e.text, timing: s.timing && e.timing, tips: s.tips && e.tips, action: s.action && { ...s.action, label: e.actionLabel ?? s.action.label } }
}

type ResourceText = Partial<Pick<Resource, 'name' | 'what' | 'hours' | 'note' | 'toConfirm' | 'phoneLabel'>>
export const RESOURCES_EN: Record<string, ResourceText> = {
  cdvasim: { name: 'Designated centre for the Island of Montréal (CDVASIM), Hôpital Notre-Dame', what: 'Adults. Welcomed at the emergency department by a trained team: care, exam, tests, forensic kit if you wish. Free, no health card needed, no police report required.', hours: '24/7' },
  'cvasm-jour': { name: 'CVASM, Clinique Médic Elle (daytime)', what: 'Adults, assault within the last 12 months. Bilingual. A CVASM support worker is on site.', phoneLabel: '+1 514 731-8531, ext. 47455', hours: 'Monday to Friday, 8 a.m. to 5 p.m.', note: 'Call before you go.' },
  'cvasm-soir': { name: 'CVASM, Montreal General Hospital (evenings and weekends)', what: 'Adults. Go to the emergency department: a CVASM support worker will be called.', hours: 'Evenings (5 p.m. to 8 a.m.), weekends, holidays', note: 'Emergency entrance on avenue des Pins.',
    toConfirm: 'Number taken from the CIUSSS reference sheet (May 2026), not yet cross-checked on the MUHC website.' },
  'sainte-justine': { name: 'CHU Sainte-Justine (under 18)', what: 'Designated centre for children and teenagers. Emergency department and specialized assessment clinic.', hours: 'Emergency 24/7' },
  children: { name: 'Montreal Children’s Hospital, MUHC (under 18)', what: 'Designated centre for children and teenagers, services mostly in English.', hours: 'Emergency 24/7', note: 'To be directed: Info-aide violence sexuelle, +1 888 933-9007.',
    toConfirm: 'Phone numbers found only on an old MUHC page and on 211: not shown until they are confirmed. The designated-centre status is confirmed (CIUSSS).' },
  'info-aide': { what: 'Listening, information and referral for anyone affected by sexual violence, and their loved ones. Free, confidential, bilingual. Online chat.', hours: '24/7' },
  cvasm: { what: 'Adults: medical and psychosocial intervention and individual psychological follow-up.', phoneLabel: '+1 514 731-8531, ext. 47456', hours: 'Hours not specified: call' },
  cavac: { what: 'Any victim of a criminal act and their loved ones: support, information about rights, accompaniment to court, help with IVAC. No police report required.', hours: 'Hours to be confirmed (9 a.m. to 5 p.m. according to a secondary source)', note: 'Call before you go.',
    toConfirm: 'Phone number confirmed (SPVM, 2026). Address and hours taken from a secondary source: the official CAVAC website could not be consulted.' },
  treve: { what: 'Cis and trans women and non-binary people, from age 14: individual meetings, groups, legal accompaniment, help with IVAC. Free.', hours: 'Monday to Thursday, 9 a.m. to 5 p.m.', note: 'Confidential address, for people’s safety.',
    toConfirm: 'The organization’s website lists two numbers: 514 251-0323 (header) and 514 565-0522 (Contact page). Main line to be confirmed.' },
  consenti: { what: 'Cis and trans women, trans, Two-Spirit and non-binary people, from age 12, in the West Island.', hours: 'Hours not specified: call', note: 'Confidential address.' },
  mcvi: { what: 'Women, including immigrants, asylum seekers, refugees and racialized women, and youth. French, English, Spanish.', hours: 'Hours to be confirmed (9:30 a.m. to 4:30 p.m. on weekdays according to a secondary source)', note: 'Confidential address.' },
  criphase: { what: 'Men who have experienced sexual violence, in childhood or as adults.', hours: 'Monday to Friday, 9 a.m. to 5 p.m.' },
  'marie-vincent': { what: 'Children and teenagers who are victims of sexual violence, and their parents: exam, interview, therapy (by referral).', hours: 'By appointment' },
  interligne: { what: 'LGBTQ+ people and their loved ones: listening, help and information, including about violence.', hours: '24/7, online chat' },
  cpsm: { what: 'If you are having suicidal thoughts or are in great distress, or for a loved one.', hours: '24/7, chat on suicide.ca' },
  'tel-aide': { what: 'Anonymous, caring listening, for anyone.', hours: '24/7' },
  'info-social': { what: 'Psychosocial consultation by phone and referral to services near you.', phoneLabel: '811, Info-Social option', hours: '24/7' },
  opq: { name: 'Ordre des psychologues du Québec: find a psychologist', what: 'Official directory of member psychologists, searchable by region and issue (trauma, sexual violence).', hours: 'Online' },
  rebatir: { what: 'Up to 4 hours of free, confidential legal advice from lawyers, for victims of sexual or domestic violence. Interpreter available.', hours: '8:30 a.m. to 4:30 p.m.; you can leave a message outside these hours' },
  ivac: { name: 'IVAC, crime victims compensation', what: 'Financial help: therapy, lost income, medical costs. No time limit for a claim related to sexual violence.', phoneLabel: '+1 514 906-3019 (toll-free +1 800 561-4822)', hours: 'Monday to Friday, 8:30 a.m. to 4:30 p.m.' },
  'info-justice': { what: 'Free, confidential legal information from lawyers and support workers.', phoneLabel: '+1 514 227-3782, option 4', hours: 'By appointment, Monday to Thursday' },
  juripop: { what: 'Low-cost legal clinic, with a sexual violence program.', hours: 'Hours not specified: call' },
  dpcp: { name: 'DPCP info line on domestic and sexual violence', what: 'Understand the court process and what happens after a police report.', hours: 'Hours not specified: call' },
  spvm: { name: 'Montréal police (SPVM)', what: 'Report to the police, if you decide to, no matter how much time has passed: 911 in an emergency, otherwise at your neighbourhood police station.', phoneLabel: '911 (emergency)', hours: '24/7' },
}
export const resource = (lang: Lang, r: Resource): Resource => (lang === 'en' ? { ...r, ...RESOURCES_EN[r.id] } : r)
