import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { CalculationOptions, PunishResult, Move } from '../types/frameData';
import type { AsyncState } from '../types/utils';

interface CalculationState {
  calculationOptions: CalculationOptions;
  results: PunishResult[];
  isCalculating: boolean;
  error: string | null;
  movesData: AsyncState<Move[]>;
}

interface CalculationActions {
  setCalculationOptions: (options: Partial<CalculationOptions>) => void;
  setResults: (results: PunishResult[]) => void;
  setIsCalculating: (isCalculating: boolean) => void;
  setError: (error: string | null) => void;
  setMovesData: (data: AsyncState<Move[]>) => void;
  resetCalculation: () => void;
}

type CalculationStore = CalculationState & CalculationActions;

const initialCalculationOptions: CalculationOptions = {
  staleness: 'none',
  rangeFilter: ['close', 'mid', 'far'],
  minimumFrameAdvantage: 0,
  maximumFrameAdvantage: 999,
  minimumDamage: 0,
  onlyGuaranteed: false,
  includeKillMoves: true,
  includeDIOptions: false,
  includeSDIOptions: false,
  positionFilter: [],
};

const initialState: CalculationState = {
  calculationOptions: initialCalculationOptions,
  results: [],
  isCalculating: false,
  error: null,
  movesData: {
    data: null,
    loading: false,
    error: null,
    lastFetch: null,
  },
};

export const useCalculationStore = create<CalculationStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        setCalculationOptions: (options) => {
          const { calculationOptions } = get();
          set({ 
            calculationOptions: { ...calculationOptions, ...options },
            results: [] // オプション変更時に結果をクリア
          });
        },

        setResults: (results) => {
          set({ results, error: null });
        },

        setIsCalculating: (isCalculating) => {
          set({ isCalculating });
        },

        setError: (error) => {
          set({ error, results: [] });
        },

        setMovesData: (data) => {
          set({ movesData: data });
        },

        resetCalculation: () => {
          set({
            ...initialState,
            calculationOptions: get().calculationOptions // オプションは保持
          });
        },
      }),
      {
        name: 'lagscope-calculation',
        partialize: (state) => ({
          calculationOptions: state.calculationOptions,
        }),
      }
    ),
    {
      name: 'lagscope-calculation-store',
    }
  )
);