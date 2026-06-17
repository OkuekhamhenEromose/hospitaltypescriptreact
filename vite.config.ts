import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://hospitalback-clean-0fre.onrender.com',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})