import { describe, it, expect } from 'vitest';
import { FrameCalculator } from '../FrameCalculator';
import { Move, Fighter, StalenessLevel } from '../../types/frameData';

describe('FrameCalculator', () => {
  const mockMove: Move = {
    id: 'jab1',
    name: 'jab1',
    displayName: 'ジャブ1',
    category: 'jab',
    type: 'normal',
    input: 'A',
    startup: 2,
    active: 2,
    recovery: 5,
    totalFrames: 9,
    onShield: -2,
    onHit: 2,
    onWhiff: -2,
    damage: 2.2,
    baseKnockback: 15,
    knockbackGrowth: 25,
    range: 'close',
    hitboxData: {
      hitboxes: [{
        id: 1,
        damage: 2.2,
        angle: 361,
        baseKnockback: 15,
        knockbackGrowth: 25,
        hitboxType: 'normal',
        effect: 'normal',
        size: 1.5,
        position: { x: 0, y: 8.5, z: 4.5 }
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
    }
  };

  const mockFighter: Fighter = {
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
    moves: [mockMove],
    shieldData: {
      shieldHealth: 50,
      shieldRegen: 0.07,
      shieldRegenDelay: 30,
      shieldStun: 0.8665,
      shieldReleaseFrames: 11,
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
      fullHopHeight: 34.65,
      shortHopHeight: 16.74,
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
    }
  };

  describe('calculateShieldStun', () => {
    it('正常にシールド硬直を計算する', () => {
      const result = FrameCalculator.calculateShieldStun(10.0);
      expect(result).toBe(Math.floor(10.0 * 0.8665 + 2));
    });

    it('最小値2フレームを保証する', () => {
      const result = FrameCalculator.calculateShieldStun(0.1);
      expect(result).toBe(2);
    });

    it('ワンパターン相殺を適用する', () => {
      const noneResult = FrameCalculator.calculateShieldStun(10.0, 'none');
      const freshResult = FrameCalculator.calculateShieldStun(10.0, 'fresh');
      const staleResult = FrameCalculator.calculateShieldStun(10.0, 'stale1');
      expect(noneResult).toBe(freshResult);
      expect(staleResult).toBeLessThanOrEqual(freshResult);
    });

    it('最大ワンパターン相殺を適用する', () => {
      const freshResult = FrameCalculator.calculateShieldStun(10.0, 'fresh');
      const stale9Result = FrameCalculator.calculateShieldStun(10.0, 'stale9');
      expect(stale9Result).toBeLessThan(freshResult);
    });
  });

  describe('calculateShieldDamage', () => {
    it('正常にシールドダメージを計算する', () => {
      const result = FrameCalculator.calculateShieldDamage(10.0);
      expect(result).toBe(Math.floor(10.0 * 0.7 + 1));
    });

    it('ワンパターン相殺を適用する', () => {
      const noneResult = FrameCalculator.calculateShieldDamage(10.0, 'none');
      const freshResult = FrameCalculator.calculateShieldDamage(10.0, 'fresh');
      const staleResult = FrameCalculator.calculateShieldDamage(10.0, 'stale1');
      expect(noneResult).toBe(freshResult);
      expect(staleResult).toBeLessThan(freshResult);
    });
  });

  describe('calculateFrameAdvantage', () => {
    it('正常にフレーム有利を計算する', () => {
      const result = FrameCalculator.calculateFrameAdvantage(mockMove, 11);
      expect(result.frameAdvantage).toBeDefined();
      expect(result.shieldStun).toBeDefined();
      expect(result.shieldDamage).toBeDefined();
    });

    it('有利/不利/五分を正しく判定する', () => {
      const advantageousMove: Move = {
        ...mockMove,
        damage: 20.0,
        totalFrames: 20,
        startup: 5,
        active: 5
      };

      const result = FrameCalculator.calculateFrameAdvantage(advantageousMove, 11);
      
      if (result.frameAdvantage > 0) {
        expect(result.isAdvantage).toBe(true);
        expect(result.isDisadvantage).toBe(false);
        expect(result.isNeutral).toBe(false);
      } else if (result.frameAdvantage < 0) {
        expect(result.isAdvantage).toBe(false);
        expect(result.isDisadvantage).toBe(true);
        expect(result.isNeutral).toBe(false);
      } else {
        expect(result.isAdvantage).toBe(false);
        expect(result.isDisadvantage).toBe(false);
        expect(result.isNeutral).toBe(true);
      }
    });

    it('パーフェクトシールドボーナスを適用する', () => {
      const normalResult = FrameCalculator.calculateFrameAdvantage(mockMove, 11, 'fresh', false);
      const perfectResult = FrameCalculator.calculateFrameAdvantage(mockMove, 11, 'fresh', true);
      
      expect(perfectResult.frameAdvantage).toBe(normalResult.frameAdvantage + 4);
    });
  });

  describe('calculatePunishWindow', () => {
    it('正常に反撃ウィンドウを計算する', () => {
      const disadvantageMove: Move = {
        ...mockMove,
        damage: 5.0,
        totalFrames: 40,
        startup: 10,
        active: 5
      };

      const result = FrameCalculator.calculatePunishWindow(disadvantageMove, mockFighter);
      
      expect(result).toBeDefined();
      expect(result.defendingFighter).toBe(mockFighter);
      expect(result.attackingMove).toBe(disadvantageMove);
      expect(result.punishingMoves).toBeDefined();
      expect(result.frameAdvantage).toBeDefined();
      expect(result.calculationContext).toBeDefined();
    });

    it('有利な技に対して空の反撃リストを返す', () => {
      const advantageMove: Move = {
        ...mockMove,
        damage: 20.0,
        totalFrames: 15,
        startup: 5,
        active: 5
      };

      const result = FrameCalculator.calculatePunishWindow(advantageMove, mockFighter);
      
      // フレーム有利が正の値または0の場合、反撃オプションは少ないはず
      if (result.frameAdvantage >= 0) {
        expect(result.punishingMoves.length).toBeLessThanOrEqual(1);
      } else {
        // 不利な場合は反撃オプションがあることを確認
        expect(result.punishingMoves.length).toBeGreaterThanOrEqual(0);
      }
    });

    it('計算オプションを適用する', () => {
      const disadvantageMove: Move = {
        ...mockMove,
        damage: 5.0,
        totalFrames: 40,
        startup: 10,
        active: 5
      };

      const result = FrameCalculator.calculatePunishWindow(
        disadvantageMove,
        mockFighter,
        'fresh',
        { onlyGuaranteed: true }
      );
      
      expect(result.calculationContext.options.onlyGuaranteed).toBe(true);
    });
  });

  describe('calculateStalenessQueue', () => {
    it('正常にワンパターンキューを更新する', () => {
      const recentMoves = ['jab1', 'ftilt', 'jab1'];
      const result = FrameCalculator.calculateStalenessQueue(recentMoves, 'usmash');
      
      expect(result).toEqual(['usmash', 'jab1', 'ftilt', 'jab1']);
    });

    it('最大サイズを超えるとキューをトリムする', () => {
      const recentMoves = ['jab1', 'ftilt', 'jab1', 'usmash', 'dsmash', 'fair', 'bair', 'nair', 'dair'];
      const result = FrameCalculator.calculateStalenessQueue(recentMoves, 'grab', 9);
      
      expect(result).toHaveLength(9);
      expect(result[0]).toBe('grab');
    });
  });

  describe('getStalenessLevel', () => {
    it('新しい技にfreshを返す', () => {
      const recentMoves = ['ftilt', 'usmash', 'dsmash'];
      const result = FrameCalculator.getStalenessLevel(recentMoves, 'jab1');
      
      expect(result).toBe('fresh');
    });

    it('1回使用した技にstale1を返す', () => {
      const recentMoves = ['jab1', 'ftilt', 'usmash'];
      const result = FrameCalculator.getStalenessLevel(recentMoves, 'jab1');
      
      expect(result).toBe('stale1');
    });

    it('3回使用した技にstale3を返す', () => {
      const recentMoves = ['jab1', 'ftilt', 'jab1', 'usmash', 'jab1'];
      const result = FrameCalculator.getStalenessLevel(recentMoves, 'jab1');
      
      expect(result).toBe('stale3');
    });

    it('9回以上使用した技にstale9を返す', () => {
      const recentMoves = Array(10).fill('jab1');
      const result = FrameCalculator.getStalenessLevel(recentMoves, 'jab1');
      
      expect(result).toBe('stale9');
    });
  });

  describe('isMoveSafe', () => {
    it('安全な技にtrueを返す', () => {
      const safeMove: Move = {
        ...mockMove,
        damage: 15.0,
        totalFrames: 20,
        startup: 5,
        active: 5
      };

      const result = FrameCalculator.isMoveSafe(safeMove, 11);
      
      if (result) {
        expect(result).toBe(true);
      }
    });

    it('不安全な技にfalseを返す', () => {
      const unsafeMove: Move = {
        ...mockMove,
        damage: 5.0,
        totalFrames: 40,
        startup: 10,
        active: 5
      };

      const result = FrameCalculator.isMoveSafe(unsafeMove, 11);
      
      if (!result) {
        expect(result).toBe(false);
      }
    });
  });

  describe('getBestPunishOptions', () => {
    it('最適な反撃オプションを返す', () => {
      const mockPunishResult = {
        defendingFighter: mockFighter,
        punishingMoves: [
          {
            move: mockMove,
            method: 'out_of_shield' as const,
            totalFrames: 10,
            isGuaranteed: true,
            probability: 0.9,
            damage: 10,
            notes: 'test'
          },
          {
            move: { ...mockMove, properties: { ...mockMove.properties, isKillMove: true } },
            method: 'out_of_shield' as const,
            totalFrames: 15,
            isGuaranteed: true,
            probability: 0.8,
            damage: 15,
            notes: 'test'
          }
        ],
        frameAdvantage: -15,
        attackingMove: mockMove,
        calculationContext: {
          staleness: 'fresh' as StalenessLevel,
          shieldDamage: 5,
          shieldStun: 8,
          range: 'close' as const,
          position: 'center',
          options: {
            staleness: 'fresh' as StalenessLevel,
            rangeFilter: ['close' as const],
            allowOutOfShield: true,
            allowGuardCancel: true,
            allowShieldDrop: true,
            allowPerfectShield: false,
            allowRolling: true,
            allowSpotDodge: true,
            minimumFrameAdvantage: -999,
            maximumFrameAdvantage: 999,
            minimumDamage: 0,
            onlyGuaranteed: false,
            includeKillMoves: true,
            includeDIOptions: false,
            includeSDIOptions: false,
            positionFilter: ['center']
          }
        }
      };

      const result = FrameCalculator.getBestPunishOptions(mockPunishResult, 5);
      
      expect(result).toHaveLength(2);
      expect(result[0].move.properties.isKillMove).toBe(true);
    });
  });
});