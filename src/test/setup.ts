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
  if (typeof document !== 'undefined' && document.body) {
    document.body.innerHTML = '';
    
    // jsdomでのルート要素作成
    const testContainer = document.createElement('div');
    testContainer.id = 'test-container';
    document.body.appendChild(testContainer);
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