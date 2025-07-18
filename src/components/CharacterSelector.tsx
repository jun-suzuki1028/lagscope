import { useMemo, useState, useId, memo, useCallback } from 'react';
import { useAppStore } from '../stores/app-store';
import { Fighter } from '../types/frameData';
import { useDebounce } from '../hooks/useDebounce';
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';
import { CharacterGrid } from './CharacterGrid';
import { CharacterModal } from './CharacterModal';
import { SkeletonScreen } from './SkeletonScreen';
import { CharacterSelectionFallback } from './FallbackUI';

interface CharacterSelectorProps {
  type: 'attacker' | 'defender';
  multiSelect?: boolean;
  onCharacterSelect?: (fighter: Fighter) => void;
  className?: string;
}

export const CharacterSelector = memo(function CharacterSelector({ 
  type, 
  multiSelect = false, 
  onCharacterSelect,
  className = '' 
}: CharacterSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const searchId = useId();
  const sectionId = useId();
  const statusId = useId();
  
  const { startMeasure } = usePerformanceMonitor('CharacterSelector');
  // 使用しない場合は削除
  void startMeasure;
  
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

  const handleFighterSelect = useCallback((fighter: Fighter) => {
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
  }, [type, multiSelect, selectedFighterIds, setAttackingFighter, addDefendingFighter, removeDefendingFighter, onCharacterSelect]);

  const clearSelection = useCallback(() => {
    if (type === 'attacker') {
      setAttackingFighter(null);
    } else {
      defendingFighters.forEach(f => removeDefendingFighter(f.id));
    }
  }, [type, setAttackingFighter, defendingFighters, removeDefendingFighter]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleSearchClear = useCallback(() => {
    setSearchTerm('');
  }, []);

  const handleModalOpen = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  if (fightersData.loading) {
    return (
      <div className={`${className} space-y-4`} role="status" aria-live="polite">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <div className="w-full h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
          <div className="w-16 h-10 bg-gray-200 rounded-lg animate-pulse sm:hidden"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
        <SkeletonScreen variant="grid" rows={24} />
        <span className="sr-only">キャラクターデータを読み込み中...</span>
      </div>
    );
  }

  if (fightersData.error) {
    return (
      <div className={className}>
        <CharacterSelectionFallback 
          error={fightersData.error} 
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <section className={`${className} space-y-4`} id={sectionId} aria-labelledby={statusId}>
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <label htmlFor={searchId} className="sr-only">
            キャラクター検索
          </label>
          <input
            id={searchId}
            type="text"
            placeholder="キャラクターを検索..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none"
            role="searchbox"
            aria-label="キャラクター検索"
            aria-describedby={statusId}
            aria-autocomplete="list"
          />
          {searchTerm && (
            <button
              onClick={handleSearchClear}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
              aria-label="検索をクリア"
              tabIndex={0}
            >
              ×
            </button>
          )}
        </div>
        
        <button
          onClick={handleModalOpen}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:hidden"
          aria-label="キャラクター選択モーダルを開く"
        >
          選択
        </button>
        
        {selectedFighterIds.length > 0 && (
          <button
            onClick={clearSelection}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            aria-label="選択をクリア"
          >
            選択をクリア
          </button>
        )}
      </div>

      <div id={statusId} className="text-sm text-gray-600" aria-live="polite">
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
        onClose={handleModalClose}
        fighters={filteredFighters}
        selectedFighterIds={selectedFighterIds}
        onFighterSelect={handleFighterSelect}
        multiSelect={multiSelect}
        title={`${type === 'attacker' ? '攻撃側' : '防御側'}キャラクター選択`}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
    </section>
  );
});