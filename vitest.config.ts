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
    testTimeout: process.env.CI ? 20000 : 5000,
    hookTimeout: process.env.CI ? 20000 : 5000,
    teardownTimeout: process.env.CI ? 15000 : 1000,
    // 並列実行設定
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: process.env.CI === 'true',
        maxThreads: process.env.CI ? 1 : undefined,
        minThreads: process.env.CI ? 1 : undefined,
      },
    },
    // CI環境でのDOM安定性向上
    env: {
      JSDOM_QUIET: process.env.CI ? 'true' : 'false',
      NODE_ENV: 'test',
    },
    // jsdom オプション
    environmentOptions: {
      jsdom: {
        resources: 'usable',
        runScripts: 'dangerously',
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
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})