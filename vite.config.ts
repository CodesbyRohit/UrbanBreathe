import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The API runs separately (`npm run server`, port 3001); both the dev server
// and `vite preview` forward /api to it, mirroring the Vercel rewrite.
const apiProxy = {
  '/api': {
    target: 'http://localhost:3001',
    changeOrigin: true,
  },
}

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: apiProxy,
  },
  preview: {
    port: 4173,
    proxy: apiProxy,
  },
})
