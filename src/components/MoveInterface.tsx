import { useState } from 'react';
import { Fighter, Move } from '../types/frameData';
import { MoveSelector } from './MoveSelector';
import { MovePreview } from './MovePreview';

interface MoveInterfaceProps {
  selectedFighter: Fighter | null;
  onMoveSelect?: (move: Move) => void;
  className?: string;
}

export function MoveInterface({ selectedFighter, onMoveSelect, className = '' }: MoveInterfaceProps) {
  const [selectedMove, setSelectedMove] = useState<Move | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleMoveSelect = (move: Move) => {
    setSelectedMove(move);
    setShowPreview(true);
    onMoveSelect?.(move);
  };

  return (
    <div className={`${className} space-y-4`}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <MoveSelector
            selectedFighter={selectedFighter}
            onMoveSelect={handleMoveSelect}
          />
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">フレームデータ詳細</h3>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="lg:hidden px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              {showPreview ? '隠す' : '表示'}
            </button>
          </div>
          
          <div className={`${showPreview ? 'block' : 'hidden lg:block'}`}>
            <MovePreview move={selectedMove} />
          </div>
        </div>
      </div>
    </div>
  );
}