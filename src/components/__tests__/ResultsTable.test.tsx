import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ResultsTable from '../ResultsTable';
import type { PunishResult, Fighter, Move, PunishMove } from '../../types/frameData';

// ResultsTableContainerをモック
vi.mock('../results/ResultsTableContainer', () => ({
  default: ({ results, className }: { results: PunishResult[], className?: string }) => (
    <div className={className} data-testid="results-table-container">
      Results: {results.length} items
    </div>
  ),
}));

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
    totalFrames: 9,
    isGuaranteed: true,
    probability: 1.0,
    damage: 3,
  };

  const mockResults: PunishResult[] = [
    {
      defendingFighter: mockFighter,
      punishingMoves: [mockPunishMove],
      frameAdvantage: 5,
      attackingMove: mockMove,
      calculationContext: {
        staleness: 'none',
        shieldDamage: 5,
        shieldStun: 10,
        range: 'close',
        position: 'center',
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
          positionFilter: ['center'],
        },
      },
    },
  ];

  it('後方互換性: 空の結果を正しく処理する', () => {
    render(<ResultsTable results={[]} />);
    
    expect(screen.getByTestId('results-table-container')).toBeInTheDocument();
    expect(screen.getByText('Results: 0 items')).toBeInTheDocument();
  });

  it('後方互換性: 結果データを正しく渡す', () => {
    render(<ResultsTable results={mockResults} />);
    
    expect(screen.getByTestId('results-table-container')).toBeInTheDocument();
    expect(screen.getByText('Results: 1 items')).toBeInTheDocument();
  });

  it('後方互換性: カスタムクラス名を正しく渡す', () => {
    const customClass = 'custom-test-class';
    render(<ResultsTable results={mockResults} className={customClass} />);
    
    const container = screen.getByTestId('results-table-container');
    expect(container).toHaveClass(customClass);
  });

  it('後方互換性: ラッパーコンポーネントとして機能する', () => {
    render(<ResultsTable results={mockResults} />);
    
    // ResultsTableContainerが呼び出されていることを確認
    expect(screen.getByTestId('results-table-container')).toBeInTheDocument();
  });
});