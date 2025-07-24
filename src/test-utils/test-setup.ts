import { vi, beforeEach, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

/**
 * テスト共通のセットアップユーティリティ
 * beforeEach/afterEachの重複を削減し、標準化されたテスト環境を提供
 */

/**
 * 共通のbeforeEachセットアップ
 * 各テストファイルで使用される標準的な準備処理
 */
export const commonBeforeEach = () => {
  // LocalStorageのモック
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });

  // SessionStorageのモック
  const sessionStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };
  Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock,
    writable: true,
  });

  // console.error/console.warnを一時的に無効化（テスト時の不要な出力を抑制）
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
};

/**
 * 共通のafterEachクリーンアップ
 * 各テストファイルで使用される標準的な後処理
 */
export const commonAfterEach = () => {
  // DOMのクリーンアップ
  cleanup();
  
  // すべてのモックをリセット
  vi.clearAllMocks();
  
  // タイマーをリセット（vi.useFakeTimers使用時）
  if (vi.isFakeTimers()) {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  }
  
  // console.error/console.warnのモックを復元
  vi.restoreAllMocks();
};

/**
 * モックフック集
 */
export const commonMocks = {
  /**
   * useBreakpointフックのモック
   */
  mockUseBreakpoint: (options: { isDesktop?: boolean; isMobile?: boolean; isTablet?: boolean } = {}) => {
    const {
      isDesktop = true,
      isMobile = false,
      isTablet = false,
    } = options;

    return vi.doMock('../hooks/useMediaQuery', () => ({
      useBreakpoint: () => ({
        isDesktop,
        isMobile,
        isTablet,
      }),
    }));
  },

  /**
   * useMediaQueryフックのモック
   */
  mockUseMediaQuery: (matches: boolean = true) => {
    return vi.doMock('../hooks/useMediaQuery', () => ({
      useMediaQuery: () => matches,
    }));
  },

  /**
   * ReactRouterのuseNavigateフックのモック
   */
  mockUseNavigate: () => {
    const navigate = vi.fn();
    vi.doMock('react-router-dom', () => ({
      useNavigate: () => navigate,
      useLocation: () => ({ pathname: '/', search: '', hash: '', state: null }),
      useParams: () => ({}),
    }));
    return navigate;
  },

  /**
   * fetchのモック
   */
  mockFetch: (mockImplementation?: () => Promise<Response>) => {
    const fetchMock = vi.fn(mockImplementation || (() => 
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
        text: () => Promise.resolve(''),
        headers: new Headers(),
        redirected: false,
        statusText: 'OK',
        type: 'basic' as ResponseType,
        url: '',
        clone: () => ({} as Response),
        body: null,
        bodyUsed: false,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
        blob: () => Promise.resolve(new Blob()),
        formData: () => Promise.resolve(new FormData()),
      } as Response)
    ));
    
    Object.defineProperty(globalThis, 'fetch', {
      value: fetchMock,
      writable: true,
    });
    
    return fetchMock;
  },

  /**
   * IntersectionObserverのモック
   */
  mockIntersectionObserver: () => {
    const mockIntersectionObserver = vi.fn();
    mockIntersectionObserver.mockReturnValue({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    });
    
    Object.defineProperty(window, 'IntersectionObserver', {
      value: mockIntersectionObserver,
      writable: true,
    });
    
    return mockIntersectionObserver;
  },

  /**
   * ResizeObserverのモック
   */
  mockResizeObserver: () => {
    const mockResizeObserver = vi.fn();
    mockResizeObserver.mockReturnValue({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    });
    
    Object.defineProperty(window, 'ResizeObserver', {
      value: mockResizeObserver,
      writable: true,
    });
    
    return mockResizeObserver;
  },
};

/**
 * タイマー関連のテストユーティリティ
 */
export const timerUtils = {
  /**
   * フェイクタイマーのセットアップと自動クリーンアップ
   */
  setupFakeTimers: () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.runOnlyPendingTimers();
      vi.useRealTimers();
    });
  },

  /**
   * 指定時間の経過をシミュレート
   */
  advanceTime: (ms: number) => {
    vi.advanceTimersByTime(ms);
  },

  /**
   * すべての保留中のタイマーを実行
   */
  flushTimers: () => {
    vi.runAllTimers();
  },
};

/**
 * よく使用されるテスト設定の組み合わせ
 */
export const testSetups = {
  /**
   * 基本的なReactコンポーネントテストのセットアップ
   */
  basicReactTest: () => {
    beforeEach(commonBeforeEach);
    afterEach(commonAfterEach);
  },

  /**
   * モバイル環境でのテストセットアップ
   */
  mobileTest: () => {
    beforeEach(() => {
      commonBeforeEach();
      commonMocks.mockUseBreakpoint({ isDesktop: false, isMobile: true });
      
      // モバイルビューポートの設定
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667,
      });
    });
    afterEach(commonAfterEach);
  },

  /**
   * デスクトップ環境でのテストセットアップ
   */
  desktopTest: () => {
    beforeEach(() => {
      commonBeforeEach();
      commonMocks.mockUseBreakpoint({ isDesktop: true, isMobile: false });
      
      // デスクトップビューポートの設定
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 768,
      });
    });
    afterEach(commonAfterEach);
  },

  /**
   * 非同期テストのセットアップ（タイマー含む）
   */
  asyncTest: () => {
    beforeEach(() => {
      commonBeforeEach();
      vi.useFakeTimers();
    });
    afterEach(() => {
      vi.runOnlyPendingTimers();
      vi.useRealTimers();
      commonAfterEach();
    });
  },

  /**
   * API呼び出しを含むテストのセットアップ
   */
  apiTest: () => {
    beforeEach(() => {
      commonBeforeEach();
      commonMocks.mockFetch();
    });
    afterEach(commonAfterEach);
  },
};

/**
 * デバッグ用ユーティリティ
 */
export const debugUtils = {
  /**
   * DOMの現在状態をコンソールに出力
   */
  logDOMState: (title: string = 'DOM State') => {
    if (process.env.NODE_ENV === 'test' && process.env.DEBUG_TESTS) {
      // eslint-disable-next-line no-console
      console.log(`\n=== ${title} ===`);
      // eslint-disable-next-line no-console
      console.log(document.body.innerHTML);
      // eslint-disable-next-line no-console
      console.log('==================\n');
    }
  },

  /**
   * レンダリングされたコンポーネントの構造を表示
   */
  logComponentTree: () => {
    if (process.env.NODE_ENV === 'test' && process.env.DEBUG_TESTS) {
      // eslint-disable-next-line no-console
      console.log(document.body.querySelector('[data-testid]')?.outerHTML);
    }
  },
};

/**
 * CI環境での安定性向上のための設定
 */
export const ciConfig = {
  /**
   * CI環境用のタイムアウト設定
   */
  timeout: process.env.CI ? 10000 : 5000,

  /**
   * CI環境での待機時間調整
   */
  waitForOptions: {
    timeout: process.env.CI ? 5000 : 3000,
    interval: process.env.CI ? 100 : 50,
  },

  /**
   * CI環境でのリトライ回数
   */
  retries: process.env.CI ? 3 : 1,
};