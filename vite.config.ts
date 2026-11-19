import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { msw } from 'msw/vite'
import { fileURLToPath } from 'node:url'
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'
import { checkApiOrigin } from './config/apiOrigin.ts'
import { createProxy } from './config/proxy.ts'

export default defineConfig(({ command, mode }) => {
  checkApiOrigin({
    command,
    mode,
    value: loadEnv(mode, process.cwd(), 'VITE_').VITE_API_ORIGIN,
  })
  return {
    plugins: [
      react(),
      tailwindcss(),
      ...(command === 'serve' || mode === 'mock' ? [msw({ mode: 'worker-only' })] : []),
    ],
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
  }
})
