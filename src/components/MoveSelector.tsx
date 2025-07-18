import { useMemo, useState } from 'react';
import { useAppStore } from '../stores/app-store';
import { Fighter, Move, MoveCategory, MoveType, MoveRange } from '../types/frameData';
import { useDebounce } from '../hooks/useDebounce';

interface MoveSelectorProps {
  selectedFighter: Fighter | null;
  onMoveSelect?: (move: Move) => void;
  className?: string;
}

interface MoveFilters {
  category: MoveCategory | 'all';
  type: MoveType | 'all';
  range: MoveRange | 'all';
  searchTerm: string;
}

const MOVE_CATEGORIES: Array<{ value: MoveCategory | 'all'; label: string }> = [
  { value: 'all', label: 'すべて' },
  { value: 'jab', label: 'ジャブ' },
  { value: 'tilt', label: 'ティルト' },
  { value: 'smash', label: 'スマッシュ' },
  { value: 'aerial', label: '空中攻撃' },
  { value: 'special', label: '必殺技' },
  { value: 'grab', label: 'つかみ' },
  { value: 'throw', label: '投げ' },
];

const MOVE_TYPES: Array<{ value: MoveType | 'all'; label: string }> = [
  { value: 'all', label: 'すべて' },
  { value: 'normal', label: '通常技' },
  { value: 'special', label: '必殺技' },
  { value: 'grab', label: 'つかみ' },
  { value: 'throw', label: '投げ' },
];

const MOVE_RANGES: Array<{ value: MoveRange | 'all'; label: string }> = [
  { value: 'all', label: 'すべて' },
  { value: 'close', label: '近距離' },
  { value: 'mid', label: '中距離' },
  { value: 'far', label: '遠距離' },
  { value: 'projectile', label: '飛び道具' },
];

export function MoveSelector({ selectedFighter, onMoveSelect, className = '' }: MoveSelectorProps) {
  const { selectedMove, setSelectedMove } = useAppStore();
  
  const [filters, setFilters] = useState<MoveFilters>({
    category: 'all',
    type: 'all',
    range: 'all',
    searchTerm: '',
  });

  const debouncedSearchTerm = useDebounce(filters.searchTerm, 300);

  const availableMoves = useMemo(() => {
    if (!selectedFighter) return [];
    return selectedFighter.moves;
  }, [selectedFighter]);

  const filteredMoves = useMemo(() => {
    if (!availableMoves.length) return [];

    return availableMoves.filter((move) => {
      // カテゴリフィルタ
      if (filters.category !== 'all' && move.category !== filters.category) {
        return false;
      }

      // タイプフィルタ
      if (filters.type !== 'all' && move.type !== filters.type) {
        return false;
      }

      // レンジフィルタ
      if (filters.range !== 'all' && move.range !== filters.range) {
        return false;
      }

      // 検索フィルタ
      if (debouncedSearchTerm) {
        const searchLower = debouncedSearchTerm.toLowerCase();
        return (
          move.name.toLowerCase().includes(searchLower) ||
          move.displayName.toLowerCase().includes(searchLower) ||
          move.input.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  }, [availableMoves, filters.category, filters.type, filters.range, debouncedSearchTerm]);

  const handleMoveSelect = (move: Move) => {
    setSelectedMove(move);
    onMoveSelect?.(move);
  };

  const handleFilterChange = (filterType: keyof MoveFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: 'all',
      type: 'all',
      range: 'all',
      searchTerm: '',
    });
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
      <div className="flex flex-col space-y-3">
        <h3 className="text-lg font-semibold">
          {selectedFighter.displayName}の技選択
        </h3>
        
        <div className="flex flex-wrap gap-2">
          <div className="flex-1 min-w-48">
            <input
              type="text"
              placeholder="技を検索..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              role="searchbox"
              aria-label="技検索"
            />
          </div>
          
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            aria-label="カテゴリでフィルタ"
          >
            {MOVE_CATEGORIES.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
          
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            aria-label="タイプでフィルタ"
          >
            {MOVE_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          
          <select
            value={filters.range}
            onChange={(e) => handleFilterChange('range', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            aria-label="レンジでフィルタ"
          >
            {MOVE_RANGES.map(range => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
          
          <button
            onClick={clearFilters}
            className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
            aria-label="フィルタをクリア"
          >
            クリア
          </button>
        </div>
        
        <div className="text-sm text-gray-600">
          {filteredMoves.length}個の技が見つかりました
          {selectedMove && ` - 選択中: ${selectedMove.displayName}`}
        </div>
      </div>

      <MoveList
        moves={filteredMoves}
        selectedMove={selectedMove}
        onMoveSelect={handleMoveSelect}
      />
    </div>
  );
}

interface MoveListProps {
  moves: Move[];
  selectedMove: Move | null;
  onMoveSelect: (move: Move) => void;
}

function MoveList({ moves, selectedMove, onMoveSelect }: MoveListProps) {
  if (moves.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        条件に該当する技が見つかりませんでした
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {moves.map((move) => (
        <MoveCard
          key={move.id}
          move={move}
          isSelected={selectedMove?.id === move.id}
          onSelect={() => onMoveSelect(move)}
        />
      ))}
    </div>
  );
}

interface MoveCardProps {
  move: Move;
  isSelected: boolean;
  onSelect: () => void;
}

function MoveCard({ move, isSelected, onSelect }: MoveCardProps) {
  return (
    <div
      onClick={onSelect}
      className={`
        p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md
        ${isSelected 
          ? 'border-blue-500 bg-blue-50 shadow-lg' 
          : 'border-gray-200 bg-white hover:border-gray-300'
        }
      `}
      role="button"
      tabIndex={0}
      aria-label={`${move.displayName}を選択`}
      aria-pressed={isSelected}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium">{move.displayName}</span>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
              {move.input}
            </span>
            <MoveCategoryBadge category={move.category} />
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>発生: {move.startup}F</span>
            <span>全体: {move.totalFrames}F</span>
            <span>
              ダメージ: {Array.isArray(move.damage) ? move.damage.join('-') : move.damage}%
            </span>
            <span>ガード: {move.onShield > 0 ? '+' : ''}{move.onShield}F</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <MoveRangeBadge range={move.range} />
          {move.properties.isKillMove && (
            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
              撃墜技
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

interface MoveCategoryBadgeProps {
  category: MoveCategory;
}

function MoveCategoryBadge({ category }: MoveCategoryBadgeProps) {
  const categoryConfig = {
    jab: { label: 'ジャブ', color: 'bg-blue-100 text-blue-800' },
    tilt: { label: 'ティルト', color: 'bg-green-100 text-green-800' },
    smash: { label: 'スマッシュ', color: 'bg-red-100 text-red-800' },
    aerial: { label: '空中攻撃', color: 'bg-purple-100 text-purple-800' },
    special: { label: '必殺技', color: 'bg-yellow-100 text-yellow-800' },
    grab: { label: 'つかみ', color: 'bg-orange-100 text-orange-800' },
    throw: { label: '投げ', color: 'bg-pink-100 text-pink-800' },
    dodge: { label: '回避', color: 'bg-gray-100 text-gray-800' },
    movement: { label: '移動', color: 'bg-indigo-100 text-indigo-800' },
  };

  const config = categoryConfig[category];
  
  return (
    <span className={`text-xs px-2 py-1 rounded ${config.color}`}>
      {config.label}
    </span>
  );
}

interface MoveRangeBadgeProps {
  range: MoveRange;
}

function MoveRangeBadge({ range }: MoveRangeBadgeProps) {
  const rangeConfig = {
    close: { label: '近', color: 'bg-red-100 text-red-700' },
    mid: { label: '中', color: 'bg-yellow-100 text-yellow-700' },
    far: { label: '遠', color: 'bg-blue-100 text-blue-700' },
    projectile: { label: '飛', color: 'bg-green-100 text-green-700' },
  };

  const config = rangeConfig[range];
  
  return (
    <span className={`text-xs px-2 py-1 rounded font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}