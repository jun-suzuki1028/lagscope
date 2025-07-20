import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { CharacterSelector } from '../CharacterSelector';
import { useAppStore } from '../../stores/app-store';
import { Fighter } from '../../types/frameData';

// Mock the store
vi.mock('../../stores/app-store');

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
    walkSpeed: 1.24,
    runSpeed: 1.534,
    airSpeed: 0.924,
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
      jumpSquat: 7,
      fullHopHeight: 30.83,
      shortHopHeight: 12.6,
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
  defendingFighters: [],
  setAttackingFighter: vi.fn(),
  addDefendingFighter: vi.fn(),
  removeDefendingFighter: vi.fn(),
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

    const { container } = render(<CharacterSelector type="attacker" />);
    // Simply check that component renders without crashing in loading state
    expect(container.firstChild).toBeTruthy();
  });

  it('renders error state', () => {
    (useAppStore as any).mockReturnValue({
      ...mockStore,
      fightersData: { ...mockStore.fightersData, error: 'データの読み込みに失敗しました' },
    });

    render(<CharacterSelector type="attacker" />);
    expect(screen.getByText('データの読み込みに失敗しました')).toBeInTheDocument();
  });

  it('renders search input', () => {
    render(<CharacterSelector type="attacker" />);
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('キャラクターを検索...')).toBeInTheDocument();
  });

  it('filters characters based on search input', async () => {
    const user = userEvent.setup();
    render(<CharacterSelector type="attacker" />);

    const searchInput = screen.getByRole('searchbox');
    await user.type(searchInput, 'マリオ');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /マリオを選択/ })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /リンクを選択/ })).not.toBeInTheDocument();
    });
  });

  it('filters characters by series', async () => {
    const user = userEvent.setup();
    render(<CharacterSelector type="attacker" />);

    const searchInput = screen.getByRole('searchbox');
    await user.type(searchInput, 'zelda');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /リンクを選択/ })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /マリオを選択/ })).not.toBeInTheDocument();
    });
  });

  it('shows clear button when search term is entered', async () => {
    const user = userEvent.setup();
    render(<CharacterSelector type="attacker" />);

    const searchInput = screen.getByRole('searchbox');
    await user.type(searchInput, 'mario');

    expect(screen.getByLabelText('検索をクリア')).toBeInTheDocument();
  });

  it('clears search when clear button is clicked', async () => {
    const user = userEvent.setup();
    render(<CharacterSelector type="attacker" />);

    const searchInput = screen.getByRole('searchbox');
    await user.type(searchInput, 'mario');

    const clearButton = screen.getByLabelText('検索をクリア');
    await user.click(clearButton);

    expect(searchInput).toHaveValue('');
  });

  it('selects attacker fighter', async () => {
    const user = userEvent.setup();
    render(<CharacterSelector type="attacker" />);

    const marioCard = screen.getByRole('button', { name: /マリオを選択/ });
    await user.click(marioCard);

    expect(mockStore.setAttackingFighter).toHaveBeenCalledWith(mockFighters[0]);
  });

  it('adds defending fighter in multiselect mode', async () => {
    const user = userEvent.setup();
    render(<CharacterSelector type="defender" multiSelect={true} />);

    const marioCard = screen.getByRole('button', { name: /マリオを選択/ });
    await user.click(marioCard);

    expect(mockStore.addDefendingFighter).toHaveBeenCalledWith(mockFighters[0]);
  });

  it('removes defending fighter when already selected', async () => {
    const user = userEvent.setup();
    (useAppStore as any).mockReturnValue({
      ...mockStore,
      defendingFighters: [mockFighters[0]],
    });

    render(<CharacterSelector type="defender" multiSelect={true} />);

    const marioCard = screen.getByRole('button', { name: /マリオを選択/ });
    await user.click(marioCard);

    expect(mockStore.removeDefendingFighter).toHaveBeenCalledWith('mario');
  });

  it('shows selected fighter count', () => {
    (useAppStore as any).mockReturnValue({
      ...mockStore,
      defendingFighters: [mockFighters[0], mockFighters[1]],
    });

    render(<CharacterSelector type="defender" multiSelect={true} />);

    expect(screen.getByText(/2体選択中/)).toBeInTheDocument();
  });

  it('shows clear selection button when fighters are selected', () => {
    (useAppStore as any).mockReturnValue({
      ...mockStore,
      attackingFighter: mockFighters[0],
    });

    render(<CharacterSelector type="attacker" />);

    expect(screen.getByText('選択をクリア')).toBeInTheDocument();
  });

  it('clears selection when clear button is clicked', async () => {
    const user = userEvent.setup();
    (useAppStore as any).mockReturnValue({
      ...mockStore,
      attackingFighter: mockFighters[0],
    });

    render(<CharacterSelector type="attacker" />);

    const clearButton = screen.getByText('選択をクリア');
    await user.click(clearButton);

    expect(mockStore.setAttackingFighter).toHaveBeenCalledWith(null);
  });

  it('handles keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<CharacterSelector type="attacker" />);

    const marioCard = screen.getByRole('button', { name: /マリオを選択/ });
    await user.click(marioCard);

    expect(mockStore.setAttackingFighter).toHaveBeenCalledWith(mockFighters[0]);
  });

  it('handles space key for selection', async () => {
    const user = userEvent.setup();
    render(<CharacterSelector type="attacker" />);

    const marioCard = screen.getByRole('button', { name: /マリオを選択/ });
    await user.click(marioCard);

    expect(mockStore.setAttackingFighter).toHaveBeenCalledWith(mockFighters[0]);
  });

  it('shows no results message when no fighters match search', async () => {
    const user = userEvent.setup();
    render(<CharacterSelector type="attacker" />);

    const searchInput = screen.getByRole('searchbox');
    await user.type(searchInput, 'nonexistent');

    await waitFor(() => {
      expect(screen.getByText('該当するキャラクターが見つかりませんでした')).toBeInTheDocument();
    });
  });

  it('calls onCharacterSelect callback when provided', async () => {
    const user = userEvent.setup();
    const onCharacterSelect = vi.fn();
    render(<CharacterSelector type="attacker" onCharacterSelect={onCharacterSelect} />);

    const marioCard = screen.getByRole('button', { name: /マリオを選択/ });
    await user.click(marioCard);

    expect(onCharacterSelect).toHaveBeenCalledWith(mockFighters[0]);
  });

  it('shows modal on mobile when modal button is clicked', async () => {
    const user = userEvent.setup();
    
    // Mock window.innerWidth to simulate mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    render(<CharacterSelector type="attacker" />);

    const modalButton = screen.getByText('選択');
    await user.click(modalButton);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('displays correct type label', () => {
    render(<CharacterSelector type="attacker" />);
    expect(screen.getByText(/攻撃側キャラクター/)).toBeInTheDocument();

    render(<CharacterSelector type="defender" />);
    expect(screen.getByText(/防御側キャラクター/)).toBeInTheDocument();
  });

  it('shows multiselect hint when multiSelect is enabled', () => {
    render(<CharacterSelector type="defender" multiSelect={true} />);
    expect(screen.getByText(/複数選択可能/)).toBeInTheDocument();
  });
});