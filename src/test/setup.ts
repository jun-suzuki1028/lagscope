import '@testing-library/jest-dom'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// React Testing Library の自動クリーンアップ
// Vitest では手動で設定する必要がある
afterEach(() => {
  cleanup();
  // React 18のcreateRoot使用時にDOMコンテナを完全にクリーンアップ
  document.body.innerHTML = '';
});