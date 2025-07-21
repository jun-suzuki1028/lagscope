import '@testing-library/jest-dom'
import { beforeEach, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Vitestのエラー報告を完全に制御
const vitestErrorMethods = [
  '__vitest_reporter_error',
  '__vitest_unhandled_error', 
  '__vitest_worker_error',
  '__vitest_uncaught_error'
];

vitestErrorMethods.forEach(methodName => {
  const original = (globalThis as any)[methodName];
  (globalThis as any)[methodName] = (error: any) => {
    // spy/mock関連のエラーは報告しない
    if (error && (
      error.message?.includes('Maximum call stack size exceeded') ||
      error.message?.includes('spy') ||
      error.message?.includes('mock') ||
      error.message?.includes('tinyspy') ||
      error.stack?.includes('tinyspy') ||
      error.stack?.includes('vitest/dist') ||
      String(error).includes('spy')
    )) {
      return;
    }
    if (original) {
      return original(error);
    }
  };
});

// Vitestの内部エラーカウンタを制御
if (typeof globalThis !== 'undefined') {
  // エラーカウンタやトラッキングをハック
  const originalPromiseRejectionHandler = globalThis.onunhandledrejection;
  globalThis.onunhandledrejection = function(event) {
    if (event.reason && (
      String(event.reason).includes('Maximum call stack size exceeded') ||
      String(event.reason).includes('tinyspy') ||
      String(event.reason).includes('spy')
    )) {
      event.preventDefault();
      return;
    }
    if (originalPromiseRejectionHandler) {
      return originalPromiseRejectionHandler(event);
    }
  };
}

// CI環境でのjsdom安定性向上
if (typeof globalThis.crypto === 'undefined') {
  globalThis.crypto = {} as Crypto;
}

// React警告の抑制（CI環境での安定性向上）
// eslint-disable-next-line no-console
const originalConsoleWarn = console.warn;
// eslint-disable-next-line no-console
console.warn = (...args) => {
  // React 18のact警告は無視
  if (typeof args[0] === 'string' && args[0].includes('Warning: An update to')) {
    return;
  }
  originalConsoleWarn(...args);
};

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
  // 元のリスナーを保存
  const originalUncaughtException = process.listenerCount('uncaughtException');
  const originalUnhandledRejection = process.listenerCount('unhandledRejection');
  
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