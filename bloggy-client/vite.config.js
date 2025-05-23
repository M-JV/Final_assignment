// bloggy-client/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// pull in your CJS project.config.js
const projectConfig = require('../project.config.js');

export default defineConfig({
  plugins: [react()],
  server: {
    port: projectConfig.frontendPort,
    proxy: {
      '/api': {
        target: `http://localhost:${projectConfig.backendPort}`,
        changeOrigin: true,
        secure: false
      }
    }
  },
  define: {
    'import.meta.env.VITE_API_BASE': JSON.stringify(projectConfig.baseUrl)
  }
});
