import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

/**
 * React 18対応のテスト実行設定
 * createRootエラー解決のための完全シーケンシャル実行
 */
const react18TestConfig = {
  // React 18 createRootエラー解決のための完全シーケンシャル設定
  pool: 'threads' as const,
  poolOptions: {
    threads: {
      singleThread: true,
      isolate: true,
      // プロセス間でのメモリ完全分離
      execArgv: ['--no-warnings'],
    },
  },
  // 一度に1つのテストファイルだけを実行
  fileParallelism: false,
  maxConcurrency: 1,
  isolate: true,
  minThreads: 1,
  maxThreads: 1,
  // 各テストファイル間でのコンテキスト完全分離
  cache: false,
  // テスト実行順序を決定論的にし、各テストを完全に分離
  sequence: {
    shuffle: false,
    concurrent: false,
    setupTimeout: 10000,
  },
};

/**
 * CI環境での安定性とタイムアウト設定
 */
const ciOptimizedConfig = {
  // CI環境での安定性向上
  testTimeout: process.env.CI ? 30000 : 5000,
  hookTimeout: process.env.CI ? 30000 : 5000,
  teardownTimeout: process.env.CI ? 20000 : 1000,
  // カスタムreporter設定
  reporters: process.env.CI ? ['basic'] : ['default'],
  // テスト実行間隔の設定（メモリクリーンアップ時間を確保）
  slowTestThreshold: 1000,
};

/**
 * DOM環境とjsdom設定
 * React 18のcreateRoot対応とDOM安定性向上
 */
const domEnvironmentConfig = {
  environment: 'jsdom' as const,
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
  // React 18 createRootエラーを回避するための環境変数
  env: {
    JSDOM_QUIET: process.env.CI ? 'true' : 'false',
    NODE_ENV: 'test',
    RTL_SKIP_AUTO_CLEANUP: 'false',
    IS_REACT_ACT_ENVIRONMENT: 'true',
  },
};

/**
 * 基本テスト設定
 * モック、除外ファイル、エラーハンドリング
 */
const baseTestConfig = {
  globals: true,
  setupFiles: './src/test/setup.ts',
  css: true,
  // React 18のcreateRootでの問題を防ぐ
  clearMocks: true,
  restoreMocks: true,
  // 除外ファイル設定
  exclude: [
    '**/node_modules/**',
    '**/dist/**',
    '**/cypress/**',
    '**/.{idea,git,cache,output,temp}/**',
    '**/e2e/**', // Playwrightテストファイルを除外
  ],
  // エラーハンドリング設定
  onUnhandledRejection: 'ignore' as const,
  disableConsoleIntercept: true,
  silent: false,
  passWithNoTests: true,
  watch: false,
};

/**
 * Vitest設定の統合
 * 機能別設定を組み合わせて最終設定を構築
 */
export default defineConfig({
  plugins: [react()],
  test: {
    ...baseTestConfig,
    ...domEnvironmentConfig,
    ...react18TestConfig,
    ...ciOptimizedConfig,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})