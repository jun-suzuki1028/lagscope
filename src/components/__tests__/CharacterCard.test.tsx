import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { CharacterCard } from '../CharacterCard';
import { createMockFighter } from '../../test-utils/mock-data';

// Mock the character icon mapping utility
vi.mock('../../utils/characterIconMapping', () => ({
  getCharacterIconUrl: vi.fn(() => '/lagscope/icons/fighters/mario.png'),
}));

const mockFighter = createMockFighter({
  id: 'mario',
  displayName: 'マリオ',
  iconUrl: '/images/mario-icon.png',
});

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