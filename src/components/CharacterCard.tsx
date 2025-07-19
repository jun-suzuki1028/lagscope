import { memo } from 'react';
import { Fighter } from '../types/frameData';

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
  return (
    <div
      onClick={onSelect}
      className={`
        relative cursor-pointer aspect-square rounded-lg border-2 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${className}
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
      <div className="flex flex-col items-center justify-center h-full p-2">
        {fighter.iconUrl ? (
          <img
            src={fighter.iconUrl}
            alt=""
            className="w-8 h-8 sm:w-10 sm:h-10 object-contain mb-1"
            loading="lazy"
            aria-hidden="true"
          />
        ) : (
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 rounded-full flex items-center justify-center mb-1" aria-hidden="true">
            <span className="text-xs font-bold text-gray-600">
              {fighter.displayName.charAt(0)}
            </span>
          </div>
        )}
        
        <span className="text-xs text-center font-medium leading-tight">
          {fighter.displayName}
        </span>
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