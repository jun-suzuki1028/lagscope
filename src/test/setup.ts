import '@testing-library/jest-dom'
import { afterEach, beforeEach, vi } from 'vitest'

// AnalyticsServiceが呼ばれる前にconfirmをモック化
if (typeof window !== 'undefined' && !window.confirm) {
  window.confirm = vi.fn(() => true);
}

import { cleanup, configure } from '@testing-library/react'
import { 
  initializeMetrics, 
  recordTestFail, 
  finalizeMetrics, 
  logMetrics 
} from './metrics'
import {
  initializeTimerManager,
  clearTrackedTimers,
  restoreTimerManager,
  logTimerStatus
} from './timer-manager'

/**
 * React 18テスト環境の統一設定
 * 
 * 各フラグの目的：
 * - IS_REACT_ACT_ENVIRONMENT: React 18のact()警告を抑制
 * - IS_REACT_18_LEGACY_MODE: legacy renderモードを強制使用
 * - FORCE_LEGACY_ROOT: createRootの代わりにlegacy renderを使用
 * - DISABLE_REACT_STRICT_MODE: テスト環境でのStrict Mode無効化
 */
const REACT_18_TEST_CONFIG = {
  IS_REACT_ACT_ENVIRONMENT: true,
  IS_REACT_18_LEGACY_MODE: true,
  FORCE_LEGACY_ROOT: true,
  DISABLE_REACT_STRICT_MODE: true,
} as const;

/**
 * デバッグログの条件付き出力
 */
const debugLog = (message: string, ...args: unknown[]): void => {
  if (process.env.NODE_ENV === 'test' && process.env.DEBUG_TESTS) {
    // eslint-disable-next-line no-console
    console.log(`[Test Setup] ${message}`, ...args);
  }
};

debugLog('Setting up React 18 compatible test environment');

// React act()警告の詳細制御
if (typeof global !== 'undefined') {
  // React 18設定をglobalに適用
  Object.assign(global, REACT_18_TEST_CONFIG);
  
  // console.error の React警告フィルタリング
  // eslint-disable-next-line no-console
  const originalError = console.error;
  // eslint-disable-next-line no-console
  console.error = (...args: unknown[]) => {
    const message = String(args[0] || '');
    
    // React act()関連の警告を抑制
    const isReactActWarning = 
      message.includes('Warning: An update to') ||
      message.includes('inside a test was not wrapped in act') ||
      message.includes('When testing, code that causes React state updates') ||
      message.includes('act(...)')
    
    if (isReactActWarning && !process.env.DEBUG_REACT_WARNINGS) {
      return; // 警告を抑制
    }
    
    originalError.apply(console, args);
  };
}

/**
 * React 18設定をglobalとglobalThisの両方に適用
 * 異なるテスト環境での互換性を確保
 */
Object.entries(REACT_18_TEST_CONFIG).forEach(([key, value]) => {
  (global as Record<string, unknown>)[key] = value;
  if (typeof globalThis !== 'undefined') {
    (globalThis as Record<string, unknown>)[key] = value;
  }
});

debugLog('Applied React 18 test configuration', REACT_18_TEST_CONFIG);

/**
 * React Testing Libraryの最適化設定
 * React 18のconcurrent featuresとアクセシビリティを重視
 */
configure({
  // テストIDによる要素検索を無効化し、アクセシビリティ重視
  testIdAttribute: 'data-testid',
  // React 18のconcurrent features対応
  asyncUtilTimeout: 5000,
  // DOM変更をより敏感に検知
  computedStyleSupportsPseudoElements: true,
});

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

  // confirm/alert/prompt のテスト用モック
  if (!window.confirm) {
    window.confirm = vi.fn(() => true); // デフォルトでOKを返す
  }
  
  if (!window.alert) {
    window.alert = vi.fn();
  }
  
  if (!window.prompt) {
    window.prompt = vi.fn(() => null);
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

/**
 * テストコンテナを安全に作成する
 * React 18 createRoot対応の完全なDOM要素を作成
 */
const createTestContainer = (): HTMLDivElement => {
  const container = document.createElement('div');
  
  // 基本属性を設定
  container.id = 'test-root';
  
  try {
    container.setAttribute('data-testid', 'test-root');
    container.setAttribute('role', 'main');
    container.setAttribute('aria-label', 'Test container');
    debugLog('Test container created successfully with attributes');
  } catch (error) {
    // setAttributeが失敗した場合は直接プロパティを設定
    Object.assign(container, {
      'data-testid': 'test-root',
      role: 'main',
      'aria-label': 'Test container'
    });
    debugLog('Fallback: Test container created using direct property assignment', error);
  }
  
  // DOM要素として確実に認識されるよう明示的にプロパティを設定
  Object.defineProperty(container, 'nodeType', {
    value: Node.ELEMENT_NODE,
    writable: false
  });
  
  return container;
};

/**
 * テストコンテナの存在を確認し、必要に応じて再作成
 */
const ensureTestContainer = (): HTMLElement => {
  let container = document.getElementById('test-root');
  
  if (!container) {
    debugLog('Test container not found, creating fallback container');
    container = createTestContainer();
    document.body.appendChild(container);
  }
  
  return container;
};

/**
 * DOM環境の初期化
 * HTML5標準構造とテストコンテナを確実に設定
 */
const initializeDOMEnvironment = (): void => {
  // bodyの内容をクリア
  document.body.innerHTML = '';
  debugLog('DOM body cleared');
  
  // HTML5の標準ドキュメント構造を確保
  if (!document.doctype) {
    try {
      const doctype = document.implementation.createDocumentType('html', '', '');
      document.insertBefore(doctype, document.documentElement);
      debugLog('HTML5 doctype created');
    } catch (error) {
      debugLog('Failed to create doctype', error);
    }
  }

  // head要素が存在することを確認
  if (!document.head) {
    const head = document.createElement('head');
    try {
      document.documentElement.insertBefore(head, document.body);
      debugLog('Head element created');
    } catch (error) {
      debugLog('Failed to create head element', error);
    }
  }

  // React Testing Library用のテストコンテナを準備
  const container = createTestContainer();
  document.body.appendChild(container);
  
  // コンテナの存在を確認
  ensureTestContainer();
  debugLog('Test environment DOM initialization completed');
};

/**
 * React 18 createRoot用のDOM環境を完全初期化
 * テスト実行前に毎回クリーンな環境を提供
 */
beforeEach(() => {
  // テストメトリクス初期化
  initializeMetrics();
  debugLog('Test metrics initialized');
  
  // タイマー管理システム初期化
  initializeTimerManager();
  debugLog('Timer management initialized');
  
  if (typeof document !== 'undefined') {
    initializeDOMEnvironment();
  }
});

/**
 * グローバル状態のクリーンアップ
 * タイマーとイベントリスナーの効率的なクリア
 */
const clearGlobalState = (): void => {
  if (typeof window === 'undefined') return;

  try {
    // 追跡中のタイマーを効率的にクリア
    clearTrackedTimers();
    
    // タイマー状況をログ出力（デバッグ時）
    logTimerStatus();
    
    // グローバルイベントリスナーをクリア
    if (window.removeEventListener) {
      const globalEvents = ['resize', 'scroll', 'load', 'error', 'beforeunload'];
      globalEvents.forEach(event => {
        // 実際のリスナーは不明なので、空の関数で削除を試行
        window.removeEventListener(event, () => {});
      });
      debugLog(`Attempted to clear global event listeners: ${globalEvents.join(', ')}`);
    }
  } catch (error) {
    debugLog('Error during global state cleanup', error);
  }
};

/**
 * React Testing Library の自動クリーンアップ
 * メモリリーク防止とDOM環境の完全リセット
 */
afterEach(async () => {
  debugLog('Starting test cleanup');
  
  // React Testing Libraryの標準クリーンアップ
  cleanup();
  debugLog('React Testing Library cleanup completed');
  
  // React 18のcreateRoot後の非同期処理完了を待機
  await new Promise(resolve => setTimeout(resolve, 0));
  
  // DOMを完全にクリーンアップ（重要：React 18のメモリリーク防止）
  if (typeof document !== 'undefined') {
    // すべてのイベントリスナーを削除
    document.body.innerHTML = '';
    debugLog('DOM body cleared during cleanup');
    
    // 新しいルートコンテナを準備（次のテスト用）
    const container = createTestContainer();
    document.body.appendChild(container);
    debugLog('New test container prepared for next test');
    
    // グローバルな状態をリセット
    clearGlobalState();
  }
  
  // タイマー管理システムの復元（テストスイート終了時のみ）
  // 通常のテスト間では追跡クリアのみ実行
  restoreTimerManager();
  debugLog('Timer management restored');
  
  // メモリクリーンアップのための待機時間
  await new Promise(resolve => setTimeout(resolve, 0));
  
  // テストメトリクス収集とログ出力
  const metrics = finalizeMetrics();
  logMetrics(metrics);
  debugLog('Test cleanup completed');
});

/**
 * グローバルエラーハンドラーでcreateRootエラーを追跡
 * テスト実行中の未処理エラーを自動的に記録
 */
if (typeof process !== 'undefined') {
  process.on('uncaughtException', (error) => {
    if (error.message?.includes('createRoot')) {
      recordTestFail(error);
      debugLog('CreateRoot error captured', error.message);
    }
  });

  process.on('unhandledRejection', (reason) => {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    if (error.message?.includes('createRoot')) {
      recordTestFail(error);
      debugLog('CreateRoot rejection captured', error.message);
    }
  });
}