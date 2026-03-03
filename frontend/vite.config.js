import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const apiTarget = process.env.API_PROXY_TARGET || 'http://localhost:5001'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/api': apiTarget,
      '/actuator': apiTarget,
      '/.well-known': apiTarget,
      '/scoreboard': apiTarget,
    }
  }
})
