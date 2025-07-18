import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { MoveSelector } from '../MoveSelector';
import { useAppStore } from '../../stores/app-store';
import { Fighter, Move } from '../../types/frameData';

// Mock the store
vi.mock('../../stores/app-store');

// Mock the debounce hook to return value immediately
vi.mock('../../hooks/useDebounce', () => ({
  useDebounce: (value: string) => value,
}));

const mockMoves: Move[] = [
  {
    id: 'mario-jab1',
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
    onWhiff: -2,
    damage: 2.2,
    baseKnockback: 8,
    knockbackGrowth: 20,
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
      priority: 1,
      transcendentPriority: false,
    },
  },
  {
    id: 'mario-utilt',
    name: 'Up Tilt',
    displayName: '上強攻撃',
    category: 'tilt',
    type: 'normal',
    input: '上+A',
    startup: 5,
    active: 5,
    recovery: 10,
    totalFrames: 20,
    onShield: -8,
    onHit: 5,
    onWhiff: -8,
    damage: 5.5,
    baseKnockback: 50,
    knockbackGrowth: 120,
    range: 'close',
    hitboxData: {
      hitboxes: [],
      multihit: false,
    },
    properties: {
      isKillMove: true,
      killPercent: 160,
      hasArmor: false,
      isCommandGrab: false,
      isSpike: false,
      isMeteor: false,
      hasInvincibility: false,
      hasIntangibility: false,
      canClank: true,
      priority: 1,
      transcendentPriority: false,
    },
  },
  {
    id: 'mario-fireball',
    name: 'Fireball',
    displayName: 'ファイアボール',
    category: 'special',
    type: 'special',
    input: 'B',
    startup: 17,
    active: 999,
    recovery: 40,
    totalFrames: 57,
    onShield: -20,
    onHit: 10,
    onWhiff: -20,
    damage: 5,
    baseKnockback: 30,
    knockbackGrowth: 50,
    range: 'projectile',
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
      canClank: false,
      priority: 1,
      transcendentPriority: true,
    },
  },
];

const mockFighter: Fighter = {
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
  moves: mockMoves,
  shieldData: {
    shieldHealth: 50,
    shieldRegen: 0.07,
    shieldRegenDelay: 30,
    shieldStun: 0.725,
    shieldReleaseFrames: 11,
    shieldDropFrames: 7,
    shieldGrabFrames: 10,
    outOfShieldOptions: [],
  },
  movementData: {
    jumpSquat: 3,
    fullHopHeight: 34.66,
    shortHopHeight: 15.02,
    airJumps: 1,
    dodgeFrames: {
      spotDodge: { startup: 3, active: 2, recovery: 24, total: 29 },
      airDodge: { startup: 3, active: 2, recovery: 39, total: 44 },
    },
    rollFrames: {
      forward: { startup: 4, active: 16, recovery: 12, total: 32 },
      backward: { startup: 4, active: 16, recovery: 12, total: 32 },
    },
  },
  iconUrl: '/images/mario-icon.png',
};

const mockStore = {
  selectedMove: null,
  setSelectedMove: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  (useAppStore as any).mockReturnValue(mockStore);
});

describe('MoveSelector', () => {
  it('shows message when no fighter is selected', () => {
    render(<MoveSelector selectedFighter={null} />);
    expect(screen.getByText('キャラクターを選択してください')).toBeInTheDocument();
  });

  it('renders fighter name and move count', () => {
    render(<MoveSelector selectedFighter={mockFighter} />);
    expect(screen.getByText('マリオの技選択')).toBeInTheDocument();
    expect(screen.getByText('3個の技が見つかりました')).toBeInTheDocument();
  });

  it('renders search input', () => {
    render(<MoveSelector selectedFighter={mockFighter} />);
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('技を検索...')).toBeInTheDocument();
  });

  it('renders filter selects', () => {
    render(<MoveSelector selectedFighter={mockFighter} />);
    expect(screen.getByLabelText('カテゴリでフィルタ')).toBeInTheDocument();
    expect(screen.getByLabelText('タイプでフィルタ')).toBeInTheDocument();
    expect(screen.getByLabelText('レンジでフィルタ')).toBeInTheDocument();
  });

  it('displays all moves initially', () => {
    render(<MoveSelector selectedFighter={mockFighter} />);
    expect(screen.getByText('ジャブ1')).toBeInTheDocument();
    expect(screen.getByText('上強攻撃')).toBeInTheDocument();
    expect(screen.getByText('ファイアボール')).toBeInTheDocument();
  });

  it('filters moves by search term', async () => {
    const user = userEvent.setup();
    render(<MoveSelector selectedFighter={mockFighter} />);

    const searchInput = screen.getByRole('searchbox');
    await user.type(searchInput, 'ジャブ');

    await waitFor(() => {
      expect(screen.getByText('ジャブ1')).toBeInTheDocument();
      expect(screen.queryByText('上強攻撃')).not.toBeInTheDocument();
      expect(screen.queryByText('ファイアボール')).not.toBeInTheDocument();
    });
  });

  it('filters moves by category', async () => {
    const user = userEvent.setup();
    render(<MoveSelector selectedFighter={mockFighter} />);

    const categorySelect = screen.getByLabelText('カテゴリでフィルタ');
    await user.selectOptions(categorySelect, 'special');

    await waitFor(() => {
      expect(screen.getByText('ファイアボール')).toBeInTheDocument();
      expect(screen.queryByText('ジャブ1')).not.toBeInTheDocument();
      expect(screen.queryByText('上強攻撃')).not.toBeInTheDocument();
    });
  });

  it('filters moves by type', async () => {
    const user = userEvent.setup();
    render(<MoveSelector selectedFighter={mockFighter} />);

    const typeSelect = screen.getByLabelText('タイプでフィルタ');
    await user.selectOptions(typeSelect, 'special');

    await waitFor(() => {
      expect(screen.getByText('ファイアボール')).toBeInTheDocument();
      expect(screen.queryByText('ジャブ1')).not.toBeInTheDocument();
      expect(screen.queryByText('上強攻撃')).not.toBeInTheDocument();
    });
  });

  it('filters moves by range', async () => {
    const user = userEvent.setup();
    render(<MoveSelector selectedFighter={mockFighter} />);

    const rangeSelect = screen.getByLabelText('レンジでフィルタ');
    await user.selectOptions(rangeSelect, 'projectile');

    await waitFor(() => {
      expect(screen.getByText('ファイアボール')).toBeInTheDocument();
      expect(screen.queryByText('ジャブ1')).not.toBeInTheDocument();
      expect(screen.queryByText('上強攻撃')).not.toBeInTheDocument();
    });
  });

  it('clears filters when clear button is clicked', async () => {
    const user = userEvent.setup();
    render(<MoveSelector selectedFighter={mockFighter} />);

    const searchInput = screen.getByRole('searchbox');
    await user.type(searchInput, 'ジャブ');

    const categorySelect = screen.getByLabelText('カテゴリでフィルタ');
    await user.selectOptions(categorySelect, 'jab');

    const clearButton = screen.getByLabelText('フィルタをクリア');
    await user.click(clearButton);

    await waitFor(() => {
      expect(searchInput).toHaveValue('');
      expect(categorySelect).toHaveValue('all');
      expect(screen.getByText('3個の技が見つかりました')).toBeInTheDocument();
    });
  });

  it('shows no results message when no moves match filters', async () => {
    const user = userEvent.setup();
    render(<MoveSelector selectedFighter={mockFighter} />);

    const searchInput = screen.getByRole('searchbox');
    await user.type(searchInput, 'nonexistent');

    await waitFor(() => {
      expect(screen.getByText('条件に該当する技が見つかりませんでした')).toBeInTheDocument();
    });
  });

  it('displays move details correctly', () => {
    render(<MoveSelector selectedFighter={mockFighter} />);
    
    expect(screen.getByText('A')).toBeInTheDocument(); // input
    expect(screen.getByText('発生: 2F')).toBeInTheDocument(); // startup
    expect(screen.getByText('全体: 9F')).toBeInTheDocument(); // total frames
    expect(screen.getByText('ダメージ: 2.2%')).toBeInTheDocument(); // damage
    expect(screen.getByText('ガード: -2F')).toBeInTheDocument(); // on shield
  });

  it('displays kill move badge for kill moves', () => {
    render(<MoveSelector selectedFighter={mockFighter} />);
    expect(screen.getByText('撃墜技')).toBeInTheDocument();
  });

  it('displays category and range badges', () => {
    render(<MoveSelector selectedFighter={mockFighter} />);
    const jabElements = screen.getAllByText('ジャブ');
    expect(jabElements.length).toBeGreaterThan(0);
    
    const tiltElements = screen.getAllByText('ティルト');
    expect(tiltElements.length).toBeGreaterThan(0);
    
    const specialElements = screen.getAllByText('必殺技');
    expect(specialElements.length).toBeGreaterThan(0);
    
    const closeRangeElements = screen.getAllByText('近');
    expect(closeRangeElements.length).toBeGreaterThan(0);
    
    const farElements = screen.getAllByText('飛');
    expect(farElements.length).toBeGreaterThan(0);
  });

  it('selects move when move card is clicked', async () => {
    const user = userEvent.setup();
    const onMoveSelect = vi.fn();
    render(<MoveSelector selectedFighter={mockFighter} onMoveSelect={onMoveSelect} />);

    const moveCard = screen.getByLabelText('ジャブ1を選択');
    await user.click(moveCard);

    expect(mockStore.setSelectedMove).toHaveBeenCalledWith(mockMoves[0]);
    expect(onMoveSelect).toHaveBeenCalledWith(mockMoves[0]);
  });

  it('handles keyboard navigation', async () => {
    const user = userEvent.setup();
    const onMoveSelect = vi.fn();
    render(<MoveSelector selectedFighter={mockFighter} onMoveSelect={onMoveSelect} />);

    const moveCard = screen.getByLabelText('ジャブ1を選択');
    moveCard.focus();

    await user.keyboard('{Enter}');

    expect(mockStore.setSelectedMove).toHaveBeenCalledWith(mockMoves[0]);
    expect(onMoveSelect).toHaveBeenCalledWith(mockMoves[0]);
  });

  it('handles space key for selection', async () => {
    const user = userEvent.setup();
    const onMoveSelect = vi.fn();
    render(<MoveSelector selectedFighter={mockFighter} onMoveSelect={onMoveSelect} />);

    const moveCard = screen.getByLabelText('ジャブ1を選択');
    moveCard.focus();

    await user.keyboard(' ');

    expect(mockStore.setSelectedMove).toHaveBeenCalledWith(mockMoves[0]);
    expect(onMoveSelect).toHaveBeenCalledWith(mockMoves[0]);
  });

  it('shows selected move in status', () => {
    const selectedMove = mockMoves[0];
    (useAppStore as any).mockReturnValue({
      ...mockStore,
      selectedMove,
    });

    render(<MoveSelector selectedFighter={mockFighter} />);
    expect(screen.getByText('3個の技が見つかりました - 選択中: ジャブ1')).toBeInTheDocument();
  });

  it('applies selected styles to selected move', () => {
    const selectedMove = mockMoves[0];
    (useAppStore as any).mockReturnValue({
      ...mockStore,
      selectedMove,
    });

    render(<MoveSelector selectedFighter={mockFighter} />);
    const moveCard = screen.getByLabelText('ジャブ1を選択');
    expect(moveCard).toHaveClass('border-blue-500', 'bg-blue-50', 'shadow-lg');
  });

  it('filters by input command', async () => {
    const user = userEvent.setup();
    render(<MoveSelector selectedFighter={mockFighter} />);

    const searchInput = screen.getByRole('searchbox');
    await user.type(searchInput, '上+A');

    await waitFor(() => {
      expect(screen.getByText('上強攻撃')).toBeInTheDocument();
      expect(screen.queryByText('ジャブ1')).not.toBeInTheDocument();
      expect(screen.queryByText('ファイアボール')).not.toBeInTheDocument();
    });
  });

  it('combines multiple filters correctly', async () => {
    const user = userEvent.setup();
    render(<MoveSelector selectedFighter={mockFighter} />);

    const categorySelect = screen.getByLabelText('カテゴリでフィルタ');
    await user.selectOptions(categorySelect, 'tilt');

    const typeSelect = screen.getByLabelText('タイプでフィルタ');
    await user.selectOptions(typeSelect, 'normal');

    await waitFor(() => {
      expect(screen.getByText('上強攻撃')).toBeInTheDocument();
      expect(screen.queryByText('ジャブ1')).not.toBeInTheDocument();
      expect(screen.queryByText('ファイアボール')).not.toBeInTheDocument();
      expect(screen.getByText('1個の技が見つかりました')).toBeInTheDocument();
    });
  });
});