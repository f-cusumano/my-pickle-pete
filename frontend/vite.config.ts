/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// In sviluppo le chiamate /api vanno al backend Spring Boot (porta 8080), salvo override con MPP_BACKEND_URL.
// `host: true` rende il server di sviluppo raggiungibile dal cellulare sulla stessa rete.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backend = env.MPP_BACKEND_URL ? env.MPP_BACKEND_URL : 'http://127.0.0.1:8080';
  return {
    plugins: [react()],
    server: {
      port: 5173,
      strictPort: true,
      host: true,
      proxy: {
        '/api': { target: backend, changeOrigin: true },
      },
    },
    build: {
      sourcemap: true,
      chunkSizeWarningLimit: 900,
    },
    test: {
      globals: true,
      environment: 'jsdom',
      include: ['src/**/*.test.{ts,tsx}'],
      setupFiles: ['./src/test/setup.ts'],
      css: false,
      restoreMocks: true,
    },
  };
});
