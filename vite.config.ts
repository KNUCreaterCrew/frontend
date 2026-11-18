import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'
import { createProxy } from './config/proxy.ts'

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: createProxy(loadEnv(mode, process.cwd(), '').BACKEND_ORIGIN || undefined),
  },
  resolve: {
    alias: {
      '@mocks': fileURLToPath(new URL('./mocks', import.meta.url)),
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/shared/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'mocks/**/*.test.{ts,tsx}', 'config/**/*.test.ts'],
  },
}))
