import { ErrorMessage } from './ErrorMessage';
import { LoadingSpinner } from './LoadingSpinner';

export interface FallbackUIProps {
  type: 'empty' | 'error' | 'loading' | 'no-data';
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function FallbackUI({ 
  type, 
  title, 
  message, 
  onRetry, 
  className = '' 
}: FallbackUIProps) {
  const getContent = () => {
    switch (type) {
      case 'loading':
        return (
          <div className="text-center py-12">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">
              {message || 'データを読み込み中...'}
            </p>
          </div>
        );

      case 'empty':
        return (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 009.586 13H7"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {title || 'データがありません'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {message || '表示するデータがありません。'}
            </p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                再読み込み
              </button>
            )}
          </div>
        );

      case 'no-data':
        return (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {title || '条件に合うデータがありません'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {message || '選択した条件に一致するデータが見つかりません。'}
            </p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                条件をリセット
              </button>
            )}
          </div>
        );

      case 'error':
        return (
          <div className="py-12">
            <ErrorMessage
              title={title}
              message={message || 'データの読み込みに失敗しました。'}
              onRetry={onRetry}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {getContent()}
    </div>
  );
}

// Character selection fallback
export function CharacterSelectionFallback({ 
  error, 
  onRetry 
}: { 
  error?: string; 
  onRetry?: () => void; 
}) {
  return (
    <FallbackUI
      type="error"
      title="キャラクターデータの読み込みエラー"
      message={error || 'キャラクターデータの読み込みに失敗しました。'}
      onRetry={onRetry}
    />
  );
}

// Move data fallback
export function MoveDataFallback({ 
  characterName, 
  onRetry 
}: { 
  characterName?: string; 
  onRetry?: () => void; 
}) {
  return (
    <FallbackUI
      type="no-data"
      title="技データがありません"
      message={characterName ? `${characterName}の技データが見つかりません。` : '技データが見つかりません。'}
      onRetry={onRetry}
    />
  );
}

// Calculation results fallback
export function CalculationResultsFallback({ 
  onRetry 
}: { 
  onRetry?: () => void; 
}) {
  return (
    <FallbackUI
      type="no-data"
      title="計算結果がありません"
      message="キャラクターと技を選択して計算を実行してください。"
      onRetry={onRetry}
    />
  );
}