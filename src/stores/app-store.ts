import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Fighter, Move, CalculationOptions, PunishResult } from '../types/frameData';
import type { AsyncState } from '../types/utils';

interface AppState {
  attackingFighter: Fighter | null;
  defendingFighter: Fighter | null;
  selectedMove: Move | null;
  calculationOptions: CalculationOptions;
  results: PunishResult[];
  isCalculating: boolean;
  error: string | null;
  fightersData: AsyncState<Fighter[]>;
  movesData: AsyncState<Move[]>;
}

interface AppStore extends AppState {
  // Actions
  setAttackingFighter: (fighter: Fighter | null) => void;
  setDefendingFighter: (fighter: Fighter | null) => void;
  setSelectedMove: (move: Move | null) => void;
  setCalculationOptions: (options: Partial<CalculationOptions>) => void;
  setResults: (results: PunishResult[]) => void;
  setIsCalculating: (isCalculating: boolean) => void;
  setError: (error: string | null) => void;
  setFightersData: (data: AsyncState<Fighter[]>) => void;
  setMovesData: (data: AsyncState<Move[]>) => void;
  resetState: () => void;
}

const initialState: AppState = {
  attackingFighter: null,
  defendingFighter: null,
  selectedMove: null,
  calculationOptions: {
    staleness: 'fresh',
    rangeFilter: ['close', 'mid', 'far'],
    minimumFrameAdvantage: 0,
    maximumFrameAdvantage: 999,
    minimumDamage: 0,
    onlyGuaranteed: false,
    includeKillMoves: true,
    includeDIOptions: false,
    includeSDIOptions: false,
    positionFilter: [],
  },
  results: [],
  isCalculating: false,
  error: null,
  fightersData: {
    data: null,
    loading: false,
    error: null,
    lastFetch: null,
  },
  movesData: {
    data: null,
    loading: false,
    error: null,
    lastFetch: null,
  },
};

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        setAttackingFighter: (fighter) => {
          set({ attackingFighter: fighter, selectedMove: null, results: [] });
        },

        setDefendingFighter: (fighter) => {
          set({ defendingFighter: fighter, results: [] });
        },

        setSelectedMove: (move) => {
          set({ selectedMove: move, results: [] });
        },

        setCalculationOptions: (options) => {
          const { calculationOptions } = get();
          set({ 
            calculationOptions: { ...calculationOptions, ...options },
            results: [] 
          });
        },

        setResults: (results) => {
          set({ results });
        },

        setIsCalculating: (isCalculating) => {
          set({ isCalculating });
        },

        setError: (error) => {
          set({ error });
        },

        setFightersData: (data) => {
          set({ fightersData: data });
        },

        setMovesData: (data) => {
          set({ movesData: data });
        },

        resetState: () => {
          set(initialState);
        },
      }),
      {
        name: 'lagscope-options',
        partialize: (state) => ({
          calculationOptions: state.calculationOptions,
        }),
      }
    ),
    {
      name: 'lagscope-app-store',
    }
  )
);