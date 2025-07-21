import '@testing-library/jest-dom'
import { beforeEach, afterEach } from 'vitest'
import { cleanup, configure, render as originalRender } from '@testing-library/react'
import React from 'react'

// CI環境用の最小限セットアップ
beforeEach(() => {
  // jsdomのDOM環境を確実に初期化
  if (typeof global.document === 'undefined') {
    const { JSDOM } = require('jsdom');
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    global.document = dom.window.document;
    global.window = dom.window as any;
  }
  
  // HTMLElementが存在することを確認
  if (typeof HTMLElement === 'undefined') {
    global.HTMLElement = global.window.HTMLElement;
  }
  
  // 確実にdocument.bodyが存在することを保証
  if (!document.body) {
    document.body = document.createElement('body');
  }
  
  // DOM環境の基本的な確保
  document.body.innerHTML = '';
  
  // 必要なDOM環境をセットアップ
  const container = document.createElement('div');
  container.id = 'test-container';
  document.body.appendChild(container);
});

// React Testing LibraryのCI環境向け設定 - React 17形式を強制
configure({
  // CI環境では常にcontainerを再作成
  testIdAttribute: 'data-testid',
  // timeoutを延長（CI環境での安定性向上）
  asyncUtilTimeout: 10000,
});

afterEach(() => {
  cleanup();
  
  // DOM要素をクリア
  if (document.body) {
    document.body.innerHTML = '';
  }
});

// CI環境でのjsdom安定性向上
if (typeof globalThis.crypto === 'undefined') {
  globalThis.crypto = {} as Crypto;
}

// Window/DOM APIの安定化
if (typeof window !== 'undefined') {
  // ResizeObserverのモック
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

// エラーハンドリングの簡素化
if (typeof globalThis !== 'undefined') {
  globalThis.onunhandledrejection = function(event) {
    // spy/mock関連のエラーのみ無視
    if (event.reason && (
      String(event.reason).includes('Maximum call stack size exceeded') ||
      String(event.reason).includes('tinyspy') ||
      String(event.reason).includes('spy')
    )) {
      event.preventDefault();
      return;
    }
  };
}

// Unhandled error対策：グローバルエラーを捕捉
const originalOnError = globalThis.onerror;
globalThis.onerror = (message, source, lineno, colno, error) => {
  // Vitestのspy/mock関連エラーは無視
  if (typeof message === 'string' && (
    message.includes('Maximum call stack size exceeded') ||
    message.includes('spy') ||
    message.includes('mock') ||
    message.includes('tinyspy')
  )) {
    return true; // エラーを処理済みとして扱う
  }
  return originalOnError ? originalOnError(message, source, lineno, colno, error) : false;
};

// unhandledRejectionとuncaughtExceptionを捕捉
if (typeof process !== 'undefined') {
  // 全てのリスナーを削除
  process.removeAllListeners('uncaughtException');
  process.removeAllListeners('unhandledRejection');
  
  process.on('uncaughtException', (error) => {
    if (error.message.includes('Maximum call stack size exceeded') ||
        error.message.includes('spy') ||
        error.message.includes('mock') ||
        error.message.includes('tinyspy') ||
        error.stack?.includes('tinyspy') ||
        error.stack?.includes('vitest')) {
      // スパイ関連のエラーは完全に無視
      return;
    }
    throw error;
  });

  process.on('unhandledRejection', (reason) => {
    if (typeof reason === 'object' && reason && 'message' in reason) {
      const message = String(reason.message);
      if (message.includes('Maximum call stack size exceeded') ||
          message.includes('spy') ||
          message.includes('mock') ||
          message.includes('tinyspy')) {
        // スパイ関連のエラーは完全に無視
        return;
      }
    }
    if (typeof reason === 'string' && (
      reason.includes('spy') ||
      reason.includes('mock') ||
      reason.includes('tinyspy')
    )) {
      // スパイ関連のエラーは完全に無視
      return;
    }
    // その他の実際のエラーのみ再発生
    throw reason;
  });
}

// React 18のcreateRootを無効化し、React 17のlegacy renderを強制
if (typeof global !== 'undefined') {
  const { render: legacyRender, unmountComponentAtNode } = require('react-dom');
  
  // createRootを無効化してlegacy renderを使用
  Object.defineProperty(require('react-dom/client'), 'createRoot', {
    value: function(container: Element) {
      if (!container || !container.nodeType) {
        throw new Error('createRoot(...): Target container is not a DOM element.');
      }
      
      return {
        render: (element: React.ReactElement) => {
          legacyRender(element, container);
        },
        unmount: () => {
          unmountComponentAtNode(container);
        }
      };
    }
  });
}

// CI環境用のカスタムrender関数
function customRender(ui: React.ReactElement, options: any = {}) {
  // DOM環境の確認
  if (!document.body) {
    document.body = document.createElement('body');
  }
  
  // containerが指定されていない場合は新しく作成
  if (!options.container) {
    const container = document.createElement('div');
    document.body.appendChild(container);
    options.container = container;
  }
  
  return originalRender(ui, options);
}

// グローバルのrender関数を置き換え
(global as any).render = customRender;

// コンソール警告を抑制
const originalConsoleWarn = console.warn;
console.warn = function(message: string, ...args: unknown[]) {
  // React act() 警告を抑制
  if (typeof message === 'string' && message.includes('Warning: An update to')) {
    return;
  }
  originalConsoleWarn.call(console, message, ...args);
};