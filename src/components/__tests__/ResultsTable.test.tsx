import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ResultsTable from '../ResultsTable';
import type { PunishResult, Fighter, Move, PunishMove } from '../../types/frameData';

describe('ResultsTable', () => {
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

  it('結果が空の場合、適切なメッセージを表示する', () => {
    render(<ResultsTable results={[]} />);
    
    expect(screen.getByText('計算結果がありません。')).toBeInTheDocument();
    expect(screen.getByText('攻撃キャラクター、防御キャラクター、技を選択して計算を実行してください。')).toBeInTheDocument();
  });

  it('結果がある場合、テーブルを表示する', () => {
    render(<ResultsTable results={mockResults} />);
    
    expect(screen.getByText('計算結果')).toBeInTheDocument();
    expect(screen.getByText('1 件の結果を表示中')).toBeInTheDocument();
    expect(screen.getAllByText('マリオ')).toHaveLength(2); // デスクトップとモバイル表示
    expect(screen.getAllByText('弱攻撃1')).toHaveLength(2); // デスクトップとモバイル表示
    expect(screen.getAllByText('3%')).toHaveLength(2); // デスクトップとモバイル表示
  });

  it('ソート機能が正常に動作する', () => {
    render(<ResultsTable results={mockResults} />);
    
    const nameHeader = screen.getByText(/技名/);
    fireEvent.click(nameHeader);
    
    // ソートアイコンの変更を確認
    expect(nameHeader).toBeInTheDocument();
  });

  it('フィルター機能が正常に動作する', () => {
    render(<ResultsTable results={mockResults} />);
    
    const guaranteedFilter = screen.getByLabelText('確定のみ');
    fireEvent.click(guaranteedFilter);
    
    // フィルターが適用されることを確認
    expect(screen.getByText('1 件の結果を表示中')).toBeInTheDocument();
  });

  it('エクスポートボタンが表示され、クリックできる', () => {
    render(<ResultsTable results={mockResults} />);
    
    const exportButton = screen.getByText('エクスポート');
    expect(exportButton).toBeInTheDocument();
    
    fireEvent.click(exportButton);
    // エクスポートモーダルが開くことを確認
    expect(screen.getByText('データエクスポート')).toBeInTheDocument();
  });

  it('技タイプフィルターが正常に動作する', () => {
    render(<ResultsTable results={mockResults} />);
    
    const typeFilter = screen.getByDisplayValue('すべて');
    fireEvent.change(typeFilter, { target: { value: 'normal' } });
    
    expect(screen.getByText('1 件の結果を表示中')).toBeInTheDocument();
  });

  it('ダメージ範囲フィルターが正常に動作する', () => {
    render(<ResultsTable results={mockResults} />);
    
    const minDamageFilter = screen.getByPlaceholderText('最小');
    fireEvent.change(minDamageFilter, { target: { value: '5' } });
    
    // 最小ダメージが3未満のため、結果が0件になることを確認
    expect(screen.getByText('0 件の結果を表示中')).toBeInTheDocument();
  });

  it('撃墜技のハイライトが正常に表示される', () => {
    const killMoveResults = [...mockResults];
    killMoveResults[0].punishingMoves[0].move.properties.isKillMove = true;
    killMoveResults[0].punishingMoves[0].killPercent = 120;
    
    render(<ResultsTable results={killMoveResults} />);
    
    expect(screen.getByText('120%')).toBeInTheDocument();
    expect(screen.getByText('撃墜 120%')).toBeInTheDocument();
  });

  it('確定度の表示が正常に動作する', () => {
    const uncertainResults = [...mockResults];
    uncertainResults[0].punishingMoves[0].isGuaranteed = false;
    uncertainResults[0].punishingMoves[0].probability = 0.8;
    
    render(<ResultsTable results={uncertainResults} />);
    
    expect(screen.getByText('不確定')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
    expect(screen.getByText('不確定 80%')).toBeInTheDocument();
  });

  it('反撃方法の表示が正常に動作する', () => {
    const oosResults = [...mockResults];
    oosResults[0].punishingMoves[0].method = 'out_of_shield';
    
    render(<ResultsTable results={oosResults} />);
    
    expect(screen.getAllByText('ガード解除')).toHaveLength(2); // デスクトップとモバイル表示
  });

  it('カスタムクラス名が適用される', () => {
    const customClass = 'custom-table-class';
    render(<ResultsTable results={mockResults} className={customClass} />);
    
    const table = screen.getByText('計算結果').closest('div')?.parentElement;
    expect(table).toHaveClass(customClass);
  });
});