import { memo } from 'react';
import type { PunishResult } from '@/types/frameData';
import { useResultsData } from '@/hooks/useResultsData';
import { useBreakpoint } from '@/hooks/useMediaQuery';
import DesktopResultsTable from './DesktopResultsTable';
import MobileResultsList from './MobileResultsList';
import ExportControls from './ExportControls';
import { cn } from '@/utils/cn';

interface ResultsTableContainerProps {
  results: PunishResult[];
  isLoading?: boolean;
  className?: string;
}

/**
 * 結果表示の統合コンテナコンポーネント
 * 
 * 責任:
 * - 結果データの処理（ソート・フィルタリング）をuseResultsDataに委譲
 * - デスクトップ/モバイル表示の切り替え
 * - 各子コンポーネントへの適切なデータ・コールバック渡し
 * - フィルター設定UIの統合
 */
const ResultsTableContainer = memo<ResultsTableContainerProps>(({ 
  results, 
  isLoading = false, 
  className = '' 
}) => {
  const { isDesktop } = useBreakpoint();
  const {
    processedData,
    sortConfig,
    filterConfig,
    handleSort,
    handleFilterChange,
    getSortIcon,
    totalCount,
    filteredCount,
  } = useResultsData(results);

  const renderFilterControls = () => (
    <div className="bg-gray-50 p-4 rounded-lg mb-6">
      <h3 className="text-sm font-medium text-gray-700 mb-3">フィルター設定</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* 確定反撃のみ */}
        <div className="flex items-center">
          <input
            id="guaranteed"
            type="checkbox"
            checked={filterConfig.guaranteed}
            onChange={(e) => handleFilterChange('guaranteed', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="guaranteed" className="ml-2 block text-sm text-gray-700">
            確定反撃のみ
          </label>
        </div>

        {/* 撃墜技のみ */}
        <div className="flex items-center">
          <input
            id="killMoves"
            type="checkbox"
            checked={filterConfig.killMoves}
            onChange={(e) => handleFilterChange('killMoves', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="killMoves" className="ml-2 block text-sm text-gray-700">
            撃墜技のみ
          </label>
        </div>

        {/* 技タイプ */}
        <div>
          <label htmlFor="moveType" className="block text-sm font-medium text-gray-700 mb-1">
            技タイプ
          </label>
          <select
            id="moveType"
            value={filterConfig.moveType}
            onChange={(e) => handleFilterChange('moveType', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="all">すべて</option>
            <option value="normal">通常技</option>
            <option value="special">必殺技</option>
            <option value="grab">掴み</option>
            <option value="throw">投げ</option>
          </select>
        </div>

        {/* 最小ダメージ */}
        <div>
          <label htmlFor="minDamage" className="block text-sm font-medium text-gray-700 mb-1">
            最小ダメージ
          </label>
          <input
            id="minDamage"
            type="number"
            min="0"
            max="999"
            value={filterConfig.minDamage}
            onChange={(e) => handleFilterChange('minDamage', parseInt(e.target.value) || 0)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        {/* 最大ダメージ */}
        <div>
          <label htmlFor="maxDamage" className="block text-sm font-medium text-gray-700 mb-1">
            最大ダメージ
          </label>
          <input
            id="maxDamage"
            type="number"
            min="0"
            max="999"
            value={filterConfig.maxDamage}
            onChange={(e) => handleFilterChange('maxDamage', parseInt(e.target.value) || 999)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>
    </div>
  );

  const renderResultsInfo = () => (
    <div className="flex justify-between items-center mb-4">
      <div className="text-sm text-gray-600">
        {filteredCount !== totalCount && (
          <>
            {filteredCount}件を表示（全{totalCount}件中）
          </>
        )}
        {filteredCount === totalCount && (
          <>
            全{totalCount}件を表示
          </>
        )}
      </div>
      <ExportControls dataToExport={processedData} />
    </div>
  );

  return (
    <div className={cn('space-y-6', className)}>
      {/* フィルターコントロール */}
      {renderFilterControls()}

      {/* 結果情報とエクスポート */}
      {renderResultsInfo()}

      {/* 結果表示 */}
      {isDesktop ? (
        <DesktopResultsTable
          data={processedData}
          onSort={handleSort}
          sortConfig={sortConfig}
          getSortIcon={getSortIcon}
          isLoading={isLoading}
        />
      ) : (
        <MobileResultsList
          data={processedData}
          isLoading={isLoading}
        />
      )}

      {/* フッター情報 */}
      {processedData.length > 0 && (
        <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-200">
          ※ フレームデータは Ultimate Frame Data を参考にしています
        </div>
      )}
    </div>
  );
});

ResultsTableContainer.displayName = 'ResultsTableContainer';

export default ResultsTableContainer;