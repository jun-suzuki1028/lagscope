import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { MoveInterface } from '../MoveInterface';
import { useAppStore } from '../../stores/app-store';
import { Fighter, Move } from '../../types/frameData';

// Mock the store
vi.mock('../../stores/app-store');

// Mock the debounce hook
vi.mock('../../hooks/useDebounce', () => ({
  useDebounce: (value: string) => value,
}));

const mockMove: Move = {
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
};

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
  moves: [mockMove],
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

describe('MoveInterface', () => {
  it('renders move selector and preview sections', () => {
    render(<MoveInterface selectedFighter={mockFighter} />);
    
    expect(screen.getByText('マリオの技選択')).toBeInTheDocument();
    expect(screen.getByText('フレームデータ詳細')).toBeInTheDocument();
  });

  it('shows preview toggle button on mobile', () => {
    // Mock window.innerWidth for mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    render(<MoveInterface selectedFighter={mockFighter} />);
    
    expect(screen.getByText('表示')).toBeInTheDocument();
  });

  it('toggles preview visibility on mobile', async () => {
    const user = userEvent.setup();
    
    // Mock window.innerWidth for mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    render(<MoveInterface selectedFighter={mockFighter} />);
    
    const toggleButton = screen.getByText('表示');
    await user.click(toggleButton);
    
    expect(screen.getByText('隠す')).toBeInTheDocument();
  });

  it('shows move preview when move is selected', async () => {
    const user = userEvent.setup();
    render(<MoveInterface selectedFighter={mockFighter} />);
    
    const moveCard = screen.getByLabelText('ジャブ1を選択');
    await user.click(moveCard);
    
    expect(screen.getByText('ジャブ1')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('calls onMoveSelect callback when move is selected', async () => {
    const user = userEvent.setup();
    const onMoveSelect = vi.fn();
    render(<MoveInterface selectedFighter={mockFighter} onMoveSelect={onMoveSelect} />);
    
    const moveCard = screen.getByLabelText('ジャブ1を選択');
    await user.click(moveCard);
    
    expect(onMoveSelect).toHaveBeenCalledWith(mockMove);
  });

  it('handles null selected fighter', () => {
    render(<MoveInterface selectedFighter={null} />);
    
    expect(screen.getByText('キャラクターを選択してください')).toBeInTheDocument();
    expect(screen.getByText('技を選択してください')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <MoveInterface selectedFighter={mockFighter} className="custom-class" />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('uses responsive grid layout', () => {
    render(<MoveInterface selectedFighter={mockFighter} />);
    
    const gridContainer = screen.getByText('マリオの技選択').closest('.grid');
    expect(gridContainer).toHaveClass('grid-cols-1', 'lg:grid-cols-2');
  });

  it('hides preview section initially on mobile', () => {
    render(<MoveInterface selectedFighter={mockFighter} />);
    
    // The preview section should be hidden on mobile but visible on desktop
    const previewContainer = screen.getByText('技を選択してください').closest('.hidden');
    expect(previewContainer).toHaveClass('hidden', 'lg:block');
  });
});