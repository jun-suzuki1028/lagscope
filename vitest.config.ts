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
    testTimeout: process.env.CI ? 10000 : 5000,
    hookTimeout: process.env.CI ? 10000 : 5000,
    teardownTimeout: process.env.CI ? 5000 : 1000,
    // 並列実行設定
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: process.env.CI === 'true',
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})