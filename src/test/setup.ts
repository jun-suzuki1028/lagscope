import '@testing-library/jest-dom'
import { afterEach, beforeEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// React 18のcreateRoot対応: 環境設定
// @ts-expect-error - グローバル環境変数の型定義がないため
global.IS_REACT_ACT_ENVIRONMENT = true;

// Happy DOM環境でのReact 18対応
if (!window.ResizeObserver) {
  window.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// window.matchMediaのモック
if (!window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

// React 18対応: DOM環境の適切な初期化
beforeEach(() => {
  // DOMの基本構造を確保
  if (typeof document !== 'undefined') {
    document.body.innerHTML = '';
    
    // ルート要素が存在することを確認
    if (!document.documentElement) {
      const html = document.createElement('html');
      const head = document.createElement('head');
      const body = document.createElement('body');
      html.appendChild(head);
      html.appendChild(body);
      document.replaceChild(html, document.documentElement);
    }
  }
});

// React Testing Library の自動クリーンアップ
afterEach(() => {
  cleanup();
  // DOMを完全にクリーンアップ
  if (typeof document !== 'undefined') {
    document.body.innerHTML = '';
  }
});