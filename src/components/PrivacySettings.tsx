import { useState, useEffect } from 'react';
import { analytics } from '../services/AnalyticsService';

export function PrivacySettings() {
  const [isAnalyticsEnabled, setIsAnalyticsEnabled] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    setIsAnalyticsEnabled(analytics.isAnalyticsEnabled());
  }, []);

  const handleToggleAnalytics = () => {
    const newState = !isAnalyticsEnabled;
    analytics.setEnabled(newState);
    setIsAnalyticsEnabled(newState);
    
    if (newState) {
      analytics.trackFeatureUsage('analytics_enabled_from_settings');
    }
  };

  const usageStats = analytics.getUsageStats();

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">プライバシー設定</h3>
      </div>

      <div className="space-y-4">
        {/* 分析データ収集の設定 */}
        <div className="flex items-start space-x-3">
          <div className="flex items-center h-5">
            <input
              id="analytics-consent"
              type="checkbox"
              checked={isAnalyticsEnabled}
              onChange={handleToggleAnalytics}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>
          <div className="text-sm">
            <label htmlFor="analytics-consent" className="font-medium text-gray-700">
              匿名使用統計の収集を許可する
            </label>
            <p className="text-gray-500 mt-1">
              アプリの改善のため、匿名の使用統計を収集します。個人を特定できる情報は収集されません。
            </p>
          </div>
        </div>

        {/* 詳細表示トグル */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          {showDetails ? '詳細を非表示' : '収集データの詳細を表示'}
        </button>

        {/* 詳細情報 */}
        {showDetails && (
          <div className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50">
            <h4 className="font-medium text-gray-900">収集する情報</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 使用されたキャラクターの統計（個人は特定されません）</li>
              <li>• アプリのパフォーマンス情報（読み込み時間、計算時間など）</li>
              <li>• エラー発生状況</li>
              <li>• 機能の使用頻度</li>
            </ul>

            <h4 className="font-medium text-gray-900 mt-4">収集しない情報</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 個人を特定できる情報</li>
              <li>• IPアドレス</li>
              <li>• 個人の計算履歴</li>
              <li>• ブラウザの詳細情報</li>
            </ul>

            {isAnalyticsEnabled && (
              <div className="mt-4 pt-3 border-t border-gray-300">
                <h4 className="font-medium text-gray-900">現在のセッション統計</h4>
                <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                  <div>
                    <span className="text-gray-600">計算回数:</span>
                    <span className="ml-2 font-medium">{usageStats.calculation_count}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">エラー数:</span>
                    <span className="ml-2 font-medium">{usageStats.error_count}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">セッション時間:</span>
                    <span className="ml-2 font-medium">
                      {Math.round(usageStats.session_duration / 1000)}秒
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">使用キャラクター数:</span>
                    <span className="ml-2 font-medium">
                      {Object.keys(usageStats.characters_selected).length}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* データの取り扱いについて */}
        <div className="text-xs text-gray-500 bg-blue-50 border border-blue-200 rounded p-3">
          <p className="font-medium text-blue-800 mb-1">データの取り扱いについて</p>
          <p>
            収集されたデータは、アプリの機能改善とバグ修正のためにのみ使用されます。
            第三者への販売や共有は行いません。いつでもこの設定から無効にできます。
          </p>
        </div>
      </div>
    </div>
  );
}