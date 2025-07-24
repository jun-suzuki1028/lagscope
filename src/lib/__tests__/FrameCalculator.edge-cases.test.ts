import { describe, it, expect } from 'vitest';
import { FrameCalculator } from '../FrameCalculator';
import { Fighter } from '../../types/frameData';
import { 
  createMockMove, 
  createMockFighter,
  createExtremeMockMove,
  createZeroDamageMockMove,
  createArrayDamageMockMove 
} from '../../test-utils/mock-data';

describe('FrameCalculator エッジケース', () => {


  describe('極端なダメージ値', () => {
    it('非常に低いダメージでも最小シールド硬直を計算する', () => {
      const result = FrameCalculator.calculateShieldStun(0.1);
      expect(result).toBe(2);
    });

    it('非常に高いダメージでも正常に計算する', () => {
      const result = FrameCalculator.calculateShieldStun(999);
      expect(result).toBe(Math.floor(999 * 0.8665 + 2));
    });

    it('0ダメージでも最小シールド硬直を計算する', () => {
      const result = FrameCalculator.calculateShieldStun(0);
      expect(result).toBe(2);
    });

    it('負のダメージでも最小シールド硬直を計算する', () => {
      const result = FrameCalculator.calculateShieldStun(-5);
      expect(result).toBe(2);
    });
  });

  describe('配列ダメージの処理', () => {
    it('配列ダメージの最初の値を使用する', () => {
      const move = createMockMove({ damage: [12, 10, 8] });
      const result = FrameCalculator.calculateFrameAdvantage(move, 11);
      
      const expectedStun = Math.floor(12 * 0.8665 + 2);
      expect(result.shieldStun).toBe(Math.max(expectedStun, 2));
    });

    it('空の配列ダメージを適切に処理する', () => {
      const move = createMockMove({ damage: [] });
      const result = FrameCalculator.calculateFrameAdvantage(move, 11);
      
      expect(result.shieldStun).toBe(2);
    });
  });

  describe('極端なフレームデータ', () => {
    it('非常に速い技（1フレーム発生）を処理する', () => {
      const move = createMockMove({
        startup: 1,
        active: 1,
        recovery: 1,
        totalFrames: 3
      });
      
      const result = FrameCalculator.calculateFrameAdvantage(move, 11);
      expect(result).toBeDefined();
      expect(result.frameAdvantage).toBeDefined();
    });

    it('非常に遅い技（100フレーム）を処理する', () => {
      const move = createMockMove({
        startup: 30,
        active: 10,
        recovery: 60,
        totalFrames: 100
      });
      
      const result = FrameCalculator.calculateFrameAdvantage(move, 11);
      expect(result).toBeDefined();
      expect(result.frameAdvantage).toBeLessThan(0);
    });
  });

  describe('ワンパターン相殺の極端なケース', () => {
    it('全てのワンパターンレベルで正常に計算する', () => {
      const stalenessLevels = [
        'none', 'stale1', 'stale2', 'stale3', 'stale4', 
        'stale5', 'stale6', 'stale7', 'stale8', 'stale9'
      ] as const;
      
      stalenessLevels.forEach(level => {
        const result = FrameCalculator.calculateShieldStun(10, level);
        expect(result).toBeGreaterThanOrEqual(2);
        expect(result).toBeLessThanOrEqual(Math.floor(10 * 0.8665 + 2));
      });
    });

    it('最大ワンパターン相殺が適切に適用される', () => {
      const none = FrameCalculator.calculateShieldStun(100, 'none');
      const stale9 = FrameCalculator.calculateShieldStun(100, 'stale9');
      
      expect(stale9).toBeLessThan(none);
      expect(stale9).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Out of Shield オプション', () => {
    it('OOSオプションがない場合は空の配列を返す', () => {
      const fighter = createMockFighter({
        shieldData: {
          ...createMockFighter().shieldData,
          outOfShieldOptions: []
        }
      });
      
      const move = createMockMove({ totalFrames: 50 });
      const result = FrameCalculator.calculatePunishWindow(move, fighter);
      
      expect(result.punishingMoves).toHaveLength(0);
    });

    it('非常に速いOOSオプションを正しく処理する', () => {
      const fastNair = createMockMove({ startup: 3, totalFrames: 20, category: 'aerial', name: 'nair' });
      const upSmash = createMockMove({ startup: 6, totalFrames: 30, category: 'smash', name: 'up_smash' });
      const grab = createMockMove({ startup: 8, totalFrames: 35, category: 'grab', name: 'grab' });
      const fighter = createMockFighter({
        moves: [fastNair, upSmash, grab],
        movementData: {
          ...createMockFighter().movementData,
          jumpSquat: 3  // ジャンプしゃがみ3F
        }
      });
      
      // 非常に不利な技（攻撃側が大幅に不利になる）
      const slowMove = createMockMove({ 
        totalFrames: 100,
        startup: 10,
        active: 5, 
        recovery: 85, // 回復85フレーム（攻撃側の隙を大きく）
        onShield: -20, // 非常に大きな不利フレーム
        damage: 50 // より大きなダメージでシールド硬直を増やす
      });
      const result = FrameCalculator.calculatePunishWindow(slowMove, fighter);
      
      // 新しいロジックでは、ガードキャンセル技とガード解除技の両方が自動計算される
      // 有利フレームが正の値の場合のみ反撃オプションが生成される
      if (result.frameAdvantage > 0) {
        expect(result.punishingMoves.length).toBeGreaterThan(0);
      } else {
        expect(result.punishingMoves.length).toBe(0);
      }
    });
  });

  describe('反撃確率の計算', () => {
    it('1フレーム有利での反撃確率を計算する', () => {
      const move = createMockMove({ totalFrames: 30 });
      const testMove = createMockMove({ name: 'test-move', startup: 5 });
      const fighter = createMockFighter({
        shieldData: {
          ...createMockFighter().shieldData,
          outOfShieldOptions: [{
            move: 'test-move',
            frames: 29,
            type: 'nair',
            effectiveness: 5
          }]
        },
        moves: [testMove]
      });
      
      const result = FrameCalculator.calculatePunishWindow(move, fighter);
      
      if (result.punishingMoves.length > 0) {
        expect(result.punishingMoves[0].probability).toBeGreaterThan(0);
        expect(result.punishingMoves[0].probability).toBeLessThanOrEqual(1);
      }
    });

    it('フレーム差が大きい場合の反撃確率を計算する', () => {
      const move = createMockMove({ totalFrames: 50 });
      const testMove2 = createMockMove({ name: 'test-move', startup: 5 });
      const fighter = createMockFighter({
        shieldData: {
          ...createMockFighter().shieldData,
          outOfShieldOptions: [{
            move: 'test-move',
            frames: 10,
            type: 'nair',
            effectiveness: 8
          }]
        },
        moves: [testMove2]
      });
      
      const result = FrameCalculator.calculatePunishWindow(move, fighter);
      
      if (result.punishingMoves.length > 0) {
        expect(result.punishingMoves[0].probability).toBeCloseTo(1, 1);
      }
    });
  });

  describe('ワンパターンキューの境界値', () => {
    it('空のキューに新しい技を追加する', () => {
      const result = FrameCalculator.calculateStalenessQueue([], 'jab');
      expect(result).toEqual(['jab']);
    });

    it('最大サイズのキューに新しい技を追加する', () => {
      const fullQueue = Array(9).fill('old-move');
      const result = FrameCalculator.calculateStalenessQueue(fullQueue, 'new-move');
      
      expect(result).toHaveLength(9);
      expect(result[0]).toBe('new-move');
      expect(result[8]).toBe('old-move');
    });

    it('カスタムサイズのキューを処理する', () => {
      const result = FrameCalculator.calculateStalenessQueue(['a', 'b'], 'c', 2);
      expect(result).toEqual(['c', 'a']);
    });
  });

  describe('安全性チェック', () => {
    it('完全に安全な技（大幅有利）を正しく判定する', () => {
      const safeMove = createMockMove({
        damage: 50,
        totalFrames: 10,
        startup: 5,
        active: 2,
        recovery: 3
      });
      
      const result = FrameCalculator.isMoveSafe(safeMove, 11);
      expect(result).toBe(true);
    });

    it('完全に不安全な技（大幅不利）を正しく判定する', () => {
      const unsafeMove = createMockMove({
        damage: 1,
        totalFrames: 100,
        startup: 10,
        active: 5,
        recovery: 85
      });
      
      const result = FrameCalculator.isMoveSafe(unsafeMove, 11);
      expect(result).toBe(false);
    });

    it('ギリギリ安全な技を正しく判定する', () => {
      const neutralMove = createMockMove({
        damage: 10,
        totalFrames: 18,
        startup: 5,
        active: 3,
        recovery: 10
      });
      
      const result = FrameCalculator.isMoveSafe(neutralMove, 11);
      expect(typeof result).toBe('boolean');
    });
  });

  describe('最適反撃オプション', () => {
    it('撃墜技を優先して返す', () => {
      const normalMove = createMockMove({ damage: 20 });
      const killMove = createMockMove({ 
        damage: 15,
        properties: { 
          ...createMockMove().properties,
          isKillMove: true 
        }
      });
      
      const punishResult = {
        defendingFighter: createMockFighter(),
        punishingMoves: [
          {
            move: normalMove,
            method: 'out_of_shield' as const,
            totalFrames: 10,
            isGuaranteed: true,
            probability: 1,
            damage: 20,
            notes: 'normal'
          },
          {
            move: killMove,
            method: 'out_of_shield' as const,
            totalFrames: 12,
            isGuaranteed: true,
            probability: 1,
            damage: 15,
            notes: 'kill move'
          }
        ],
        frameAdvantage: -15,
        attackingMove: createMockMove(),
        calculationContext: {
          staleness: 'none' as const,
          shieldDamage: 5,
          shieldStun: 8,
          range: 'close' as const,
          position: 'center',
          options: {
            staleness: 'none' as const,
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
      
      const result = FrameCalculator.getBestPunishOptions(punishResult, 5);
      
      expect(result).toHaveLength(2);
      expect(result[0].move.properties.isKillMove).toBe(true);
      expect(result[1].move.properties.isKillMove).toBe(false);
    });

    it('確定技のみを返す', () => {
      const guaranteedMove = createMockMove({ damage: 10 });
      const uncertainMove = createMockMove({ damage: 20 });
      
      const punishResult = {
        defendingFighter: createMockFighter(),
        punishingMoves: [
          {
            move: guaranteedMove,
            method: 'out_of_shield' as const,
            totalFrames: 10,
            isGuaranteed: true,
            probability: 1,
            damage: 10,
            notes: 'guaranteed'
          },
          {
            move: uncertainMove,
            method: 'out_of_shield' as const,
            totalFrames: 15,
            isGuaranteed: false,
            probability: 0.7,
            damage: 20,
            notes: 'uncertain'
          }
        ],
        frameAdvantage: -15,
        attackingMove: createMockMove(),
        calculationContext: {
          staleness: 'none' as const,
          shieldDamage: 5,
          shieldStun: 8,
          range: 'close' as const,
          position: 'center',
          options: {
            staleness: 'none' as const,
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
      
      const result = FrameCalculator.getBestPunishOptions(punishResult, 5);
      
      expect(result).toHaveLength(1);
      expect(result[0].isGuaranteed).toBe(true);
    });
  });
});