import React from 'react';
import { useCalculationStore, calculationSelectors } from '../stores';
import type { CalculationOptions, MoveRange, StalenessLevel } from '../types/frameData';

interface OptionsPanelProps {
  className?: string;
}

const OptionsPanel: React.FC<OptionsPanelProps> = ({ className = '' }) => {
  // 分割されたストアから計算オプションを購諭
  const calculationOptions = useCalculationStore(calculationSelectors.calculationOptions);
  const setCalculationOptions = useCalculationStore(state => state.setCalculationOptions);

  const handleOptionChange = (key: keyof CalculationOptions, value: unknown) => {
    try {
      setCalculationOptions({ [key]: value });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to update calculation options:', error);
    }
  };

  const handleRangeToggle = (range: MoveRange) => {
    const newRanges = calculationOptions.rangeFilter.includes(range)
      ? calculationOptions.rangeFilter.filter((r: MoveRange) => r !== range)
      : [...calculationOptions.rangeFilter, range];
    handleOptionChange('rangeFilter', newRanges);
  };

  const stalenessOptions: { value: StalenessLevel; label: string }[] = [
    { value: 'none', label: 'なし' },
    { value: 'stale1', label: '1回使用' },
    { value: 'stale2', label: '2回使用' },
    { value: 'stale3', label: '3回使用' },
    { value: 'stale4', label: '4回使用' },
    { value: 'stale5', label: '5回使用' },
    { value: 'stale6', label: '6回使用' },
    { value: 'stale7', label: '7回使用' },
    { value: 'stale8', label: '8回使用' },
    { value: 'stale9', label: '9回使用' },
  ];

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h2 className="text-xl font-bold mb-4 text-gray-800">計算オプション</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ワンパターン相殺 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ワンパターン相殺
          </label>
          <select
            value={calculationOptions.staleness}
            onChange={(e) => handleOptionChange('staleness', e.target.value as StalenessLevel)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {stalenessOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* 距離フィルター */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            距離フィルター
          </label>
          <div className="space-y-2">
            {[
              { value: 'close' as MoveRange, label: '短距離' },
              { value: 'mid' as MoveRange, label: '中距離' },
              { value: 'far' as MoveRange, label: '長距離' },
              { value: 'projectile' as MoveRange, label: '飛び道具' },
            ].map(range => (
              <label key={range.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={calculationOptions.rangeFilter.includes(range.value)}
                  onChange={() => handleRangeToggle(range.value)}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">{range.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* ガード行動について */}
        <div className="md:col-span-2">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md text-sm text-gray-700">
            <p className="font-medium text-blue-800 mb-2">ガード行動について</p>
            <p className="mb-2">計算結果には以下の2つのパターンが自動的に含まれます：</p>
            <ul className="text-xs space-y-1 ml-2">
              <li>• <strong>ガードキャンセル</strong>（上スマッシュ、上必殺技、つかみ、ジャンプ）：シールド解除11Fの隙なしで直接実行</li>
              <li>• <strong>ガード解除</strong>（通常の技）：シールド解除11F + 技の発生フレーム</li>
            </ul>
            <p className="text-xs mt-2 text-gray-600">
              計算結果では、どちらのパターンで反撃可能かが表示されます。
            </p>
          </div>
        </div>

        {/* フィルタリング設定 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            フィルタリング設定
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={calculationOptions.onlyGuaranteed}
                onChange={(e) => handleOptionChange('onlyGuaranteed', e.target.checked)}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">確定のみ表示</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={calculationOptions.includeKillMoves}
                onChange={(e) => handleOptionChange('includeKillMoves', e.target.checked)}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">撃墜技を含める</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={calculationOptions.includeDIOptions}
                onChange={(e) => handleOptionChange('includeDIOptions', e.target.checked)}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">DIオプションを含める</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={calculationOptions.includeSDIOptions}
                onChange={(e) => handleOptionChange('includeSDIOptions', e.target.checked)}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">SDIオプションを含める</span>
            </label>
          </div>
        </div>

        {/* 数値フィルター */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            数値フィルター
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="minFrameAdvantage" className="block text-xs text-gray-600 mb-1">
                最小フレーム有利
              </label>
              <input
                id="minFrameAdvantage"
                type="number"
                value={calculationOptions.minimumFrameAdvantage}
                onChange={(e) => handleOptionChange('minimumFrameAdvantage', parseInt(e.target.value) || 0)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
              />
            </div>
            <div>
              <label htmlFor="maxFrameAdvantage" className="block text-xs text-gray-600 mb-1">
                最大フレーム有利
              </label>
              <input
                id="maxFrameAdvantage"
                type="number"
                value={calculationOptions.maximumFrameAdvantage}
                onChange={(e) => handleOptionChange('maximumFrameAdvantage', parseInt(e.target.value) || 999)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
              />
            </div>
            <div>
              <label htmlFor="minDamage" className="block text-xs text-gray-600 mb-1">
                最小ダメージ
              </label>
              <input
                id="minDamage"
                type="number"
                value={calculationOptions.minimumDamage}
                onChange={(e) => handleOptionChange('minimumDamage', parseInt(e.target.value) || 0)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                step="0.1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* リセットボタン */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={() => setCalculationOptions({
            staleness: 'none',
            rangeFilter: ['close', 'mid', 'far'],
            minimumFrameAdvantage: 0,
            maximumFrameAdvantage: 999,
            minimumDamage: 0,
            onlyGuaranteed: false,
            includeKillMoves: true,
            includeDIOptions: false,
            includeSDIOptions: false,
            positionFilter: [],
          })}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          リセット
        </button>
      </div>
    </div>
  );
};

export default OptionsPanel;