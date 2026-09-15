import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  server: {
    host: true,
    watch: {
      usePolling: true,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5006',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5006',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})