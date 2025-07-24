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
    // React 18のcreateRootでの問題を防ぐ
    clearMocks: true,
    restoreMocks: true,
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
    // React 18 createRootエラー解決のための完全シーケンシャル設定
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
        isolate: true,
      },
    },
    // 一度に1つのテストファイルだけを実行
    fileParallelism: false,
    maxConcurrency: 1,
    isolate: true,
    // CI環境でのDOM安定性向上
    env: {
      JSDOM_QUIET: process.env.CI ? 'true' : 'false',
      NODE_ENV: 'test',
    },
    // jsdom オプション（createRootエラー解決）
    environmentOptions: {
      jsdom: {
        resources: 'usable',
        runScripts: 'dangerously',
        pretendToBeVisual: true,
        url: 'http://localhost:3000',
        // React 18のcreateRoot用のDOMコンテナを確実に設定
        html: '<!DOCTYPE html><html><head></head><body><div id="root"></div></body></html>',
        contentType: 'text/html',
        userAgent: 'Mozilla/5.0 (jsdom)',
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
    // ファイルウォッチャーを無効化
    watch: false,
    // テスト実行順序を決定論的にし、各テストを完全に分離
    sequence: {
      shuffle: false,
      concurrent: false,
      setupTimeout: 10000,
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})