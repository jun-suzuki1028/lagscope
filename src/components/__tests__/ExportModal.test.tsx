import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ExportModal from '../ExportModal';
import { ExportService } from '../../services/ExportService';
import type { PunishResult, Fighter, Move, PunishMove } from '../../types/frameData';

// ExportServiceをモック
vi.mock('../../services/ExportService', () => ({
  ExportService: {
    validateResults: vi.fn(),
    exportAndDownload: vi.fn(),
  },
}));

describe('ExportModal', () => {
  const mockOnClose = vi.fn();
  
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
      shieldDropFrames: 4,
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

  it('モーダルが閉じている場合は何も表示しない', () => {
    render(
      <ExportModal
        isOpen={false}
        onClose={mockOnClose}
        results={mockResults}
      />
    );

    expect(screen.queryByText('データエクスポート')).not.toBeInTheDocument();
  });

  it('モーダルが開いている場合はエクスポートフォームを表示する', () => {
    render(
      <ExportModal
        isOpen={true}
        onClose={mockOnClose}
        results={mockResults}
      />
    );

    expect(screen.getByText('データエクスポート')).toBeInTheDocument();
    expect(screen.getByText('エクスポート形式')).toBeInTheDocument();
    expect(screen.getByText('CSV')).toBeInTheDocument();
    expect(screen.getByText('TXT')).toBeInTheDocument();
    expect(screen.getByText('JSON')).toBeInTheDocument();
  });

  it('デフォルトでCSVフォーマットが選択されている', () => {
    render(
      <ExportModal
        isOpen={true}
        onClose={mockOnClose}
        results={mockResults}
      />
    );

    const csvRadio = screen.getByDisplayValue('csv');
    expect(csvRadio).toBeChecked();
  });

  it('フォーマットの変更ができる', () => {
    render(
      <ExportModal
        isOpen={true}
        onClose={mockOnClose}
        results={mockResults}
      />
    );

    const txtRadio = screen.getByDisplayValue('txt');
    fireEvent.click(txtRadio);
    expect(txtRadio).toBeChecked();
  });

  it('メタデータ含めるオプションがデフォルトで選択されている', () => {
    render(
      <ExportModal
        isOpen={true}
        onClose={mockOnClose}
        results={mockResults}
      />
    );

    const metadataCheckbox = screen.getByLabelText('メタデータを含める');
    expect(metadataCheckbox).toBeChecked();
  });

  it('ファイル名を入力できる', () => {
    render(
      <ExportModal
        isOpen={true}
        onClose={mockOnClose}
        results={mockResults}
      />
    );

    const fileNameInput = screen.getByLabelText('ファイル名 (省略可)');
    fireEvent.change(fileNameInput, { target: { value: 'custom-filename' } });
    expect(fileNameInput).toHaveValue('custom-filename');
  });

  it('データ件数を正しく表示する', () => {
    render(
      <ExportModal
        isOpen={true}
        onClose={mockOnClose}
        results={mockResults}
      />
    );

    expect(screen.getByText('エクスポート対象: 1件の結果')).toBeInTheDocument();
    expect(screen.getByText('反撃技数: 1')).toBeInTheDocument();
    expect(screen.getByText('キャラクター数: 1')).toBeInTheDocument();
  });

  it('エクスポートボタンをクリックしてエクスポートを実行する', async () => {
    (ExportService.validateResults as any).mockImplementation(() => {});
    (ExportService.exportAndDownload as any).mockImplementation(() => {});

    render(
      <ExportModal
        isOpen={true}
        onClose={mockOnClose}
        results={mockResults}
      />
    );

    const exportButton = screen.getByText('エクスポート');
    fireEvent.click(exportButton);

    expect(ExportService.validateResults).toHaveBeenCalledWith(mockResults);
    expect(ExportService.exportAndDownload).toHaveBeenCalledWith(mockResults, {
      format: 'csv',
      includeMetadata: true,
      fileName: undefined,
    });

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('カスタムファイル名でエクスポートを実行する', async () => {
    (ExportService.validateResults as any).mockImplementation(() => {});
    (ExportService.exportAndDownload as any).mockImplementation(() => {});

    render(
      <ExportModal
        isOpen={true}
        onClose={mockOnClose}
        results={mockResults}
      />
    );

    const fileNameInput = screen.getByLabelText('ファイル名 (省略可)');
    fireEvent.change(fileNameInput, { target: { value: 'custom-filename' } });

    const exportButton = screen.getByText('エクスポート');
    fireEvent.click(exportButton);

    expect(ExportService.exportAndDownload).toHaveBeenCalledWith(mockResults, {
      format: 'csv',
      includeMetadata: true,
      fileName: 'custom-filename',
    });
  });

  it('エクスポートでエラーが発生した場合はエラーメッセージを表示する', async () => {
    (ExportService.validateResults as any).mockImplementation(() => {
      throw new Error('テストエラー');
    });

    render(
      <ExportModal
        isOpen={true}
        onClose={mockOnClose}
        results={mockResults}
      />
    );

    const exportButton = screen.getByText('エクスポート');
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(screen.getByText('テストエラー')).toBeInTheDocument();
    });
  });

  it.skip('データが空の場合はエラーメッセージを表示する', async () => {
    render(
      <ExportModal
        isOpen={true}
        onClose={mockOnClose}
        results={[]}
      />
    );

    const exportButton = screen.getByText('エクスポート');
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(screen.getByText('エクスポートするデータがありません')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('閉じるボタンをクリックしてモーダルを閉じる', () => {
    render(
      <ExportModal
        isOpen={true}
        onClose={mockOnClose}
        results={mockResults}
      />
    );

    const closeButton = screen.getByRole('button', { name: '' }); // X button
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('キャンセルボタンをクリックしてモーダルを閉じる', () => {
    render(
      <ExportModal
        isOpen={true}
        onClose={mockOnClose}
        results={mockResults}
      />
    );

    const cancelButton = screen.getByText('キャンセル');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('エクスポート中は操作を無効にする', async () => {
    (ExportService.validateResults as any).mockImplementation(() => {});
    (ExportService.exportAndDownload as any).mockImplementation(() => {
      return new Promise(resolve => setTimeout(resolve, 1000));
    });

    render(
      <ExportModal
        isOpen={true}
        onClose={mockOnClose}
        results={mockResults}
      />
    );

    const exportButton = screen.getByText('エクスポート');
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(screen.getByText('エクスポート中...')).toBeInTheDocument();
    });

    // エクスポート中は各要素が無効化されている
    expect(screen.getByDisplayValue('csv')).toBeDisabled();
    expect(screen.getByLabelText('メタデータを含める')).toBeDisabled();
    expect(screen.getByLabelText('ファイル名 (省略可)')).toBeDisabled();
    expect(screen.getByText('キャンセル')).toBeDisabled();
  });

  it('カスタムクラス名が適用される', () => {
    const customClass = 'custom-export-modal';
    render(
      <ExportModal
        isOpen={true}
        onClose={mockOnClose}
        results={mockResults}
        className={customClass}
      />
    );

    const modal = screen.getByText('データエクスポート').closest('div')?.parentElement?.parentElement;
    expect(modal).toHaveClass(customClass);
  });
});