import { useState, useEffect } from 'react';
import { Fighter } from '../types/frameData';
import { CharacterGrid } from './CharacterGrid';

interface CharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  fighters: Fighter[];
  selectedFighterIds: string[];
  onFighterSelect: (fighter: Fighter) => void;
  multiSelect?: boolean;
  title?: string;
  searchTerm?: string;
  onSearchChange?: (searchTerm: string) => void;
}

export function CharacterModal({
  isOpen,
  onClose,
  fighters,
  selectedFighterIds,
  onFighterSelect,
  multiSelect = false,
  title = 'キャラクター選択',
  searchTerm = '',
  onSearchChange,
}: CharacterModalProps) {
  const [internalSearchTerm, setInternalSearchTerm] = useState(searchTerm);

  useEffect(() => {
    setInternalSearchTerm(searchTerm);
  }, [searchTerm]);

  const handleSearchChange = (value: string) => {
    setInternalSearchTerm(value);
    onSearchChange?.(value);
  };

  const handleFighterSelect = (fighter: Fighter) => {
    onFighterSelect(fighter);
    if (!multiSelect) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="character-modal-title"
    >
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] mx-4 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
          <h2 id="character-modal-title" className="text-xl font-semibold">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="モーダルを閉じる"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-4 flex-1 flex flex-col min-h-0">
          <div className="relative flex-shrink-0">
            <input
              type="text"
              placeholder="キャラクターを検索..."
              value={internalSearchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              role="searchbox"
              aria-label="キャラクター検索"
              autoFocus
            />
            {internalSearchTerm && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="検索をクリア"
              >
                ×
              </button>
            )}
          </div>

          {multiSelect && selectedFighterIds.length > 0 && (
            <div className="text-sm text-gray-600 flex-shrink-0">
              {selectedFighterIds.length}体のキャラクターが選択されています
            </div>
          )}

          <div className="overflow-y-auto flex-1 min-h-0">
            <CharacterGrid
              fighters={fighters}
              selectedFighterIds={selectedFighterIds}
              onFighterSelect={handleFighterSelect}
              multiSelect={multiSelect}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 p-4 border-t bg-gray-50 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
          >
            キャンセル
          </button>
          {multiSelect && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              選択完了
            </button>
          )}
        </div>
      </div>
    </div>
  );
}