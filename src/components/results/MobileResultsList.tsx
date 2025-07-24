import { memo } from 'react';
import type { FlattenedResult } from '@/hooks/useResultsData';
import { cn } from '@/utils/cn';
import { formatMethod, formatMoveType } from '@/utils/formatters';

interface MobileResultsListProps {
  data: FlattenedResult[];
  isLoading?: boolean;
  className?: string;
}

/**
 * モバイル環境用のカード形式リスト表示コンポーネント
 * 
 * 責任:
 * - 結果データをカード形式で表示
 * - モバイル向けの視認性とタッチ操作を考慮したレイアウト
 */
const MobileResultsList = memo<MobileResultsListProps>(({ 
  data, 
  isLoading = false,
  className = '' 
}) => {

  if (isLoading) {
    return (
      <div className={cn('flex justify-center items-center py-8', className)}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={cn('text-center py-8 text-gray-500', className)}>
        条件に一致する結果がありません
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {data.map(({ result, move, key }) => (
        <div key={key} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          {/* キャラクター情報 */}
          <div className="flex items-center mb-3">
            <div className="flex-shrink-0 h-10 w-10">
              {result.defendingFighter.iconUrl && (
                <img
                  className="h-10 w-10 rounded-full"
                  src={result.defendingFighter.iconUrl}
                  alt={result.defendingFighter.displayName}
                />
              )}
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-900">
                {result.defendingFighter.displayName}
              </div>
              <div className="text-xs text-gray-500">
                {formatMoveType(move.move.type)}
              </div>
            </div>
            <div className="ml-auto">
              <span className={cn(
                'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                move.isGuaranteed
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              )}>
                {move.isGuaranteed ? '確定' : `${Math.round(move.probability * 100)}%`}
              </span>
            </div>
          </div>

          {/* 技情報 */}
          <div className="mb-3">
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              {move.move.displayName}
            </h3>
            <p className="text-sm text-gray-600">
              {formatMethod(move.method)}
            </p>
          </div>

          {/* フレームデータ */}
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-blue-600">
                {move.damage}%
              </div>
              <div className="text-xs text-gray-500">ダメージ</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">
                {move.move.startup}F
              </div>
              <div className="text-xs text-gray-500">発生</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">
                {move.totalFrames}F
              </div>
              <div className="text-xs text-gray-500">全体</div>
            </div>
            <div>
              <div className="text-lg font-bold text-red-600">
                {move.killPercent ? `${move.killPercent}%` : '-'}
              </div>
              <div className="text-xs text-gray-500">撃墜%</div>
            </div>
          </div>

          {/* 追加情報 */}
          {move.notes && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-600">{move.notes}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
});

MobileResultsList.displayName = 'MobileResultsList';

export default MobileResultsList;