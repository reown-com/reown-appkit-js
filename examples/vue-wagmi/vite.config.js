import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import vercel from 'vite-plugin-vercel'

export default defineConfig({
  plugins: [vue(), vercel()],
  build: {
    rollupOptions: {
      external: ['@tanstack/vue-query']
    }
  },
  define: {
    VITE_PROJECT_ID: process.env.VITE_PROJECT_ID
  }
})
