import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    // GitHub Pages用の設定
    outDir: 'dist',
    assetsDir: 'assets',
    // バンドルサイズの最適化
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          zustand: ['zustand'],
          zod: ['zod'],
        },
      },
    },
    // 本番環境でのソースマップを無効化
    sourcemap: false,
    // 圧縮を有効化
    minify: 'terser',
    // チャンクサイズ警告の閾値を調整
    chunkSizeWarningLimit: 1000,
  },
  // GitHub Pages用のベースパス設定
  base: '/lagscope/',
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})