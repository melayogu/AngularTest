import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    video: 'on', // 每次測試都錄影
  },
  testDir: './tests',
});