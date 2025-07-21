import { useMemo, useState, useId, memo, useCallback } from 'react';
import { useAppStore } from '../stores/app-store';
import { Fighter } from '../types/frameData';
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';
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

  const filteredFighters = useMemo(() => {
    const allFighters = fightersData.data || [];
    
    if (!searchTerm) {
      return allFighters;
    }
    
    return allFighters.filter(fighter => 
      fighter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fighter.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fighter.series.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [fightersData.data, searchTerm]);

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
    <section className={`${className} space-y-3`} id={sectionId} aria-labelledby={statusId}>

      <div className="flex items-center justify-between">
        <div id={statusId} className="text-sm text-gray-600" aria-live="polite">
          {type === 'attacker' ? '攻撃側' : '防御側'}キャラクター
          {multiSelect && ' (複数選択可能)'}
          {selectedFighterIds.length > 0 && ` - ${selectedFighterIds.length}体選択中`}
        </div>
        {selectedFighterIds.length > 0 && (
          <button
            onClick={clearSelection}
            className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            aria-label="選択をクリア"
          >
            選択をクリア
          </button>
        )}
      </div>

      <div className="space-y-3">
        {/* 選択ボタン */}
        <button
          onClick={handleModalOpen}
          className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-left"
          aria-label="キャラクター選択モーダルを開く"
        >
          <div className="flex items-center justify-between">
            <div>
              {type === 'attacker' ? (
                attackingFighter ? (
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{attackingFighter.displayName}</span>
                    <span className="text-sm text-gray-500">({attackingFighter.series})</span>
                  </div>
                ) : (
                  <span className="text-gray-500">攻撃側キャラクターを選択</span>
                )
              ) : (
                defendingFighters.length > 0 ? (
                  <div>
                    <span className="font-medium text-gray-900">
                      {defendingFighters.length === 1 
                        ? defendingFighters[0].displayName
                        : `${defendingFighters.length}体のキャラクター`
                      }
                    </span>
                    {defendingFighters.length === 1 && (
                      <span className="text-sm text-gray-500 ml-2">({defendingFighters[0].series})</span>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-500">防御側キャラクターを選択</span>
                )
              )}
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {/* 選択状態表示 */}
        {multiSelect && defendingFighters.length > 1 && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm font-medium text-blue-900 mb-2">選択中のキャラクター:</div>
            <div className="flex flex-wrap gap-2">
              {defendingFighters.map(fighter => (
                <span 
                  key={fighter.id}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs"
                >
                  {fighter.displayName}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeDefendingFighter(fighter.id);
                    }}
                    className="text-blue-600 hover:text-blue-800"
                    aria-label={`${fighter.displayName}を選択から削除`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
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