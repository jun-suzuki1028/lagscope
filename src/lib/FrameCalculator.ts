import { Move, Fighter, StalenessLevel, PunishResult, PunishMove, CalculationOptions, CalculationContext } from '../types/frameData';
import { GAME_MECHANICS } from './constants';

export interface FrameAdvantageResult {
  frameAdvantage: number;
  shieldStun: number;
  shieldDamage: number;
  isAdvantage: boolean;
  isDisadvantage: boolean;
  isNeutral: boolean;
}

export interface StalenessModifier {
  damageMultiplier: number;
  shieldDamageMultiplier: number;
  hitstunMultiplier: number;
}

export interface GuardCancelOptions {
  jumpCancel: boolean;
  grabCancel: boolean;
  upBCancel: boolean;
  upSmashCancel: boolean;
  nairCancel: boolean;
  upTiltCancel: boolean;
}

export class FrameCalculator {
  private static readonly SHIELD_STUN_MULTIPLIER = 0.8665;
  private static readonly SHIELD_DAMAGE_MULTIPLIER = 0.7;
  private static readonly PERFECT_SHIELD_ADVANTAGE = 4;
  // 将来の実装で使用される予定の定数
  // private static readonly JUMP_SQUAT_FRAMES = 3;
  // private static readonly GRAB_RELEASE_FRAMES = 30;

  private static readonly STALENESS_MULTIPLIERS: Record<StalenessLevel, StalenessModifier> = {
    none: { damageMultiplier: 1.0, shieldDamageMultiplier: 1.0, hitstunMultiplier: 1.0 },
    stale1: { damageMultiplier: 0.99, shieldDamageMultiplier: 0.99, hitstunMultiplier: 0.99 },
    stale2: { damageMultiplier: 0.98, shieldDamageMultiplier: 0.98, hitstunMultiplier: 0.98 },
    stale3: { damageMultiplier: 0.97, shieldDamageMultiplier: 0.97, hitstunMultiplier: 0.97 },
    stale4: { damageMultiplier: 0.96, shieldDamageMultiplier: 0.96, hitstunMultiplier: 0.96 },
    stale5: { damageMultiplier: 0.95, shieldDamageMultiplier: 0.95, hitstunMultiplier: 0.95 },
    stale6: { damageMultiplier: 0.94, shieldDamageMultiplier: 0.94, hitstunMultiplier: 0.94 },
    stale7: { damageMultiplier: 0.93, shieldDamageMultiplier: 0.93, hitstunMultiplier: 0.93 },
    stale8: { damageMultiplier: 0.92, shieldDamageMultiplier: 0.92, hitstunMultiplier: 0.92 },
    stale9: { damageMultiplier: 0.91, shieldDamageMultiplier: 0.91, hitstunMultiplier: 0.91 },
  };

  public static calculateShieldStun(attackDamage: number, staleness: StalenessLevel = 'none'): number {
    const stalenessModifier = this.STALENESS_MULTIPLIERS[staleness];
    const adjustedDamage = attackDamage * stalenessModifier.damageMultiplier;
    const shieldStun = Math.floor(adjustedDamage * this.SHIELD_STUN_MULTIPLIER + 2);
    return Math.max(shieldStun, 2);
  }

  public static calculateShieldDamage(attackDamage: number, staleness: StalenessLevel = 'none'): number {
    const stalenessModifier = this.STALENESS_MULTIPLIERS[staleness];
    const adjustedDamage = attackDamage * stalenessModifier.shieldDamageMultiplier;
    return Math.floor(adjustedDamage * this.SHIELD_DAMAGE_MULTIPLIER + 1);
  }

  public static calculateFrameAdvantage(
    attackMove: Move,
    defenderShieldReleaseFrames: number,
    staleness: StalenessLevel = 'none',
    isPerfectShield: boolean = false
  ): FrameAdvantageResult {
    const baseDamage = Array.isArray(attackMove.damage) 
      ? (attackMove.damage.length > 0 ? attackMove.damage[0] : 0)
      : attackMove.damage;
    const shieldStun = this.calculateShieldStun(baseDamage, staleness);
    const shieldDamage = this.calculateShieldDamage(baseDamage, staleness);
    
    const attackerRecovery = attackMove.totalFrames - attackMove.startup - attackMove.active;
    const defenderTotal = shieldStun + defenderShieldReleaseFrames;
    
    let frameAdvantage = defenderTotal - attackerRecovery;
    
    if (isPerfectShield) {
      frameAdvantage += this.PERFECT_SHIELD_ADVANTAGE;
    }

    return {
      frameAdvantage,
      shieldStun,
      shieldDamage,
      isAdvantage: frameAdvantage > 0,
      isDisadvantage: frameAdvantage < 0,
      isNeutral: frameAdvantage === 0
    };
  }

  public static calculatePunishWindow(
    attackMove: Move,
    defender: Fighter,
    staleness: StalenessLevel = 'none',
    options: Partial<CalculationOptions> = {}
  ): PunishResult {
    const frameAdvantage = this.calculateFrameAdvantage(
      attackMove,
      defender.shieldData.shieldReleaseFrames,
      staleness,
      false // perfectShieldは今回は無効
    );

    const context: CalculationContext = {
      staleness,
      shieldDamage: frameAdvantage.shieldDamage,
      shieldStun: frameAdvantage.shieldStun,
      range: attackMove.range,
      position: 'center',
      options: {
        staleness,
        rangeFilter: options.rangeFilter || ['close', 'mid', 'far'],
        minimumFrameAdvantage: options.minimumFrameAdvantage ?? -999,
        maximumFrameAdvantage: options.maximumFrameAdvantage ?? 999,
        minimumDamage: options.minimumDamage ?? 0,
        onlyGuaranteed: options.onlyGuaranteed ?? false,
        includeKillMoves: options.includeKillMoves ?? true,
        includeDIOptions: options.includeDIOptions ?? false,
        includeSDIOptions: options.includeSDIOptions ?? false,
        positionFilter: options.positionFilter ?? ['center']
      }
    };

    const punishingMoves = this.findPunishingMoves(
      defender,
      frameAdvantage.frameAdvantage > 0 ? frameAdvantage.frameAdvantage : 0,
      context
    );

    return {
      defendingFighter: defender,
      punishingMoves,
      frameAdvantage: frameAdvantage.frameAdvantage,
      attackingMove: attackMove,
      calculationContext: context
    };
  }

  private static findPunishingMoves(
    defender: Fighter,
    advantageFrames: number,
    context: CalculationContext
  ): PunishMove[] {
    const punishingMoves: PunishMove[] = [];
    const { options } = context;

    // 有利フレームが0以下の場合、反撃オプションはない
    if (advantageFrames <= 0) {
      return punishingMoves;
    }

    // ガードキャンセル技を自動的に計算
    const guardCancelOptions = this.getGuardCancelOptions(defender, advantageFrames, context);
    punishingMoves.push(...guardCancelOptions);

    // ガード解除技を自動的に計算
    const guardReleaseOptions = this.getGuardReleaseOptions(defender, advantageFrames, context);
    punishingMoves.push(...guardReleaseOptions);

    return punishingMoves
      .filter(move => 
        move.damage >= options.minimumDamage &&
        (!options.onlyGuaranteed || move.isGuaranteed) &&
        options.rangeFilter.includes(move.move.range)
      )
      .sort((a, b) => a.totalFrames - b.totalFrames);
  }


  private static getGuardCancelOptions(
    defender: Fighter,
    advantageFrames: number,
    _context: CalculationContext
  ): PunishMove[] {
    const punishingMoves: PunishMove[] = [];

    // ガードキャンセル可能な技のカテゴリ定義
    const guardCancelMoves = [
      { category: 'smash', type: 'up', name: '上スマッシュ' },
      { category: 'special', type: 'up', name: '上必殺技' },
      { category: 'grab', type: 'normal', name: 'つかみ' },
    ];

    for (const gcMove of guardCancelMoves) {
      const move = defender.moves.find(m => 
        m.category === gcMove.category && 
        (gcMove.type === 'normal' || m.name.includes(gcMove.type))
      );

      if (move) {
        // ガードキャンセル技は11Fのシールド解除ペナルティなし
        const totalFrames = move.startup;
        
        if (totalFrames <= advantageFrames) {
          punishingMoves.push({
            move,
            method: this.getGuardCancelMethod(gcMove.category, gcMove.type),
            totalFrames,
            isGuaranteed: totalFrames < advantageFrames,
            probability: this.calculateProbability(totalFrames, advantageFrames, 8),
            damage: Array.isArray(move.damage) 
              ? (move.damage.length > 0 ? move.damage[0] : 0)
              : move.damage,
            killPercent: move.properties.killPercent,
            guardActionType: 'guard_cancel',
            notes: `${gcMove.name}（ガードキャンセル）`
          });
        }
      }
    }

    // ジャンプキャンセル（空中技）
    const jumpSquatFrames = defender.movementData.jumpSquat;
    for (const move of defender.moves) {
      if (move.category === 'aerial') {
        const totalFrames = jumpSquatFrames + move.startup;
        
        if (totalFrames <= advantageFrames) {
          punishingMoves.push({
            move,
            method: 'guard_cancel_jump',
            totalFrames,
            isGuaranteed: totalFrames < advantageFrames,
            probability: this.calculateProbability(totalFrames, advantageFrames, 7),
            damage: Array.isArray(move.damage) 
              ? (move.damage.length > 0 ? move.damage[0] : 0)
              : move.damage,
            killPercent: move.properties.killPercent,
            guardActionType: 'guard_cancel',
            notes: `${move.displayName}（ジャンプキャンセル）`
          });
        }
      }
    }

    return punishingMoves;
  }

  private static getGuardReleaseOptions(
    defender: Fighter,
    advantageFrames: number,
    _context: CalculationContext
  ): PunishMove[] {
    const punishingMoves: PunishMove[] = [];
    const shieldReleaseFrames = GAME_MECHANICS.SHIELD_RELEASE_FRAMES; // シールド解除ペナルティ

    for (const move of defender.moves) {
      // ガードキャンセル不可能な技（通常技、強攻撃、スマッシュ、必殺技など）
      if (move.category !== 'grab' && 
          !(move.category === 'smash' && move.name.includes('up')) &&
          !(move.category === 'special' && move.name.includes('up')) &&
          move.category !== 'aerial') {
        
        const totalFrames = shieldReleaseFrames + move.startup;
        
        if (totalFrames <= advantageFrames) {
          punishingMoves.push({
            move,
            method: 'out_of_shield',
            totalFrames,
            isGuaranteed: totalFrames < advantageFrames,
            probability: this.calculateProbability(totalFrames, advantageFrames, 5),
            damage: Array.isArray(move.damage) 
              ? (move.damage.length > 0 ? move.damage[0] : 0)
              : move.damage,
            killPercent: move.properties.killPercent,
            guardActionType: 'guard_release',
            notes: `${move.displayName}（ガード解除）`
          });
        }
      }
    }

    return punishingMoves;
  }

  private static getGuardCancelMethod(category: string, type: string): PunishMove['method'] {
    if (category === 'smash' && type === 'up') return 'guard_cancel_up_smash';
    if (category === 'special' && type === 'up') return 'guard_cancel_up_b';
    if (category === 'grab') return 'guard_cancel_grab';
    return 'guard_cancel_jump';
  }



  private static calculateProbability(
    totalFrames: number,
    disadvantageFrames: number,
    effectiveness: number
  ): number {
    const frameDiff = disadvantageFrames - totalFrames;
    const baseProb = Math.min(1, frameDiff / 5);
    const effectivenessBonus = effectiveness / 10;
    
    return Math.min(1, baseProb + effectivenessBonus);
  }

  public static calculateStalenessQueue(
    recentMoves: string[],
    newMoveId: string,
    maxSize: number = 9
  ): string[] {
    const queue = [newMoveId, ...recentMoves];
    return queue.slice(0, maxSize);
  }

  public static getStalenessLevel(
    recentMoves: string[],
    moveId: string
  ): StalenessLevel {
    const occurrences = recentMoves.filter(id => id === moveId).length;
    
    if (occurrences === 0) return 'none';
    if (occurrences >= 9) return 'stale9';
    
    return `stale${occurrences}` as StalenessLevel;
  }

  public static isMoveSafe(
    attackMove: Move,
    defenderShieldReleaseFrames: number,
    staleness: StalenessLevel = 'none'
  ): boolean {
    const result = this.calculateFrameAdvantage(
      attackMove,
      defenderShieldReleaseFrames,
      staleness
    );
    
    return result.frameAdvantage >= 0;
  }

  public static getBestPunishOptions(
    punishResult: PunishResult,
    maxResults: number = 5
  ): PunishMove[] {
    return punishResult.punishingMoves
      .filter(move => move.isGuaranteed)
      .sort((a, b) => {
        if (a.move.properties.isKillMove !== b.move.properties.isKillMove) {
          return a.move.properties.isKillMove ? -1 : 1;
        }
        return b.damage - a.damage;
      })
      .slice(0, maxResults);
  }
}