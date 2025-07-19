import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  FighterSchema,
  MoveSchema,
  CalculationOptionsSchema,
  PunishResultSchema,
  validateFighter,
  safeParse,
  isValidData,
  createValidationResult,
  getValidationMessage,
} from '../validation';
import type { Fighter, Move, CalculationOptions, PunishResult } from '../../types/frameData';

describe('Validation Schemas', () => {
  describe('FighterSchema', () => {
    const validFighter: Fighter = {
      id: 'mario',
      name: 'Mario',
      displayName: 'マリオ',
      series: 'Super Mario',
      weight: 98,
      fallSpeed: 1.5,
      fastFallSpeed: 2.4,
      gravity: 0.087,
      walkSpeed: 1.05,
      runSpeed: 1.6,
      airSpeed: 1.15,
      moves: [],
      shieldData: {
        shieldHealth: 50,
        shieldRegen: 0.07,
        shieldRegenDelay: 90,
        shieldStun: 0.725,
        shieldReleaseFrames: 11,
        shieldGrabFrames: 11,
        outOfShieldOptions: [],
      },
      movementData: {
        jumpSquat: 3,
        fullHopHeight: 36.57,
        shortHopHeight: 15.02,
        airJumps: 2,
        dodgeFrames: {
          spotDodge: { startup: 3, active: 2, recovery: 25, total: 30 },
          airDodge: { startup: 3, active: 2, recovery: 40, total: 45 },
        },
        rollFrames: {
          forward: { startup: 4, active: 12, recovery: 14, total: 30 },
          backward: { startup: 4, active: 12, recovery: 14, total: 30 },
        },
      },
    };

    it('should validate a valid fighter', () => {
      expect(() => FighterSchema.parse(validFighter)).not.toThrow();
    });

    it('should reject fighter with missing required fields', () => {
      const invalidFighter = { ...validFighter };
      delete (invalidFighter as any).id;
      
      expect(() => FighterSchema.parse(invalidFighter)).toThrow();
    });

    it('should reject fighter with invalid weight', () => {
      const invalidFighter = { ...validFighter, weight: -1 };
      
      expect(() => FighterSchema.parse(invalidFighter)).toThrow();
    });

    it('should reject fighter with invalid jump squat frames', () => {
      const invalidFighter = {
        ...validFighter,
        movementData: {
          ...validFighter.movementData,
          jumpSquat: 0,
        },
      };
      
      expect(() => FighterSchema.parse(invalidFighter)).toThrow();
    });

    it('should validate fighter with optional fields', () => {
      const fighterWithOptionals = {
        ...validFighter,
        imageUrl: 'https://example.com/mario.png',
        iconUrl: 'https://example.com/mario-icon.png',
      };
      
      expect(() => FighterSchema.parse(fighterWithOptionals)).not.toThrow();
    });
  });

  describe('MoveSchema', () => {
    const validMove: Move = {
      id: 'mario_jab1',
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
      onWhiff: -5,
      damage: 2.2,
      baseKnockback: 8,
      knockbackGrowth: 25,
      range: 'close',
      hitboxData: {
        hitboxes: [{
          id: 1,
          damage: 2.2,
          angle: 361,
          baseKnockback: 8,
          knockbackGrowth: 25,
          hitboxType: 'normal',
          effect: 'normal',
          size: 1.6,
          position: { x: 0, y: 0, z: 0 },
        }],
        multihit: false,
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
        priority: 2,
        transcendentPriority: false,
      },
    };

    it('should validate a valid move', () => {
      expect(() => MoveSchema.parse(validMove)).not.toThrow();
    });

    it('should reject move with invalid startup frames', () => {
      const invalidMove = { ...validMove, startup: 0 };
      
      expect(() => MoveSchema.parse(invalidMove)).toThrow();
    });

    it('should reject move with invalid category', () => {
      const invalidMove = { ...validMove, category: 'invalid' };
      
      expect(() => MoveSchema.parse(invalidMove)).toThrow();
    });

    it('should validate move with array damage', () => {
      const moveWithArrayDamage = { ...validMove, damage: [2.2, 3.0, 4.5] };
      
      expect(() => MoveSchema.parse(moveWithArrayDamage)).not.toThrow();
    });

    it('should validate move with kill properties', () => {
      const killMove = {
        ...validMove,
        properties: {
          ...validMove.properties,
          isKillMove: true,
          killPercent: 120,
        },
      };
      
      expect(() => MoveSchema.parse(killMove)).not.toThrow();
    });
  });

  describe('CalculationOptionsSchema', () => {
    const validOptions: CalculationOptions = {
      staleness: 'fresh',
      rangeFilter: ['close', 'mid'],
      allowOutOfShield: true,
      allowGuardCancel: true,
      allowShieldDrop: true,
      allowPerfectShield: false,
      allowRolling: true,
      allowSpotDodge: false,
      minimumFrameAdvantage: 0,
      maximumFrameAdvantage: 20,
      minimumDamage: 5,
      onlyGuaranteed: false,
      includeKillMoves: true,
      includeDIOptions: false,
      includeSDIOptions: false,
      positionFilter: ['center', 'edge'],
    };

    it('should validate valid calculation options', () => {
      expect(() => CalculationOptionsSchema.parse(validOptions)).not.toThrow();
    });

    it('should reject options with invalid staleness', () => {
      const invalidOptions = { ...validOptions, staleness: 'invalid' };
      
      expect(() => CalculationOptionsSchema.parse(invalidOptions)).toThrow();
    });

    it('should reject options with invalid range filter', () => {
      const invalidOptions = { ...validOptions, rangeFilter: ['invalid'] };
      
      expect(() => CalculationOptionsSchema.parse(invalidOptions)).toThrow();
    });

    it('should validate options with all ranges', () => {
      const allRangeOptions = {
        ...validOptions,
        rangeFilter: ['close', 'mid', 'far', 'projectile'],
      };
      
      expect(() => CalculationOptionsSchema.parse(allRangeOptions)).not.toThrow();
    });
  });

  describe('PunishResultSchema', () => {
    const validPunishResult: PunishResult = {
      defendingFighter: {
        id: 'mario',
        name: 'Mario',
        displayName: 'マリオ',
        series: 'Super Mario',
        weight: 98,
        fallSpeed: 1.5,
        fastFallSpeed: 2.4,
        gravity: 0.087,
        walkSpeed: 1.05,
        runSpeed: 1.6,
        airSpeed: 1.15,
        moves: [],
        shieldData: {
          shieldHealth: 50,
          shieldRegen: 0.07,
          shieldRegenDelay: 90,
          shieldStun: 0.725,
          shieldReleaseFrames: 11,
          shieldGrabFrames: 11,
          outOfShieldOptions: [],
        },
        movementData: {
          jumpSquat: 3,
          fullHopHeight: 36.57,
          shortHopHeight: 15.02,
          airJumps: 2,
          dodgeFrames: {
            spotDodge: { startup: 3, active: 2, recovery: 25, total: 30 },
            airDodge: { startup: 3, active: 2, recovery: 40, total: 45 },
          },
          rollFrames: {
            forward: { startup: 4, active: 12, recovery: 14, total: 30 },
            backward: { startup: 4, active: 12, recovery: 14, total: 30 },
          },
        },
      },
      punishingMoves: [],
      frameAdvantage: 5,
      attackingMove: {
        id: 'mario_jab1',
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
        onWhiff: -5,
        damage: 2.2,
        baseKnockback: 8,
        knockbackGrowth: 25,
        range: 'close',
        hitboxData: {
          hitboxes: [{
            id: 1,
            damage: 2.2,
            angle: 361,
            baseKnockback: 8,
            knockbackGrowth: 25,
            hitboxType: 'normal',
            effect: 'normal',
            size: 1.6,
            position: { x: 0, y: 0, z: 0 },
          }],
          multihit: false,
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
          priority: 2,
          transcendentPriority: false,
        },
      },
      calculationContext: {
        staleness: 'fresh',
        shieldDamage: 2.2,
        shieldStun: 5,
        range: 'close',
        position: 'center',
        options: {
          staleness: 'fresh',
          rangeFilter: ['close'],
          allowOutOfShield: true,
          allowGuardCancel: true,
          allowShieldDrop: true,
          allowPerfectShield: false,
          allowRolling: true,
          allowSpotDodge: false,
          minimumFrameAdvantage: 0,
          maximumFrameAdvantage: 20,
          minimumDamage: 0,
          onlyGuaranteed: false,
          includeKillMoves: true,
          includeDIOptions: false,
          includeSDIOptions: false,
          positionFilter: [],
        },
      },
    };

    it('should validate a valid punish result', () => {
      expect(() => PunishResultSchema.parse(validPunishResult)).not.toThrow();
    });

    it('should reject punish result with invalid frame advantage', () => {
      const invalidResult = { ...validPunishResult, frameAdvantage: 1000 };
      
      expect(() => PunishResultSchema.parse(invalidResult)).toThrow();
    });
  });
});

describe('Validation Functions', () => {
  describe('validateFighter', () => {
    it('should validate and return a valid fighter', () => {
      const validFighter = {
        id: 'mario',
        name: 'Mario',
        displayName: 'マリオ',
        series: 'Super Mario',
        weight: 98,
        fallSpeed: 1.5,
        fastFallSpeed: 2.4,
        gravity: 0.087,
        walkSpeed: 1.05,
        runSpeed: 1.6,
        airSpeed: 1.15,
        moves: [],
        shieldData: {
          shieldHealth: 50,
          shieldRegen: 0.07,
          shieldRegenDelay: 90,
          shieldStun: 0.725,
          shieldReleaseFrames: 11,
          shieldGrabFrames: 11,
          outOfShieldOptions: [],
        },
        movementData: {
          jumpSquat: 3,
          fullHopHeight: 36.57,
          shortHopHeight: 15.02,
          airJumps: 2,
          dodgeFrames: {
            spotDodge: { startup: 3, active: 2, recovery: 25, total: 30 },
            airDodge: { startup: 3, active: 2, recovery: 40, total: 45 },
          },
          rollFrames: {
            forward: { startup: 4, active: 12, recovery: 14, total: 30 },
            backward: { startup: 4, active: 12, recovery: 14, total: 30 },
          },
        },
      };

      const result = validateFighter(validFighter);
      expect(result).toEqual(validFighter);
    });

    it('should throw error for invalid fighter', () => {
      const invalidFighter = { id: 'mario' };
      
      expect(() => validateFighter(invalidFighter)).toThrow();
    });
  });

  describe('safeParse', () => {
    it('should return success for valid data', () => {
      const validData = { staleness: 'fresh', rangeFilter: ['close'] };
      const result = safeParse(CalculationOptionsSchema.partial(), validData);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validData);
      expect(result.errors).toBeUndefined();
    });

    it('should return error for invalid data', () => {
      const invalidData = { staleness: 'invalid' };
      const result = safeParse(CalculationOptionsSchema, invalidData);
      
      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.errors).toBeDefined();
      expect(result.errors).toBeInstanceOf(z.ZodError);
    });
  });

  describe('isValidData', () => {
    it('should return true for valid data', () => {
      const validData = { staleness: 'fresh', rangeFilter: ['close'] };
      const result = isValidData(CalculationOptionsSchema.partial(), validData);
      
      expect(result).toBe(true);
    });

    it('should return false for invalid data', () => {
      const invalidData = { staleness: 'invalid' };
      const result = isValidData(CalculationOptionsSchema, invalidData);
      
      expect(result).toBe(false);
    });
  });

  describe('createValidationResult', () => {
    it('should create validation result from zod error', () => {
      const invalidData = { staleness: 'invalid' };
      
      try {
        CalculationOptionsSchema.parse(invalidData);
      } catch (error) {
        if (error instanceof z.ZodError) {
          const result = createValidationResult(error);
          
          expect(result.isValid).toBe(false);
          expect(result.errors.length).toBeGreaterThan(0);
          expect(result.errors[0].field).toBe('staleness');
          expect(result.warnings).toEqual([]);
        }
      }
    });
  });

  describe('getValidationMessage', () => {
    it('should return appropriate message for invalid type', () => {
      const issue: z.ZodIssue = {
        code: 'invalid_type',
        expected: 'string',
        received: 'number',
        path: ['name'],
        message: 'Expected string, received number',
      };
      
      const message = getValidationMessage(issue);
      expect(message).toBe('型が正しくありません');
    });

    it('should return appropriate message for invalid enum', () => {
      const issue: z.ZodIssue = {
        code: 'invalid_enum_value',
        options: ['fresh', 'stale1'],
        received: 'invalid',
        path: ['staleness'],
        message: 'Invalid enum value',
      };
      
      const message = getValidationMessage(issue);
      expect(message).toBe('許可されていない値です');
    });

    it('should return appropriate message for invalid URL', () => {
      const issue: z.ZodIssue = {
        code: 'invalid_string',
        validation: 'url',
        path: ['imageUrl'],
        message: 'Invalid URL',
      };
      
      const message = getValidationMessage(issue);
      expect(message).toBe('URLが無効です');
    });

    it('should return original message for unknown error codes', () => {
      const issue: z.ZodIssue = {
        code: 'custom' as any,
        path: ['test'],
        message: 'Custom error message',
      };
      
      const message = getValidationMessage(issue);
      expect(message).toBe('Custom error message');
    });
  });
});

describe('Edge Cases and Error Handling', () => {
  describe('Complex nested validation', () => {
    it('should validate complex nested fighter data', () => {
      const complexFighter = {
        id: 'mario',
        name: 'Mario',
        displayName: 'マリオ',
        series: 'Super Mario',
        weight: 98,
        fallSpeed: 1.5,
        fastFallSpeed: 2.4,
        gravity: 0.087,
        walkSpeed: 1.05,
        runSpeed: 1.6,
        airSpeed: 1.15,
        moves: [{
          id: 'mario_jab1',
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
          onWhiff: -5,
          damage: [2.2, 3.0],
          baseKnockback: 8,
          knockbackGrowth: 25,
          range: 'close',
          hitboxData: {
            hitboxes: [{
              id: 1,
              damage: 2.2,
              angle: 361,
              baseKnockback: 8,
              knockbackGrowth: 25,
              hitboxType: 'normal',
              effect: 'fire',
              size: 1.6,
              position: { x: 0, y: 5.5, z: 2.1 },
            }],
            multihit: true,
            multihitFrames: [2, 4, 6],
          },
          properties: {
            isKillMove: false,
            hasArmor: true,
            armorThreshold: 5.0,
            isCommandGrab: false,
            isSpike: false,
            isMeteor: false,
            hasInvincibility: true,
            invincibilityFrames: [1, 2, 3],
            hasIntangibility: false,
            canClank: true,
            priority: 2,
            transcendentPriority: false,
          },
          notes: 'Fast startup jab with good frame data',
        }],
        shieldData: {
          shieldHealth: 50,
          shieldRegen: 0.07,
          shieldRegenDelay: 90,
          shieldStun: 0.725,
          shieldReleaseFrames: 11,
          shieldGrabFrames: 11,
          outOfShieldOptions: [{
            move: 'nair',
            frames: 3,
            type: 'nair',
            effectiveness: 8,
          }],
        },
        movementData: {
          jumpSquat: 3,
          fullHopHeight: 36.57,
          shortHopHeight: 15.02,
          airJumps: 2,
          dodgeFrames: {
            spotDodge: { startup: 3, active: 2, recovery: 25, total: 30 },
            airDodge: { startup: 3, active: 2, recovery: 40, total: 45 },
          },
          rollFrames: {
            forward: { startup: 4, active: 12, recovery: 14, total: 30 },
            backward: { startup: 4, active: 12, recovery: 14, total: 30 },
          },
        },
        imageUrl: 'https://example.com/mario.png',
        iconUrl: 'https://example.com/mario-icon.png',
      };

      expect(() => FighterSchema.parse(complexFighter)).not.toThrow();
    });
  });

  describe('Boundary value testing', () => {
    it('should handle minimum and maximum values correctly', () => {
      const boundaryOptions = {
        staleness: 'fresh',
        rangeFilter: ['close'],
        allowOutOfShield: true,
        allowGuardCancel: true,
        allowShieldDrop: true,
        allowPerfectShield: true,
        allowRolling: true,
        allowSpotDodge: true,
        minimumFrameAdvantage: -999,
        maximumFrameAdvantage: 999,
        minimumDamage: 0,
        onlyGuaranteed: false,
        includeKillMoves: true,
        includeDIOptions: false,
        includeSDIOptions: false,
        positionFilter: [],
      };

      expect(() => CalculationOptionsSchema.parse(boundaryOptions)).not.toThrow();
    });

    it('should reject values outside boundaries', () => {
      const outOfBoundsOptions = {
        staleness: 'fresh',
        rangeFilter: ['close'],
        allowOutOfShield: true,
        allowGuardCancel: true,
        allowShieldDrop: true,
        allowPerfectShield: true,
        allowRolling: true,
        allowSpotDodge: true,
        minimumFrameAdvantage: -1000,
        maximumFrameAdvantage: 1000,
        minimumDamage: -1,
        onlyGuaranteed: false,
        includeKillMoves: true,
        includeDIOptions: false,
        includeSDIOptions: false,
        positionFilter: [],
      };

      expect(() => CalculationOptionsSchema.parse(outOfBoundsOptions)).toThrow();
    });
  });
});