import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: {
    // Send /api requests to the backend, so the browser sees one site (cookie works, no CORS)
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
})