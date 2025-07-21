import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Fighter, Move } from '../types/frameData';
import type { AsyncState } from '../types/utils';

interface CharacterSelectionState {
  attackingFighter: Fighter | null;
  defendingFighter: Fighter | null;
  selectedMove: Move | null;
  fightersData: AsyncState<Fighter[]>;
}

interface CharacterSelectionActions {
  setAttackingFighter: (fighter: Fighter | null) => void;
  setDefendingFighter: (fighter: Fighter | null) => void;
  setSelectedMove: (move: Move | null) => void;
  setFightersData: (data: AsyncState<Fighter[]>) => void;
  resetSelection: () => void;
}

type CharacterSelectionStore = CharacterSelectionState & CharacterSelectionActions;

const initialState: CharacterSelectionState = {
  attackingFighter: null,
  defendingFighter: null,
  selectedMove: null,
  fightersData: {
    data: null,
    loading: false,
    error: null,
    lastFetch: null,
  },
};

export const useCharacterSelectionStore = create<CharacterSelectionStore>()(
  devtools(
    (set) => ({
      ...initialState,

      setAttackingFighter: (fighter) => {
        set({ 
          attackingFighter: fighter, 
          selectedMove: null // 攻撃側変更時に技選択をリセット
        });
      },

      setDefendingFighter: (fighter) => {
        set({ defendingFighter: fighter });
      },

      setSelectedMove: (move) => {
        set({ selectedMove: move });
      },

      setFightersData: (data) => {
        set({ fightersData: data });
      },

      resetSelection: () => {
        set(initialState);
      },
    }),
    {
      name: 'lagscope-character-selection',
    }
  )
);