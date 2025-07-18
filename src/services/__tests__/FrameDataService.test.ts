import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FrameDataService } from '../FrameDataService';
import { Fighter } from '../../types/frameData';

// Mock fetch
const mockFetch = vi.fn();
(globalThis as any).fetch = mockFetch;

describe('FrameDataService', () => {
  let service: FrameDataService;

  beforeEach(() => {
    service = FrameDataService.getInstance();
    service.clearCache();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getFighter', () => {
    it('正常にファイターデータを取得する', async () => {
      const mockFighterData: Fighter = {
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
        moves: [],
        shieldData: {
          shieldHealth: 50,
          shieldRegen: 0.07,
          shieldRegenDelay: 30,
          shieldStun: 0.8665,
          shieldReleaseFrames: 11,
          shieldDropFrames: 4,
          shieldGrabFrames: 6,
          outOfShieldOptions: []
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

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockFighterData)
      });

      const result = await service.getFighter('mario');
      expect(result).toEqual(mockFighterData);
      expect(mockFetch).toHaveBeenCalledWith('/data/characters/mario.json', expect.any(Object));
    });

    it('キャッシュからファイターデータを取得する', async () => {
      const mockFighterData: Fighter = {
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
        moves: [],
        shieldData: {
          shieldHealth: 50,
          shieldRegen: 0.07,
          shieldRegenDelay: 30,
          shieldStun: 0.8665,
          shieldReleaseFrames: 11,
          shieldDropFrames: 4,
          shieldGrabFrames: 6,
          outOfShieldOptions: []
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

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockFighterData)
      });

      // 最初の呼び出し
      await service.getFighter('mario');

      // 2回目の呼び出し（キャッシュから取得）
      const result = await service.getFighter('mario');
      expect(result).toEqual(mockFighterData);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('404エラーでNOT_FOUNDエラーを投げる', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      await expect(service.getFighter('nonexistent')).rejects.toThrow('Fighter \'nonexistent\' not found');
    });

    it('ネットワークエラーでNETWORK_ERRORを投げる', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network failed'));

      await expect(service.getFighter('mario')).rejects.toThrow('Failed to load fighter data');
    });

    it('不正なJSONでVALIDATION_ERRORを投げる', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ invalid: 'data' })
      });

      await expect(service.getFighter('mario')).rejects.toThrow('Invalid fighter data format');
    });
  });

  describe('getAllFighters', () => {
    it('正常にファイター一覧を取得する', async () => {
      const mockFightersData: Fighter[] = [
        {
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
          moves: [],
          shieldData: {
            shieldHealth: 50,
            shieldRegen: 0.07,
            shieldRegenDelay: 30,
            shieldStun: 0.8665,
            shieldReleaseFrames: 11,
            shieldDropFrames: 4,
            shieldGrabFrames: 6,
            outOfShieldOptions: []
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
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockFightersData)
      });

      const result = await service.getAllFighters();
      expect(result).toEqual(mockFightersData);
      expect(mockFetch).toHaveBeenCalledWith('/data/characters/index.json', expect.any(Object));
    });
  });

  describe('getFightersByIds', () => {
    it('複数のファイターを正常に取得する', async () => {
      const mockMarioData: Fighter = {
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
        moves: [],
        shieldData: {
          shieldHealth: 50,
          shieldRegen: 0.07,
          shieldRegenDelay: 30,
          shieldStun: 0.8665,
          shieldReleaseFrames: 11,
          shieldDropFrames: 4,
          shieldGrabFrames: 6,
          outOfShieldOptions: []
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

      const mockLinkData: Fighter = {
        ...mockMarioData,
        id: 'link',
        name: 'Link',
        displayName: 'リンク',
        series: 'The Legend of Zelda',
        weight: 104
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockMarioData)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockLinkData)
        });

      const result = await service.getFightersByIds(['mario', 'link']);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(mockMarioData);
      expect(result[1]).toEqual(mockLinkData);
    });

    it('一部のファイターが失敗した場合でも成功したものを返す', async () => {
      const mockMarioData: Fighter = {
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
        moves: [],
        shieldData: {
          shieldHealth: 50,
          shieldRegen: 0.07,
          shieldRegenDelay: 30,
          shieldStun: 0.8665,
          shieldReleaseFrames: 11,
          shieldDropFrames: 4,
          shieldGrabFrames: 6,
          outOfShieldOptions: []
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

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockMarioData)
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 404
        });

      const result = await service.getFightersByIds(['mario', 'nonexistent']);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockMarioData);
    });
  });

  describe('clearCache', () => {
    it('キャッシュをクリアする', async () => {
      const mockFighterData: Fighter = {
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
        moves: [],
        shieldData: {
          shieldHealth: 50,
          shieldRegen: 0.07,
          shieldRegenDelay: 30,
          shieldStun: 0.8665,
          shieldReleaseFrames: 11,
          shieldDropFrames: 4,
          shieldGrabFrames: 6,
          outOfShieldOptions: []
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

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockFighterData)
      });

      // データを取得してキャッシュする
      await service.getFighter('mario');
      expect(service.getCacheSize()).toBe(1);

      // キャッシュをクリア
      service.clearCache();
      expect(service.getCacheSize()).toBe(0);

      // 再度取得すると新しいfetchが呼ばれる
      await service.getFighter('mario');
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });
});