import { useState, useEffect, useCallback } from 'react';

export interface AccessibilitySettings {
  highContrast: boolean;
  reducedMotion: boolean;
  announcements: boolean;
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  highContrast: false,
  reducedMotion: false,
  announcements: true,
};

export function useAccessibility() {
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    // 非同期でlocalStorageを読み込み、UIブロッキングを回避
    const loadSettings = async () => {
      try {
        const savedSettings = localStorage.getItem('lagscope-accessibility-settings');
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings });
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn('Failed to parse accessibility settings:', error);
      }
    };

    // システム設定の検出
    const detectSystemPreferences = () => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;

      if (prefersReducedMotion || prefersHighContrast) {
        setSettings(prevSettings => ({
          ...prevSettings,
          reducedMotion: prefersReducedMotion,
          highContrast: prefersHighContrast,
        }));
      }
    };

    // 設定読み込みを非同期実行
    loadSettings();
    detectSystemPreferences();
  }, []);

  useEffect(() => {
    localStorage.setItem('lagscope-accessibility-settings', JSON.stringify(settings));
    
    document.documentElement.classList.toggle('high-contrast', settings.highContrast);
    document.documentElement.classList.toggle('reduced-motion', settings.reducedMotion);
  }, [settings]);

  const updateSettings = useCallback((newSettings: Partial<AccessibilitySettings>) => {
    setSettings(prevSettings => ({ ...prevSettings, ...newSettings }));
  }, []);

  const toggleHighContrast = useCallback(() => {
    setSettings(prevSettings => ({ 
      ...prevSettings, 
      highContrast: !prevSettings.highContrast 
    }));
  }, []);

  const toggleReducedMotion = useCallback(() => {
    setSettings(prevSettings => ({ 
      ...prevSettings, 
      reducedMotion: !prevSettings.reducedMotion 
    }));
  }, []);

  const toggleAnnouncements = useCallback(() => {
    setSettings(prevSettings => ({ 
      ...prevSettings, 
      announcements: !prevSettings.announcements 
    }));
  }, []);

  return {
    settings,
    updateSettings,
    toggleHighContrast,
    toggleReducedMotion,
    toggleAnnouncements,
  };
}