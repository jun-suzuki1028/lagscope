import { useCharacterSelectionStore } from './characterSelectionStore';
import { useCalculationStore } from './calculationStore';
import { useUISettingsStore } from './uiSettingsStore';

// 分割されたZustandストアのエクスポート
export { useCharacterSelectionStore };
export { useCalculationStore };
export { useUISettingsStore };

// セレクター関数の提供（パフォーマンス最適化）
export const characterSelectors = {
  attackingFighter: (state: ReturnType<typeof useCharacterSelectionStore.getState>) => state.attackingFighter,
  defendingFighter: (state: ReturnType<typeof useCharacterSelectionStore.getState>) => state.defendingFighter,
  selectedMove: (state: ReturnType<typeof useCharacterSelectionStore.getState>) => state.selectedMove,
  fightersData: (state: ReturnType<typeof useCharacterSelectionStore.getState>) => state.fightersData,
};

export const calculationSelectors = {
  calculationOptions: (state: ReturnType<typeof useCalculationStore.getState>) => state.calculationOptions,
  results: (state: ReturnType<typeof useCalculationStore.getState>) => state.results,
  isCalculating: (state: ReturnType<typeof useCalculationStore.getState>) => state.isCalculating,
  error: (state: ReturnType<typeof useCalculationStore.getState>) => state.error,
};

export const uiSelectors = {
  theme: (state: ReturnType<typeof useUISettingsStore.getState>) => state.settings.theme,
  compactMode: (state: ReturnType<typeof useUISettingsStore.getState>) => state.settings.compactMode,
  animationsEnabled: (state: ReturnType<typeof useUISettingsStore.getState>) => state.settings.animationsEnabled,
};