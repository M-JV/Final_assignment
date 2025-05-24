// bloggy-client/vite.config.js
import { defineConfig } from 'vite'
import react            from '@vitejs/plugin-react'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const projectConfig = require('../project.config.js')

export default defineConfig({
  plugins: [react()],

  define: {
    // expose the base URL at runtime
    'import.meta.env.VITE_API_BASE': JSON.stringify(projectConfig.baseUrl)
  },

  server: {
    port: projectConfig.frontendPort,
    proxy: {
      // everything under /api → your backend
      '/api': {
        target: `http://localhost:${projectConfig.backendPort}`,
        changeOrigin: true,
        secure: false
      },
      // socket.io
      '/socket.io': {
        target: `http://localhost:${projectConfig.backendPort}`,
        ws: true,
        changeOrigin: true,
        secure: false
      }
    }
  }
})
