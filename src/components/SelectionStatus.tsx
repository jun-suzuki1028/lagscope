import { memo } from 'react';
import type { Fighter, Move } from '../types/frameData';

interface SelectionStatusProps {
  attackingFighter: Fighter | null;
  selectedMove: Move | null;
  defendingFighter: Fighter | null;
}

export const SelectionStatus = memo(({ 
  attackingFighter, 
  selectedMove, 
  defendingFighter 
}: SelectionStatusProps) => (
  <section className="bg-white rounded-lg shadow p-3 sm:p-6 transform transition-all duration-300 hover:shadow-lg animate-slideInUp" style={{ animationDelay: '0.5s' }}>
    <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">現在の選択状態</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
      <div>
        <span className="font-medium text-gray-700">攻撃側：</span>
        <span className="ml-2">{attackingFighter?.displayName || '未選択'}</span>
      </div>
      <div>
        <span className="font-medium text-gray-700">技：</span>
        <span className="ml-2">{selectedMove?.displayName || '未選択'}</span>
      </div>
      <div>
        <span className="font-medium text-gray-700">防御側：</span>
        <span className="ml-2">{defendingFighter?.displayName || '未選択'}</span>
      </div>
    </div>
  </section>
));

SelectionStatus.displayName = 'SelectionStatus';