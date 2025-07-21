import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface UISettings {
  theme: 'light' | 'dark' | 'system';
  compactMode: boolean;
  animationsEnabled: boolean;
  soundEnabled: boolean;
  language: 'ja' | 'en';
}

interface UIState {
  settings: UISettings;
  isLoading: boolean;
}

interface UIActions {
  setTheme: (theme: UISettings['theme']) => void;
  setCompactMode: (enabled: boolean) => void;
  setAnimationsEnabled: (enabled: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setLanguage: (language: UISettings['language']) => void;
  updateSettings: (settings: Partial<UISettings>) => void;
  resetSettings: () => void;
}

type UISettingsStore = UIState & UIActions;

const defaultSettings: UISettings = {
  theme: 'system',
  compactMode: false,
  animationsEnabled: true,
  soundEnabled: false,
  language: 'ja',
};

const initialState: UIState = {
  settings: defaultSettings,
  isLoading: false,
};

export const useUISettingsStore = create<UISettingsStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        setTheme: (theme) => {
          const { settings } = get();
          set({
            settings: { ...settings, theme }
          });
        },

        setCompactMode: (compactMode) => {
          const { settings } = get();
          set({
            settings: { ...settings, compactMode }
          });
        },

        setAnimationsEnabled: (animationsEnabled) => {
          const { settings } = get();
          set({
            settings: { ...settings, animationsEnabled }
          });
        },

        setSoundEnabled: (soundEnabled) => {
          const { settings } = get();
          set({
            settings: { ...settings, soundEnabled }
          });
        },

        setLanguage: (language) => {
          const { settings } = get();
          set({
            settings: { ...settings, language }
          });
        },

        updateSettings: (newSettings) => {
          const { settings } = get();
          set({
            settings: { ...settings, ...newSettings }
          });
        },

        resetSettings: () => {
          set({ settings: defaultSettings });
        },
      }),
      {
        name: 'lagscope-ui-settings',
        partialize: (state) => ({
          settings: state.settings,
        }),
      }
    ),
    {
      name: 'lagscope-ui-settings-store',
    }
  )
);