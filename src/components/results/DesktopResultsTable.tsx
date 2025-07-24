import { memo } from 'react';
import type { SortOption, SortConfig } from '@/types/frameData';
import type { FlattenedResult } from '@/hooks/useResultsData';
import { cn } from '@/utils/cn';
import { formatMethod, formatMoveType } from '@/utils/formatters';
import { ListStateDisplay } from '../StateDisplay';

interface DesktopResultsTableProps {
  data: FlattenedResult[];
  onSort: (option: SortOption) => void;
  sortConfig: SortConfig;
  getSortIcon: (option: SortOption) => string;
  isLoading?: boolean;
  className?: string;
}

/**
 * デスクトップ環境用のテーブル表示コンポーネント
 * 
 * 責任:
 * - 結果データをテーブル形式で表示
 * - カラムヘッダーのクリックでソート要求を親に送信
 * - 現在のソート状態を視覚的に表示
 */
const DesktopResultsTable = memo<DesktopResultsTableProps>(({ 
  data, 
  onSort, 
  sortConfig, 
  getSortIcon, 
  isLoading = false,
  className = '' 
}) => {
  return (
    <ListStateDisplay
      isLoading={isLoading}
      error={null}
      items={data}
      emptyMessage="条件に一致する結果がありません"
      loadingMessage="計算結果を生成中..."
      className={className}
    >
      {(results) => (
        <div className={cn('overflow-x-auto', className)}>
      <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              キャラクター
            </th>
            <th 
              className={cn(
                'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100',
                sortConfig.option === 'name' && 'bg-blue-50 text-blue-700'
              )}
              onClick={() => onSort('name')}
            >
              技名 {getSortIcon('name')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              タイプ
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              反撃方法
            </th>
            <th 
              className={cn(
                'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100',
                sortConfig.option === 'damage' && 'bg-blue-50 text-blue-700'
              )}
              onClick={() => onSort('damage')}
            >
              ダメージ {getSortIcon('damage')}
            </th>
            <th 
              className={cn(
                'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100',
                sortConfig.option === 'startup' && 'bg-blue-50 text-blue-700'
              )}
              onClick={() => onSort('startup')}
            >
              発生 {getSortIcon('startup')}
            </th>
            <th 
              className={cn(
                'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100',
                sortConfig.option === 'total' && 'bg-blue-50 text-blue-700'
              )}
              onClick={() => onSort('total')}
            >
              全体 {getSortIcon('total')}
            </th>
            <th 
              className={cn(
                'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100',
                sortConfig.option === 'killPercent' && 'bg-blue-50 text-blue-700'
              )}
              onClick={() => onSort('killPercent')}
            >
              撃墜% {getSortIcon('killPercent')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              確定度
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {results.map(({ result, move, key }) => (
            <tr key={key} className="hover:bg-gray-50">
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-8 w-8">
                    {result.defendingFighter.iconUrl && (
                      <img
                        className="h-8 w-8 rounded-full"
                        src={result.defendingFighter.iconUrl}
                        alt={result.defendingFighter.displayName}
                      />
                    )}
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">
                      {result.defendingFighter.displayName}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {move.move.displayName}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatMoveType(move.move.type)}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatMethod(move.method)}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                {move.damage}%
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                {move.move.startup}F
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                {move.totalFrames}F
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                {move.killPercent ? `${move.killPercent}%` : '-'}
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <span className={cn(
                  'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                  move.isGuaranteed
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                )}>
                  {move.isGuaranteed ? '確定' : `${Math.round(move.probability * 100)}%`}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
        </div>
      )}
    </ListStateDisplay>
  );
});

DesktopResultsTable.displayName = 'DesktopResultsTable';

export default DesktopResultsTable;