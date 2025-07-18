import { Fighter } from '../types/frameData';

interface CharacterCardProps {
  fighter: Fighter;
  isSelected: boolean;
  onSelect: () => void;
  multiSelect?: boolean;
  className?: string;
}

export function CharacterCard({ 
  fighter, 
  isSelected, 
  onSelect, 
  multiSelect = false,
  className = ''
}: CharacterCardProps) {
  return (
    <div
      onClick={onSelect}
      className={`
        relative cursor-pointer aspect-square rounded-lg border-2 transition-all duration-200 hover:scale-105 ${className}
        ${isSelected 
          ? 'border-blue-500 bg-blue-50 shadow-lg' 
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
        }
      `}
      role="button"
      tabIndex={0}
      aria-label={`${fighter.displayName}を選択`}
      aria-pressed={isSelected}
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
            alt={fighter.displayName}
            className="w-8 h-8 sm:w-10 sm:h-10 object-contain mb-1"
            loading="lazy"
          />
        ) : (
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 rounded-full flex items-center justify-center mb-1">
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
        <div className="absolute top-1 right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs">✓</span>
        </div>
      )}
    </div>
  );
}