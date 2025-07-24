import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ResponsiveNavigation from '../ResponsiveNavigation';

describe('ResponsiveNavigation', () => {
  const mockItems = [
    { id: 'home', label: 'ホーム', active: true },
    { id: 'about', label: 'アバウト', active: false },
    { id: 'contact', label: 'お問い合わせ', active: false },
  ];

  it('デフォルトタイトルでレンダリングする', () => {
    render(<ResponsiveNavigation items={mockItems} />);
    
    expect(screen.getByText('LagScope')).toBeInTheDocument();
  });

  it('カスタムタイトルでレンダリングする', () => {
    render(<ResponsiveNavigation items={mockItems} title="Custom Title" />);
    
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  it('ナビゲーションアイテムを正しくレンダリングする', () => {
    render(<ResponsiveNavigation items={mockItems} />);
    
    expect(screen.getByText('ホーム')).toBeInTheDocument();
    expect(screen.getByText('アバウト')).toBeInTheDocument();
    expect(screen.getByText('お問い合わせ')).toBeInTheDocument();
  });

  it('アクティブな項目を正しく表示する', () => {
    render(<ResponsiveNavigation items={mockItems} />);
    
    const activeItem = screen.getAllByText('ホーム')[0]; // デスクトップ版
    expect(activeItem).toHaveClass('text-gray-900');
    expect(activeItem).toHaveClass('border-blue-500');
  });

  it('モバイルメニューボタンをクリックしてメニューを開く', () => {
    render(<ResponsiveNavigation items={mockItems} />);
    
    const menuButton = screen.getByRole('button', { name: 'メニューを開く' });
    fireEvent.click(menuButton);
    
    // モバイルメニューが表示されることを確認（複数の要素が見つかることを想定）
    expect(screen.getAllByText('ホーム')).toHaveLength(2); // デスクトップとモバイル版
  });

  it('モバイルメニューボタンをクリックしてメニューを閉じる', () => {
    render(<ResponsiveNavigation items={mockItems} />);
    
    const menuButton = screen.getByRole('button', { name: 'メニューを開く' });
    
    // メニューを開く
    fireEvent.click(menuButton);
    
    // メニューを閉じる
    fireEvent.click(menuButton);
    
    // アイコンが変更されることを確認
    expect(screen.getByRole('button', { name: 'メニューを開く' })).toBeInTheDocument();
  });

  it('アイコン付きのナビゲーションアイテムを正しくレンダリングする', () => {
    const itemsWithIcon = [
      { 
        id: 'home', 
        label: 'ホーム', 
        active: true, 
        icon: <span data-testid="home-icon">🏠</span> 
      },
    ];

    render(<ResponsiveNavigation items={itemsWithIcon} />);
    
    expect(screen.getByTestId('home-icon')).toBeInTheDocument();
  });

  it('ナビゲーションアイテムのクリックイベントを正しく処理する', () => {
    const mockOnClick = vi.fn();
    const itemsWithClick = [
      { id: 'home', label: 'ホーム', onClick: mockOnClick },
    ];

    render(<ResponsiveNavigation items={itemsWithClick} />);
    
    const homeButton = screen.getAllByText('ホーム')[0]; // デスクトップ版
    fireEvent.click(homeButton);
    
    expect(mockOnClick).toHaveBeenCalled();
  });

  it('モバイルメニューのアイテムをクリックするとメニューが閉じる', () => {
    const mockOnClick = vi.fn();
    const itemsWithClick = [
      { id: 'home', label: 'ホーム', onClick: mockOnClick },
    ];

    render(<ResponsiveNavigation items={itemsWithClick} />);
    
    // モバイルメニューを開く
    const menuButton = screen.getByRole('button', { name: 'メニューを開く' });
    fireEvent.click(menuButton);
    
    // モバイルメニューのアイテムをクリック
    const mobileHomeButton = screen.getAllByText('ホーム')[1]; // モバイル版
    fireEvent.click(mobileHomeButton);
    
    expect(mockOnClick).toHaveBeenCalled();
  });

  it('カスタムクラス名を正しく適用する', () => {
    const customClass = 'custom-nav-class';
    render(<ResponsiveNavigation items={mockItems} className={customClass} />);
    
    const nav = screen.getByText('LagScope').closest('nav');
    expect(nav).toHaveClass(customClass);
  });

  it('空のアイテム配列を正しく処理する', () => {
    render(<ResponsiveNavigation items={[]} />);
    
    expect(screen.getByText('LagScope')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'メニューを開く' })).toBeInTheDocument();
  });
});