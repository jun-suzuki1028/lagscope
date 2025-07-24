import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

/**
 * Empty状態表示コンポーネント
 */
export interface EmptyStateProps {
  message: string;
  icon?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

export function EmptyState({ message, icon, className = '', children }: EmptyStateProps) {
  return (
    <div className={`text-center py-8 text-gray-500 ${className}`} role="status" aria-live="polite">
      {icon && <div className="mb-3 flex justify-center">{icon}</div>}
      <p className="text-sm">{message}</p>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}

/**
 * エラー状態表示コンポーネント
 */
export interface ErrorStateProps {
  message: string;
  error?: Error | null;
  onRetry?: () => void;
  className?: string;
  showDetails?: boolean;
}

export function ErrorState({ 
  message, 
  error, 
  onRetry, 
  className = '', 
  showDetails = false 
}: ErrorStateProps) {
  return (
    <div className={`text-center py-8 ${className}`} role="alert" aria-live="assertive">
      <div className="text-red-600 mb-2">
        <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <p className="text-red-700 font-medium mb-2">{message}</p>
      {showDetails && error && (
        <details className="mt-2 text-sm text-gray-600">
          <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
            詳細情報を表示
          </summary>
          <pre className="mt-2 text-left bg-gray-100 p-2 rounded text-xs overflow-x-auto">
            {error.message}
          </pre>
        </details>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          再試行
        </button>
      )}
    </div>
  );
}

/**
 * 統合された状態表示コンポーネント
 * Loading、Error、Empty、Success状態を一元管理
 */
export interface StateDisplayProps<T> {
  isLoading: boolean;
  error: Error | string | null;
  data: T[] | T | undefined | null;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  loadingMessage?: string;
  errorMessage?: string;
  onRetry?: () => void;
  showErrorDetails?: boolean;
  className?: string;
  children: (data: NonNullable<T>) => React.ReactNode;
}

export function StateDisplay<T>({
  isLoading,
  error,
  data,
  emptyMessage = 'データがありません',
  emptyIcon,
  loadingMessage = '読み込み中...',
  errorMessage = 'エラーが発生しました',
  onRetry,
  showErrorDetails = false,
  className = '',
  children
}: StateDisplayProps<T>) {
  // ローディング状態
  if (isLoading) {
    return (
      <div className={`py-8 ${className}`}>
        <LoadingSpinner message={loadingMessage} />
      </div>
    );
  }

  // エラー状態
  if (error) {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    return (
      <ErrorState
        message={errorMessage}
        error={errorObj}
        onRetry={onRetry}
        showDetails={showErrorDetails}
        className={className}
      />
    );
  }

  // Empty状態
  if (!data || (Array.isArray(data) && data.length === 0)) {
    return (
      <EmptyState
        message={emptyMessage}
        icon={emptyIcon}
        className={className}
      />
    );
  }

  // 成功状態 - データを表示
  return <>{children(data as NonNullable<T>)}</>;
}

/**
 * リスト用の状態表示コンポーネント
 * 配列データ専用の簡易版
 */
export interface ListStateDisplayProps<T> {
  isLoading: boolean;
  error: Error | string | null;
  items: T[] | undefined | null;
  emptyMessage?: string;
  loadingMessage?: string;
  errorMessage?: string;
  onRetry?: () => void;
  className?: string;
  children: (items: T[]) => React.ReactNode;
}

export function ListStateDisplay<T>({
  isLoading,
  error,
  items,
  emptyMessage = '項目がありません',
  loadingMessage = '読み込み中...',
  errorMessage = 'エラーが発生しました',
  onRetry,
  className = '',
  children
}: ListStateDisplayProps<T>) {
  return (
    <StateDisplay
      isLoading={isLoading}
      error={error}
      data={items}
      emptyMessage={emptyMessage}
      loadingMessage={loadingMessage}
      errorMessage={errorMessage}
      onRetry={onRetry}
      className={className}
    >
      {(data) => children(Array.isArray(data) ? data : [data])}
    </StateDisplay>
  );
}

/**
 * テーブル用の状態表示コンポーネント
 * テーブル内での使用に最適化
 */
export interface TableStateDisplayProps<T> {
  isLoading: boolean;
  error: Error | string | null;
  rows: T[] | undefined | null;
  columnCount: number;
  emptyMessage?: string;
  loadingMessage?: string;
  errorMessage?: string;
  onRetry?: () => void;
  children: (rows: T[]) => React.ReactNode;
}

export function TableStateDisplay<T>({
  isLoading,
  error,
  rows,
  columnCount,
  emptyMessage = '該当する項目がありません',
  loadingMessage = '読み込み中...',
  errorMessage = 'データの読み込みに失敗しました',
  onRetry,
  children
}: TableStateDisplayProps<T>) {
  if (isLoading) {
    return (
      <tr>
        <td colSpan={columnCount} className="px-6 py-8 text-center">
          <LoadingSpinner message={loadingMessage} />
        </td>
      </tr>
    );
  }

  if (error) {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    return (
      <tr>
        <td colSpan={columnCount} className="px-6 py-8">
          <ErrorState
            message={errorMessage}
            error={errorObj}
            onRetry={onRetry}
          />
        </td>
      </tr>
    );
  }

  if (!rows || rows.length === 0) {
    return (
      <tr>
        <td colSpan={columnCount} className="px-6 py-8 text-center text-gray-500">
          {emptyMessage}
        </td>
      </tr>
    );
  }

  return <>{children(rows)}</>;
}

