
import { useState } from 'react';

export interface ErrorMessageProps {
  title?: string;
  message: string;
  type?: 'error' | 'warning' | 'info';
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
  details?: string; // 詳細なエラー情報
  errorCode?: string; // エラーコード
  retryCount?: number; // 再試行回数
  maxRetries?: number; // 最大再試行回数
}

export function ErrorMessage({ 
  title = 'エラー',
  message, 
  type = 'error',
  onRetry,
  onDismiss,
  className = '',
  details,
  errorCode,
  retryCount = 0,
  maxRetries = 3
}: ErrorMessageProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  const canRetry = onRetry && retryCount < maxRetries;
  
  const getTypeStyles = () => {
    switch (type) {
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200',
          icon: 'text-yellow-500',
          title: 'text-yellow-800',
          message: 'text-yellow-700',
          button: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
        };
      case 'info':
        return {
          container: 'bg-blue-50 border-blue-200',
          icon: 'text-blue-500',
          title: 'text-blue-800',
          message: 'text-blue-700',
          button: 'bg-blue-100 text-blue-800 hover:bg-blue-200'
        };
      default:
        return {
          container: 'bg-red-50 border-red-200',
          icon: 'text-red-500',
          title: 'text-red-800',
          message: 'text-red-700',
          button: 'bg-red-100 text-red-800 hover:bg-red-200'
        };
    }
  };

  const styles = getTypeStyles();

  const getIcon = () => {
    switch (type) {
      case 'warning':
        return (
          <svg className={`w-5 h-5 ${styles.icon}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'info':
        return (
          <svg className={`w-5 h-5 ${styles.icon}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className={`w-5 h-5 ${styles.icon}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div className={`border rounded-md p-4 ${styles.container} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${styles.title}`}>
            {title}
          </h3>
          <div className={`mt-2 text-sm ${styles.message}`}>
            <p>{message}</p>
            {errorCode && (
              <p className="mt-1 font-mono text-xs opacity-80">
                エラーコード: {errorCode}
              </p>
            )}
            {retryCount > 0 && (
              <p className="mt-1 text-xs opacity-80">
                再試行回数: {retryCount}/{maxRetries}
              </p>
            )}
          </div>
          
          {details && (
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                className={`text-xs font-medium underline ${styles.title} hover:no-underline`}
                aria-expanded={showDetails}
                aria-controls="error-details"
              >
                {showDetails ? '詳細を隠す' : '詳細を表示'}
              </button>
              {showDetails && (
                <div
                  id="error-details"
                  className={`mt-2 p-3 bg-gray-50 rounded text-xs font-mono ${styles.message} border-l-4 border-gray-300`}
                >
                  <pre className="whitespace-pre-wrap break-words">{details}</pre>
                </div>
              )}
            </div>
          )}
          
          {(canRetry || onDismiss) && (
            <div className="mt-4 flex space-x-2">
              {canRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${styles.button}`}
                  disabled={retryCount >= maxRetries}
                >
                  再試行 {retryCount > 0 && `(${retryCount}/${maxRetries})`}
                </button>
              )}
              {retryCount >= maxRetries && (
                <span className="text-xs text-gray-500 flex items-center">
                  最大再試行回数に達しました
                </span>
              )}
              {onDismiss && (
                <button
                  type="button"
                  onClick={onDismiss}
                  className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${styles.button}`}
                >
                  閉じる
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

