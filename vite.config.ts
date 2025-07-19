import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    })
  ],
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
        manualChunks: (id) => {
          // React関連を分離
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react';
          }
          // 状態管理ライブラリを分離
          if (id.includes('node_modules/zustand')) {
            return 'state';
          }
          // バリデーションライブラリを分離
          if (id.includes('node_modules/zod')) {
            return 'validation';
          }
          // コンポーネントライブラリを分離
          if (id.includes('/src/components/')) {
            return 'components';
          }
          // データとサービスを分離
          if (id.includes('/src/data/') || id.includes('/src/services/')) {
            return 'data';
          }
          // その他のnode_modulesを分離
          if (id.includes('node_modules')) {
            return 'vendor';
          }
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