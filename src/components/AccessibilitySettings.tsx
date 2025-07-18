import { useState } from 'react';
import { useAccessibility } from '../hooks/useAccessibility';

export function AccessibilitySettings() {
  const [isOpen, setIsOpen] = useState(false);
  const { settings, toggleHighContrast, toggleReducedMotion, toggleAnnouncements } = useAccessibility();

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="アクセシビリティ設定を開く"
        title="アクセシビリティ設定"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 w-80">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          アクセシビリティ設定
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          aria-label="アクセシビリティ設定を閉じる"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label htmlFor="high-contrast" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            高コントラストモード
          </label>
          <button
            id="high-contrast"
            role="switch"
            aria-checked={settings.highContrast}
            onClick={toggleHighContrast}
            className={`relative inline-flex h-6 w-11 items-center rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              settings.highContrast ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                settings.highContrast ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <label htmlFor="reduced-motion" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            動作を減らす
          </label>
          <button
            id="reduced-motion"
            role="switch"
            aria-checked={settings.reducedMotion}
            onClick={toggleReducedMotion}
            className={`relative inline-flex h-6 w-11 items-center rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              settings.reducedMotion ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                settings.reducedMotion ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <label htmlFor="announcements" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            スクリーンリーダー通知
          </label>
          <button
            id="announcements"
            role="switch"
            aria-checked={settings.announcements}
            onClick={toggleAnnouncements}
            className={`relative inline-flex h-6 w-11 items-center rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              settings.announcements ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                settings.announcements ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        設定は自動的に保存されます。一部の設定はページを再読み込みした後に適用されます。
      </div>
    </div>
  );
}