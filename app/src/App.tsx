import { lazy, Suspense, useEffect, useState } from 'react'
import Espace from './components/Espace'
import { OfflineBanner } from './components/Pwa'
import { CONTACT } from './lib/site'

const Demo = lazy(() => import('./components/Demo'))
const APropos = lazy(() => import('./components/Pages').then((m) => ({ default: m.APropos })))
const Confidentialite = lazy(() => import('./components/Pages').then((m) => ({ default: m.Confidentialite })))

// Routage par ancre : #/ espace de la personne (arrivée directe), #/demo outil soignant,
// #/a-propos et #/confidentialite (publiées quand le contact du projet est renseigné).
export default function App() {
  const [route, setRoute] = useState(window.location.hash)
  useEffect(() => {
    const on = () => { setRoute(window.location.hash); window.scrollTo(0, 0) }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return (
    <>
      <OfflineBanner />
      <Suspense fallback={<div className="min-h-screen" />}>
        {route.startsWith('#/demo') ? <Demo />
          : CONTACT && route.startsWith('#/a-propos') ? <APropos />
          : CONTACT && route.startsWith('#/confidentialite') ? <Confidentialite />
          : <Espace />}
      </Suspense>
    </>
  )
}
