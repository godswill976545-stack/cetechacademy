import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'login.html'),
        portal: resolve(__dirname, 'frontend/portal.html'),
        payment: resolve(__dirname, 'frontend/payment.html'),
      }
    }
  },
  server: {
    port: 5176,
    strictPort: true
  }
});

