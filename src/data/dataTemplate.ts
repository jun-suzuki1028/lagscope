import { 
  Fighter, 
  Move, 
  MoveCategory, 
  MoveType, 
  MoveRange,
  ShieldData,
  MovementData,
  GameMechanics
} from '../types/frameData';
import { CharacterInfo } from './charactersRegistry';
import { GAME_MECHANICS as GAME_CONSTANTS } from '../lib/constants';

/**
 * 標準的な技テンプレート
 * 各キャラクターに共通する技のベースライン
 */
export interface MoveTemplate {
  id: string;
  name: string;
  displayName: string;
  category: MoveCategory;
  type: MoveType;
  input: string;
  baseStartup: number;
  baseActive: number;
  baseRecovery: number;
  baseOnShield: number;
  baseDamage: number;
  range: MoveRange;
  notes?: string;
}

/**
 * 共通の技テンプレート定義
 */
export const COMMON_MOVE_TEMPLATES: MoveTemplate[] = [
  // ジャブ
  {
    id: 'jab1',
    name: 'jab1',
    displayName: '弱攻撃1',
    category: 'jab',
    type: 'normal',
    input: 'A',
    baseStartup: 3,
    baseActive: 2,
    baseRecovery: 4,
    baseOnShield: -2,
    baseDamage: 2.5,
    range: 'close'
  },
  {
    id: 'jab2',
    name: 'jab2',
    displayName: '弱攻撃2',
    category: 'jab',
    type: 'normal',
    input: 'A A',
    baseStartup: 3,
    baseActive: 2,
    baseRecovery: 4,
    baseOnShield: -2,
    baseDamage: 2.0,
    range: 'close'
  },
  {
    id: 'jab3',
    name: 'jab3',
    displayName: '弱攻撃3',
    category: 'jab',
    type: 'normal',
    input: 'A A A',
    baseStartup: 5,
    baseActive: 3,
    baseRecovery: 8,
    baseOnShield: -5,
    baseDamage: 4.0,
    range: 'close'
  },
  
  // 強攻撃
  {
    id: 'ftilt',
    name: 'ftilt',
    displayName: '横強攻撃',
    category: 'tilt',
    type: 'normal',
    input: '→ + A',
    baseStartup: 8,
    baseActive: 3,
    baseRecovery: 12,
    baseOnShield: -3,
    baseDamage: 8.0,
    range: 'mid'
  },
  {
    id: 'utilt',
    name: 'utilt',
    displayName: '上強攻撃',
    category: 'tilt',
    type: 'normal',
    input: '↑ + A',
    baseStartup: 6,
    baseActive: 4,
    baseRecovery: 10,
    baseOnShield: -2,
    baseDamage: 7.0,
    range: 'close'
  },
  {
    id: 'dtilt',
    name: 'dtilt',
    displayName: '下強攻撃',
    category: 'tilt',
    type: 'normal',
    input: '↓ + A',
    baseStartup: 7,
    baseActive: 3,
    baseRecovery: 8,
    baseOnShield: -1,
    baseDamage: 6.0,
    range: 'close'
  },
  
  // スマッシュ攻撃
  {
    id: 'fsmash',
    name: 'fsmash',
    displayName: '横スマッシュ攻撃',
    category: 'smash',
    type: 'normal',
    input: '→ + A (溜め)',
    baseStartup: 14,
    baseActive: 4,
    baseRecovery: 20,
    baseOnShield: -8,
    baseDamage: 15.0,
    range: 'mid'
  },
  {
    id: 'usmash',
    name: 'usmash',
    displayName: '上スマッシュ攻撃',
    category: 'smash',
    type: 'normal',
    input: '↑ + A (溜め)',
    baseStartup: 12,
    baseActive: 5,
    baseRecovery: 18,
    baseOnShield: -6,
    baseDamage: 14.0,
    range: 'close'
  },
  {
    id: 'dsmash',
    name: 'dsmash',
    displayName: '下スマッシュ攻撃',
    category: 'smash',
    type: 'normal',
    input: '↓ + A (溜め)',
    baseStartup: 10,
    baseActive: 3,
    baseRecovery: 22,
    baseOnShield: -7,
    baseDamage: 12.0,
    range: 'close'
  },
  
  // 空中攻撃
  {
    id: 'nair',
    name: 'nair',
    displayName: '空中ニュートラル攻撃',
    category: 'aerial',
    type: 'normal',
    input: 'A (空中)',
    baseStartup: 8,
    baseActive: 4,
    baseRecovery: 10,
    baseOnShield: -4,
    baseDamage: 9.0,
    range: 'close'
  },
  {
    id: 'fair',
    name: 'fair',
    displayName: '空中前攻撃',
    category: 'aerial',
    type: 'normal',
    input: '→ + A (空中)',
    baseStartup: 10,
    baseActive: 3,
    baseRecovery: 12,
    baseOnShield: -5,
    baseDamage: 10.0,
    range: 'mid'
  },
  {
    id: 'bair',
    name: 'bair',
    displayName: '空中後攻撃',
    category: 'aerial',
    type: 'normal',
    input: '← + A (空中)',
    baseStartup: 9,
    baseActive: 4,
    baseRecovery: 11,
    baseOnShield: -3,
    baseDamage: 11.0,
    range: 'mid'
  },
  {
    id: 'uair',
    name: 'uair',
    displayName: '空中上攻撃',
    category: 'aerial',
    type: 'normal',
    input: '↑ + A (空中)',
    baseStartup: 7,
    baseActive: 5,
    baseRecovery: 8,
    baseOnShield: -2,
    baseDamage: 8.0,
    range: 'close'
  },
  {
    id: 'dair',
    name: 'dair',
    displayName: '空中下攻撃',
    category: 'aerial',
    type: 'normal',
    input: '↓ + A (空中)',
    baseStartup: 12,
    baseActive: 3,
    baseRecovery: 15,
    baseOnShield: -6,
    baseDamage: 12.0,
    range: 'close'
  },
  
  // ダッシュ攻撃
  {
    id: 'dash_attack',
    name: 'dash_attack',
    displayName: 'ダッシュ攻撃',
    category: 'dash',
    type: 'normal',
    input: 'A (ダッシュ中)',
    baseStartup: 8,
    baseActive: 3,
    baseRecovery: 24,
    baseOnShield: -5,
    baseDamage: 8.0,
    range: 'mid'
  },
  
  // 必殺技
  {
    id: 'neutral_b',
    name: 'neutral_b',
    displayName: '通常必殺技',
    category: 'special',
    type: 'special',
    input: 'B',
    baseStartup: 15,
    baseActive: 5,
    baseRecovery: 20,
    baseOnShield: -10,
    baseDamage: 10.0,
    range: 'projectile'
  },
  {
    id: 'side_b',
    name: 'side_b',
    displayName: '横必殺技',
    category: 'special',
    type: 'special',
    input: '→ + B',
    baseStartup: 12,
    baseActive: 4,
    baseRecovery: 18,
    baseOnShield: -8,
    baseDamage: 12.0,
    range: 'mid'
  },
  {
    id: 'up_b',
    name: 'up_b',
    displayName: '上必殺技',
    category: 'special',
    type: 'special',
    input: '↑ + B',
    baseStartup: 10,
    baseActive: 6,
    baseRecovery: 16,
    baseOnShield: -6,
    baseDamage: 8.0,
    range: 'close'
  },
  {
    id: 'down_b',
    name: 'down_b',
    displayName: '下必殺技',
    category: 'special',
    type: 'special',
    input: '↓ + B',
    baseStartup: 18,
    baseActive: 3,
    baseRecovery: 25,
    baseOnShield: -12,
    baseDamage: 14.0,
    range: 'close'
  },
  
  // 投げ技
  {
    id: 'grab',
    name: 'grab',
    displayName: 'つかみ',
    category: 'grab',
    type: 'grab',
    input: 'Z',
    baseStartup: 6,
    baseActive: 2,
    baseRecovery: 10,
    baseOnShield: 0,
    baseDamage: 0,
    range: 'close'
  },
  {
    id: 'pummel',
    name: 'pummel',
    displayName: 'つかみ攻撃',
    category: 'grab',
    type: 'grab',
    input: 'A (つかみ中)',
    baseStartup: 1,
    baseActive: 1,
    baseRecovery: 2,
    baseOnShield: 0,
    baseDamage: 1.3,
    range: 'close'
  },
  {
    id: 'fthrow',
    name: 'fthrow',
    displayName: '前投げ',
    category: 'throw',
    type: 'throw',
    input: '→ (つかみ中)',
    baseStartup: 8,
    baseActive: 1,
    baseRecovery: 15,
    baseOnShield: 0,
    baseDamage: 8.0,
    range: 'close'
  },
  {
    id: 'bthrow',
    name: 'bthrow',
    displayName: '後投げ',
    category: 'throw',
    type: 'throw',
    input: '← (つかみ中)',
    baseStartup: 10,
    baseActive: 1,
    baseRecovery: 18,
    baseOnShield: 0,
    baseDamage: 9.0,
    range: 'close'
  },
  {
    id: 'uthrow',
    name: 'uthrow',
    displayName: '上投げ',
    category: 'throw',
    type: 'throw',
    input: '↑ (つかみ中)',
    baseStartup: 7,
    baseActive: 1,
    baseRecovery: 16,
    baseOnShield: 0,
    baseDamage: 7.0,
    range: 'close'
  },
  {
    id: 'dthrow',
    name: 'dthrow',
    displayName: '下投げ',
    category: 'throw',
    type: 'throw',
    input: '↓ (つかみ中)',
    baseStartup: 12,
    baseActive: 1,
    baseRecovery: 20,
    baseOnShield: 0,
    baseDamage: 6.0,
    range: 'close'
  }
];

/**
 * 標準的なシールドデータテンプレート
 */
export const DEFAULT_SHIELD_DATA: ShieldData = {
  shieldHealth: 50,
  shieldRegen: 0.07,
  shieldRegenDelay: 30,
  shieldStun: 0.8665,
  shieldReleaseFrames: GAME_CONSTANTS.SHIELD_RELEASE_FRAMES,
  shieldGrabFrames: 6,
  outOfShieldOptions: [
    {
      move: 'nair',
      frames: 3,
      type: 'nair',
      effectiveness: 7
    },
    {
      move: 'up_b',
      frames: 3,
      type: 'up_b',
      effectiveness: 8
    },
    {
      move: 'grab',
      frames: 6,
      type: 'grab',
      effectiveness: 6
    },
    {
      move: 'up_smash',
      frames: 4,
      type: 'up_smash',
      effectiveness: 9
    }
  ]
};

/**
 * 標準的な移動データテンプレート
 */
export const DEFAULT_MOVEMENT_DATA: MovementData = {
  jumpSquat: 3,
  fullHopHeight: 32.0,
  shortHopHeight: 15.5,
  airJumps: 1,
  dodgeFrames: {
    spotDodge: {
      startup: 3,
      active: 20,
      recovery: 4,
      total: 27
    },
    airDodge: {
      startup: 3,
      active: 29,
      recovery: 28,
      total: 60
    }
  },
  rollFrames: {
    forward: {
      startup: 4,
      active: 12,
      recovery: 15,
      total: 31
    },
    backward: {
      startup: 4,
      active: 12,
      recovery: 15,
      total: 31
    }
  }
};

/**
 * ゲームメカニクス定数
 */
export const GAME_MECHANICS: GameMechanics = {
  shieldHealthMax: 50,
  shieldHealthMin: 7.5,
  shieldRegenRate: 0.07,
  shieldStunMultiplier: 0.8665,
  shieldDamageMultiplier: 0.7,
  perfectShieldWindow: 5,
  grabReleaseFrames: 30,
  hitlagMultiplier: 0.65,
  sdiMultiplier: 6.0,
  diInfluence: 0.17,
  stalenessMultipliers: {
    none: 1.0,
    stale1: 0.99,
    stale2: 0.98,
    stale3: 0.97,
    stale4: 0.96,
    stale5: 0.95,
    stale6: 0.94,
    stale7: 0.93,
    stale8: 0.92,
    stale9: 0.91
  }
};

/**
 * キャラクター固有の調整値
 */
export interface CharacterAdjustments {
  characterId: string;
  weightAdjustment?: number;
  speedAdjustments?: {
    walkSpeed?: number;
    runSpeed?: number;
    airSpeed?: number;
    fallSpeed?: number;
    fastFallSpeed?: number;
    gravity?: number;
  };
  frameAdjustments?: Record<string, {
    startup?: number;
    active?: number;
    recovery?: number;
    onShield?: number;
    damage?: number;
  }>;
  shieldAdjustments?: Partial<ShieldData>;
  movementAdjustments?: Partial<MovementData>;
  customMoves?: MoveTemplate[];
}

/**
 * キャラクター固有調整データ
 */
export const CHARACTER_ADJUSTMENTS: CharacterAdjustments[] = [
  // マリオの調整例
  {
    characterId: 'mario',
    weightAdjustment: 98,
    speedAdjustments: {
      walkSpeed: 1.1,
      runSpeed: 1.76,
      airSpeed: 1.208,
      fallSpeed: 1.8,
      fastFallSpeed: 2.88,
      gravity: 0.087
    },
    frameAdjustments: {
      'jab1': { startup: 2, damage: 2.2 },
      'up_b': { startup: 3 }
    }
  },
  // ピカチュウの調整例
  {
    characterId: 'pikachu',
    weightAdjustment: 79,
    speedAdjustments: {
      walkSpeed: 1.302,
      runSpeed: 2.039,
      airSpeed: 1.0,
      fallSpeed: 1.55,
      fastFallSpeed: 2.48,
      gravity: 0.095
    },
    frameAdjustments: {
      'jab1': { startup: 2, damage: 1.4 },
      'up_b': { startup: 2 }
    }
  },
  // カズヤ - 正確なフレームデータ
  {
    characterId: 'kazuya',
    weightAdjustment: 113,
    speedAdjustments: {
      walkSpeed: 0.66,
      runSpeed: 1.55,
      airSpeed: 1.0,
      fallSpeed: 1.7,
      fastFallSpeed: 2.72,
      gravity: 0.09
    },
    frameAdjustments: {
      'jab1': { startup: 6, onShield: -11, damage: 2.0 },
      'fsmash': { startup: 25, onShield: -16, damage: 15.0 },
      'usmash': { startup: 12, onShield: -22, damage: 14.0 },
      'nair': { startup: 8, onShield: -3, damage: 9.0 },
      'up_b': { startup: 12 },
      'grab': { startup: 7 }
    },
    shieldAdjustments: {
      outOfShieldOptions: [
        { move: 'nair', frames: 3, type: 'nair', effectiveness: 6 },
        { move: 'up_b', frames: 12, type: 'up_b', effectiveness: 7 },
        { move: 'grab', frames: 7, type: 'grab', effectiveness: 8 },
        { move: 'up_smash', frames: 12, type: 'up_smash', effectiveness: 9 }
      ]
    }
  },
  // ソラ - 正確なフレームデータ
  {
    characterId: 'sora',
    weightAdjustment: 85,
    speedAdjustments: {
      walkSpeed: 0.82,
      runSpeed: 1.58,
      airSpeed: 0.96,
      fallSpeed: 1.44,
      fastFallSpeed: 2.304,
      gravity: 0.064
    },
    frameAdjustments: {
      'jab1': { startup: 5, onShield: -22, damage: 2.5 },
      'fsmash': { startup: 16, onShield: -16, damage: 15.0 },
      'usmash': { startup: 11, onShield: -26, damage: 14.0 },
      'nair': { startup: 8, onShield: -4, damage: 9.0 },
      'up_b': { startup: 9 },
      'grab': { startup: 7 }
    },
    shieldAdjustments: {
      outOfShieldOptions: [
        { move: 'nair', frames: 3, type: 'nair', effectiveness: 7 },
        { move: 'up_b', frames: 9, type: 'up_b', effectiveness: 8 },
        { move: 'grab', frames: 7, type: 'grab', effectiveness: 6 },
        { move: 'up_smash', frames: 11, type: 'up_smash', effectiveness: 8 }
      ]
    }
  }
];

/**
 * テンプレートからファイターデータを生成
 */
export function generateFighterFromTemplate(
  characterInfo: CharacterInfo,
  adjustments?: CharacterAdjustments
): Partial<Fighter> {
  const adj = adjustments || CHARACTER_ADJUSTMENTS.find(a => a.characterId === characterInfo.id);
  
  // 基本ステータス
  const baseFighter: Partial<Fighter> = {
    id: characterInfo.id,
    name: characterInfo.name,
    displayName: characterInfo.displayName,
    series: characterInfo.series,
    weight: adj?.weightAdjustment || 100,
    fallSpeed: adj?.speedAdjustments?.fallSpeed || 1.6,
    fastFallSpeed: adj?.speedAdjustments?.fastFallSpeed || 2.56,
    gravity: adj?.speedAdjustments?.gravity || 0.09,
    walkSpeed: adj?.speedAdjustments?.walkSpeed || 1.0,
    runSpeed: adj?.speedAdjustments?.runSpeed || 1.5,
    airSpeed: adj?.speedAdjustments?.airSpeed || 1.0,
    iconUrl: `/icons/${characterInfo.id}.png`,
    imageUrl: `/images/${characterInfo.id}.png`
  };

  // 技データの生成
  const moves = generateMovesFromTemplates(characterInfo.id, adj);
  
  // シールドデータの生成
  const shieldData = {
    ...DEFAULT_SHIELD_DATA,
    ...adj?.shieldAdjustments
  };

  // 移動データの生成
  const movementData = {
    ...DEFAULT_MOVEMENT_DATA,
    ...adj?.movementAdjustments
  };

  return {
    ...baseFighter,
    moves,
    shieldData,
    movementData
  };
}

/**
 * テンプレートから技データを生成
 */
function generateMovesFromTemplates(
  characterId: string,
  adjustments?: CharacterAdjustments
): Move[] {
  const moves: Move[] = [];
  
  // 基本テンプレートから技を生成
  for (const template of COMMON_MOVE_TEMPLATES) {
    const adjustment = adjustments?.frameAdjustments?.[template.id];
    const customMove = adjustments?.customMoves?.find(m => m.id === template.id);
    
    const moveTemplate = customMove || template;
    
    const move: Move = {
      id: `${characterId}-${moveTemplate.id}`,
      name: moveTemplate.name,
      displayName: moveTemplate.displayName,
      category: moveTemplate.category,
      type: moveTemplate.type,
      input: moveTemplate.input,
      startup: adjustment?.startup || moveTemplate.baseStartup,
      active: adjustment?.active || moveTemplate.baseActive,
      recovery: adjustment?.recovery || moveTemplate.baseRecovery,
      totalFrames: (adjustment?.startup || moveTemplate.baseStartup) + 
                  (adjustment?.active || moveTemplate.baseActive) + 
                  (adjustment?.recovery || moveTemplate.baseRecovery),
      onShield: adjustment?.onShield || moveTemplate.baseOnShield,
      onHit: (adjustment?.onShield || moveTemplate.baseOnShield) + 5, // 仮の計算
      onWhiff: -(adjustment?.recovery || moveTemplate.baseRecovery),
      damage: adjustment?.damage || moveTemplate.baseDamage,
      baseKnockback: calculateBaseKnockback(adjustment?.damage || moveTemplate.baseDamage),
      knockbackGrowth: calculateKnockbackGrowth(moveTemplate.category),
      range: moveTemplate.range,
      hitboxData: generateDefaultHitboxData(adjustment?.damage || moveTemplate.baseDamage),
      properties: generateDefaultMoveProperties(moveTemplate),
      notes: moveTemplate.notes
    };
    
    moves.push(move);
  }
  
  return moves;
}

function calculateBaseKnockback(damage: number): number {
  // ダメージに基づく基本ノックバック計算
  return Math.floor(damage * 3 + 10);
}

function calculateKnockbackGrowth(category: MoveCategory): number {
  // カテゴリに基づくノックバック成長率
  switch (category) {
    case 'smash': return 100;
    case 'special': return 80;
    case 'aerial': return 70;
    case 'throw': return 60;
    default: return 50;
  }
}

function generateDefaultHitboxData(damage: number) {
  return {
    hitboxes: [{
      id: 1,
      damage,
      angle: 361,
      baseKnockback: calculateBaseKnockback(damage),
      knockbackGrowth: 70,
      hitboxType: 'normal' as const,
      effect: 'normal' as const,
      size: Math.max(1.0, damage / 5),
      position: { x: 0, y: 8, z: 5 }
    }],
    multihit: false
  };
}

function generateDefaultMoveProperties(template: MoveTemplate) {
  return {
    isKillMove: template.category === 'smash' || template.baseDamage > 12,
    killPercent: template.category === 'smash' ? 120 : undefined,
    hasArmor: false,
    isCommandGrab: false,
    isSpike: template.id === 'dair',
    isMeteor: false,
    hasInvincibility: template.category === 'dodge',
    hasIntangibility: false,
    canClank: template.type !== 'grab',
    priority: 1,
    transcendentPriority: template.category === 'special'
  };
}

/**
 * 全キャラクターのデータ生成
 */
export function generateAllCharacterData(): Partial<Fighter>[] {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { ALL_CHARACTERS } = require('./charactersRegistry');
  
  return ALL_CHARACTERS.map((charInfo: CharacterInfo) => 
    generateFighterFromTemplate(charInfo)
  );
}