// vite.config.js

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import projectConfig from '../project.config';

export default defineConfig({
  plugins: [react()],
  server: {
    port: projectConfig.frontendPort,
    proxy: {
      '/api': {
        target: `http://localhost:${projectConfig.backendPort}`,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
