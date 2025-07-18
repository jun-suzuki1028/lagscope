import { useMemo, useState } from 'react';
import { useAppStore } from '../stores/app-store';
import { Fighter } from '../types/frameData';
import { useDebounce } from '../hooks/useDebounce';
import { CharacterGrid } from './CharacterGrid';
import { CharacterModal } from './CharacterModal';

interface CharacterSelectorProps {
  type: 'attacker' | 'defender';
  multiSelect?: boolean;
  onCharacterSelect?: (fighter: Fighter) => void;
  className?: string;
}

export function CharacterSelector({ 
  type, 
  multiSelect = false, 
  onCharacterSelect,
  className = '' 
}: CharacterSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  const {
    fightersData,
    attackingFighter,
    defendingFighters,
    setAttackingFighter,
    addDefendingFighter,
    removeDefendingFighter,
  } = useAppStore();

  const allFighters = fightersData.data || [];
  
  const filteredFighters = useMemo(() => {
    if (!debouncedSearchTerm) {
      return allFighters;
    }
    
    return allFighters.filter(fighter => 
      fighter.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      fighter.displayName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      fighter.series.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [allFighters, debouncedSearchTerm]);

  const selectedFighterIds = useMemo(() => {
    if (type === 'attacker') {
      return attackingFighter ? [attackingFighter.id] : [];
    }
    return defendingFighters.map(f => f.id);
  }, [type, attackingFighter, defendingFighters]);

  const handleFighterSelect = (fighter: Fighter) => {
    if (type === 'attacker') {
      setAttackingFighter(fighter);
    } else {
      if (multiSelect) {
        const isSelected = selectedFighterIds.includes(fighter.id);
        if (isSelected) {
          removeDefendingFighter(fighter.id);
        } else {
          addDefendingFighter(fighter);
        }
      } else {
        setAttackingFighter(fighter);
      }
    }
    
    onCharacterSelect?.(fighter);
  };

  const clearSelection = () => {
    if (type === 'attacker') {
      setAttackingFighter(null);
    } else {
      defendingFighters.forEach(f => removeDefendingFighter(f.id));
    }
  };

  if (fightersData.loading) {
    return (
      <div className={`${className} flex items-center justify-center py-8`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (fightersData.error) {
    return (
      <div className={`${className} text-red-600 text-center py-8`}>
        エラー: {fightersData.error}
      </div>
    );
  }

  return (
    <div className={`${className} space-y-4`}>
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="キャラクターを検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            role="searchbox"
            aria-label="キャラクター検索"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="検索をクリア"
            >
              ×
            </button>
          )}
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors sm:hidden"
        >
          選択
        </button>
        
        {selectedFighterIds.length > 0 && (
          <button
            onClick={clearSelection}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            選択をクリア
          </button>
        )}
      </div>

      <div className="text-sm text-gray-600">
        {type === 'attacker' ? '攻撃側' : '防御側'}キャラクター
        {multiSelect && ' (複数選択可能)'}
        {selectedFighterIds.length > 0 && ` - ${selectedFighterIds.length}体選択中`}
      </div>

      <div className="hidden sm:block">
        <CharacterGrid
          fighters={filteredFighters}
          selectedFighterIds={selectedFighterIds}
          onFighterSelect={handleFighterSelect}
          multiSelect={multiSelect}
        />
      </div>

      <CharacterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        fighters={filteredFighters}
        selectedFighterIds={selectedFighterIds}
        onFighterSelect={handleFighterSelect}
        multiSelect={multiSelect}
        title={`${type === 'attacker' ? '攻撃側' : '防御側'}キャラクター選択`}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
    </div>
  );
}