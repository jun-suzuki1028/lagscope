import { memo } from 'react';
import { Fighter } from '../types/frameData';
import { getCharacterIconUrl } from '../utils/characterIconMapping';

interface CharacterCardProps {
  fighter: Fighter;
  isSelected: boolean;
  onSelect: () => void;
  multiSelect?: boolean;
  className?: string;
  tabIndex?: number;
}

export const CharacterCard = memo(function CharacterCard({ 
  fighter, 
  isSelected, 
  onSelect, 
  multiSelect = false,
  className = '',
  tabIndex = 0
}: CharacterCardProps) {
  const iconUrl = getCharacterIconUrl(fighter.id);
  
  return (
    <div
      onClick={onSelect}
      className={`
        relative cursor-pointer aspect-square rounded-lg border-2 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-h-12 min-w-12 sm:min-h-14 sm:min-w-14 ${className}
        ${isSelected 
          ? 'border-blue-500 bg-blue-50 shadow-lg' 
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
        }
      `}
      role="button"
      tabIndex={tabIndex}
      aria-label={`${fighter.displayName}を${multiSelect ? (isSelected ? '選択解除' : '選択') : '選択'}`}
      aria-pressed={isSelected}
      aria-describedby={multiSelect ? `${fighter.id}-status` : undefined}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      <div className="flex items-center justify-center h-full p-1">
        {iconUrl ? (
          <img
            src={iconUrl}
            alt={fighter.displayName}
            className="w-full h-full object-contain"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gray-300 rounded-lg flex items-center justify-center">
            <span className="text-lg font-bold text-gray-600">
              {fighter.displayName.charAt(0)}
            </span>
          </div>
        )}
      </div>
      
      {isSelected && multiSelect && (
        <div className="absolute top-1 right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center" aria-hidden="true">
          <span className="text-white text-xs">✓</span>
        </div>
      )}
      
      {multiSelect && (
        <div id={`${fighter.id}-status`} className="sr-only">
          {isSelected ? '選択済み' : '未選択'}
        </div>
      )}
    </div>
  );
});