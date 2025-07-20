import { useMemo } from 'react';
import { useAppStore } from '../stores/app-store';
import { Fighter, Move } from '../types/frameData';

interface MoveSelectorProps {
  selectedFighter: Fighter | null;
  onMoveSelect?: (move: Move) => void;
  className?: string;
}

export function MoveSelector({ selectedFighter, onMoveSelect, className = '' }: MoveSelectorProps) {
  const { selectedMove, setSelectedMove } = useAppStore();

  const availableMoves = useMemo(() => {
    if (!selectedFighter) return [];
    // つかみ攻撃と投げ技を除外
    return selectedFighter.moves.filter(move => 
      move.category !== 'grab' && move.category !== 'throw'
    );
  }, [selectedFighter]);

  const handleMoveSelect = (moveId: string) => {
    const move = availableMoves.find(m => m.id.toString() === moveId);
    if (move) {
      setSelectedMove(move);
      onMoveSelect?.(move);
    }
  };

  if (!selectedFighter) {
    return (
      <div className={`${className} text-center py-8 text-gray-500`}>
        キャラクターを選択してください
      </div>
    );
  }

  return (
    <div className={`${className} space-y-4`}>
      <h3 className="text-lg font-semibold">
        {selectedFighter.displayName}の技選択
      </h3>

      {/* メイン技選択プルダウン */}
      <div className="space-y-2">
        <label htmlFor="move-select" className="block text-sm font-medium text-gray-700">
          技を選択
        </label>
        <select
          id="move-select"
          value={selectedMove?.id.toString() || ''}
          onChange={(e) => handleMoveSelect(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-label="技を選択"
          data-testid="move-select"
        >
          <option value="">技を選択してください</option>
          {availableMoves.map((move) => (
            <option key={move.id} value={move.id.toString()}>
              {move.displayName}
            </option>
          ))}
        </select>
        
        {/* 選択された技の詳細表示 */}
        {selectedMove && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium text-blue-900">{selectedMove.displayName}</span>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-blue-700">
              <span>発生: {selectedMove.startup}F</span>
              <span>全体: {selectedMove.totalFrames}F</span>
              <span>
                ダメージ: {Array.isArray(selectedMove.damage) ? selectedMove.damage.join('-') : selectedMove.damage}%
              </span>
              <span>ガード: {selectedMove.onShield > 0 ? '+' : ''}{selectedMove.onShield}F</span>
              {selectedMove.properties.isKillMove && (
                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                  撃墜技
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
