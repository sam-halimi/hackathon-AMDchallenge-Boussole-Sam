// La fiche de la personne : ce qui est chiffré et enregistré sur l'appareil (voir vault.ts).
export type Tri = 'oui' | 'non' | 'nsp' | ''
export type Fiche = {
  prenom: string
  quand: string; quandInconnu: boolean; ou: string; souvenirs: string; oublis: string
  symptomes: string[]; substance: Tri; douche: Tri; vetements: string; temoins: string; besoins: string[]
  journal: { at: string; action: string }[]
}
export const EMPTY: Fiche = { prenom: '', quand: '', quandInconnu: false, ou: '', souvenirs: '', oublis: '', symptomes: [], substance: '', douche: '', vetements: '', temoins: '', besoins: [], journal: [] }
export const SYMPTOMES = ['Étourdissements', 'Trous de mémoire', 'Somnolence inhabituelle', 'Nausées', 'Douleurs', 'Blessures visibles', 'Aucun']
export const BESOINS = ['Parler à quelqu’un', 'Un examen médical', 'Un conseil juridique', 'Rien pour l’instant']
export const VETEMENTS = ['Gardés tels quels', 'Lavés', 'Je ne sais pas']
export const TRI: [Exclude<Tri, ''>, string][] = [['oui', 'Oui'], ['non', 'Non'], ['nsp', 'Je ne sais pas']]

export type Tab = 'accueil' | 'recit' | 'aller' | 'dossier' | 'vie-privee'
export type Kind = 'all' | 'exam' | 'support' | 'legal'
