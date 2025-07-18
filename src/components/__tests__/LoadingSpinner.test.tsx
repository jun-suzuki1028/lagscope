import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { LoadingSpinner, LoadingOverlay, LoadingButton } from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('スピナーを表示する', () => {
    render(<LoadingSpinner />);
    
    const spinner = screen.getByRole('generic');
    expect(spinner).toBeInTheDocument();
  });

  it('メッセージを表示する', () => {
    render(<LoadingSpinner message="Loading..." />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('サイズに応じたクラスを適用する', () => {
    const { rerender } = render(<LoadingSpinner size="sm" />);
    expect(document.querySelector('.w-4')).toBeInTheDocument();
    
    rerender(<LoadingSpinner size="lg" />);
    expect(document.querySelector('.w-12')).toBeInTheDocument();
  });
});

describe('LoadingOverlay', () => {
  it('ローディング中はオーバーレイを表示する', () => {
    render(
      <LoadingOverlay isLoading={true} message="Loading...">
        <div>Content</div>
      </LoadingOverlay>
    );
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('ローディング中でない場合はオーバーレイを表示しない', () => {
    render(
      <LoadingOverlay isLoading={false} message="Loading...">
        <div>Content</div>
      </LoadingOverlay>
    );
    
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});

describe('LoadingButton', () => {
  it('ローディング中はスピナーとテキストを表示する', () => {
    render(
      <LoadingButton isLoading={true} loadingText="処理中...">
        Click me
      </LoadingButton>
    );
    
    expect(screen.getByText('処理中...')).toBeInTheDocument();
    expect(screen.queryByText('Click me')).not.toBeInTheDocument();
  });

  it('ローディング中でない場合は通常のボタンを表示する', () => {
    render(
      <LoadingButton isLoading={false}>
        Click me
      </LoadingButton>
    );
    
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('ローディング中はボタンを無効化する', () => {
    render(
      <LoadingButton isLoading={true}>
        Click me
      </LoadingButton>
    );
    
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('クリックイベントを処理する', () => {
    const mockClick = vi.fn();
    render(
      <LoadingButton isLoading={false} onClick={mockClick}>
        Click me
      </LoadingButton>
    );
    
    fireEvent.click(screen.getByText('Click me'));
    expect(mockClick).toHaveBeenCalledTimes(1);
  });
});