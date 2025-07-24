import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { MoveSelector } from '../MoveSelector';
import { useAppStore } from "../../stores/app-store";
import { Fighter, Move } from '../../types/frameData';

// Mock the store
vi.mock("../../stores/app-store");

const mockMoves: Move[] = [
  {
    id: 'mario-jab1',
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
  // つかみと投げのテスト用モック（フィルターで除外される）
  {
    id: 'mario-grab',
    name: 'Grab',
    displayName: 'つかみ',
    category: 'grab',
    type: 'grab',
    input: 'Z',
    startup: 6,
    active: 2,
    recovery: 30,
    totalFrames: 38,
    onShield: 0,
    onHit: 0,
    onWhiff: -30,
    damage: 0,
    baseKnockback: 0,
    knockbackGrowth: 0,
    range: 'close',
    hitboxData: {
      hitboxes: [],
      multihit: false,
    },
    properties: {
      isKillMove: false,
      hasArmor: false,
      isCommandGrab: true,
      isSpike: false,
      isMeteor: false,
      hasInvincibility: false,
      hasIntangibility: false,
      canClank: false,
      priority: 1,
      transcendentPriority: false,
    },
  },
  {
    id: 'mario-fthrow',
    name: 'Forward Throw',
    displayName: '前投げ',
    category: 'throw',
    type: 'throw',
    input: '前+Z',
    startup: 16,
    active: 1,
    recovery: 23,
    totalFrames: 40,
    onShield: 0,
    onHit: 0,
    onWhiff: 0,
    damage: 8,
    baseKnockback: 65,
    knockbackGrowth: 65,
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
      canClank: false,
      priority: 1,
      transcendentPriority: false,
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

  it('renders fighter name', () => {
    render(<MoveSelector selectedFighter={mockFighter} />);
    expect(screen.getByText('マリオの技選択')).toBeInTheDocument();
  });



  it('displays move dropdown with filtered moves (excludes grab and throw)', () => {
    render(<MoveSelector selectedFighter={mockFighter} />);
    const dropdown = screen.getByTestId('move-select');
    expect(dropdown).toBeInTheDocument();
    expect(screen.getByText('技を選択してください')).toBeInTheDocument();
    expect(dropdown).toHaveValue('');
    
    // プルダウンに技名のみが表示され、つかみと投げが除外されることを確認
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(4); // 空のオプション + 3つの技（つかみと投げは除外）
    expect(options[1]).toHaveTextContent('弱攻撃1');
    expect(options[2]).toHaveTextContent('上強攻撃');
    expect(options[3]).toHaveTextContent('ファイアボール');
    
    // つかみと投げが表示されないことを確認
    expect(screen.queryByText('つかみ')).not.toBeInTheDocument();
    expect(screen.queryByText('前投げ')).not.toBeInTheDocument();
  });







  it('displays move details when a move is selected', () => {
    const selectedMove = mockMoves[0];
    (useAppStore as any).mockReturnValue({
      ...mockStore,
      selectedMove,
    });

    render(<MoveSelector selectedFighter={mockFighter} />);
    
    expect(screen.getByText('発生: 2F')).toBeInTheDocument(); // startup
    expect(screen.getByText('全体: 9F')).toBeInTheDocument(); // total frames
    expect(screen.getByText('ダメージ: 2.2%')).toBeInTheDocument(); // damage
    expect(screen.getByText('ガード: -2F')).toBeInTheDocument(); // on shield
  });

  it('displays kill move badge for kill moves when selected', () => {
    const selectedMove = mockMoves[1]; // utilt is a kill move
    (useAppStore as any).mockReturnValue({
      ...mockStore,
      selectedMove,
    });

    render(<MoveSelector selectedFighter={mockFighter} />);
    expect(screen.getByText('撃墜技')).toBeInTheDocument();
  });

  it('displays move name and details when move is selected', () => {
    const selectedMove = mockMoves[0]; // jab
    (useAppStore as any).mockReturnValue({
      ...mockStore,
      selectedMove,
    });

    render(<MoveSelector selectedFighter={mockFighter} />);
    
    expect(screen.getAllByText('弱攻撃1').length).toBeGreaterThan(0); // move name appears multiple times
    expect(screen.getByText('発生: 2F')).toBeInTheDocument(); // startup frames
  });

  it('selects move when dropdown option is selected', async () => {
    const user = userEvent.setup();
    const onMoveSelect = vi.fn();
    render(<MoveSelector selectedFighter={mockFighter} onMoveSelect={onMoveSelect} />);

    const dropdown = screen.getByTestId('move-select');
    await user.selectOptions(dropdown, mockMoves[0].id);

    expect(mockStore.setSelectedMove).toHaveBeenCalledWith(mockMoves[0]);
    expect(onMoveSelect).toHaveBeenCalledWith(mockMoves[0]);
  });

  it('shows selected move in dropdown', () => {
    const selectedMove = mockMoves[0];
    (useAppStore as any).mockReturnValue({
      ...mockStore,
      selectedMove,
    });

    render(<MoveSelector selectedFighter={mockFighter} />);
    const dropdown = screen.getByTestId('move-select');
    expect(dropdown).toHaveValue(mockMoves[0].id);
  });





});