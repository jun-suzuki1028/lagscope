import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { ErrorBoundary } from '../ErrorBoundary';

// Mock component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('ErrorBoundary', () => {
  // Suppress console.error for these tests
  // eslint-disable-next-line no-console
  const originalError = console.error;
  beforeAll(() => {
    // eslint-disable-next-line no-console
    console.error = vi.fn();
  });
  afterAll(() => {
    // eslint-disable-next-line no-console
    console.error = originalError;
  });

  it('通常時は子コンポーネントを表示する', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('エラー時はデフォルトのエラーUIを表示する', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('予期しないエラーが発生しました')).toBeInTheDocument();
    expect(screen.getByText(/申し訳ございません。アプリケーションで問題が発生しました/)).toBeInTheDocument();
    expect(screen.getByText('ページを再読み込み')).toBeInTheDocument();
    expect(screen.getByText('リトライ')).toBeInTheDocument();
  });

  it('カスタムフォールバックUIを表示する', () => {
    const customFallback = <div>Custom error UI</div>;
    
    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error UI')).toBeInTheDocument();
    expect(screen.queryByText('予期しないエラーが発生しました')).not.toBeInTheDocument();
  });

  it('開発環境でエラー詳細を表示する', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('開発者情報')).toBeInTheDocument();
    
    process.env.NODE_ENV = originalEnv;
  });
});