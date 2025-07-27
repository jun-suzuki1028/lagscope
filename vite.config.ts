import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
// import viteImagemin from 'vite-plugin-imagemin'
// import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
    // 画像最適化プラグイン（依存関係の脆弱性のため一時的に無効化）
    // viteImagemin({
    //   gifsicle: { optimizationLevel: 7 },
    //   mozjpeg: { quality: 85 },
    //   pngquant: { quality: [0.65, 0.8], speed: 4 },
    //   webp: { quality: 85 },
    //   // PNG をWebPに変換
    //   optipng: { optimizationLevel: 7 },
    // }),
    // PWA設定（ワークボックス設定エラーのため一時的に無効化）
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   workbox: {
    //     globPatterns: ['**/*.{js,css,html,ico,png,webp,svg,json}'],
    //     runtimeCaching: [
    //       {
    //         urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
    //         handler: 'CacheFirst',
    //         options: {
    //           cacheName: 'google-fonts-cache',
    //           expiration: {
    //             maxEntries: 10,
    //             maxAgeSeconds: 60 * 60 * 24 * 365 // 1年
    //           },
    //           cacheKeyWillBeUsed: async ({ request }) => {
    //             return `${request.url}?v=1`;
    //           },
    //         },
    //       },
    //       {
    //         urlPattern: /\.(?:png|jpg|jpeg|svg|webp)$/,
    //         handler: 'CacheFirst',
    //         options: {
    //           cacheName: 'images-cache',
    //           expiration: {
    //             maxEntries: 100,
    //             maxAgeSeconds: 60 * 60 * 24 * 30 // 30日
    //           },
    //         },
    //       },
    //       {
    //         urlPattern: /\.(?:js|css)$/,
    //         handler: 'StaleWhileRevalidate',
    //         options: {
    //           cacheName: 'static-resources',
    //         },
    //       },
    //       {
    //         urlPattern: /\/data\/.*\.json$/,
    //         handler: 'NetworkFirst',
    //         options: {
    //           cacheName: 'frame-data-cache',
    //           expiration: {
    //             maxEntries: 50,
    //             maxAgeSeconds: 60 * 60 * 24 * 7 // 7日
    //           },
    //         },
    //       },
    //     ],
    //   },
    //   manifest: {
    //     name: 'LagScope',
    //     short_name: 'LagScope',
    //     description: '大乱闘スマッシュブラザーズ SPECIALの確定反撃算出ツール',
    //     theme_color: '#3b82f6',
    //     background_color: '#f3f4f6',
    //     display: 'standalone',
    //     orientation: 'portrait',
    //     scope: '/lagscope/',
    //     start_url: '/lagscope/',
    //     icons: [
    //       {
    //         src: 'pwa-192x192.png',
    //         sizes: '192x192',
    //         type: 'image/png'
    //       },
    //       {
    //         src: 'pwa-512x512.png',
    //         sizes: '512x512',
    //         type: 'image/png'
    //       },
    //       {
    //         src: 'pwa-512x512.png',
    //         sizes: '512x512',
    //         type: 'image/png',
    //         purpose: 'any maskable'
    //       }
    //     ],
    //     categories: ['games', 'utilities'],
    //     shortcuts: [
    //       {
    //         name: 'フレーム計算',
    //         short_name: '計算',
    //         description: '確定反撃の計算を開始',
    //         url: '/lagscope/?shortcut=calculate',
    //         icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
    //       }
    //     ]
    //   }
    // })
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
    // React 18のcreateRoot対応
    environmentOptions: {
      jsdom: {
        resources: 'usable',
      },
    },
    // レガシーレンダリング設定
    env: {
      RTL_SKIP_AUTO_CLEANUP: 'true',
    },
  },
})