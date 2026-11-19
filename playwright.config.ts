import { defineConfig } from '@playwright/test'

const mobile = { browserName: 'chromium', hasTouch: true, isMobile: true } as const
const appUrl = 'http://127.0.0.1:4173'
const previewUrl = 'http://127.0.0.1:4174'
const appOnly = { testIgnore: /preview\.spec\.ts/ }
const previewOnly = { testMatch: /preview\.spec\.ts/ }

export default defineConfig({
  testDir: 'e2e',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  webServer: [
    {
      command: 'pnpm exec vite --mode e2e --port 4173 --strictPort --host 127.0.0.1',
      url: appUrl,
      reuseExistingServer: !process.env.CI,
    },
    {
      command:
        'pnpm exec vite build --mode mock --outDir dist-mock && pnpm exec vite preview --mode mock --outDir dist-mock --port 4174 --strictPort --host 127.0.0.1',
      url: previewUrl,
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
    },
  ],
  projects: [
    {
      name: 'mobile-360',
      ...appOnly,
      use: { ...mobile, baseURL: appUrl, viewport: { width: 360, height: 740 } },
    },
    {
      name: 'mobile-390',
      ...appOnly,
      use: { ...mobile, baseURL: appUrl, viewport: { width: 390, height: 844 } },
    },
    {
      name: 'preview-360',
      ...previewOnly,
      use: { ...mobile, baseURL: previewUrl, viewport: { width: 360, height: 740 } },
    },
    {
      name: 'preview-390',
      ...previewOnly,
      use: { ...mobile, baseURL: previewUrl, viewport: { width: 390, height: 844 } },
    },
  ],
})
