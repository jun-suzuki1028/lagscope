import { renderHook, act } from '../../test/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useMediaQuery, useBreakpoint, useScreenSize } from '../useMediaQuery';

// matchMediaのモック
const mockMatchMedia = vi.fn();

// Window.matchMediaをモック
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia,
});

describe('useMediaQuery', () => {
  let mockMediaQueryList: any;

  beforeEach(() => {
    mockMediaQueryList = {
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    };
    mockMatchMedia.mockReturnValue(mockMediaQueryList);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('初期状態でメディアクエリの状態を返す', () => {
    mockMediaQueryList.matches = true;
    
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    
    expect(result.current).toBe(true);
    expect(mockMatchMedia).toHaveBeenCalledWith('(min-width: 768px)');
  });

  it.skip('メディアクエリの変更を検出する', () => {
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    
    expect(result.current).toBe(false);
    
    // メディアクエリの変更をシミュレート
    act(() => {
      const changeListener = mockMediaQueryList.addEventListener.mock.calls[0][1];
      changeListener({ matches: true });
    });
    
    expect(result.current).toBe(true);
  });

  it.skip('古いブラウザのフォールバックを使用する', () => {
    mockMediaQueryList.addEventListener = undefined;
    mockMediaQueryList.removeEventListener = undefined;
    
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    
    expect(result.current).toBe(false);
    expect(mockMediaQueryList.addListener).toHaveBeenCalled();
    
    // メディアクエリの変更をシミュレート
    act(() => {
      const changeListener = mockMediaQueryList.addListener.mock.calls[0][0];
      changeListener({ matches: true });
    });
    
    expect(result.current).toBe(true);
  });

  it('コンポーネントのアンマウント時にリスナーを削除する', () => {
    const { unmount } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    
    unmount();
    
    expect(mockMediaQueryList.removeEventListener).toHaveBeenCalled();
  });

  it('古いブラウザのフォールバックでリスナーを削除する', () => {
    mockMediaQueryList.addEventListener = undefined;
    mockMediaQueryList.removeEventListener = undefined;
    
    const { unmount } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    
    unmount();
    
    expect(mockMediaQueryList.removeListener).toHaveBeenCalled();
  });
});

describe('useBreakpoint', () => {
  beforeEach(() => {
    mockMatchMedia.mockImplementation((query) => {
      const mockMediaQueryList = {
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
      };
      
      // 特定のブレークポイントでtrueを返す
      if (query === '(min-width: 768px)') {
        mockMediaQueryList.matches = true;
      }
      
      return mockMediaQueryList;
    });
  });

  it('ブレークポイントの状態を正しく返す', () => {
    const { result } = renderHook(() => useBreakpoint());
    
    expect(result.current.isMd).toBe(true);
    expect(result.current.isSm).toBe(false);
    expect(result.current.isLg).toBe(false);
    expect(result.current.isXl).toBe(false);
    expect(result.current.is2xl).toBe(false);
    expect(result.current.isMobile).toBe(true);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(false);
  });

  it('デスクトップサイズでの状態を正しく返す', () => {
    mockMatchMedia.mockImplementation((query) => {
      const mockMediaQueryList = {
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
      };
      
      // lg以上のブレークポイントでtrueを返す
      if (query === '(min-width: 640px)' || 
          query === '(min-width: 768px)' || 
          query === '(min-width: 1024px)') {
        mockMediaQueryList.matches = true;
      }
      
      return mockMediaQueryList;
    });

    const { result } = renderHook(() => useBreakpoint());
    
    expect(result.current.isSm).toBe(true);
    expect(result.current.isMd).toBe(true);
    expect(result.current.isLg).toBe(true);
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(true);
  });
});

describe('useScreenSize', () => {
  beforeEach(() => {
    // window.innerWidthとinnerHeightをモック
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

  it('初期画面サイズを返す', () => {
    const { result } = renderHook(() => useScreenSize());
    
    expect(result.current.width).toBe(1024);
    expect(result.current.height).toBe(768);
  });

  it('リサイズイベントを検出する', () => {
    const { result } = renderHook(() => useScreenSize());
    
    // 初期値を確認
    expect(result.current.width).toBe(1024);
    expect(result.current.height).toBe(768);
    
    // 画面サイズを変更
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1280,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 800,
      });
      
      // リサイズイベントを発火
      window.dispatchEvent(new Event('resize'));
    });
    
    expect(result.current.width).toBe(1280);
    expect(result.current.height).toBe(800);
  });

  it('コンポーネントのアンマウント時にリスナーを削除する', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    
    const { unmount } = renderHook(() => useScreenSize());
    
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
  });
});