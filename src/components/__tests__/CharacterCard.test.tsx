import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { CharacterCard } from '../CharacterCard';
import { Fighter } from '../../types/frameData';

// Mock the character icon mapping utility
vi.mock('../../utils/characterIconMapping', () => ({
  getCharacterIconUrl: vi.fn(() => '/lagscope/icons/fighters/mario.png'),
}));

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
  moves: [],
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

describe('CharacterCard', () => {
  it('renders character card with accessibility label', () => {
    const onSelect = vi.fn();
    render(
      <CharacterCard
        fighter={mockFighter}
        isSelected={false}
        onSelect={onSelect}
        multiSelect={false}
      />
    );

    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('aria-label', 'マリオを選択');
  });

  it('renders character icon when iconUrl is provided', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <CharacterCard
        fighter={mockFighter}
        isSelected={false}
        onSelect={onSelect}
        multiSelect={false}
      />
    );
    
    const icon = container.querySelector('img');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('alt', 'マリオ');
  });

  it('renders fallback when icon is not available', async () => {
    const onSelect = vi.fn();
    const { getCharacterIconUrl } = await import('../../utils/characterIconMapping');
    
    // Mock getCharacterIconUrl to return null for this test
    vi.mocked(getCharacterIconUrl).mockReturnValueOnce(null);
    
    render(
      <CharacterCard
        fighter={mockFighter}
        isSelected={false}
        onSelect={onSelect}
        multiSelect={false}
      />
    );

    expect(screen.getByText('マ')).toBeInTheDocument(); // First character of display name
  });

  it('applies selected styles when isSelected is true', () => {
    const onSelect = vi.fn();
    render(
      <CharacterCard
        fighter={mockFighter}
        isSelected={true}
        onSelect={onSelect}
        multiSelect={false}
      />
    );

    const card = screen.getByRole('button');
    expect(card).toHaveClass('border-blue-500', 'bg-blue-50', 'shadow-lg');
  });

  it('applies default styles when isSelected is false', () => {
    const onSelect = vi.fn();
    render(
      <CharacterCard
        fighter={mockFighter}
        isSelected={false}
        onSelect={onSelect}
        multiSelect={false}
      />
    );

    const card = screen.getByRole('button');
    expect(card).toHaveClass('border-gray-200', 'bg-white');
  });

  it('shows checkmark when selected and multiSelect is enabled', () => {
    const onSelect = vi.fn();
    render(
      <CharacterCard
        fighter={mockFighter}
        isSelected={true}
        onSelect={onSelect}
        multiSelect={true}
      />
    );

    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('does not show checkmark when selected but multiSelect is disabled', () => {
    const onSelect = vi.fn();
    render(
      <CharacterCard
        fighter={mockFighter}
        isSelected={true}
        onSelect={onSelect}
        multiSelect={false}
      />
    );

    expect(screen.queryByText('✓')).not.toBeInTheDocument();
  });

  it('calls onSelect when clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <CharacterCard
        fighter={mockFighter}
        isSelected={false}
        onSelect={onSelect}
        multiSelect={false}
      />
    );

    const card = screen.getByRole('button');
    await user.click(card);

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('calls onSelect when Enter key is pressed', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <CharacterCard
        fighter={mockFighter}
        isSelected={false}
        onSelect={onSelect}
        multiSelect={false}
      />
    );

    const card = screen.getByRole('button');
    card.focus();
    await user.keyboard('{Enter}');

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('calls onSelect when Space key is pressed', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <CharacterCard
        fighter={mockFighter}
        isSelected={false}
        onSelect={onSelect}
        multiSelect={false}
      />
    );

    const card = screen.getByRole('button');
    card.focus();
    await user.keyboard(' ');

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('does not call onSelect for other keys', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <CharacterCard
        fighter={mockFighter}
        isSelected={false}
        onSelect={onSelect}
        multiSelect={false}
      />
    );

    const card = screen.getByRole('button');
    card.focus();
    await user.keyboard('a');

    expect(onSelect).not.toHaveBeenCalled();
  });

  it('has correct accessibility attributes', () => {
    const onSelect = vi.fn();
    render(
      <CharacterCard
        fighter={mockFighter}
        isSelected={false}
        onSelect={onSelect}
        multiSelect={false}
      />
    );

    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('aria-label', 'マリオを選択');
    expect(card).toHaveAttribute('aria-pressed', 'false');
    expect(card).toHaveAttribute('tabIndex', '0');
  });

  it('updates aria-pressed when selection changes', () => {
    const onSelect = vi.fn();
    const { rerender } = render(
      <CharacterCard
        fighter={mockFighter}
        isSelected={false}
        onSelect={onSelect}
        multiSelect={false}
      />
    );

    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('aria-pressed', 'false');

    rerender(
      <CharacterCard
        fighter={mockFighter}
        isSelected={true}
        onSelect={onSelect}
        multiSelect={false}
      />
    );

    expect(card).toHaveAttribute('aria-pressed', 'true');
  });

  it('applies custom className', () => {
    const onSelect = vi.fn();
    render(
      <CharacterCard
        fighter={mockFighter}
        isSelected={false}
        onSelect={onSelect}
        multiSelect={false}
        className="custom-class"
      />
    );

    const card = screen.getByRole('button');
    expect(card).toHaveClass('custom-class');
  });

  it('has proper image loading optimization', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <CharacterCard
        fighter={mockFighter}
        isSelected={false}
        onSelect={onSelect}
        multiSelect={false}
      />
    );

    const icon = container.querySelector('img');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('loading', 'lazy');
    expect(icon).toHaveClass('w-full', 'h-full', 'object-contain');
  });
});