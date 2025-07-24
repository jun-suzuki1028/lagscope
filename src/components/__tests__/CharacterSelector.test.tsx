import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CharacterSelector } from '../CharacterSelector';
import { useAppStore } from "../../stores/app-store";
import type { Fighter } from '../../types/frameData';

vi.mock("../../stores/app-store");

// Mock the debounce hook to return value immediately
vi.mock('../../hooks/useDebounce', () => ({
  useDebounce: (value: string) => value,
}));

// Mock the character icon mapping utility
vi.mock('../../utils/characterIconMapping', () => ({
  getCharacterIconUrl: vi.fn((id: string) => `/lagscope/icons/fighters/${id}.png`),
}));

const mockFighters: Fighter[] = [
  {
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
  },
  {
    id: 'link',
    name: 'Link',
    displayName: 'リンク',
    series: 'The Legend of Zelda',
    weight: 104,
    fallSpeed: 1.6,
    fastFallSpeed: 2.56,
    gravity: 0.096,
    walkSpeed: 1.247,
    runSpeed: 1.534,
    airSpeed: 1.155,
    moves: [],
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
      fullHopHeight: 31.17,
      shortHopHeight: 15.05,
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
    iconUrl: '/images/link-icon.png',
  },
];

const mockStore = {
  fightersData: {
    data: mockFighters,
    loading: false,
    error: null,
    lastFetch: Date.now(),
  },
  attackingFighter: null,
  defendingFighter: null,
  setAttackingFighter: vi.fn(),
  setDefendingFighter: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  (useAppStore as any).mockReturnValue(mockStore);
});

describe('CharacterSelector', () => {
  it('renders loading state', () => {
    (useAppStore as any).mockReturnValue({
      ...mockStore,
      fightersData: { ...mockStore.fightersData, loading: true },
    });

    render(<CharacterSelector type="attacker" />);
    expect(screen.getByText('キャラクターデータを読み込み中...')).toBeInTheDocument();
  });

  it('renders error state', () => {
    (useAppStore as any).mockReturnValue({
      ...mockStore,
      fightersData: { ...mockStore.fightersData, error: 'Failed to load' },
    });

    render(<CharacterSelector type="attacker" />);
    expect(screen.getByText('キャラクターデータの読み込みエラー')).toBeInTheDocument();
  });

  it('renders character selection button', () => {
    render(<CharacterSelector type="attacker" />);
    expect(screen.getByRole('button', { name: 'キャラクター選択モーダルを開く' })).toBeInTheDocument();
    expect(screen.getByText('攻撃側キャラクターを選択')).toBeInTheDocument();
  });

  it('shows selected fighter name when selected', () => {
    (useAppStore as any).mockReturnValue({
      ...mockStore,
      attackingFighter: mockFighters[0],
    });

    render(<CharacterSelector type="attacker" />);
    
    expect(screen.getByText('マリオ')).toBeInTheDocument();
    expect(screen.getByText('(Super Mario)')).toBeInTheDocument();
  });

  it('shows defending fighter name when selected', () => {
    (useAppStore as any).mockReturnValue({
      ...mockStore,
      defendingFighter: mockFighters[1],
    });

    render(<CharacterSelector type="defender" />);
    
    expect(screen.getByText('リンク')).toBeInTheDocument();
    expect(screen.getByText('(The Legend of Zelda)')).toBeInTheDocument();
  });

  it('shows clear selection button when fighter is selected', () => {
    (useAppStore as any).mockReturnValue({
      ...mockStore,
      attackingFighter: mockFighters[0],
    });

    render(<CharacterSelector type="attacker" />);
    
    expect(screen.getByRole('button', { name: '選択をクリア' })).toBeInTheDocument();
  });

  it('clears selection when clear button is clicked', async () => {
    const user = userEvent.setup();
    (useAppStore as any).mockReturnValue({
      ...mockStore,
      attackingFighter: mockFighters[0],
    });

    render(<CharacterSelector type="attacker" />);

    const clearButton = screen.getByRole('button', { name: '選択をクリア' });
    await user.click(clearButton);

    expect(mockStore.setAttackingFighter).toHaveBeenCalledWith(null);
  });

  it('opens modal when selection button is clicked', async () => {
    const user = userEvent.setup();
    render(<CharacterSelector type="attacker" />);

    const selectionButton = screen.getByRole('button', { name: 'キャラクター選択モーダルを開く' });
    await user.click(selectionButton);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('selects defending fighter from modal', async () => {
    const user = userEvent.setup();
    render(<CharacterSelector type="defender" />);

    const selectionButton = screen.getByRole('button', { name: 'キャラクター選択モーダルを開く' });
    await user.click(selectionButton);

    const marioCard = screen.getByRole('button', { name: /マリオ/ });
    await user.click(marioCard);

    expect(mockStore.setDefendingFighter).toHaveBeenCalledWith(mockFighters[0]);
  });

  it('clears defending fighter selection', async () => {
    const user = userEvent.setup();
    (useAppStore as any).mockReturnValue({
      ...mockStore,
      defendingFighter: mockFighters[0],
    });

    render(<CharacterSelector type="defender" />);

    const clearButton = screen.getByRole('button', { name: '選択をクリア' });
    await user.click(clearButton);

    expect(mockStore.setDefendingFighter).toHaveBeenCalledWith(null);
  });

  it('shows selection status', () => {
    (useAppStore as any).mockReturnValue({
      ...mockStore,
      defendingFighter: mockFighters[0],
    });

    render(<CharacterSelector type="defender" />);

    expect(screen.getByText(/選択済み/)).toBeInTheDocument();
  });

  it('calls onCharacterSelect callback when provided', async () => {
    const user = userEvent.setup();
    const onCharacterSelect = vi.fn();
    render(<CharacterSelector type="attacker" onCharacterSelect={onCharacterSelect} />);

    const selectionButton = screen.getByRole('button', { name: 'キャラクター選択モーダルを開く' });
    await user.click(selectionButton);

    const marioCard = screen.getByRole('button', { name: /マリオ/ });
    await user.click(marioCard);

    expect(onCharacterSelect).toHaveBeenCalledWith(mockFighters[0]);
  });

  it('displays correct type labels', () => {
    const { rerender } = render(<CharacterSelector type="attacker" />);
    expect(screen.getByText('攻撃側キャラクター')).toBeInTheDocument();

    rerender(<CharacterSelector type="defender" />);
    expect(screen.getByText('防御側キャラクター')).toBeInTheDocument();
  });
});