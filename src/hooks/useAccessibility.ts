import { useState, useEffect } from 'react';

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
    const savedSettings = localStorage.getItem('lagscope-accessibility-settings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings });
      } catch (error) {
        console.warn('Failed to parse accessibility settings:', error);
      }
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;

    if (prefersReducedMotion || prefersHighContrast) {
      setSettings(prevSettings => ({
        ...prevSettings,
        reducedMotion: prefersReducedMotion,
        highContrast: prefersHighContrast,
      }));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('lagscope-accessibility-settings', JSON.stringify(settings));
    
    document.documentElement.classList.toggle('high-contrast', settings.highContrast);
    document.documentElement.classList.toggle('reduced-motion', settings.reducedMotion);
  }, [settings]);

  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    setSettings(prevSettings => ({ ...prevSettings, ...newSettings }));
  };

  const toggleHighContrast = () => {
    updateSettings({ highContrast: !settings.highContrast });
  };

  const toggleReducedMotion = () => {
    updateSettings({ reducedMotion: !settings.reducedMotion });
  };

  const toggleAnnouncements = () => {
    updateSettings({ announcements: !settings.announcements });
  };

  return {
    settings,
    updateSettings,
    toggleHighContrast,
    toggleReducedMotion,
    toggleAnnouncements,
  };
}