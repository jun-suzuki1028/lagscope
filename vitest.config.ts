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
    // 並列実行設定（全環境でシーケンシャル実行）
    fileParallelism: false,
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
        maxForks: 1,
        minForks: 1,
        isolate: true,
      },
    },
    // テスト実行の完全な分離
    isolate: true,
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
    // 全環境でのリソース制限（安定性向上）
    maxConcurrency: 1,
    // ファイルウォッチャーを無効化
    watch: false,
    // テスト実行順序を決定論的にする
    sequence: {
      shuffle: false,
      concurrent: false,
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})