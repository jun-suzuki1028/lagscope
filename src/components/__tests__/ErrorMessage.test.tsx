import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { ErrorMessage } from '../ErrorMessage';

describe('ErrorMessage', () => {
  it('エラーメッセージを表示する', () => {
    render(<ErrorMessage message="Test error message" />);
    
    expect(screen.getByText('エラー')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('カスタムタイトルを表示する', () => {
    render(<ErrorMessage title="Custom Title" message="Test message" />);
    
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  it('警告タイプのスタイルを適用する', () => {
    render(<ErrorMessage type="warning" message="Warning message" />);
    
    const container = screen.getByText('Warning message').closest('div')?.closest('div');
    expect(container).toHaveClass('bg-yellow-50');
  });

  it('情報タイプのスタイルを適用する', () => {
    render(<ErrorMessage type="info" message="Info message" />);
    
    const container = screen.getByText('Info message').closest('div')?.closest('div');
    expect(container).toHaveClass('bg-blue-50');
  });

  it('再試行ボタンがクリックされた時にコールバックを実行する', () => {
    const mockRetry = vi.fn();
    render(<ErrorMessage message="Test message" onRetry={mockRetry} />);
    
    fireEvent.click(screen.getByText('再試行'));
    expect(mockRetry).toHaveBeenCalledTimes(1);
  });

  it('閉じるボタンがクリックされた時にコールバックを実行する', () => {
    const mockDismiss = vi.fn();
    render(<ErrorMessage message="Test message" onDismiss={mockDismiss} />);
    
    fireEvent.click(screen.getByText('閉じる'));
    expect(mockDismiss).toHaveBeenCalledTimes(1);
  });

  it('ボタンがない場合は表示しない', () => {
    render(<ErrorMessage message="Test message" />);
    
    expect(screen.queryByText('再試行')).not.toBeInTheDocument();
    expect(screen.queryByText('閉じる')).not.toBeInTheDocument();
  });
});