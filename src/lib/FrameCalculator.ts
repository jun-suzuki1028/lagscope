import { Move, Fighter, StalenessLevel, PunishResult, PunishMove, CalculationOptions, CalculationContext } from '../types/frameData';

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
    fresh: { damageMultiplier: 1.0, shieldDamageMultiplier: 1.0, hitstunMultiplier: 1.0 },
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

  public static calculateShieldStun(attackDamage: number, staleness: StalenessLevel = 'fresh'): number {
    const stalenessModifier = this.STALENESS_MULTIPLIERS[staleness];
    const adjustedDamage = attackDamage * stalenessModifier.damageMultiplier;
    const shieldStun = Math.floor(adjustedDamage * this.SHIELD_STUN_MULTIPLIER + 2);
    return Math.max(shieldStun, 2);
  }

  public static calculateShieldDamage(attackDamage: number, staleness: StalenessLevel = 'fresh'): number {
    const stalenessModifier = this.STALENESS_MULTIPLIERS[staleness];
    const adjustedDamage = attackDamage * stalenessModifier.shieldDamageMultiplier;
    return Math.floor(adjustedDamage * this.SHIELD_DAMAGE_MULTIPLIER + 1);
  }

  public static calculateFrameAdvantage(
    attackMove: Move,
    defenderShieldReleaseFrames: number,
    staleness: StalenessLevel = 'fresh',
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
    staleness: StalenessLevel = 'fresh',
    options: Partial<CalculationOptions> = {}
  ): PunishResult {
    const frameAdvantage = this.calculateFrameAdvantage(
      attackMove,
      defender.shieldData.shieldReleaseFrames,
      staleness,
      options.allowPerfectShield
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
        allowOutOfShield: options.allowOutOfShield ?? true,
        allowGuardCancel: options.allowGuardCancel ?? true,
        allowPerfectShield: options.allowPerfectShield ?? false,
        allowRolling: options.allowRolling ?? true,
        allowSpotDodge: options.allowSpotDodge ?? true,
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

    if (options.allowOutOfShield) {
      const oosOptions = this.getOutOfShieldOptions(defender, advantageFrames, context);
      punishingMoves.push(...oosOptions);
    }

    if (options.allowGuardCancel) {
      const guardCancelOptions = this.getGuardCancelOptions(defender, advantageFrames, context);
      punishingMoves.push(...guardCancelOptions);
    }


    return punishingMoves
      .filter(move => 
        move.damage >= options.minimumDamage &&
        (!options.onlyGuaranteed || move.isGuaranteed) &&
        options.rangeFilter.includes(move.move.range)
      )
      .sort((a, b) => a.totalFrames - b.totalFrames);
  }

  private static getOutOfShieldOptions(
    defender: Fighter,
    advantageFrames: number,
     
    _context: CalculationContext
  ): PunishMove[] {
    const punishingMoves: PunishMove[] = [];
    
    for (const oosOption of defender.shieldData.outOfShieldOptions) {
      const totalFrames = oosOption.frames;
      
      if (totalFrames <= advantageFrames) {
        const move = defender.moves.find(m => m.name === oosOption.move);
        if (move) {
          punishingMoves.push({
            move,
            method: this.getOOSMethod(oosOption.type),
            totalFrames,
            isGuaranteed: totalFrames < advantageFrames,
            probability: this.calculateProbability(totalFrames, advantageFrames, oosOption.effectiveness),
            damage: Array.isArray(move.damage) 
              ? (move.damage.length > 0 ? move.damage[0] : 0)
              : move.damage,
            killPercent: move.properties.killPercent,
            notes: `OOS option: ${oosOption.type}`
          });
        }
      }
    }

    return punishingMoves;
  }

  private static getGuardCancelOptions(
    defender: Fighter,
    advantageFrames: number,
     
    _context: CalculationContext
  ): PunishMove[] {
    const punishingMoves: PunishMove[] = [];
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
            notes: `Jump cancel option`
          });
        }
      }
    }

    return punishingMoves;
  }


  private static getOOSMethod(type: string): PunishMove['method'] {
    switch (type) {
      case 'jump_cancel':
        return 'guard_cancel_jump';
      case 'grab':
        return 'guard_cancel_grab';
      case 'up_b':
        return 'guard_cancel_up_b';
      case 'up_smash':
        return 'guard_cancel_up_smash';
      case 'nair':
        return 'guard_cancel_nair';
      case 'up_tilt':
        return 'guard_cancel_up_tilt';
      default:
        return 'out_of_shield';
    }
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
    
    if (occurrences === 0) return 'fresh';
    if (occurrences >= 9) return 'stale9';
    
    return `stale${occurrences}` as StalenessLevel;
  }

  public static isMoveSafe(
    attackMove: Move,
    defenderShieldReleaseFrames: number,
    staleness: StalenessLevel = 'fresh'
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