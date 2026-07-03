import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// Relative base ("./") so the same build works everywhere: GitHub Pages under a
// project subpath (/Economic-EIOS/), the Capacitor Android webview (file://), and
// local dev. This app is a single state-driven page, so there's no router base to
// worry about.
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
})
