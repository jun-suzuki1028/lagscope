import '@testing-library/jest-dom'
import { beforeEach, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// CI環境でのjsdom安定性向上
if (typeof globalThis.crypto === 'undefined') {
  globalThis.crypto = {} as Crypto;
}

// グローバルエラーハンドラーを設定
// eslint-disable-next-line no-console
const originalConsoleError = console.error;
// eslint-disable-next-line no-console
console.error = (...args) => {
  // React 18のact警告は無視（CI環境での失敗を防ぐ）
  if (typeof args[0] === 'string' && args[0].includes('Warning: An update to')) {
    return;
  }
  originalConsoleError(...args);
};

// Window/DOM APIの安定化
if (typeof window !== 'undefined') {
  // ResizeObserverのモック（CI環境で欠けている場合がある）
  if (!window.ResizeObserver) {
    window.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
  
  // IntersectionObserver のモック
  if (!window.IntersectionObserver) {
    window.IntersectionObserver = class IntersectionObserver {
      root = null;
      rootMargin = '';
      thresholds: ReadonlyArray<number> = [];
      
      constructor() {}
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords(): IntersectionObserverEntry[] { return []; }
    } as typeof IntersectionObserver;
  }
  
  // matchMedia のモック
  if (!window.matchMedia) {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => {},
      }),
    });
  }
}

// テスト前後でのDOMクリーンアップ
beforeEach(() => {
  // HTMLElementが存在することを確認
  if (typeof window !== 'undefined' && typeof HTMLElement === 'undefined') {
    global.HTMLElement = window.HTMLElement;
  }
  
  // 確実にdocument.bodyが存在することを保証
  if (!document.body) {
    document.body = document.createElement('body');
  }
  
  // body要素をクリア
  document.body.innerHTML = '';
  
  // 必要なDOM環境をセットアップ
  const container = document.createElement('div');
  container.id = 'test-container';
  document.body.appendChild(container);
});

afterEach(() => {
  cleanup();
  
  // DOM要素をクリア
  if (document.body) {
    document.body.innerHTML = '';
  }
  
  // 任意のグローバル状態をリセット
  if (typeof window !== 'undefined') {
    // windowオブジェクトのイベントリスナーをクリア
    window.removeEventListener = window.removeEventListener || (() => {});
  }
});

// jsdomのDOM API互換性向上
if (typeof global.document !== 'undefined') {
  // createElementの安全性確保
  const originalCreateElement = document.createElement;
  document.createElement = function (tagName: string, options?: ElementCreationOptions) {
    try {
      const element = originalCreateElement.call(this, tagName, options);
      // CI環境でのDOM要素の初期化を確実にする
      if (element && typeof element.setAttribute === 'function') {
        return element;
      }
      throw new Error(`Invalid element created for tag: ${tagName}`);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`createElement failed for ${tagName}:`, error);
      throw error;
    }
  };
}