/**
 * テスト環境でのタイマー管理システム
 * 効率的なターゲット型クリーンアップを提供
 */

interface TimerManager {
  /** 追跡中のタイマーID */
  activeTimeouts: Set<number>;
  activeIntervals: Set<number>;
  /** 元のタイマー関数への参照 */
  originalSetTimeout: typeof setTimeout;
  originalSetInterval: typeof setInterval;
  originalClearTimeout: typeof clearTimeout;
  originalClearInterval: typeof clearInterval;
  /** タイマー管理が有効かどうか */
  isActive: boolean;
}

/**
 * グローバルタイマーマネージャーインスタンス
 */
let timerManager: TimerManager | null = null;

/**
 * タイマー管理を初期化
 * テスト環境でのみ有効化され、本番環境には影響しない
 */
export const initializeTimerManager = (): void => {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'test') {
    return;
  }

  if (timerManager?.isActive) {
    // 既に初期化済みの場合は何もしない
    return;
  }

  // 元の関数への参照を保存
  const originalSetTimeout = window.setTimeout.bind(window);
  const originalSetInterval = window.setInterval.bind(window);
  const originalClearTimeout = window.clearTimeout.bind(window);
  const originalClearInterval = window.clearInterval.bind(window);

  timerManager = {
    activeTimeouts: new Set<number>(),
    activeIntervals: new Set<number>(),
    originalSetTimeout,
    originalSetInterval,
    originalClearTimeout,
    originalClearInterval,
    isActive: true,
  };

  // setTimeoutをオーバーライドして追跡
  window.setTimeout = ((callback: (...args: unknown[]) => void, delay?: number, ...args: unknown[]) => {
    const id = originalSetTimeout(() => {
      // タイマーが実行されたら追跡リストから削除
      timerManager?.activeTimeouts.delete(id);
      try {
        callback(...args);
      } catch (error) {
        // コールバックエラーをコンソールに出力するが、処理は継続
        if (process.env.DEBUG_TESTS) {
          // eslint-disable-next-line no-console
          console.warn('[Timer Manager] Timer callback error:', error);
        }
        // エラーを再スローしてテストエラーとして処理
        throw error;
      }
    }, delay);
    
    timerManager?.activeTimeouts.add(id);
    return id;
  }) as typeof setTimeout;

  // setIntervalをオーバーライドして追跡
  window.setInterval = ((callback: (...args: unknown[]) => void, delay?: number, ...args: unknown[]) => {
    const id = originalSetInterval(() => {
      try {
        callback(...args);
      } catch (error) {
        // コールバックエラーをコンソールに出力するが、処理は継続
        if (process.env.DEBUG_TESTS) {
          // eslint-disable-next-line no-console
          console.warn('[Timer Manager] Interval callback error:', error);
        }
        // intervalの場合はエラーが発生しても継続実行
      }
    }, delay);
    
    timerManager?.activeIntervals.add(id);
    return id;
  }) as typeof setInterval;

  // clearTimeoutをオーバーライドして追跡リストからも削除
  window.clearTimeout = ((id?: number) => {
    if (id !== undefined) {
      timerManager?.activeTimeouts.delete(id);
      originalClearTimeout(id);
    }
  }) as typeof clearTimeout;

  // clearIntervalをオーバーライドして追跡リストからも削除
  window.clearInterval = ((id?: number) => {
    if (id !== undefined) {
      timerManager?.activeIntervals.delete(id);
      originalClearInterval(id);
    }
  }) as typeof clearInterval;
};

/**
 * 追跡中の全タイマーをクリア
 * 効率的なターゲット型クリーンアップ
 */
export const clearTrackedTimers = (): void => {
  if (!timerManager?.isActive) {
    return;
  }

  let clearedTimeouts = 0;
  let clearedIntervals = 0;

  // 追跡中のtimeoutをクリア
  timerManager.activeTimeouts.forEach(id => {
    timerManager?.originalClearTimeout(id);
    clearedTimeouts++;
  });
  timerManager.activeTimeouts.clear();

  // 追跡中のintervalをクリア
  timerManager.activeIntervals.forEach(id => {
    timerManager?.originalClearInterval(id);
    clearedIntervals++;
  });
  timerManager.activeIntervals.clear();

  // デバッグログ出力
  if (process.env.DEBUG_TESTS && (clearedTimeouts > 0 || clearedIntervals > 0)) {
    // eslint-disable-next-line no-console
    console.log(`[Timer Manager] Cleared ${clearedTimeouts} timeouts and ${clearedIntervals} intervals`);
  }
};

/**
 * タイマー管理システムを復元
 * 元のタイマー関数に戻す
 */
export const restoreTimerManager = (): void => {
  if (!timerManager?.isActive || typeof window === 'undefined') {
    return;
  }

  // まず残存タイマーをクリア
  clearTrackedTimers();

  // 元の関数を復元
  window.setTimeout = timerManager.originalSetTimeout;
  window.setInterval = timerManager.originalSetInterval;
  window.clearTimeout = timerManager.originalClearTimeout;
  window.clearInterval = timerManager.originalClearInterval;

  // マネージャーを無効化
  timerManager.isActive = false;
  timerManager = null;

  if (process.env.DEBUG_TESTS) {
    // eslint-disable-next-line no-console
    console.log('[Timer Manager] Timer management restored to original functions');
  }
};

/**
 * タイマー管理の統計情報を取得
 */
export const getTimerStats = (): { activeTimeouts: number; activeIntervals: number; isActive: boolean } => {
  if (!timerManager) {
    return { activeTimeouts: 0, activeIntervals: 0, isActive: false };
  }

  return {
    activeTimeouts: timerManager.activeTimeouts.size,
    activeIntervals: timerManager.activeIntervals.size,
    isActive: timerManager.isActive,
  };
};

/**
 * 特定のタイマーIDが追跡されているかチェック
 */
export const isTimerTracked = (id: number, type: 'timeout' | 'interval'): boolean => {
  if (!timerManager?.isActive) {
    return false;
  }

  if (type === 'timeout') {
    return timerManager.activeTimeouts.has(id);
  } else {
    return timerManager.activeIntervals.has(id);
  }
};

/**
 * デバッグ用：現在追跡中のタイマー一覧を表示
 */
export const logTimerStatus = (): void => {
  if (!process.env.DEBUG_TESTS || !timerManager?.isActive) {
    return;
  }

  const stats = getTimerStats();
  // eslint-disable-next-line no-console
  console.log(`[Timer Manager] Active timers - Timeouts: ${stats.activeTimeouts}, Intervals: ${stats.activeIntervals}`);
  
  if (stats.activeTimeouts > 0) {
    // eslint-disable-next-line no-console
    console.log('[Timer Manager] Active timeout IDs:', Array.from(timerManager.activeTimeouts));
  }
  
  if (stats.activeIntervals > 0) {
    // eslint-disable-next-line no-console
    console.log('[Timer Manager] Active interval IDs:', Array.from(timerManager.activeIntervals));
  }
};