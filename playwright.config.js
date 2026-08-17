// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI
    ? [['line'], ['html', { open: 'never' }]]
    : 'list',
  use: {
    baseURL: 'http://127.0.0.1:8765',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'iphone-safari',
      testIgnore: /pwa-offline\.spec\.js/,
      use: {
        ...devices['iPhone 13'],
        viewport: { width: 375, height: 667 },
      },
    },
    {
      name: 'chromium-pwa',
      testMatch: /pwa-offline\.spec\.js/,
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
  webServer: {
    command: 'npx serve -l tcp://127.0.0.1:8765 --no-clipboard',
    url: 'http://127.0.0.1:8765',
    reuseExistingServer: !process.env.CI,
  },
});
