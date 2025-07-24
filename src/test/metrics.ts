/**
 * テスト実行メトリクス収集
 * 並列実行問題の測定と分析のための指標
 */

export interface TestMetrics {
  /** テスト開始時刻 */
  startTime: number;
  /** テスト終了時刻 */
  endTime?: number;
  /** テスト実行時間（ミリ秒） */
  duration?: number;
  /** 成功したテスト数 */
  passedTests: number;
  /** 失敗したテスト数 */
  failedTests: number;
  /** スキップされたテスト数 */
  skippedTests: number;
  /** 実行モード（sequential/parallel） */
  executionMode: 'sequential' | 'parallel';
  /** createRootエラーの発生回数 */
  createRootErrors: number;
  /** メモリ使用量（取得可能な場合） */
  memoryUsage?: {
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
}

/**
 * グローバルテストメトリクス
 */
let currentMetrics: TestMetrics = {
  startTime: Date.now(),
  passedTests: 0,
  failedTests: 0,
  skippedTests: 0,
  executionMode: 'sequential', // vitest設定に基づいて設定
  createRootErrors: 0,
};

/**
 * テストメトリクスを初期化
 */
export const initializeMetrics = (): void => {
  currentMetrics = {
    startTime: Date.now(),
    passedTests: 0,
    failedTests: 0,
    skippedTests: 0,
    executionMode: process.env.VITEST_POOL_OPTIONS ? 'parallel' : 'sequential',
    createRootErrors: 0,
  };
  
  // メモリ使用量を記録（Node.js環境でのみ利用可能）
  if (typeof process !== 'undefined' && process.memoryUsage) {
    currentMetrics.memoryUsage = process.memoryUsage();
  }
};

/**
 * テスト成功を記録
 */
export const recordTestPass = (): void => {
  currentMetrics.passedTests++;
};

/**
 * テスト失敗を記録
 */
export const recordTestFail = (error?: Error): void => {
  currentMetrics.failedTests++;
  
  // createRootエラーを特別に追跡
  if (error?.message?.includes('createRoot')) {
    currentMetrics.createRootErrors++;
  }
};

/**
 * テストスキップを記録
 */
export const recordTestSkip = (): void => {
  currentMetrics.skippedTests++;
};

/**
 * テスト実行完了を記録
 */
export const finalizeMetrics = (): TestMetrics => {
  currentMetrics.endTime = Date.now();
  currentMetrics.duration = currentMetrics.endTime - currentMetrics.startTime;
  
  // 最終メモリ使用量を記録
  if (typeof process !== 'undefined' && process.memoryUsage && currentMetrics.memoryUsage) {
    const finalMemory = process.memoryUsage();
    currentMetrics.memoryUsage = {
      ...currentMetrics.memoryUsage,
      heapUsed: finalMemory.heapUsed,
    };
  }
  
  return { ...currentMetrics };
};

/**
 * 現在のメトリクスを取得
 */
export const getCurrentMetrics = (): TestMetrics => {
  return { ...currentMetrics };
};

/**
 * メトリクスをコンソールに出力（デバッグ用）
 */
export const logMetrics = (metrics: TestMetrics = currentMetrics): void => {
  if (process.env.NODE_ENV === 'test' && process.env.DEBUG_TESTS) {
    // eslint-disable-next-line no-console
    console.log('\n=== Test Execution Metrics ===');
    // eslint-disable-next-line no-console
    console.log(`Duration: ${metrics.duration || 'N/A'}ms`);
    // eslint-disable-next-line no-console
    console.log(`Execution Mode: ${metrics.executionMode}`);
    // eslint-disable-next-line no-console
    console.log(`Passed: ${metrics.passedTests}`);
    // eslint-disable-next-line no-console
    console.log(`Failed: ${metrics.failedTests}`);
    // eslint-disable-next-line no-console
    console.log(`Skipped: ${metrics.skippedTests}`);
    // eslint-disable-next-line no-console
    console.log(`CreateRoot Errors: ${metrics.createRootErrors}`);
    
    if (metrics.memoryUsage) {
      // eslint-disable-next-line no-console
      console.log(`Memory: ${Math.round(metrics.memoryUsage.heapUsed / 1024 / 1024)}MB`);
    }
    // eslint-disable-next-line no-console
    console.log('==============================\n');
  }
};

/**
 * メトリクス収集の自動初期化
 * テスト環境でのみ実行
 */
if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
  initializeMetrics();
}