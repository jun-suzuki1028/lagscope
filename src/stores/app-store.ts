// テスト互換性のための旧ストアAPIエミュレーション
import { useCharacterSelectionStore } from './characterSelectionStore';
import { useCalculationStore } from './calculationStore';

export const useAppStore = () => {
  // 各ストアから必要なデータを取得
  const characterData = useCharacterSelectionStore((state) => ({
    fightersData: state.fightersData,
    attackingFighter: state.attackingFighter,
    defendingFighter: state.defendingFighter,
    selectedMove: state.selectedMove,
    setAttackingFighter: state.setAttackingFighter,
    setDefendingFighter: state.setDefendingFighter,
    setSelectedMove: state.setSelectedMove,
    setFightersData: state.setFightersData,
  }));

  const calculationData = useCalculationStore((state) => ({
    calculationOptions: state.calculationOptions,
    results: state.results,
    isCalculating: state.isCalculating,
    error: state.error,
    movesData: state.movesData,
    setCalculationOptions: state.setCalculationOptions,
    setResults: state.setResults,
    setIsCalculating: state.setIsCalculating,
    setError: state.setError,
    setMovesData: state.setMovesData,
  }));

  // 旧APIの形式で返す
  return {
    ...characterData,
    ...calculationData,
    resetState: () => {
      // 必要に応じて各ストアのリセットを実装
    },
  };
};