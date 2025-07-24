import { useState } from 'react';
import { cn } from '@/utils/cn';
import { ExportService, type ExportFormat } from '../services/ExportService';
import type { PunishResult } from '../types/frameData';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: PunishResult[];
  className?: string;
}

const ExportModal: React.FC<ExportModalProps> = ({ 
  isOpen, 
  onClose, 
  results, 
  className = '' 
}) => {
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [fileName, setFileName] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);

    try {
      if (results.length === 0) {
        throw new Error('エクスポートするデータがありません');
      }

      ExportService.validateResults(results);
      
      const options = {
        format,
        includeMetadata,
        fileName: fileName.trim() || undefined,
      };

      ExportService.exportAndDownload(results, options);
      
      // 成功時はモーダルを閉じる
      setTimeout(() => {
        onClose();
        setIsExporting(false);
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エクスポートに失敗しました');
      setIsExporting(false);
    }
  };

  const handleFormatChange = (newFormat: ExportFormat) => {
    setFormat(newFormat);
    setError(null);
  };

  const formatDescriptions = {
    csv: 'カンマ区切りファイル。ExcelやGoogleスプレッドシートで開けます。',
    txt: 'プレーンテキストファイル。見やすく整形された形式です。',
    json: 'JSON形式。プログラムで処理する際に便利です。',
  };

  if (!isOpen) return null;

  return (
    <div className={cn('fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50', className)}>
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">データエクスポート</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            disabled={isExporting}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {/* フォーマット選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              エクスポート形式
            </label>
            <div className="space-y-2">
              {(['csv', 'txt', 'json'] as ExportFormat[]).map((formatOption) => (
                <label key={formatOption} className="flex items-center">
                  <input
                    type="radio"
                    name="format"
                    value={formatOption}
                    checked={format === formatOption}
                    onChange={(e) => handleFormatChange(e.target.value as ExportFormat)}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    disabled={isExporting}
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      {formatOption.toUpperCase()}
                    </span>
                    <p className="text-xs text-gray-500">
                      {formatDescriptions[formatOption]}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* メタデータ含める */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={includeMetadata}
                onChange={(e) => setIncludeMetadata(e.target.checked)}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isExporting}
              />
              <span className="text-sm text-gray-700">
                メタデータを含める
              </span>
            </label>
            <p className="text-xs text-gray-500 ml-6">
              エクスポート日時、データ件数等の情報を含めます
            </p>
          </div>

          {/* ファイル名 */}
          <div>
            <label htmlFor="fileName" className="block text-sm font-medium text-gray-700 mb-1">
              ファイル名 (省略可)
            </label>
            <input
              id="fileName"
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder={`lagscope-results-${new Date().toISOString().slice(0, 10)}`}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isExporting}
            />
            <p className="text-xs text-gray-500 mt-1">
              空の場合は自動的に生成されます
            </p>
          </div>

          {/* データ件数表示 */}
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm text-gray-600">
              エクスポート対象: {results.length}件の結果
            </p>
            <p className="text-sm text-gray-600">
              反撃技数: {results.reduce((sum, r) => sum + r.punishingMoves.length, 0)}
            </p>
            <p className="text-sm text-gray-600">
              キャラクター数: {new Set(results.map(r => r.defendingFighter.id)).size}
            </p>
          </div>
        </div>

        {/* ボタン */}
        <div className="flex justify-end space-x-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            disabled={isExporting}
          >
            キャンセル
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isExporting || results.length === 0}
          >
            {isExporting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                エクスポート中...
              </span>
            ) : (
              'エクスポート'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;