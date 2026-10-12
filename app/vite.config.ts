/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { timelineApi } from './server/vitePlugin.js'

// BASE_PATH : sous-dossier de publication (ex. /mon-depot/ pour GitHub Pages) ; à la racine par défaut.
// Les variables VLLM_* sont lues ici pour la route /api/timeline du serveur de dev : elles ne sont
// jamais exposées au navigateur (seules les variables VITE_* le sont).
export default defineConfig(({ mode }) => ({
  base: process.env.BASE_PATH ?? '/',
  plugins: [react(), tailwindcss(), timelineApi(loadEnv(mode, process.cwd(), 'VLLM_'))],
  test: {
    include: ['src/**/*.test.ts', 'server/**/*.test.js', 'scripts/**/*.test.js'],
  },
}))
