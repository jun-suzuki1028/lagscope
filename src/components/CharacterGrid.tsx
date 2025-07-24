import { useId, useRef } from 'react';
import { Fighter } from '../types/frameData';
import { CharacterCard } from './CharacterCard';

interface CharacterGridProps {
  fighters: Fighter[];
  selectedFighterIds: string[];
  onFighterSelect: (fighter: Fighter) => void;
  multiSelect?: boolean;
  className?: string;
}

export function CharacterGrid({ 
  fighters, 
  selectedFighterIds, 
  onFighterSelect,
  multiSelect = false,
  className = ''
}: CharacterGridProps) {
  const gridId = useId();
  const gridRef = useRef<HTMLDivElement>(null);
  
  // キーボードナビゲーション用の状態管理
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!gridRef.current) return;
    
    const cards = gridRef.current.querySelectorAll('[role="button"]') as NodeListOf<HTMLElement>;
    const currentIndex = Array.from(cards).findIndex(card => card === document.activeElement);
    
    if (currentIndex === -1) return;
    
    const columns = Math.floor(gridRef.current.offsetWidth / 80); // 概算列数
    let nextIndex = currentIndex;
    
    switch (e.key) {
      case 'ArrowRight':
        nextIndex = Math.min(currentIndex + 1, cards.length - 1);
        break;
      case 'ArrowLeft':
        nextIndex = Math.max(currentIndex - 1, 0);
        break;
      case 'ArrowDown':
        nextIndex = Math.min(currentIndex + columns, cards.length - 1);
        break;
      case 'ArrowUp':
        nextIndex = Math.max(currentIndex - columns, 0);
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = cards.length - 1;
        break;
      default:
        return;
    }
    
    e.preventDefault();
    cards[nextIndex]?.focus();
  };
  
  if (fighters.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`} role="status" aria-live="polite">
        該当するキャラクターが見つかりませんでした
      </div>
    );
  }

  return (
    <div 
      ref={gridRef}
      id={gridId}
      className={`grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-15 gap-1 sm:gap-2 md:gap-3 ${className}`}
      role="list"
      aria-label="キャラクター選択リスト"
      onKeyDown={handleKeyDown}
    >
      {fighters.map((fighter, index) => (
        <div key={fighter.id} role="listitem">
          <CharacterCard
            fighter={fighter}
            isSelected={selectedFighterIds.includes(fighter.id)}
            onSelect={() => onFighterSelect(fighter)}
            multiSelect={multiSelect}
            tabIndex={index === 0 ? 0 : -1}
          />
        </div>
      ))}
    </div>
  );
}