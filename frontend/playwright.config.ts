import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',   // your e2e tests folder
  timeout: 30 * 1000,
  use: {
    headless: true,         // set false to see the browser UI
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
  },
  reporter: [['list'], ['html']],
});
