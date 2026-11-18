import { defineConfig } from '@playwright/test'

const mobile = { browserName: 'chromium', hasTouch: true, isMobile: true } as const

export default defineConfig({
  testDir: 'e2e',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL: 'http://127.0.0.1:4173' },
  webServer: {
    command: 'pnpm exec vite --mode e2e --port 4173 --strictPort --host 127.0.0.1',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'mobile-360', use: { ...mobile, viewport: { width: 360, height: 740 } } },
    { name: 'mobile-390', use: { ...mobile, viewport: { width: 390, height: 844 } } },
  ],
})
