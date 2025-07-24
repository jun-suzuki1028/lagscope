import React from 'react';
import { ListStateDisplay } from './StateDisplay';

/**
 * よく使用される状態表示コンポーネントのプリセット
 */
export const StateDisplayPresets = {
  /**
   * キャラクター一覧用
   */
  CharacterList: <T extends { id: string; displayName: string }>({ isLoading, error, characters, onRetry, children }: {
    isLoading: boolean;
    error: Error | null;
    characters: T[] | undefined | null;
    onRetry?: () => void;
    children: (characters: T[]) => React.ReactNode;
  }) => (
    <ListStateDisplay
      isLoading={isLoading}
      error={error}
      items={characters}
      emptyMessage="該当するキャラクターが見つかりませんでした"
      loadingMessage="キャラクターを読み込み中..."
      errorMessage="キャラクターの読み込みに失敗しました"
      onRetry={onRetry}
    >
      {children}
    </ListStateDisplay>
  ),

  /**
   * 技一覧用
   */
  MoveList: <T extends { id: string; displayName: string }>({ isLoading, error, moves, onRetry, children }: {
    isLoading: boolean;
    error: Error | null;
    moves: T[] | undefined | null;
    onRetry?: () => void;
    children: (moves: T[]) => React.ReactNode;
  }) => (
    <ListStateDisplay
      isLoading={isLoading}
      error={error}
      items={moves}
      emptyMessage="キャラクターを選択してください"
      loadingMessage="技データを読み込み中..."
      errorMessage="技データの読み込みに失敗しました"
      onRetry={onRetry}
    >
      {children}
    </ListStateDisplay>
  ),

  /**
   * 計算結果一覧用
   */
  ResultsList: <T extends { id?: string }>({ isLoading, error, results, onRetry, children }: {
    isLoading: boolean;
    error: Error | null;
    results: T[] | undefined | null;
    onRetry?: () => void;
    children: (results: T[]) => React.ReactNode;
  }) => (
    <ListStateDisplay
      isLoading={isLoading}
      error={error}
      items={results}
      emptyMessage="条件に一致する結果がありません"
      loadingMessage="計算結果を生成中..."
      errorMessage="計算処理に失敗しました"
      onRetry={onRetry}
    >
      {children}
    </ListStateDisplay>
  ),
};