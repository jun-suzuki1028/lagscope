import React, { useMemo, useState, memo, useCallback } from 'react';
import type { PunishResult, PunishMove, SortOption, SortDirection } from '../types/frameData';
import ExportModal from './ExportModal';

interface ResultsTableProps {
  results: PunishResult[];
  className?: string;
}

interface SortConfig {
  option: SortOption;
  direction: SortDirection;
}

interface FilterConfig {
  guaranteed: boolean;
  killMoves: boolean;
  moveType: string;
  minDamage: number;
  maxDamage: number;
}

const ResultsTable: React.FC<ResultsTableProps> = memo(({ results, className = '' }) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ option: 'damage', direction: 'desc' });
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({
    guaranteed: false,
    killMoves: false,
    moveType: 'all',
    minDamage: 0,
    maxDamage: 999,
  });
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const flattenedResults = useMemo(() => {
    const flattened: Array<{
      result: PunishResult;
      move: PunishMove;
      key: string;
    }> = [];

    results.forEach(result => {
      result.punishingMoves.forEach(move => {
        flattened.push({
          result,
          move,
          key: `${result.defendingFighter.id}-${move.move.id}-${move.method}`,
        });
      });
    });

    return flattened;
  }, [results]);

  const filteredResults = useMemo(() => {
    return flattenedResults.filter(({ move }) => {
      if (filterConfig.guaranteed && !move.isGuaranteed) return false;
      if (filterConfig.killMoves && !move.move.properties.isKillMove) return false;
      if (filterConfig.moveType !== 'all' && move.move.type !== filterConfig.moveType) return false;
      if (move.damage < filterConfig.minDamage || move.damage > filterConfig.maxDamage) return false;
      return true;
    });
  }, [flattenedResults, filterConfig]);

  const sortedResults = useMemo(() => {
    return [...filteredResults].sort((a, b) => {
      const { option, direction } = sortConfig;
      let aValue: number | string;
      let bValue: number | string;

      switch (option) {
        case 'name':
          aValue = a.move.move.displayName;
          bValue = b.move.move.displayName;
          break;
        case 'damage':
          aValue = a.move.damage;
          bValue = b.move.damage;
          break;
        case 'startup':
          aValue = a.move.move.startup;
          bValue = b.move.move.startup;
          break;
        case 'recovery':
          aValue = a.move.move.recovery;
          bValue = b.move.move.recovery;
          break;
        case 'total':
          aValue = a.move.totalFrames;
          bValue = b.move.totalFrames;
          break;
        case 'killPercent':
          aValue = a.move.killPercent || 999;
          bValue = b.move.killPercent || 999;
          break;
        default:
          aValue = a.move.damage;
          bValue = b.move.damage;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }

      return direction === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
    });
  }, [filteredResults, sortConfig]);

  const handleSort = useCallback((option: SortOption) => {
    setSortConfig(prev => ({
      option,
      direction: prev.option === option && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  const handleFilterChange = useCallback((key: keyof FilterConfig, value: string | boolean | number) => {
    setFilterConfig(prev => ({ ...prev, [key]: value }));
  }, []);

  const getSortIcon = useCallback((option: SortOption) => {
    if (sortConfig.option !== option) return '↕️';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  }, [sortConfig]);

  const formatMethod = useCallback((method: string) => {
    const methodMap: Record<string, string> = {
      normal: '通常',
      out_of_shield: 'ガード解除',
      guard_cancel_jump: 'ガーキャン空中攻撃',
      guard_cancel_grab: 'ガーキャン掴み',
      guard_cancel_up_b: 'ガーキャン上B',
      guard_cancel_up_smash: 'ガーキャン上スマ',
      guard_cancel_nair: 'ガーキャン空N',
      guard_cancel_up_tilt: 'ガーキャン上強',
      perfect_shield: 'ジャストシールド',
      roll_away: '回避(離脱)',
      roll_behind: '回避(後ろ)',
      spot_dodge: 'その場回避',
    };
    return methodMap[method] || method;
  }, []);

  const formatMoveType = useCallback((type: string) => {
    const typeMap: Record<string, string> = {
      normal: '通常技',
      special: '必殺技',
      grab: '掴み',
      throw: '投げ',
    };
    return typeMap[type] || type;
  }, []);

  if (results.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-3 sm:p-6 ${className}`}>
        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-800">計算結果</h2>
        <div className="text-center py-6 sm:py-8 text-gray-500">
          <p>計算結果がありません。</p>
          <p className="text-sm mt-2">攻撃キャラクター、防御キャラクター、技を選択して計算を実行してください。</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-3 sm:p-6 ${className}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4 gap-2">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800">計算結果</h2>
        <button
          onClick={() => setIsExportModalOpen(true)}
          className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          エクスポート
        </button>
      </div>

      {/* フィルター */}
      <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filterConfig.guaranteed}
                onChange={(e) => handleFilterChange('guaranteed', e.target.checked)}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">確定のみ</span>
            </label>
          </div>
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filterConfig.killMoves}
                onChange={(e) => handleFilterChange('killMoves', e.target.checked)}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">撃墜技のみ</span>
            </label>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">技タイプ</label>
            <select
              value={filterConfig.moveType}
              onChange={(e) => handleFilterChange('moveType', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="all">すべて</option>
              <option value="normal">通常技</option>
              <option value="special">必殺技</option>
              <option value="grab">掴み</option>
              <option value="throw">投げ</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">ダメージ範囲</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={filterConfig.minDamage}
                onChange={(e) => handleFilterChange('minDamage', parseInt(e.target.value) || 0)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                min="0"
                placeholder="最小"
              />
              <input
                type="number"
                value={filterConfig.maxDamage}
                onChange={(e) => handleFilterChange('maxDamage', parseInt(e.target.value) || 999)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                min="0"
                placeholder="最大"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 結果数表示 */}
      <div className="mb-4 text-sm text-gray-600">
        {sortedResults.length} 件の結果を表示中
      </div>

      {/* テーブル */}
      <div className="overflow-x-auto hidden md:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                防御キャラクター
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('name')}
              >
                技名 {getSortIcon('name')}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('damage')}
              >
                ダメージ {getSortIcon('damage')}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('startup')}
              >
                発生F {getSortIcon('startup')}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('total')}
              >
                総F {getSortIcon('total')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                反撃方法
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                確定度
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('killPercent')}
              >
                撃墜% {getSortIcon('killPercent')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedResults.map(({ result, move, key }) => (
              <tr key={key} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {result.defendingFighter.displayName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center">
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full mr-2 ${
                      move.move.properties.isKillMove 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {formatMoveType(move.move.type)}
                    </span>
                    {move.move.displayName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {move.damage}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {move.move.startup}F
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {move.totalFrames}F
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {formatMethod(move.method)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center">
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                      move.isGuaranteed 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {move.isGuaranteed ? '確定' : '不確定'}
                    </span>
                    {!move.isGuaranteed && (
                      <span className="ml-2 text-xs text-gray-500">
                        {Math.round(move.probability * 100)}%
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {move.killPercent ? `${move.killPercent}%` : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* モバイル表示 */}
      <div className="block md:hidden">
        <div className="space-y-4">
          {sortedResults.map(({ result, move, key }) => (
            <div key={key} className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium text-gray-900">{result.defendingFighter.displayName}</h3>
                  <p className="text-sm text-gray-600">{move.move.displayName}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">{move.damage}%</div>
                  <div className="text-sm text-gray-600">{move.totalFrames}F</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                  move.move.properties.isKillMove 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {formatMoveType(move.move.type)}
                </span>
                <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  {formatMethod(move.method)}
                </span>
                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                  move.isGuaranteed 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {move.isGuaranteed ? '確定' : `不確定 ${Math.round(move.probability * 100)}%`}
                </span>
                {move.killPercent && (
                  <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                    撃墜 {move.killPercent}%
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500">
                発生: {move.move.startup}F | 総フレーム: {move.totalFrames}F
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* エクスポートモーダル */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        results={results}
      />
    </div>
  );
});

export default ResultsTable;