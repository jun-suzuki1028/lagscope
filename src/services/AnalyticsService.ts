/**
 * プライバシー重視のユーザー分析サービス
 * 個人を特定できる情報は収集せず、使用統計のみを収集
 */

interface AnalyticsEvent {
  event: string;
  category: 'user_action' | 'performance' | 'error' | 'feature_usage';
  data?: Record<string, string | number | boolean>;
  timestamp: number;
  session_id: string;
}

interface PerformanceMetrics {
  load_time: number;
  calculation_time: number;
  render_time: number;
  bundle_size?: number;
}

interface UsageStats {
  characters_selected: Record<string, number>;
  most_used_features: string[];
  calculation_count: number;
  session_duration: number;
  error_count: number;
}

export class AnalyticsService {
  private sessionId: string;
  private events: AnalyticsEvent[] = [];
  private isEnabled: boolean = false;
  private startTime: number = Date.now();

  constructor() {
    this.sessionId = this.generateSessionId();
    this.checkUserConsent();
  }

  /**
   * ユーザー同意の確認
   */
  private checkUserConsent(): void {
    // テスト環境やサーバーサイドでは実行しない
    if (typeof window === 'undefined' || typeof localStorage === 'undefined' || !window.confirm) {
      this.isEnabled = false;
      return;
    }

    const consent = localStorage.getItem('lagscope-analytics-consent');
    this.isEnabled = consent === 'true';
    
    if (consent === null) {
      this.requestConsent();
    }
  }

  /**
   * ユーザーに分析データ収集の同意を求める
   */
  private requestConsent(): void {
    // テスト環境やconfirm関数が利用できない場合はスキップ
    if (typeof window === 'undefined' || typeof localStorage === 'undefined' || !window.confirm) {
      this.isEnabled = false;
      return;
    }

    const message = `
LagScopeの改善のため、匿名の使用統計を収集させていただけますか？

収集する情報：
- 使用されたキャラクターの統計（個人は特定されません）
- アプリのパフォーマンス情報
- エラー発生状況

収集しない情報：
- 個人を特定できる情報
- IPアドレス
- 個人の計算履歴

いつでも設定から無効にできます。
    `;

    if (confirm(message)) {
      localStorage.setItem('lagscope-analytics-consent', 'true');
      this.isEnabled = true;
      this.trackEvent('consent_granted', 'user_action');
    } else {
      localStorage.setItem('lagscope-analytics-consent', 'false');
      this.isEnabled = false;
    }
  }

  /**
   * セッションIDの生成（個人特定不可）
   */
  private generateSessionId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  /**
   * イベントの追跡
   */
  public trackEvent(
    event: string, 
    category: AnalyticsEvent['category'], 
    data?: Record<string, string | number | boolean>
  ): void {
    if (!this.isEnabled) return;

    const analyticsEvent: AnalyticsEvent = {
      event,
      category,
      data: data || {},
      timestamp: Date.now(),
      session_id: this.sessionId,
    };

    this.events.push(analyticsEvent);
    
    // 開発環境でのデバッグ
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log('📊 Analytics Event:', analyticsEvent);
    }

    // イベントが50個溜まったら送信
    if (this.events.length >= 50) {
      this.sendEvents();
    }
  }

  /**
   * パフォーマンス指標の記録
   */
  public trackPerformance(metrics: PerformanceMetrics): void {
    if (!this.isEnabled) return;

    this.trackEvent('performance_metrics', 'performance', {
      load_time: metrics.load_time,
      calculation_time: metrics.calculation_time,
      render_time: metrics.render_time,
      bundle_size: metrics.bundle_size || 0,
    });
  }

  /**
   * キャラクター使用統計の記録
   */
  public trackCharacterUsage(characterId: string, role: 'attacker' | 'defender'): void {
    if (!this.isEnabled) return;

    this.trackEvent('character_selected', 'feature_usage', {
      character_id: characterId,
      role: role,
    });
  }

  /**
   * 計算実行の記録
   */
  public trackCalculation(
    attackerCharacter: string, 
    defenderCharacter: string, 
    moveCount: number,
    calculationTime: number
  ): void {
    if (!this.isEnabled) return;

    this.trackEvent('calculation_performed', 'feature_usage', {
      attacker: attackerCharacter,
      defender: defenderCharacter,
      move_count: moveCount,
      calculation_time: calculationTime,
    });
  }

  /**
   * エラーの記録
   */
  public trackError(error: string, context?: string): void {
    if (!this.isEnabled) return;

    this.trackEvent('error_occurred', 'error', {
      error_type: error,
      context: context || 'unknown',
    });
  }

  /**
   * 機能使用の記録
   */
  public trackFeatureUsage(feature: string, data?: Record<string, string | number | boolean>): void {
    if (!this.isEnabled) return;

    this.trackEvent('feature_used', 'feature_usage', {
      feature_name: feature,
      ...data,
    });
  }

  /**
   * 使用統計の取得
   */
  public getUsageStats(): UsageStats {
    const characters: Record<string, number> = {};
    const features: string[] = [];
    let calculationCount = 0;
    let errorCount = 0;

    this.events.forEach(event => {
      if (event.event === 'character_selected' && event.data?.character_id) {
        const charId = event.data.character_id as string;
        characters[charId] = (characters[charId] || 0) + 1;
      }

      if (event.event === 'calculation_performed') {
        calculationCount++;
      }

      if (event.event === 'feature_used' && event.data?.feature_name) {
        features.push(event.data.feature_name as string);
      }

      if (event.category === 'error') {
        errorCount++;
      }
    });

    return {
      characters_selected: characters,
      most_used_features: [...new Set(features)],
      calculation_count: calculationCount,
      session_duration: Date.now() - this.startTime,
      error_count: errorCount,
    };
  }

  /**
   * イベントの送信（実際の実装では適切なエンドポイントに送信）
   */
  private async sendEvents(): Promise<void> {
    if (!this.isEnabled || this.events.length === 0) return;

    try {
      // 本番環境では適切な分析エンドポイントに送信
      if (import.meta.env.PROD) {
        // 例: Google Analytics, Mixpanel, 自前のサーバーなど
        // await fetch('/api/analytics', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(this.events)
        // });
      }

      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log('📊 Sending analytics events:', this.events.length);
      }

      this.events = []; // 送信後にクリア
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Analytics sending failed:', error);
    }
  }

  /**
   * ページ離脱時のイベント送信
   */
  public flush(): void {
    if (this.events.length > 0) {
      this.sendEvents();
    }
  }

  /**
   * 分析機能の有効/無効切り替え
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    localStorage.setItem('lagscope-analytics-consent', enabled.toString());
    
    if (enabled) {
      this.trackEvent('analytics_enabled', 'user_action');
    } else {
      this.events = []; // 無効化時にイベントをクリア
    }
  }

  /**
   * 現在の有効状態を取得
   */
  public isAnalyticsEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * セッション終了時の統計送信
   */
  public endSession(): void {
    if (!this.isEnabled) return;

    const stats = this.getUsageStats();
    this.trackEvent('session_end', 'user_action', {
      session_duration: stats.session_duration,
      calculation_count: stats.calculation_count,
      error_count: stats.error_count,
      unique_characters: Object.keys(stats.characters_selected).length,
    });

    this.flush();
  }
}

// ダミー実装（テスト環境用）
const createDummyAnalytics = (): AnalyticsService => {
  return {
    trackEvent: () => {},
    trackPerformance: () => {},
    trackCharacterUsage: () => {},
    trackCalculation: () => {},
    trackError: () => {},
    trackFeatureUsage: () => {},
    getUsageStats: () => ({
      characters_selected: {},
      most_used_features: [],
      calculation_count: 0,
      session_duration: 0,
      error_count: 0,
    }),
    flush: () => {},
    setEnabled: () => {},
    isAnalyticsEnabled: () => false,
    endSession: () => {},
    // プライベートプロパティもダミー値で満たす
    sessionId: 'dummy-session',
    events: [],
    isEnabled: false,
    startTime: Date.now(),
    generateSessionId: () => 'dummy-session',
    checkUserConsent: () => {},
    requestConsent: () => {},
    sendEvents: () => Promise.resolve(),
  } as unknown as AnalyticsService;
};

// シングルトンインスタンス（テスト環境では安全なダミー実装を使用）
let analytics: AnalyticsService;

// テスト環境チェック（Vitestやjsdom環境）
const isTestEnvironment = typeof process !== 'undefined' && 
  (process.env.NODE_ENV === 'test' || process.env.VITEST === 'true');

try {
  // テスト環境では常にダミー実装を使用
  if (isTestEnvironment || typeof window === 'undefined' || typeof localStorage === 'undefined') {
    analytics = createDummyAnalytics();
  } else {
    // confirm関数の存在確認
    const hasConfirm = 'confirm' in window && typeof (window as any).confirm === 'function';
    if (!hasConfirm) {
      analytics = createDummyAnalytics();
    } else {
      analytics = new AnalyticsService();
    }
  }
} catch (error) {
  // テスト環境やconfirm未実装環境では安全なダミーを使用
  analytics = createDummyAnalytics();
}

export { analytics };

// ページ離脱時のイベント送信（テスト環境では無効化）
if (typeof window !== 'undefined' && analytics.isAnalyticsEnabled()) {
  window.addEventListener('beforeunload', () => {
    analytics.endSession();
  });

  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      analytics.flush();
    }
  });
}