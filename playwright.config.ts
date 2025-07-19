import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0, // リトライ回数を削減
  workers: process.env.CI ? 2 : 4, // ワーカー数を最適化
  reporter: 'line', // シンプルなレポーター
  timeout: 30000, // テストタイムアウトを30秒に短縮
  expect: {
    timeout: 5000, // Expectタイムアウトを5秒に短縮
  },
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure', // 失敗時のみトレースを保存
    screenshot: 'only-on-failure',
    actionTimeout: 10000, // アクションタイムアウトを10秒に短縮
    navigationTimeout: 15000, // ナビゲーションタイムアウトを15秒に短縮
  },

  // Chromiumのみでテスト実行（大幅な時間短縮）
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 60000, // サーバー起動タイムアウトを1分に短縮
  },
});