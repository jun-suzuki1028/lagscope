import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import './index.css'

// PWA Service Worker登録
import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('新しいバージョンが利用可能です。更新しますか？')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log('アプリがオフラインで利用可能になりました')
    }
  },
})

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)