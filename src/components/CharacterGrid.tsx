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
  if (fighters.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        該当するキャラクターが見つかりませんでした
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 ${className}`}>
      {fighters.map((fighter) => (
        <CharacterCard
          key={fighter.id}
          fighter={fighter}
          isSelected={selectedFighterIds.includes(fighter.id)}
          onSelect={() => onFighterSelect(fighter)}
          multiSelect={multiSelect}
        />
      ))}
    </div>
  );
}