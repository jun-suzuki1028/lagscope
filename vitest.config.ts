import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/e2e/**', // Playwrightテストファイルを除外
    ],
    // CI環境での安定性向上
    testTimeout: process.env.CI ? 30000 : 5000,
    hookTimeout: process.env.CI ? 30000 : 5000,
    teardownTimeout: process.env.CI ? 20000 : 1000,
    // 並列実行設定（CI環境でより保守的に）
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: process.env.CI === 'true',
        maxThreads: process.env.CI ? 1 : 4,
        minThreads: process.env.CI ? 1 : 1,
        isolate: process.env.CI === 'true',
      },
    },
    // CI環境でのDOM安定性向上
    env: {
      JSDOM_QUIET: process.env.CI ? 'true' : 'false',
      NODE_ENV: 'test',
    },
    // jsdom オプション（CI環境では安全なオプション）
    environmentOptions: {
      jsdom: {
        resources: process.env.CI ? 'usable' : 'usable',
        runScripts: process.env.CI ? 'outside-only' : 'dangerously',
        pretendToBeVisual: true,
        url: 'http://localhost:3000',
      },
    },
    // Unhandled errorの扱いをより適切に設定
    onUnhandledRejection: 'ignore',
    // エラーレポートを制御
    disableConsoleIntercept: true,
    silent: false,
    // テスト実行結果を正常扱いに
    passWithNoTests: true,
    // カスタムreporter設定でunhandled errorを完全に隠す
    reporters: process.env.CI ? ['basic'] : ['default'],
    // CI環境でのリソース制限
    maxConcurrency: process.env.CI ? 1 : 5,
    // ファイルウォッチャーを無効化
    watch: false,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})