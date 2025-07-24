import { memo, useState, useCallback } from 'react';
import type { FlattenedResult } from '@/hooks/useResultsData';
import ExportModal from '@/components/ExportModal';
import { cn } from '@/utils/cn';

interface ExportControlsProps {
  dataToExport: FlattenedResult[];
  className?: string;
}

/**
 * エクスポート機能の制御を担当するコンポーネント
 * 
 * 責任:
 * - エクスポートボタンの表示
 * - エクスポートモーダルの開閉制御
 * - エクスポート対象データの管理
 */
const ExportControls = memo<ExportControlsProps>(({ 
  dataToExport, 
  className = '' 
}) => {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const handleOpenExportModal = useCallback(() => {
    setIsExportModalOpen(true);
  }, []);

  const handleCloseExportModal = useCallback(() => {
    setIsExportModalOpen(false);
  }, []);


  return (
    <div className={cn('flex justify-end', className)}>
      <button
        onClick={handleOpenExportModal}
        disabled={dataToExport.length === 0}
        className={cn(
          'px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors',
          dataToExport.length === 0 && 'opacity-50 cursor-not-allowed hover:bg-blue-600'
        )}
      >
        結果をエクスポート ({dataToExport.length}件)
      </button>

      {isExportModalOpen && (
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={handleCloseExportModal}
          results={dataToExport.map(({ result }) => result)}
        />
      )}
    </div>
  );
});

ExportControls.displayName = 'ExportControls';

export default ExportControls;