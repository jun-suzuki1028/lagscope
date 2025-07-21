import { memo } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import type { PunishResult } from '../types/frameData';

interface CalculationStatusProps {
  isCalculating: boolean;
  hasCompleteSelection: boolean;
  calculationResults: PunishResult[];
  calculationError: string | null;
}

export const CalculationStatus = memo(({ 
  isCalculating, 
  hasCompleteSelection, 
  calculationResults, 
  calculationError 
}: CalculationStatusProps) => (
  <section className="bg-white rounded-lg shadow p-3 sm:p-6 transform transition-all duration-300 hover:shadow-lg animate-slideInUp" style={{ animationDelay: '0.3s' }}>
    <div className="flex flex-col items-center space-y-4">
      {isCalculating && (
        <div className="flex items-center space-x-2 text-blue-600">
          <LoadingSpinner size="sm" />
          <span className="text-sm font-medium">計算中...</span>
        </div>
      )}
      
      {!hasCompleteSelection && !isCalculating && (
        <p className="text-sm text-gray-500 text-center">
          攻撃側キャラクター、技、防御側キャラクターを選択すると自動で計算されます
        </p>
      )}
      
      {hasCompleteSelection && !isCalculating && calculationResults.length === 0 && !calculationError && (
        <div className="text-center">
          <div className="text-2xl mb-2">🤔</div>
          <p className="text-sm text-gray-600">
            条件に該当する確定反撃技が見つかりませんでした
          </p>
          <p className="text-xs text-gray-500 mt-1">
            オプション設定を調整してみてください
          </p>
        </div>
      )}
      
      {calculationError && (
        <p className="text-sm text-red-600 text-center">
          {calculationError}
        </p>
      )}
    </div>
  </section>
));

CalculationStatus.displayName = 'CalculationStatus';