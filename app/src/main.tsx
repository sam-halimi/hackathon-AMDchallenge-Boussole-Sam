import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/nunito'
import './index.css'
import App from './App.tsx'
import { LangProvider } from './lib/i18n'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LangProvider>
      <App />
    </LangProvider>
  </StrictMode>,
)

// Application installable et utilisable hors ligne (service worker produit au build seulement).
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => { /* navigation privée, HTTP… : l'appli marche sans */ })
  })
}
