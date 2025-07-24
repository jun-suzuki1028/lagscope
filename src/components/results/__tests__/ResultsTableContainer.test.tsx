import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ResultsTableContainer from '../ResultsTableContainer';
import type { PunishResult, Fighter, Move, PunishMove } from '../../../types/frameData';

// useMediaQueryフックをモック
vi.mock('../../../hooks/useMediaQuery', () => ({
  useBreakpoint: () => ({
    isDesktop: true,
    isMobile: false,
  }),
}));

describe('ResultsTableContainer', () => {
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
      shieldRegenDelay: 30,
      shieldStun: 0,
      shieldReleaseFrames: 11,
      shieldGrabFrames: 8,
      outOfShieldOptions: [],
    },
    movementData: {
      jumpSquat: 3,
      fullHopHeight: 34.5,
      shortHopHeight: 16.6,
      airJumps: 2,
      dodgeFrames: {
        spotDodge: { startup: 3, active: 2, recovery: 22, total: 27 },
        airDodge: { startup: 3, active: 29, recovery: 10, total: 42 },
      },
      rollFrames: {
        forward: { startup: 4, active: 15, recovery: 15, total: 34 },
        backward: { startup: 4, active: 15, recovery: 15, total: 34 },
      },
    },
  };

  const mockMove: Move = {
    id: 'jab1',
    name: 'Jab 1',
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
    onWhiff: 0,
    damage: 2.2,
    baseKnockback: 25,
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
    totalFrames: 13,
    isGuaranteed: true,
    probability: 1.0,
    damage: 2.2,
  };

  const mockResults: PunishResult[] = [
    {
      defendingFighter: mockFighter,
      punishingMoves: [mockPunishMove],
      frameAdvantage: 9,
      attackingMove: mockMove,
      calculationContext: {
        staleness: 'none',
        shieldDamage: 2.2,
        shieldStun: 3,
        range: 'close',
        position: 'neutral',
        options: {
          staleness: 'none',
          rangeFilter: ['close', 'mid', 'far'],
          minimumFrameAdvantage: 0,
          maximumFrameAdvantage: 999,
          minimumDamage: 0,
          onlyGuaranteed: false,
          includeKillMoves: true,
          includeDIOptions: false,
          includeSDIOptions: false,
          positionFilter: ['neutral'],
        },
      },
    },
  ];

  it('結果が空の場合、適切なメッセージを表示する', () => {
    render(<ResultsTableContainer results={[]} />);
    
    expect(screen.getByText('全0件を表示')).toBeInTheDocument();
  });

  it('結果がある場合、テーブルを表示する', () => {
    render(<ResultsTableContainer results={mockResults} />);
    
    // フィルター設定が表示される
    expect(screen.getByText('フィルター設定')).toBeInTheDocument();
    
    // 結果情報が表示される
    expect(screen.getByText('全1件を表示')).toBeInTheDocument();
    
    // エクスポートボタンが表示される
    expect(screen.getByText('結果をエクスポート (1件)')).toBeInTheDocument();
    
    // テーブルデータが表示される（デスクトップ表示）
    expect(screen.getByText('マリオ')).toBeInTheDocument();
    expect(screen.getByText('ジャブ1')).toBeInTheDocument();
  });

  it('フィルター機能が正常に動作する', () => {
    render(<ResultsTableContainer results={mockResults} />);
    
    // 確定反撃のみフィルターをチェック
    const guaranteedFilter = screen.getByLabelText('確定反撃のみ');
    fireEvent.click(guaranteedFilter);
    
    // 結果が表示される（この技は確定なので）
    expect(screen.getByText('マリオ')).toBeInTheDocument();
    expect(screen.getByText('ジャブ1')).toBeInTheDocument();
  });

  it('ソート機能が正常に動作する', () => {
    render(<ResultsTableContainer results={mockResults} />);
    
    // テーブルヘッダーのダメージ列を取得
    const allDamageTexts = screen.getAllByText(/ダメージ/);
    const damageHeader = allDamageTexts.find(el => el.tagName === 'TH');
    expect(damageHeader).toBeInTheDocument();
    
    // 技名でソート
    const nameHeader = screen.getByRole('columnheader', { name: /技名/ });
    fireEvent.click(nameHeader);
    
    // データが表示されていることを確認
    expect(screen.getByText('ジャブ1')).toBeInTheDocument();
  });

  it('エクスポートボタンが機能する', () => {
    render(<ResultsTableContainer results={mockResults} />);
    
    const exportButton = screen.getByText('結果をエクスポート (1件)');
    fireEvent.click(exportButton);
    
    // エクスポートモーダルが表示される
    expect(screen.getByText('データエクスポート')).toBeInTheDocument();
  });

  it('カスタムクラス名が適用される', () => {
    const customClass = 'custom-test-class';
    const { container } = render(
      <ResultsTableContainer results={mockResults} className={customClass} />
    );
    
    expect(container.firstChild).toHaveClass(customClass);
  });

  it('ローディング状態を正しく表示する', () => {
    render(<ResultsTableContainer results={mockResults} isLoading={true} />);
    
    // ローディングスピナーが表示される
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });
});