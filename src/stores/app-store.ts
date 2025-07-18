import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Fighter, Move, CalculationOptions, PunishResult } from '../types/frameData';
import type { AsyncState } from '../types/utils';

interface AppState {
  attackingFighter: Fighter | null;
  defendingFighters: Fighter[];
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
  setDefendingFighters: (fighters: Fighter[]) => void;
  addDefendingFighter: (fighter: Fighter) => void;
  removeDefendingFighter: (fighterId: string) => void;
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
  defendingFighters: [],
  selectedMove: null,
  calculationOptions: {
    staleness: 'fresh',
    rangeFilter: ['close', 'mid', 'far'],
    allowOutOfShield: true,
    allowGuardCancel: true,
    allowShieldDrop: true,
    allowPerfectShield: true,
    allowRolling: true,
    allowSpotDodge: true,
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
    (set, get) => ({
      ...initialState,

      setAttackingFighter: (fighter) => {
        set({ attackingFighter: fighter, selectedMove: null, results: [] });
      },

      setDefendingFighters: (fighters) => {
        set({ defendingFighters: fighters, results: [] });
      },

      addDefendingFighter: (fighter) => {
        const { defendingFighters } = get();
        if (!defendingFighters.find(f => f.id === fighter.id)) {
          set({ defendingFighters: [...defendingFighters, fighter], results: [] });
        }
      },

      removeDefendingFighter: (fighterId) => {
        const { defendingFighters } = get();
        set({ 
          defendingFighters: defendingFighters.filter(f => f.id !== fighterId),
          results: [] 
        });
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
      name: 'lagscope-app-store',
    }
  )
);