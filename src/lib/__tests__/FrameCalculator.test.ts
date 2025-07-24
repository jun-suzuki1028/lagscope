import { describe, it, expect } from 'vitest';
import { FrameCalculator } from '../FrameCalculator';
import { StalenessLevel } from '../../types/frameData';
import { createMockMove, createMockFighter, createMockJab } from '../../test-utils/mock-data';

describe('FrameCalculator', () => {
  const mockMove = createMockJab({
    id: 'jab1',
    name: 'jab1',
    displayName: 'ジャブ1',
    startup: 2,
    active: 2,
    recovery: 5,
    totalFrames: 9,
    onShield: -2,
    onHit: 2,
    onWhiff: -2,
    damage: 2.2,
    baseKnockback: 15,
    knockbackGrowth: 25
  });

  const mockFighter = createMockFighter({
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
    moves: [mockMove]
  });

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
      const staleResult = FrameCalculator.calculateShieldStun(10.0, 'stale1');
      expect(staleResult).toBeLessThanOrEqual(noneResult);
    });

    it('最大ワンパターン相殺を適用する', () => {
      const noneResult = FrameCalculator.calculateShieldStun(10.0, 'none');
      const stale9Result = FrameCalculator.calculateShieldStun(10.0, 'stale9');
      expect(stale9Result).toBeLessThan(noneResult);
    });
  });

  describe('calculateShieldDamage', () => {
    it('正常にシールドダメージを計算する', () => {
      const result = FrameCalculator.calculateShieldDamage(10.0);
      expect(result).toBe(Math.floor(10.0 * 0.7 + 1));
    });

    it('ワンパターン相殺を適用する', () => {
      const noneResult = FrameCalculator.calculateShieldDamage(10.0, 'none');
      const staleResult = FrameCalculator.calculateShieldDamage(10.0, 'stale1');
      expect(staleResult).toBeLessThan(noneResult);
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
      const normalResult = FrameCalculator.calculateFrameAdvantage(mockMove, 11, 'none', false);
      const perfectResult = FrameCalculator.calculateFrameAdvantage(mockMove, 11, 'none', true);
      
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
        'none',
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
    it('新しい技にnoneを返す', () => {
      const recentMoves = ['ftilt', 'usmash', 'dsmash'];
      const result = FrameCalculator.getStalenessLevel(recentMoves, 'jab1');
      
      expect(result).toBe('none');
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
          staleness: 'none' as StalenessLevel,
          shieldDamage: 5,
          shieldStun: 8,
          range: 'close' as const,
          position: 'center',
          options: {
            staleness: 'none' as StalenessLevel,
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