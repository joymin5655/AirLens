import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig(() => {
  // GitHub Pages deployment uses /AirLens/ base path.
  // Cloudflare Pages or local dev usually uses / (root).
  const isGithubPages = process.env.DEPLOY_TARGET === 'github';

  return {
    base: isGithubPages ? '/AirLens/' : '/',
    plugins: [
      react(),
      tailwindcss(),
    ],
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
    server: {
      proxy: {
        '/ml-api': {
          target: process.env.VITE_ML_API_URL || 'http://localhost:8000',
          rewrite: (path) => path.replace(/^\/ml-api/, ''),
          changeOrigin: true,
        },
      },
    },
  }
})
