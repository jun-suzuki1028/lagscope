import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  initializeMetrics,
  recordTestPass,
  recordTestFail,
  recordTestSkip,
  finalizeMetrics,
  getCurrentMetrics,
  logMetrics,
  type TestMetrics,
} from '../metrics';

describe('Test Metrics System', () => {
  beforeEach(() => {
    // 各テストで新しいメトリクスでスタート
    initializeMetrics();
  });

  describe('initializeMetrics', () => {
    it('should initialize metrics with default values', () => {
      const metrics = getCurrentMetrics();
      
      expect(metrics.passedTests).toBe(0);
      expect(metrics.failedTests).toBe(0);
      expect(metrics.skippedTests).toBe(0);
      expect(metrics.createRootErrors).toBe(0);
      expect(metrics.executionMode).toBe('sequential');
      expect(metrics.startTime).toBeGreaterThan(0);
    });

    it('should detect parallel execution mode from environment', () => {
      // 環境変数をモック
      const originalEnv = process.env.VITEST_POOL_OPTIONS;
      process.env.VITEST_POOL_OPTIONS = 'true';
      
      initializeMetrics();
      const metrics = getCurrentMetrics();
      
      expect(metrics.executionMode).toBe('parallel');
      
      // 環境変数を復元
      process.env.VITEST_POOL_OPTIONS = originalEnv;
    });

    it('should capture memory usage when available', () => {
      const metrics = getCurrentMetrics();
      
      // Node.js環境ではmemoryUsageが利用可能
      if (typeof process !== 'undefined' && process.memoryUsage) {
        expect(metrics.memoryUsage).toBeDefined();
        expect(metrics.memoryUsage!.heapUsed).toBeGreaterThan(0);
        expect(metrics.memoryUsage!.heapTotal).toBeGreaterThan(0);
      }
    });
  });

  describe('Test Recording Functions', () => {
    it('should record test passes correctly', () => {
      recordTestPass();
      recordTestPass();
      recordTestPass();
      
      const metrics = getCurrentMetrics();
      expect(metrics.passedTests).toBe(3);
      expect(metrics.failedTests).toBe(0);
      expect(metrics.skippedTests).toBe(0);
    });

    it('should record test failures correctly', () => {
      const testError = new Error('Test failed');
      
      recordTestFail(testError);
      recordTestFail();
      
      const metrics = getCurrentMetrics();
      expect(metrics.failedTests).toBe(2);
      expect(metrics.passedTests).toBe(0);
      expect(metrics.createRootErrors).toBe(0);
    });

    it('should track createRoot errors specially', () => {
      const createRootError = new Error('createRoot(...): Target container is not a DOM element');
      const normalError = new Error('Normal test error');
      
      recordTestFail(createRootError);
      recordTestFail(normalError);
      
      const metrics = getCurrentMetrics();
      expect(metrics.failedTests).toBe(2);
      expect(metrics.createRootErrors).toBe(1);
    });

    it('should record test skips correctly', () => {
      recordTestSkip();
      recordTestSkip();
      
      const metrics = getCurrentMetrics();
      expect(metrics.skippedTests).toBe(2);
      expect(metrics.passedTests).toBe(0);
      expect(metrics.failedTests).toBe(0);
    });

    it('should handle mixed test results', () => {
      recordTestPass();
      recordTestPass();
      recordTestFail();
      recordTestSkip();
      
      const metrics = getCurrentMetrics();
      expect(metrics.passedTests).toBe(2);
      expect(metrics.failedTests).toBe(1);
      expect(metrics.skippedTests).toBe(1);
    });
  });

  describe('finalizeMetrics', () => {
    it('should calculate duration and set end time', async () => {
      // 少し時間を経過させる
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const finalMetrics = finalizeMetrics();
      
      expect(finalMetrics.endTime).toBeGreaterThan(finalMetrics.startTime);
      expect(finalMetrics.duration).toBeGreaterThan(0);
      expect(finalMetrics.duration).toBe(finalMetrics.endTime! - finalMetrics.startTime);
    });

    it('should preserve all recorded data', () => {
      recordTestPass();
      recordTestFail();
      recordTestSkip();
      
      const finalMetrics = finalizeMetrics();
      
      expect(finalMetrics.passedTests).toBe(1);
      expect(finalMetrics.failedTests).toBe(1);
      expect(finalMetrics.skippedTests).toBe(1);
    });

    it('should update memory usage if available', () => {
      const finalMetrics = finalizeMetrics();
      
      if (typeof process !== 'undefined' && process.memoryUsage) {
        expect(finalMetrics.memoryUsage).toBeDefined();
        expect(finalMetrics.memoryUsage!.heapUsed).toBeGreaterThan(0);
      }
    });
  });

  describe('getCurrentMetrics', () => {
    it('should return a copy of current metrics', () => {
      recordTestPass();
      
      const metrics1 = getCurrentMetrics();
      const metrics2 = getCurrentMetrics();
      
      // 同じ値を持つが異なるオブジェクト
      expect(metrics1).toEqual(metrics2);
      expect(metrics1).not.toBe(metrics2);
    });

    it('should reflect real-time changes', () => {
      const initialMetrics = getCurrentMetrics();
      expect(initialMetrics.passedTests).toBe(0);
      
      recordTestPass();
      
      const updatedMetrics = getCurrentMetrics();
      expect(updatedMetrics.passedTests).toBe(1);
    });
  });

  describe('logMetrics', () => {
    it('should not log when DEBUG_TESTS is not set', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      // DEBUG_TESTSが設定されていない状態でログ実行
      const originalDebug = process.env.DEBUG_TESTS;
      delete process.env.DEBUG_TESTS;
      
      logMetrics();
      
      expect(consoleSpy).not.toHaveBeenCalled();
      
      // 環境変数を復元
      process.env.DEBUG_TESTS = originalDebug;
      consoleSpy.mockRestore();
    });

    it('should log metrics when DEBUG_TESTS is set', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      // DEBUG_TESTSを設定
      const originalDebug = process.env.DEBUG_TESTS;
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.DEBUG_TESTS = 'true';
      process.env.NODE_ENV = 'test';
      
      recordTestPass();
      recordTestFail();
      const finalMetrics = finalizeMetrics();
      
      logMetrics(finalMetrics);
      
      expect(consoleSpy).toHaveBeenCalledWith('\n=== Test Execution Metrics ===');
      expect(consoleSpy).toHaveBeenCalledWith('Passed: 1');
      expect(consoleSpy).toHaveBeenCalledWith('Failed: 1');
      
      // 環境変数を復元
      process.env.DEBUG_TESTS = originalDebug;
      process.env.NODE_ENV = originalNodeEnv;
      consoleSpy.mockRestore();
    });

    it('should log memory usage when available', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      const originalDebug = process.env.DEBUG_TESTS;
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.DEBUG_TESTS = 'true';
      process.env.NODE_ENV = 'test';
      
      const mockMetrics: TestMetrics = {
        startTime: Date.now(),
        endTime: Date.now() + 100,
        duration: 100,
        passedTests: 5,
        failedTests: 2,
        skippedTests: 1,
        executionMode: 'sequential',
        createRootErrors: 0,
        memoryUsage: {
          heapUsed: 1024 * 1024 * 50, // 50MB
          heapTotal: 1024 * 1024 * 100, // 100MB
          external: 1024 * 1024 * 5, // 5MB
        },
      };
      
      logMetrics(mockMetrics);
      
      expect(consoleSpy).toHaveBeenCalledWith('Memory: 50MB');
      
      process.env.DEBUG_TESTS = originalDebug;
      process.env.NODE_ENV = originalNodeEnv;
      consoleSpy.mockRestore();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined error in recordTestFail', () => {
      expect(() => recordTestFail(undefined)).not.toThrow();
      
      const metrics = getCurrentMetrics();
      expect(metrics.failedTests).toBe(1);
      expect(metrics.createRootErrors).toBe(0);
    });

    it('should handle error without message in recordTestFail', () => {
      const errorWithoutMessage = { name: 'Error' } as Error;
      
      expect(() => recordTestFail(errorWithoutMessage)).not.toThrow();
      
      const metrics = getCurrentMetrics();
      expect(metrics.failedTests).toBe(1);
      expect(metrics.createRootErrors).toBe(0);
    });

    it('should handle multiple finalizeMetrics calls', () => {
      recordTestPass();
      
      const metrics1 = finalizeMetrics();
      const metrics2 = finalizeMetrics();
      
      // 両方とも同じpassedTestsを持つべき
      expect(metrics1.passedTests).toBe(1);
      expect(metrics2.passedTests).toBe(1);
      
      // 2回目の方が時刻が新しいはず
      expect(metrics2.endTime).toBeGreaterThanOrEqual(metrics1.endTime!);
    });
  });

  describe('Performance', () => {
    it('should handle large numbers of test records efficiently', () => {
      const startTime = performance.now();
      
      // 大量のテスト記録
      for (let i = 0; i < 1000; i++) {
        recordTestPass();
        recordTestFail();
        recordTestSkip();
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // 1000回の記録が100ms以内で完了することを期待
      expect(duration).toBeLessThan(100);
      
      const metrics = getCurrentMetrics();
      expect(metrics.passedTests).toBe(1000);
      expect(metrics.failedTests).toBe(1000);
      expect(metrics.skippedTests).toBe(1000);
    });
  });
});