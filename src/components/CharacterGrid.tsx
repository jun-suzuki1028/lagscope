import { useId } from 'react';
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
  
  if (fighters.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`} role="status" aria-live="polite">
        該当するキャラクターが見つかりませんでした
      </div>
    );
  }

  return (
    <div 
      id={gridId}
      className={`grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-15 gap-1 sm:gap-2 md:gap-3 ${className}`}
      role="list"
      aria-label="キャラクター選択リスト"
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