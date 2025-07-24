import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ResultsTableContainer from '../ResultsTableContainer';
import type { PunishResult, PunishMove } from '../../../types/frameData';
import { 
  createMockFighter, 
  createMockMove, 
  createMockPunishMove,
  createMockPunishResult 
} from '../../../test-utils/mock-data';

// useMediaQueryフックをモック
vi.mock('../../../hooks/useMediaQuery', () => ({
  useBreakpoint: () => ({
    isDesktop: true,
    isMobile: false,
  }),
}));

describe('ResultsTableContainer', () => {
  const mockFighter = createMockFighter({
    id: 'mario',
    displayName: 'マリオ',
  });

  const mockMove = createMockMove({
    id: 'jab1',
    displayName: 'ジャブ1',
    startup: 2,
    damage: 2.2,
  });

  const mockPunishMove = createMockPunishMove({
    move: mockMove,
    totalFrames: 13,
    damage: 2.2,
  });

  const mockResults: PunishResult[] = [
    createMockPunishResult({
      defendingFighter: mockFighter,
      punishingMoves: [mockPunishMove],
      frameAdvantage: 9,
      attackingMove: mockMove,
    }),
  ];

  it('結果が空の場合、適切なメッセージを表示する', () => {
    render(<ResultsTableContainer results={[]} />);
    
    expect(screen.getByText('全0件を表示')).toBeInTheDocument();
  });

  it('結果がある場合、テーブルを表示する', () => {
    render(<ResultsTableContainer results={mockResults} />);
    
    // フィルター設定が表示される
    expect(screen.getByText('フィルター設定')).toBeInTheDocument();
    
    // 結果情報が表示される
    expect(screen.getByText('全1件を表示')).toBeInTheDocument();
    
    // エクスポートボタンが表示される
    expect(screen.getByText('結果をエクスポート (1件)')).toBeInTheDocument();
    
    // テーブルデータが表示される（デスクトップ表示）
    expect(screen.getByText('マリオ')).toBeInTheDocument();
    expect(screen.getByText('ジャブ1')).toBeInTheDocument();
  });

  it('フィルター機能が正常に動作する', () => {
    render(<ResultsTableContainer results={mockResults} />);
    
    // 確定反撃のみフィルターをチェック
    const guaranteedFilter = screen.getByLabelText('確定反撃のみ');
    fireEvent.click(guaranteedFilter);
    
    // 結果が表示される（この技は確定なので）
    expect(screen.getByText('マリオ')).toBeInTheDocument();
    expect(screen.getByText('ジャブ1')).toBeInTheDocument();
  });

  it('ソート機能が正常に動作する', () => {
    render(<ResultsTableContainer results={mockResults} />);
    
    // テーブルヘッダーのダメージ列を取得
    const allDamageTexts = screen.getAllByText(/ダメージ/);
    const damageHeader = allDamageTexts.find(el => el.tagName === 'TH');
    expect(damageHeader).toBeInTheDocument();
    
    // 技名でソート
    const nameHeader = screen.getByRole('columnheader', { name: /技名/ });
    fireEvent.click(nameHeader);
    
    // データが表示されていることを確認
    expect(screen.getByText('ジャブ1')).toBeInTheDocument();
  });

  it('エクスポートボタンが機能する', () => {
    render(<ResultsTableContainer results={mockResults} />);
    
    const exportButton = screen.getByText('結果をエクスポート (1件)');
    fireEvent.click(exportButton);
    
    // エクスポートモーダルが表示される
    expect(screen.getByText('データエクスポート')).toBeInTheDocument();
  });

  it('カスタムクラス名が適用される', () => {
    const customClass = 'custom-test-class';
    const { container } = render(
      <ResultsTableContainer results={mockResults} className={customClass} />
    );
    
    expect(container.firstChild).toHaveClass(customClass);
  });

  it('ローディング状態を正しく表示する', () => {
    render(<ResultsTableContainer results={mockResults} isLoading={true} />);
    
    // ローディングスピナーが表示される
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });
});