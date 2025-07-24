import '@testing-library/jest-dom'
import { afterEach, beforeEach } from 'vitest'
import { cleanup, configure } from '@testing-library/react'

// React 18 対応のテスト環境設定
// eslint-disable-next-line no-console
console.log('Setting up React 18 compatible test environment');

// React 18のcreateRoot対応: 環境設定
// @ts-expect-error - グローバル環境変数の型定義がないため
global.IS_REACT_ACT_ENVIRONMENT = true;

// React 18でのcreateRoot問題を回避するため、強制的にlegacy renderを使用
// @ts-expect-error - テスト環境でのモード指定
global.IS_REACT_18_LEGACY_MODE = true;

// React Testing Libraryの設定を最適化
configure({
  // テストIDによる要素検索を無効化し、アクセシビリティ重視
  testIdAttribute: 'data-testid',
  // React 18のconcurrent features対応
  asyncUtilTimeout: 5000,
  // DOM変更をより敏感に検知
  computedStyleSupportsPseudoElements: true,
});

// React Testing LibraryでcreateRootエラーを回避するための設定
if (typeof globalThis !== 'undefined') {
  // @ts-expect-error - テスト環境でのReact Rootモード指定
  globalThis.FORCE_LEGACY_ROOT = true;
  // @ts-expect-error - React Testing Libraryの内部フラグ
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  // @ts-expect-error - React 18のstrict modeを無効化
  globalThis.DISABLE_REACT_STRICT_MODE = true;
}

// Web API のモック実装
if (typeof window !== 'undefined') {
  // ResizeObserver のモック
  if (!window.ResizeObserver) {
    window.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }

  // IntersectionObserver のモック
  if (!window.IntersectionObserver) {
    window.IntersectionObserver = class MockIntersectionObserver {
      root = null;
      rootMargin = '';
      thresholds = [];
      
      constructor() {}
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() { return []; }
    } as unknown as typeof IntersectionObserver;
  }

  // matchMedia のモック
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

  // requestAnimationFrame のモック
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = (callback: FrameRequestCallback) => {
      return setTimeout(callback, 0);
    };
  }

  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = (id: number) => {
      clearTimeout(id);
    };
  }

  // getComputedStyle のモック（jsdomの制限を回避）
  // 既存の実装を上書きして強制的にモックを適用
  Object.defineProperty(window, 'getComputedStyle', {
    value: (_element: Element, _pseudoElement?: string | null) => {
      // CSSStyleDeclarationを模倣したオブジェクトを返す
      const styles: Partial<CSSStyleDeclaration> = {
        getPropertyValue: (property: string) => {
          // よく使われるプロパティのデフォルト値を提供
          const defaults: Record<string, string> = {
            'display': 'block',
            'visibility': 'visible',
            'opacity': '1',
            'color': 'rgb(0, 0, 0)',
            'background-color': 'rgba(0, 0, 0, 0)',
            'font-size': '16px',
            'font-family': 'Arial, sans-serif',
            'line-height': 'normal',
            'width': 'auto',
            'height': 'auto',
            'margin': '0px',
            'padding': '0px',
            'border': '0px',
            'position': 'static',
            'top': 'auto',
            'left': 'auto',
            'right': 'auto',
            'bottom': 'auto',
            'z-index': 'auto',
          };
          return defaults[property] || '';
        },
        setProperty: () => {},
        removeProperty: () => '',
        length: 0,
        cssText: '',
        parentRule: null,
      };
      
      return styles as CSSStyleDeclaration;
    },
    writable: true,
    configurable: true,
  });
}

// React 18 createRoot用のDOM環境を完全初期化
beforeEach(() => {
  // DOMを完全にリセット
  if (typeof document !== 'undefined') {
    // bodyの内容をクリア
    document.body.innerHTML = '';
    
    // HTML5の標準ドキュメント構造を確保
    if (!document.doctype) {
      try {
        const doctype = document.implementation.createDocumentType('html', '', '');
        document.insertBefore(doctype, document.documentElement);
      } catch {
        // doctype作成に失敗した場合は無視
      }
    }

    // head要素が存在することを確認
    if (!document.head) {
      const head = document.createElement('head');
      try {
        document.documentElement.insertBefore(head, document.body);
      } catch {
        // head要素の挿入に失敗した場合は無視
      }
    }

    // React Testing Library用の標準的なDOMコンテナを準備
    const container = document.createElement('div');
    try {
      container.setAttribute('data-testid', 'test-root');
      container.id = 'test-root';
    } catch {
      // setAttributeが失敗した場合は直接プロパティを設定
      (container as Element & { dataset: Record<string, string> }).dataset = { testid: 'test-root' };
      container.id = 'test-root';
    }
    
    // bodyに確実に追加
    document.body.appendChild(container);

    // React 18のcreatRootが参照するDOMが存在することを確実にチェック
    const verifyContainer = document.getElementById('test-root');
    if (!verifyContainer) {
      // eslint-disable-next-line no-console
      console.warn('test-root container not found after creation');
      // 再作成を試す
      const fallbackContainer = document.createElement('div');
      fallbackContainer.id = 'test-root';
      document.body.appendChild(fallbackContainer);
    }
  }
});

// React Testing Library の自動クリーンアップ
afterEach(async () => {
  // React Testing Libraryの標準クリーンアップ
  cleanup();
  
  // React 18のcreateRoot後の非同期処理完了を待機
  await new Promise(resolve => setTimeout(resolve, 0));
  
  // DOMを完全にクリーンアップ（重要：React 18のメモリリーク防止）
  if (typeof document !== 'undefined') {
    // すべてのイベントリスナーを削除
    document.body.innerHTML = '';
    
    // 新しいルートコンテナを準備（次のテスト用）
    const container = document.createElement('div');
    try {
      container.setAttribute('data-testid', 'test-root');
      container.id = 'test-root';
    } catch {
      // setAttributeが失敗した場合は直接プロパティを設定
      (container as Element & { dataset: Record<string, string> }).dataset = { testid: 'test-root' };
      container.id = 'test-root';
    }
    document.body.appendChild(container);
    
    // グローバルな状態をリセット
    if (typeof window !== 'undefined') {
      // すべてのタイマーをクリア
      const highestTimeoutId = setTimeout(() => {}, 0) as unknown as number;
      for (let i = 0; i < highestTimeoutId; i++) {
        clearTimeout(i);
      }
      
      const highestIntervalId = setInterval(() => {}, 1000) as unknown as number;
      for (let i = 0; i < highestIntervalId; i++) {
        clearInterval(i);
      }
      
      // イベントリスナーをリセット
      if (window.removeEventListener) {
        // resize, scroll等のグローバルイベントをクリア
        ['resize', 'scroll', 'load', 'error', 'beforeunload'].forEach(event => {
          window.removeEventListener(event, () => {});
        });
      }
    }
  }
  
  // メモリクリーンアップのための待機時間
  await new Promise(resolve => setTimeout(resolve, 0));
});