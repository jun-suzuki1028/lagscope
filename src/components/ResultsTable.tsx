/**
 * @deprecated このファイルは非推奨です。
 * 新しい実装は @/components/results/ResultsTableContainer を使用してください。
 * 
 * 単一責任原則に基づき、以下のコンポーネントに分割されました:
 * - ResultsTableContainer: 統合コンテナ
 * - useResultsData: データ処理ロジック
 * - DesktopResultsTable: デスクトップ表示
 * - MobileResultsList: モバイル表示
 * - ExportControls: エクスポート機能
 */

import { memo } from 'react';
import type { PunishResult } from '../types/frameData';
import { ResultsTableContainer } from './results';

interface ResultsTableProps {
  results: PunishResult[];
  className?: string;
}

/**
 * 後方互換性を保つためのラッパーコンポーネント
 * 新規開発では ResultsTableContainer を直接使用することを推奨
 */
const ResultsTable = memo<ResultsTableProps>(({ results, className }) => {
  return (
    <ResultsTableContainer 
      results={results} 
      className={className}
    />
  );
});

ResultsTable.displayName = 'ResultsTable';

export default ResultsTable;