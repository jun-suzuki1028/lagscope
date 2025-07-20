import { describe, it, expect } from 'vitest';
import { FrameCalculator } from '../FrameCalculator';
import { Move, Fighter } from '../../types/frameData';

describe('FrameCalculator パフォーマンステスト', () => {
  const createMockMove = (id: string, damage: number = 10): Move => ({
    id,
    name: id,
    displayName: `テスト技${id}`,
    category: 'jab',
    type: 'normal',
    input: 'A',
    startup: 5,
    active: 3,
    recovery: 10,
    totalFrames: 18,
    onShield: -5,
    onHit: 5,
    onWhiff: -10,
    damage,
    baseKnockback: 20,
    knockbackGrowth: 30,
    range: 'close',
    hitboxData: {
      hitboxes: [{
        id: 1,
        damage,
        angle: 361,
        baseKnockback: 20,
        knockbackGrowth: 30,
        hitboxType: 'normal',
        effect: 'normal',
        size: 2.0,
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
  });

  const createMockFighter = (id: string, moveCount: number = 50): Fighter => {
    const moves = Array.from({ length: moveCount }, (_, i) => 
      createMockMove(`${id}-move-${i}`, 5 + i % 15)
    );

    return {
      id,
      name: `Fighter ${id}`,
      displayName: `ファイター${id}`,
      series: 'Test Series',
      weight: 100,
      fallSpeed: 1.5,
      fastFallSpeed: 2.4,
      gravity: 0.08,
      walkSpeed: 1.0,
      runSpeed: 1.5,
      airSpeed: 1.0,
      moves,
      shieldData: {
        shieldHealth: 50,
        shieldRegen: 0.07,
        shieldRegenDelay: 30,
        shieldStun: 0.8665,
        shieldReleaseFrames: 11,
        shieldGrabFrames: 6,
        outOfShieldOptions: moves.slice(0, 5).map((move, i) => ({
          move: move.name,
          frames: 3 + i,
          type: 'nair',
          effectiveness: 8
        }))
      },
      movementData: {
        jumpSquat: 3,
        fullHopHeight: 35,
        shortHopHeight: 17,
        airJumps: 1,
        dodgeFrames: {
          spotDodge: { startup: 3, active: 20, recovery: 4, total: 27 },
          airDodge: { startup: 3, active: 29, recovery: 28, total: 60 }
        },
        rollFrames: {
          forward: { startup: 4, active: 12, recovery: 15, total: 31 },
          backward: { startup: 4, active: 12, recovery: 15, total: 31 }
        }
      }
    };
  };

  describe('基本計算のパフォーマンス', () => {
    it('シールド硬直計算が100ms以内で完了する', () => {
      const startTime = performance.now();
      
      // 大量の計算を実行
      for (let i = 0; i < 10000; i++) {
        FrameCalculator.calculateShieldStun(i % 100);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(100);
    });

    it('フレーム有利計算が100ms以内で完了する', () => {
      const move = createMockMove('test-move');
      const startTime = performance.now();
      
      // 大量の計算を実行
      for (let i = 0; i < 1000; i++) {
        FrameCalculator.calculateFrameAdvantage(move, 11);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(100);
    });
  });

  describe('反撃計算のパフォーマンス', () => {
    it('単一キャラクターの反撃計算が500ms以内で完了する', () => {
      const move = createMockMove('slow-move');
      move.totalFrames = 50; // 反撃可能にする
      
      const fighter = createMockFighter('test-fighter', 100);
      
      const startTime = performance.now();
      
      const result = FrameCalculator.calculatePunishWindow(move, fighter);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(500);
      expect(result).toBeDefined();
    });

    it('複数キャラクターの反撃計算が妥当な時間で完了する', () => {
      const move = createMockMove('slow-move');
      move.totalFrames = 50;
      
      const fighters = Array.from({ length: 10 }, (_, i) => 
        createMockFighter(`fighter-${i}`, 50)
      );
      
      const startTime = performance.now();
      
      const results = fighters.map(fighter => 
        FrameCalculator.calculatePunishWindow(move, fighter)
      );
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // 10キャラクターの計算が2秒以内で完了することを確認
      expect(duration).toBeLessThan(2000);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toBeDefined();
      });
    });
  });

  describe('大量データ処理のパフォーマンス', () => {
    it('ワンパターン相殺計算が効率的に動作する', () => {
      const startTime = performance.now();
      
      // 大量のワンパターンレベル計算
      for (let i = 0; i < 1000; i++) {
        const recentMoves = Array.from({ length: 9 }, (_, j) => `move-${j % 5}`);
        FrameCalculator.getStalenessLevel(recentMoves, 'test-move');
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(100);
    });

    it('最適反撃オプション選択が効率的に動作する', () => {
      const fighter = createMockFighter('test-fighter', 100);
      const moves = Array.from({ length: 100 }, (_, i) => ({
        move: createMockMove(`move-${i}`, 10 + i % 20),
        method: 'out_of_shield' as const,
        totalFrames: 10 + i % 30,
        isGuaranteed: i % 2 === 0,
        probability: 0.7 + (i % 3) * 0.1,
        damage: 10 + i % 20,
        notes: `Move ${i}`
      }));
      
      const punishResult = {
        defendingFighter: fighter,
        punishingMoves: moves,
        frameAdvantage: -20,
        attackingMove: createMockMove('attacking-move'),
        calculationContext: {
          staleness: 'fresh' as const,
          shieldDamage: 5,
          shieldStun: 8,
          range: 'close' as const,
          position: 'center',
          options: {
            staleness: 'fresh' as const,
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
      
      const startTime = performance.now();
      
      // 大量の最適化計算
      for (let i = 0; i < 100; i++) {
        FrameCalculator.getBestPunishOptions(punishResult, 10);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(200);
    });
  });

  describe('メモリ効率性テスト', () => {
    it('大量計算でメモリリークが発生しない', () => {
      // メモリ使用量の初期値を測定
      const initialMemory = performance.memory?.usedJSHeapSize || 0;
      
      // 大量の計算を実行
      for (let i = 0; i < 1000; i++) {
        const move = createMockMove(`move-${i}`);
        const fighter = createMockFighter(`fighter-${i}`, 20);
        
        FrameCalculator.calculatePunishWindow(move, fighter);
        
        // 定期的にガベージコレクションを促す
        if (i % 100 === 0 && global.gc) {
          global.gc();
        }
      }
      
      // 最終的なメモリ使用量を測定
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = performance.memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;
      
      // メモリ増加が10MBを超えないことを確認
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });
  });

  describe('リアルタイム計算要件', () => {
    it('対戦中のリアルタイム計算が60FPS要件を満たす', () => {
      const move = createMockMove('real-time-move');
      move.totalFrames = 30;
      
      const fighter = createMockFighter('real-time-fighter', 80);
      
      const frameTime = 1000 / 60; // 60FPS = 16.67ms per frame
      const maxCalculationTime = frameTime * 0.5; // フレーム時間の50%以内
      
      const startTime = performance.now();
      
      // リアルタイム計算をシミュレート
      FrameCalculator.calculatePunishWindow(move, fighter);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(maxCalculationTime);
    });

    it('多キャラクター同時計算が120FPS要件を満たす', () => {
      const move = createMockMove('multi-char-move');
      move.totalFrames = 35;
      
      const fighters = Array.from({ length: 5 }, (_, i) => 
        createMockFighter(`fighter-${i}`, 30)
      );
      
      const frameTime = 1000 / 120; // 120FPS = 8.33ms per frame
      const maxCalculationTime = frameTime * 0.7; // フレーム時間の70%以内
      
      const startTime = performance.now();
      
      // 5キャラクター同時計算
      fighters.forEach(fighter => {
        FrameCalculator.calculatePunishWindow(move, fighter);
      });
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(maxCalculationTime);
    });
  });

  describe('ベンチマークテスト', () => {
    it('計算速度のベンチマークを実行する', () => {
      const iterations = 1000;
      const move = createMockMove('benchmark-move');
      move.totalFrames = 40;
      
      const fighter = createMockFighter('benchmark-fighter', 60);
      
      const startTime = performance.now();
      
      for (let i = 0; i < iterations; i++) {
        FrameCalculator.calculatePunishWindow(move, fighter);
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const averageTime = totalTime / iterations;
      
      // 1回の計算が平均5ms以内で完了することを確認
      expect(averageTime).toBeLessThan(5);
      
      // ベンチマーク結果をログ出力
      // eslint-disable-next-line no-console
      console.log(`ベンチマーク結果: ${iterations}回の計算に${totalTime.toFixed(2)}ms、平均${averageTime.toFixed(2)}ms`);
    });
  });
});