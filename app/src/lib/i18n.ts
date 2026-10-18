import { createContext, createElement, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

// Langue de l'interface : français ou anglais. Les autres langues passent par la traduction intégrée
// du navigateur (aucun script tiers) ; numéros et adresses portent translate="no".
export type Lang = 'fr' | 'en'
const KEY = 'boussole.langue'

function initialLang(): Lang {
  // Lien qui impose une langue : ?lang=en ou #/demo?lang=en (et elle est retenue pour la suite).
  try {
    const m = /[?&]lang=(fr|en)\b/.exec(`${location.search}${location.hash}`)
    if (m) {
      try { localStorage.setItem(KEY, m[1]) } catch { /* stockage indisponible */ }
      return m[1] as Lang
    }
  } catch { /* hors navigateur */ }
  try {
    const saved = localStorage.getItem(KEY)
    if (saved === 'fr' || saved === 'en') return saved
  } catch { /* stockage indisponible */ }
  return navigator.language?.toLowerCase().startsWith('en') ? 'en' : 'fr'
}

type Ctx = { lang: Lang; locale: string; setLang: (l: Lang) => void; t: (fr: string, en: string) => string }
const LangContext = createContext<Ctx>({ lang: 'fr', locale: 'fr-CA', setLang: () => undefined, t: (fr) => fr })

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang)
  useEffect(() => {
    document.documentElement.lang = lang
    document.title = lang === 'fr' ? 'Boussole · On vous accompagne, pas à pas' : 'Boussole · We walk with you, step by step'
  }, [lang])
  const value = useMemo<Ctx>(() => ({
    lang,
    locale: lang === 'fr' ? 'fr-CA' : 'en-CA',
    t: (fr, en) => (lang === 'fr' ? fr : en),
    setLang: (l) => {
      setLangState(l)
      try { localStorage.setItem(KEY, l) } catch { /* stockage indisponible */ }
    },
  }), [lang])
  return createElement(LangContext.Provider, { value }, children)
}

export const useLang = () => useContext(LangContext)
