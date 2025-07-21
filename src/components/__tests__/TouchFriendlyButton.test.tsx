import { render, screen, fireEvent } from '../../test/test-utils';
import { describe, it, expect, vi } from 'vitest';
import TouchFriendlyButton from '../TouchFriendlyButton';

describe('TouchFriendlyButton', () => {
  it('デフォルトプロパティで正しくレンダリングする', () => {
    render(<TouchFriendlyButton>クリック</TouchFriendlyButton>);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('クリック');
    expect(button).toHaveClass('bg-blue-500');
    expect(button).toHaveClass('min-h-[44px]');
    expect(button).toHaveClass('min-w-[44px]');
  });

  it('クリックイベントを正しく処理する', () => {
    const mockOnClick = vi.fn();
    render(<TouchFriendlyButton onClick={mockOnClick}>クリック</TouchFriendlyButton>);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('すべてのバリアントを正しく適用する', () => {
    const { rerender } = render(<TouchFriendlyButton variant="primary">Primary</TouchFriendlyButton>);
    expect(screen.getByRole('button')).toHaveClass('bg-blue-500');

    rerender(<TouchFriendlyButton variant="secondary">Secondary</TouchFriendlyButton>);
    expect(screen.getByRole('button')).toHaveClass('bg-gray-200');

    rerender(<TouchFriendlyButton variant="danger">Danger</TouchFriendlyButton>);
    expect(screen.getByRole('button')).toHaveClass('bg-red-500');

    rerender(<TouchFriendlyButton variant="ghost">Ghost</TouchFriendlyButton>);
    expect(screen.getByRole('button')).toHaveClass('bg-transparent');
  });

  it('すべてのサイズを正しく適用する', () => {
    const { rerender } = render(<TouchFriendlyButton size="sm">Small</TouchFriendlyButton>);
    expect(screen.getByRole('button')).toHaveClass('px-3');
    expect(screen.getByRole('button')).toHaveClass('py-2');
    expect(screen.getByRole('button')).toHaveClass('text-sm');

    rerender(<TouchFriendlyButton size="md">Medium</TouchFriendlyButton>);
    expect(screen.getByRole('button')).toHaveClass('px-4');
    expect(screen.getByRole('button')).toHaveClass('py-3');
    expect(screen.getByRole('button')).toHaveClass('text-base');

    rerender(<TouchFriendlyButton size="lg">Large</TouchFriendlyButton>);
    expect(screen.getByRole('button')).toHaveClass('px-6');
    expect(screen.getByRole('button')).toHaveClass('py-4');
    expect(screen.getByRole('button')).toHaveClass('text-lg');
  });

  it('無効化状態を正しく適用する', () => {
    const mockOnClick = vi.fn();
    render(
      <TouchFriendlyButton disabled onClick={mockOnClick}>
        無効化
      </TouchFriendlyButton>
    );
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:opacity-50');
    expect(button).toHaveClass('disabled:cursor-not-allowed');
    
    fireEvent.click(button);
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('カスタムクラス名を正しく適用する', () => {
    const customClass = 'custom-button-class';
    render(<TouchFriendlyButton className={customClass}>カスタム</TouchFriendlyButton>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass(customClass);
  });

  it('異なるボタンタイプを正しく設定する', () => {
    const { rerender } = render(<TouchFriendlyButton type="button">Button</TouchFriendlyButton>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');

    rerender(<TouchFriendlyButton type="submit">Submit</TouchFriendlyButton>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');

    rerender(<TouchFriendlyButton type="reset">Reset</TouchFriendlyButton>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'reset');
  });

  it('アイコン付きボタンを正しくレンダリングする', () => {
    const icon = <span data-testid="button-icon">🚀</span>;
    render(<TouchFriendlyButton icon={icon}>アイコン付き</TouchFriendlyButton>);
    
    expect(screen.getByTestId('button-icon')).toBeInTheDocument();
    expect(screen.getByText('アイコン付き')).toBeInTheDocument();
  });

  it('アイコンのみのボタンを正しくレンダリングする', () => {
    const icon = <span data-testid="only-icon">⚙️</span>;
    render(<TouchFriendlyButton icon={icon}></TouchFriendlyButton>);
    
    expect(screen.getByTestId('only-icon')).toBeInTheDocument();
  });

  it('タッチ最適化クラスを適用する', () => {
    render(<TouchFriendlyButton>タッチ最適化</TouchFriendlyButton>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('touch-manipulation');
    expect(button).toHaveClass('min-h-[44px]');
    expect(button).toHaveClass('min-w-[44px]');
  });

  it('フォーカス状態のクラスを適用する', () => {
    render(<TouchFriendlyButton>フォーカス</TouchFriendlyButton>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('focus:outline-none');
    expect(button).toHaveClass('focus:ring-2');
    expect(button).toHaveClass('focus:ring-offset-2');
  });

  it('トランジションクラスを適用する', () => {
    render(<TouchFriendlyButton>トランジション</TouchFriendlyButton>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('transition-all');
    expect(button).toHaveClass('duration-200');
  });
});