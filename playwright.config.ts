import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000, // 每個測試的超時時間
  retries: 2, // 失敗時重試次數
  use: {
    video: 'on-first-retry', // 只在第一次重試時錄影
    screenshot: 'only-on-failure', // 只在失敗時截圖
    actionTimeout: 10000, // 每個動作的超時時間
    navigationTimeout: 15000, // 導航超時時間
  },
  webServer: {
    command: 'npm start',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env['CI'],
    timeout: 120000, // 等待開發伺服器啟動的時間
  },
});
