import { Fighter, Move, PunishResult, PunishMove, CalculationOptions, CalculationContext } from '../types/frameData';
import { GAME_MECHANICS } from '../lib/constants';
import { vi } from 'vitest';

/**
 * テスト用モックデータファクトリ
 * 統一されたモックデータを提供し、テスト間の重複を削減
 */

/**
 * 基本的なモック技データの作成
 */
export const createMockMove = (overrides: Partial<Move> = {}): Move => ({
  id: 'test-move',
  name: 'test-move',
  displayName: 'テスト技',
  category: 'jab',
  type: 'normal',
  input: 'A',
  startup: 3,
  active: 2,
  recovery: 8,
  totalFrames: 13,
  onShield: -2,
  onHit: 3,
  onWhiff: -8,
  damage: 5.0,
  baseKnockback: 25,
  knockbackGrowth: 50,
  range: 'close',
  hitboxData: {
    hitboxes: [{
      id: 1,
      damage: 5.0,
      angle: 361,
      baseKnockback: 25,
      knockbackGrowth: 50,
      hitboxType: 'normal',
      effect: 'normal',
      size: 2.0,
      position: { x: 0, y: 8, z: 4 }
    }],
    multihit: false
  },
  properties: {
    isKillMove: false,
    hasArmor: false,
    isCommandGrab: false,
    isSpike: false,
    isMeteor: false,
    hasInvincibility: false,
    hasIntangibility: false,
    canClank: true,
    priority: 1,
    transcendentPriority: false
  },
  ...overrides
});

/**
 * 基本的なモックファイターデータの作成
 */
export const createMockFighter = (overrides: Partial<Fighter> = {}): Fighter => ({
  id: 'test-fighter',
  name: 'Test Fighter',
  displayName: 'テストファイター',
  series: 'Test Series',
  weight: 100,
  fallSpeed: 1.6,
  fastFallSpeed: 2.56,
  gravity: 0.087,
  walkSpeed: 1.0,
  runSpeed: 1.5,
  airSpeed: 1.0,
  iconUrl: '/test-icon.png',
  moves: [createMockMove()],
  shieldData: {
    shieldHealth: 50,
    shieldRegen: 0.07,
    shieldRegenDelay: 30,
    shieldStun: 0.8665,
    shieldReleaseFrames: GAME_MECHANICS.SHIELD_RELEASE_FRAMES,
    shieldGrabFrames: 6,
    outOfShieldOptions: [
      {
        move: 'nair',
        frames: 3,
        type: 'nair',
        effectiveness: 8
      },
      {
        move: 'up_b',
        frames: 3,
        type: 'up_b',
        effectiveness: 9
      }
    ]
  },
  movementData: {
    jumpSquat: 3,
    fullHopHeight: 30.0,
    shortHopHeight: 15.0,
    airJumps: 1,
    dodgeFrames: {
      spotDodge: { startup: 3, active: 20, recovery: 4, total: 27 },
      airDodge: { startup: 3, active: 29, recovery: 28, total: 60 }
    },
    rollFrames: {
      forward: { startup: 4, active: 12, recovery: 15, total: 31 },
      backward: { startup: 4, active: 12, recovery: 15, total: 31 }
    }
  },
  ...overrides
});

/**
 * よく使われるキャラクターのモックデータ
 */
export const mockMario = (): Fighter => createMockFighter({
  id: 'mario',
  name: 'Mario',
  displayName: 'マリオ',
  series: 'Super Mario',
  weight: 98,
  fallSpeed: 1.8,
  fastFallSpeed: 2.88,
  gravity: 0.087,
  walkSpeed: 1.1,
  runSpeed: 1.76,
  airSpeed: 1.208,
  iconUrl: '/icons/mario.png',
  moves: [
    createMockMove({
      id: 'mario-jab1',
      name: 'jab1',
      displayName: '弱攻撃1',
      startup: 2,
      damage: 2.2
    }),
    createMockMove({
      id: 'mario-nair',
      name: 'nair', 
      displayName: '空中N攻撃',
      category: 'aerial',
      startup: 3,
      damage: 8.0
    })
  ]
});

export const mockPikachu = (): Fighter => createMockFighter({
  id: 'pikachu',
  name: 'Pikachu',
  displayName: 'ピカチュウ',
  series: 'Pokémon',
  weight: 79,
  fallSpeed: 1.55,
  fastFallSpeed: 2.48,
  gravity: 0.095,
  walkSpeed: 1.302,
  runSpeed: 2.039,
  airSpeed: 1.0,
  iconUrl: '/icons/pikachu.png'
});

export const mockKazuya = (): Fighter => createMockFighter({
  id: 'kazuya',
  name: 'Kazuya',
  displayName: 'カズヤ',
  series: 'Tekken',
  weight: 113,
  fallSpeed: 1.7,
  fastFallSpeed: 2.72,
  gravity: 0.09,
  walkSpeed: 0.66,
  runSpeed: 1.55,
  airSpeed: 1.0,
  iconUrl: '/icons/kazuya.png'
});

/**
 * 複数ファイターの配列
 */
export const mockFightersArray = (): Fighter[] => [
  mockMario(),
  mockPikachu(),
  mockKazuya()
];

/**
 * モック技カテゴリ
 */
export const createMockJab = (overrides: Partial<Move> = {}): Move => 
  createMockMove({
    category: 'jab',
    startup: 2,
    damage: 2.5,
    onShield: -2,
    range: 'close',
    ...overrides
  });

export const createMockSmash = (overrides: Partial<Move> = {}): Move => 
  createMockMove({
    category: 'smash',
    startup: 14,
    damage: 18.0,
    onShield: -8,
    range: 'mid',
    properties: {
      isKillMove: true,
      killPercent: 120,
      hasArmor: false,
      isCommandGrab: false,
      isSpike: false,
      isMeteor: false,
      hasInvincibility: false,
      hasIntangibility: false,
      canClank: true,
      priority: 1,
      transcendentPriority: false
    },
    ...overrides
  });

export const createMockAerial = (overrides: Partial<Move> = {}): Move => 
  createMockMove({
    category: 'aerial',
    startup: 8,
    damage: 9.0,
    onShield: -4,
    range: 'close',
    ...overrides
  });

export const createMockGrab = (overrides: Partial<Move> = {}): Move => 
  createMockMove({
    category: 'grab',
    type: 'grab',
    startup: 6,
    damage: 0,
    onShield: 0,
    range: 'close',
    properties: {
      isKillMove: false,
      hasArmor: false,
      isCommandGrab: false,
      isSpike: false,
      isMeteor: false,
      hasInvincibility: false,
      hasIntangibility: false,
      canClank: false,
      priority: 1,
      transcendentPriority: false
    },
    ...overrides
  });

/**
 * モック反撃データの作成
 */
export const createMockPunishMove = (overrides: Partial<PunishMove> = {}): PunishMove => ({
  move: createMockMove(),
  method: 'out_of_shield',
  totalFrames: 14,
  isGuaranteed: true,
  probability: 0.9,
  damage: 5.0,
  killPercent: undefined,
  guardActionType: 'guard_release',
  notes: 'テスト反撃技',
  ...overrides
});

/**
 * モック反撃結果の作成
 */
export const createMockPunishResult = (overrides: Partial<PunishResult> = {}): PunishResult => ({
  defendingFighter: createMockFighter(),
  punishingMoves: [createMockPunishMove()],
  frameAdvantage: 5,
  attackingMove: createMockMove(),
  calculationContext: createMockCalculationContext(),
  ...overrides
});

/**
 * モック計算コンテキストの作成
 */
export const createMockCalculationContext = (overrides: Partial<CalculationContext> = {}): CalculationContext => ({
  staleness: 'none',
  shieldDamage: 3,
  shieldStun: 6,
  range: 'close',
  position: 'center',
  options: createMockCalculationOptions(),
  ...overrides
});

/**
 * モック計算オプションの作成
 */
export const createMockCalculationOptions = (overrides: Partial<CalculationOptions> = {}): CalculationOptions => ({
  staleness: 'none',
  rangeFilter: ['close', 'mid', 'far'],
  minimumFrameAdvantage: 1,
  maximumFrameAdvantage: 30,
  minimumDamage: 0,
  onlyGuaranteed: false,
  includeKillMoves: true,
  includeDIOptions: false,
  includeSDIOptions: false,
  positionFilter: ['center'],
  ...overrides
});

/**
 * エッジケース用のモックデータ
 */
export const createExtremeMockMove = (overrides: Partial<Move> = {}): Move => 
  createMockMove({
    startup: 1,
    damage: 999,
    onShield: -30,
    ...overrides
  });

export const createZeroDamageMockMove = (overrides: Partial<Move> = {}): Move => 
  createMockMove({
    damage: 0,
    onShield: 0,
    ...overrides
  });

export const createArrayDamageMockMove = (damages: number[], overrides: Partial<Move> = {}): Move => 
  createMockMove({
    damage: damages,
    ...overrides
  });

/**
 * テスト用のストアモック作成ヘルパー
 */
export const createMockStore = (initialState: Record<string, unknown> = {}) => ({
  getState: () => initialState,
  setState: vi.fn(),
  subscribe: vi.fn(),
  destroy: vi.fn(),
  ...initialState
});

/**
 * よく使われるテストデータセット
 */
export const TEST_DATA_SETS = {
  BASIC_FIGHTERS: mockFightersArray(),
  MARIO_ONLY: [mockMario()],
  EMPTY_FIGHTERS: [],
  
  BASIC_MOVES: [
    createMockJab(),
    createMockSmash(),
    createMockAerial(),
    createMockGrab()
  ],
  
  EXTREME_MOVES: [
    createExtremeMockMove(),
    createZeroDamageMockMove(),
    createArrayDamageMockMove([10, 8, 5])
  ]
} as const;