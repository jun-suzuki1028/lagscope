import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  initializeTimerManager,
  clearTrackedTimers,
  restoreTimerManager,
  getTimerStats,
  isTimerTracked,
  logTimerStatus,
} from '../timer-manager';

// Node.js環境でもwindowオブジェクトを模倣
const createMockWindow = () => {
  const mockWindow = {
    setTimeout: global.setTimeout,
    setInterval: global.setInterval,
    clearTimeout: global.clearTimeout,
    clearInterval: global.clearInterval,
  };
  
  // @ts-expect-error - テスト環境でのwindow模倣
  global.window = mockWindow;
  return mockWindow;
};

describe('Timer Manager System', () => {
  const originalWindow = global.window;
  const originalNodeEnv = process.env.NODE_ENV;
  
  beforeEach(() => {
    // テスト環境を設定
    process.env.NODE_ENV = 'test';
    createMockWindow();
    
    // タイマー管理をリセット
    restoreTimerManager();
    initializeTimerManager();
  });

  afterEach(() => {
    // 環境を復元
    restoreTimerManager();
    process.env.NODE_ENV = originalNodeEnv;
    // @ts-expect-error - グローバル変数の復元
    global.window = originalWindow;
  });

  describe('initializeTimerManager', () => {
    it('should initialize timer tracking in test environment', () => {
      const stats = getTimerStats();
      expect(stats.isActive).toBe(true);
      expect(stats.activeTimeouts).toBe(0);
      expect(stats.activeIntervals).toBe(0);
    });

    it('should not initialize outside test environment', () => {
      process.env.NODE_ENV = 'production';
      restoreTimerManager();
      initializeTimerManager();
      
      const stats = getTimerStats();
      expect(stats.isActive).toBe(false);
    });

    it('should not reinitialize when already active', () => {
      // 既に初期化済み
      const firstInit = getTimerStats();
      
      // 再初期化を試行
      initializeTimerManager();
      
      const secondInit = getTimerStats();
      expect(firstInit.isActive).toBe(secondInit.isActive);
    });
  });

  describe('Timer Tracking', () => {
    it('should track setTimeout calls', () => {
      const callback = vi.fn();
      
      const timerId = setTimeout(callback, 100);
      
      const stats = getTimerStats();
      expect(stats.activeTimeouts).toBe(1);
      expect(isTimerTracked(timerId, 'timeout')).toBe(true);
    });

    it('should track setInterval calls', () => {
      const callback = vi.fn();
      
      const timerId = setInterval(callback, 100);
      
      const stats = getTimerStats();
      expect(stats.activeIntervals).toBe(1);
      expect(isTimerTracked(timerId, 'interval')).toBe(true);
    });

    it('should remove timeout from tracking when executed', async () => {
      const callback = vi.fn();
      
      setTimeout(callback, 10);
      
      // タイマー実行前
      expect(getTimerStats().activeTimeouts).toBe(1);
      
      // タイマー実行を待機
      await new Promise(resolve => setTimeout(resolve, 20));
      
      // タイマー実行後は追跡リストから削除される
      expect(getTimerStats().activeTimeouts).toBe(0);
      expect(callback).toHaveBeenCalledOnce();
    });

    it('should track multiple timers correctly', () => {
      const callback = vi.fn();
      
      const timeout1 = setTimeout(callback, 100);
      const timeout2 = setTimeout(callback, 200);
      const interval1 = setInterval(callback, 100);
      const interval2 = setInterval(callback, 200);
      
      const stats = getTimerStats();
      expect(stats.activeTimeouts).toBe(2);
      expect(stats.activeIntervals).toBe(2);
      
      expect(isTimerTracked(timeout1, 'timeout')).toBe(true);
      expect(isTimerTracked(timeout2, 'timeout')).toBe(true);
      expect(isTimerTracked(interval1, 'interval')).toBe(true);
      expect(isTimerTracked(interval2, 'interval')).toBe(true);
    });
  });

  describe('Manual Timer Clearing', () => {
    it('should remove timer from tracking when manually cleared', () => {
      const callback = vi.fn();
      
      const timerId = setTimeout(callback, 100);
      expect(getTimerStats().activeTimeouts).toBe(1);
      
      clearTimeout(timerId);
      
      expect(getTimerStats().activeTimeouts).toBe(0);
      expect(isTimerTracked(timerId, 'timeout')).toBe(false);
    });

    it('should remove interval from tracking when manually cleared', () => {
      const callback = vi.fn();
      
      const timerId = setInterval(callback, 100);
      expect(getTimerStats().activeIntervals).toBe(1);
      
      clearInterval(timerId);
      
      expect(getTimerStats().activeIntervals).toBe(0);
      expect(isTimerTracked(timerId, 'interval')).toBe(false);
    });

    it('should handle clearing undefined timer IDs gracefully', () => {
      expect(() => clearTimeout(undefined)).not.toThrow();
      expect(() => clearInterval(undefined)).not.toThrow();
    });
  });

  describe('clearTrackedTimers', () => {
    it('should clear all tracked timeouts and intervals', () => {
      const callback = vi.fn();
      
      // 複数のタイマーを作成
      setTimeout(callback, 100);
      setTimeout(callback, 200);
      setInterval(callback, 100);
      setInterval(callback, 200);
      
      expect(getTimerStats().activeTimeouts).toBe(2);
      expect(getTimerStats().activeIntervals).toBe(2);
      
      clearTrackedTimers();
      
      expect(getTimerStats().activeTimeouts).toBe(0);
      expect(getTimerStats().activeIntervals).toBe(0);
    });

    it('should not throw when no timers are active', () => {
      expect(() => clearTrackedTimers()).not.toThrow();
      
      const stats = getTimerStats();
      expect(stats.activeTimeouts).toBe(0);
      expect(stats.activeIntervals).toBe(0);
    });

    it('should log debug information when DEBUG_TESTS is enabled', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const originalDebug = process.env.DEBUG_TESTS;
      process.env.DEBUG_TESTS = 'true';
      
      // タイマーを作成
      setTimeout(() => {}, 100);
      setInterval(() => {}, 100);
      
      clearTrackedTimers();
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Timer Manager] Cleared 1 timeouts and 1 intervals')
      );
      
      process.env.DEBUG_TESTS = originalDebug;
      consoleSpy.mockRestore();
    });
  });

  describe('restoreTimerManager', () => {
    it('should restore original timer functions', () => {
      // タイマー管理が初期化されていることを確認
      const stats = getTimerStats();
      expect(stats.isActive).toBe(true);
      
      // 元の関数への参照を保存（初期化後）
      const wrappedSetTimeout = window.setTimeout;
      
      restoreTimerManager();
      
      // 復元後は異なる関数になることを確認
      expect(window.setTimeout).not.toBe(wrappedSetTimeout);
      
      const finalStats = getTimerStats();
      expect(finalStats.isActive).toBe(false);
    });

    it('should clear remaining timers before restoration', () => {
      const callback = vi.fn();
      
      // タイマーを作成
      setTimeout(callback, 100);
      setInterval(callback, 100);
      
      expect(getTimerStats().activeTimeouts).toBe(1);
      expect(getTimerStats().activeIntervals).toBe(1);
      
      restoreTimerManager();
      
      // 復元時に残存タイマーもクリアされる
      const stats = getTimerStats();
      expect(stats.activeTimeouts).toBe(0);
      expect(stats.activeIntervals).toBe(0);
    });
  });

  describe('logTimerStatus', () => {
    it('should not log when DEBUG_TESTS is not set', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const originalDebug = process.env.DEBUG_TESTS;
      delete process.env.DEBUG_TESTS;
      
      setTimeout(() => {}, 100);
      logTimerStatus();
      
      expect(consoleSpy).not.toHaveBeenCalled();
      
      process.env.DEBUG_TESTS = originalDebug;
      consoleSpy.mockRestore();
    });

    it('should log timer status when DEBUG_TESTS is enabled', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const originalDebug = process.env.DEBUG_TESTS;
      process.env.DEBUG_TESTS = 'true';
      
      setTimeout(() => {}, 100);
      setInterval(() => {}, 100);
      
      logTimerStatus();
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Timer Manager] Active timers - Timeouts: 1, Intervals: 1')
      );
      
      process.env.DEBUG_TESTS = originalDebug;
      consoleSpy.mockRestore();
    });

    it('should log timer IDs when timers are active', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const originalDebug = process.env.DEBUG_TESTS;
      process.env.DEBUG_TESTS = 'true';
      
      const timeoutId = setTimeout(() => {}, 100);
      const intervalId = setInterval(() => {}, 100);
      
      logTimerStatus();
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[Timer Manager] Active timeout IDs:',
        expect.arrayContaining([timeoutId])
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        '[Timer Manager] Active interval IDs:',
        expect.arrayContaining([intervalId])
      );
      
      process.env.DEBUG_TESTS = originalDebug;
      consoleSpy.mockRestore();
    });
  });

  describe('Performance', () => {
    it('should handle large numbers of timers efficiently', () => {
      const startTime = performance.now();
      
      // 大量のタイマーを作成
      for (let i = 0; i < 1000; i++) {
        setTimeout(() => {}, 100);
        setInterval(() => {}, 100);
      }
      
      const creationTime = performance.now() - startTime;
      expect(creationTime).toBeLessThan(100); // 100ms以内で作成完了
      
      const stats = getTimerStats();
      expect(stats.activeTimeouts).toBe(1000);
      expect(stats.activeIntervals).toBe(1000);
      
      const clearStartTime = performance.now();
      clearTrackedTimers();
      const clearTime = performance.now() - clearStartTime;
      
      expect(clearTime).toBeLessThan(50); // 50ms以内でクリア完了
      
      const finalStats = getTimerStats();
      expect(finalStats.activeTimeouts).toBe(0);
      expect(finalStats.activeIntervals).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should work when window is undefined', () => {
      // タイマー管理を先に復元
      restoreTimerManager();
      
      // @ts-expect-error - テストでのwindow無効化
      global.window = undefined;
      
      expect(() => initializeTimerManager()).not.toThrow();
      expect(() => clearTrackedTimers()).not.toThrow();
      expect(() => restoreTimerManager()).not.toThrow();
      
      const stats = getTimerStats();
      expect(stats.isActive).toBe(false);
    });

    it('should handle timer callbacks with arguments', async () => {
      const callback = vi.fn();
      
      setTimeout(callback, 10, 'arg1', 'arg2', 123);
      
      await new Promise(resolve => setTimeout(resolve, 20));
      
      expect(callback).toHaveBeenCalledWith('arg1', 'arg2', 123);
    });

    it('should handle timer callbacks that throw errors', async () => {
      const errorCallback = vi.fn(() => {
        throw new Error('Timer callback error');
      });
      
      setTimeout(errorCallback, 10);
      
      // エラーが投げられてもタイマー管理システムは正常動作する
      await new Promise(resolve => setTimeout(resolve, 20));
      
      expect(errorCallback).toHaveBeenCalled();
      expect(getTimerStats().activeTimeouts).toBe(0);
    });
  });
});