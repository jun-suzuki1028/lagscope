import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ExportService } from '../ExportService';
import type { PunishResult, Fighter, Move, PunishMove } from '../../types/frameData';

// DOM APIのモック
Object.defineProperty(window, 'URL', {
  value: {
    createObjectURL: vi.fn(() => 'mocked-url'),
    revokeObjectURL: vi.fn(),
  },
});

describe('ExportService', () => {
  const mockFighter: Fighter = {
    id: 'mario',
    name: 'Mario',
    displayName: 'マリオ',
    series: 'Super Mario',
    weight: 98,
    fallSpeed: 1.6,
    fastFallSpeed: 2.56,
    gravity: 0.087,
    walkSpeed: 1.05,
    runSpeed: 1.76,
    airSpeed: 1.208,
    moves: [],
    shieldData: {
      shieldHealth: 50,
      shieldRegen: 0.07,
      shieldRegenDelay: 60,
      shieldStun: 0.725,
      shieldReleaseFrames: 11,
      shieldGrabFrames: 7,
      outOfShieldOptions: [],
    },
    movementData: {
      jumpSquat: 3,
      fullHopHeight: 34.4,
      shortHopHeight: 17.2,
      airJumps: 1,
      dodgeFrames: {
        spotDodge: { startup: 3, active: 2, recovery: 25, total: 30 },
        airDodge: { startup: 4, active: 3, recovery: 40, total: 47 },
      },
      rollFrames: {
        forward: { startup: 4, active: 13, recovery: 17, total: 34 },
        backward: { startup: 4, active: 13, recovery: 17, total: 34 },
      },
    },
  };

  const mockMove: Move = {
    id: 'jab1',
    name: 'Jab 1',
    displayName: '弱攻撃1',
    category: 'jab',
    type: 'normal',
    input: 'A',
    startup: 2,
    active: 2,
    recovery: 5,
    totalFrames: 9,
    onShield: -2,
    onHit: 2,
    onWhiff: 0,
    damage: 3,
    baseKnockback: 15,
    knockbackGrowth: 25,
    range: 'close',
    hitboxData: {
      hitboxes: [],
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
      priority: 3,
      transcendentPriority: false,
    },
  };

  const mockPunishMove: PunishMove = {
    move: mockMove,
    method: 'normal',
    totalFrames: 9,
    isGuaranteed: true,
    probability: 1.0,
    damage: 3,
    killPercent: undefined,
  };

  const mockResults: PunishResult[] = [
    {
      defendingFighter: mockFighter,
      punishingMoves: [mockPunishMove],
      frameAdvantage: 5,
      attackingMove: mockMove,
      calculationContext: {
        staleness: 'fresh',
        shieldDamage: 5,
        shieldStun: 10,
        range: 'close',
        position: 'center',
        options: {
          staleness: 'fresh',
          rangeFilter: ['close', 'mid', 'far'],
          allowOutOfShield: true,
          allowGuardCancel: true,
          allowShieldDrop: true,
          allowPerfectShield: true,
          allowRolling: true,
          allowSpotDodge: true,
          minimumFrameAdvantage: 0,
          maximumFrameAdvantage: 999,
          minimumDamage: 0,
          onlyGuaranteed: false,
          includeKillMoves: true,
          includeDIOptions: false,
          includeSDIOptions: false,
          positionFilter: [],
        },
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('validateResults', () => {
    it('有効な結果を検証する', () => {
      expect(() => ExportService.validateResults(mockResults)).not.toThrow();
    });

    it('空の配列でエラーを投げる', () => {
      expect(() => ExportService.validateResults([])).toThrow('エクスポートするデータがありません');
    });

    it('配列でない場合にエラーを投げる', () => {
      expect(() => ExportService.validateResults(null as any)).toThrow('結果は配列である必要があります');
    });

    it('無効な防御キャラクターでエラーを投げる', () => {
      const invalidResults = [
        {
          ...mockResults[0],
          defendingFighter: { ...mockFighter, displayName: '' },
        },
      ];
      expect(() => ExportService.validateResults(invalidResults)).toThrow('防御キャラクターが無効です');
    });

    it('反撃技が空の場合にエラーを投げる', () => {
      const invalidResults = [
        {
          ...mockResults[0],
          punishingMoves: [],
        },
      ];
      expect(() => ExportService.validateResults(invalidResults)).toThrow('反撃技が設定されていません');
    });
  });

  describe('exportToCSV', () => {
    it('CSVフォーマットで正しくエクスポートする', () => {
      const csv = ExportService.exportToCSV(mockResults, {
        format: 'csv',
        includeMetadata: false,
      });

      expect(csv).toContain('防御キャラクター,技名,技タイプ');
      expect(csv).toContain('マリオ');
      expect(csv).toContain('弱攻撃1');
      expect(csv).toContain('通常技');
    });

    it('メタデータを含めてエクスポートする', () => {
      const csv = ExportService.exportToCSV(mockResults, {
        format: 'csv',
        includeMetadata: true,
      });

      expect(csv).toContain('エクスポート日時:');
      expect(csv).toContain('データ件数: 1');
      expect(csv).toContain('キャラクター数: 1');
      expect(csv).toContain('LagScope');
    });

    it('空の結果でエラーを投げる', () => {
      expect(() => ExportService.exportToCSV([], {
        format: 'csv',
        includeMetadata: false,
      })).toThrow('エクスポートするデータがありません');
    });
  });

  describe('exportToText', () => {
    it('テキストフォーマットで正しくエクスポートする', () => {
      const text = ExportService.exportToText(mockResults, {
        format: 'txt',
        includeMetadata: false,
      });

      expect(text).toContain('■ マリオ');
      expect(text).toContain('【確定反撃】');
      expect(text).toContain('• 弱攻撃1');
      expect(text).toContain('(通常技)');
      expect(text).toContain('3%');
    });

    it('メタデータを含めてエクスポートする', () => {
      const text = ExportService.exportToText(mockResults, {
        format: 'txt',
        includeMetadata: true,
      });

      expect(text).toContain('LagScope - スマブラSP確定反撃計算結果');
      expect(text).toContain('エクスポート日時:');
      expect(text).toContain('データ件数: 1');
    });

    it('不確定技を正しく分類する', () => {
      const uncertainResults = [...mockResults];
      uncertainResults[0].punishingMoves[0].isGuaranteed = false;
      uncertainResults[0].punishingMoves[0].probability = 0.8;

      const text = ExportService.exportToText(uncertainResults, {
        format: 'txt',
        includeMetadata: false,
      });

      expect(text).toContain('【不確定反撃】');
      expect(text).toContain('成功率80%');
    });
  });

  describe('exportToJSON', () => {
    it('JSONフォーマットで正しくエクスポートする', () => {
      const json = ExportService.exportToJSON(mockResults, {
        format: 'json',
        includeMetadata: false,
      });

      const parsed = JSON.parse(json);
      expect(parsed.results).toHaveLength(1);
      expect(parsed.results[0].defendingFighter.displayName).toBe('マリオ');
    });

    it('メタデータを含めてエクスポートする', () => {
      const json = ExportService.exportToJSON(mockResults, {
        format: 'json',
        includeMetadata: true,
      });

      const parsed = JSON.parse(json);
      expect(parsed.metadata).toBeDefined();
      expect(parsed.metadata.exportTool).toBe('LagScope');
      expect(parsed.metadata.dataCount).toBe(1);
      expect(parsed.metadata.characterCount).toBe(1);
    });
  });

  describe('export', () => {
    it('指定されたフォーマットでエクスポートする', () => {
      const csvResult = ExportService.export(mockResults, {
        format: 'csv',
        includeMetadata: false,
      });
      expect(csvResult).toContain('防御キャラクター,技名');

      const textResult = ExportService.export(mockResults, {
        format: 'txt',
        includeMetadata: false,
      });
      expect(textResult).toContain('■ マリオ');

      const jsonResult = ExportService.export(mockResults, {
        format: 'json',
        includeMetadata: false,
      });
      expect(() => JSON.parse(jsonResult)).not.toThrow();
    });

    it('未サポートのフォーマットでエラーを投げる', () => {
      expect(() => ExportService.export(mockResults, {
        format: 'xml' as any,
        includeMetadata: false,
      })).toThrow('未サポートの形式です');
    });
  });

  describe('downloadFile', () => {
    let mockAppendChild: any;
    let mockRemoveChild: any;
    let mockClick: any;

    beforeEach(() => {
      mockAppendChild = vi.fn();
      mockRemoveChild = vi.fn();
      mockClick = vi.fn();

      Object.defineProperty(document, 'createElement', {
        value: vi.fn(() => ({
          href: '',
          download: '',
          style: { display: '' },
          click: mockClick,
        })),
        writable: true,
      });

      Object.defineProperty(document.body, 'appendChild', {
        value: mockAppendChild,
        writable: true,
      });

      Object.defineProperty(document.body, 'removeChild', {
        value: mockRemoveChild,
        writable: true,
      });
    });

    it('ファイルを正しくダウンロードする', () => {
      const content = 'test content';
      const fileName = 'test.txt';
      const mimeType = 'text/plain';

      ExportService.downloadFile(content, fileName, mimeType);

      expect(mockClick).toHaveBeenCalled();
      expect(mockAppendChild).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalled();
      expect(window.URL.createObjectURL).toHaveBeenCalled();
      expect(window.URL.revokeObjectURL).toHaveBeenCalled();
    });
  });

  describe('exportAndDownload', () => {
    it('エクスポートしてダウンロードする', () => {
      const downloadFileSpy = vi.spyOn(ExportService, 'downloadFile').mockImplementation(() => {});

      ExportService.exportAndDownload(mockResults, {
        format: 'csv',
        includeMetadata: false,
      });

      expect(downloadFileSpy).toHaveBeenCalledWith(
        expect.stringContaining('防御キャラクター,技名'),
        expect.stringMatching(/lagscope-results-.*\.csv/),
        'text/csv;charset=utf-8'
      );

      downloadFileSpy.mockRestore();
    });

    it('カスタムファイル名を使用する', () => {
      const downloadFileSpy = vi.spyOn(ExportService, 'downloadFile').mockImplementation(() => {});

      ExportService.exportAndDownload(mockResults, {
        format: 'txt',
        includeMetadata: false,
        fileName: 'custom-results.txt',
      });

      expect(downloadFileSpy).toHaveBeenCalledWith(
        expect.any(String),
        'custom-results.txt',
        'text/plain;charset=utf-8'
      );

      downloadFileSpy.mockRestore();
    });
  });
});