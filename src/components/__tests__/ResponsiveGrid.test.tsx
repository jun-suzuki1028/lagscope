import { render, screen } from '../../test/test-utils';
import { describe, it, expect } from 'vitest';
import ResponsiveGrid from '../ResponsiveGrid';

describe('ResponsiveGrid', () => {
  it('デフォルトプロパティで正しくレンダリングする', () => {
    render(
      <ResponsiveGrid>
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
      </ResponsiveGrid>
    );

    const grid = screen.getByText('Item 1').parentElement;
    expect(grid).toHaveClass('grid');
    expect(grid).toHaveClass('grid-cols-1');
    expect(grid).toHaveClass('md:grid-cols-2');
    expect(grid).toHaveClass('lg:grid-cols-3');
    expect(grid).toHaveClass('gap-4');
  });

  it('カスタムカラム数を正しく適用する', () => {
    render(
      <ResponsiveGrid cols={{ base: 2, md: 3, lg: 4 }}>
        <div>Item 1</div>
        <div>Item 2</div>
      </ResponsiveGrid>
    );

    const grid = screen.getByText('Item 1').parentElement;
    expect(grid).toHaveClass('grid-cols-2');
    expect(grid).toHaveClass('md:grid-cols-3');
    expect(grid).toHaveClass('lg:grid-cols-4');
  });

  it('すべてのブレークポイントを正しく適用する', () => {
    render(
      <ResponsiveGrid cols={{ base: 1, sm: 2, md: 3, lg: 4, xl: 5, '2xl': 6 }}>
        <div>Item 1</div>
      </ResponsiveGrid>
    );

    const grid = screen.getByText('Item 1').parentElement;
    expect(grid).toHaveClass('grid-cols-1');
    expect(grid).toHaveClass('sm:grid-cols-2');
    expect(grid).toHaveClass('md:grid-cols-3');
    expect(grid).toHaveClass('lg:grid-cols-4');
    expect(grid).toHaveClass('xl:grid-cols-5');
    expect(grid).toHaveClass('2xl:grid-cols-6');
  });

  it('カスタムギャップを正しく適用する', () => {
    render(
      <ResponsiveGrid gap={8}>
        <div>Item 1</div>
        <div>Item 2</div>
      </ResponsiveGrid>
    );

    const grid = screen.getByText('Item 1').parentElement;
    expect(grid).toHaveClass('gap-8');
  });

  it('カスタムクラス名を正しく適用する', () => {
    const customClass = 'custom-grid-class';
    render(
      <ResponsiveGrid className={customClass}>
        <div>Item 1</div>
      </ResponsiveGrid>
    );

    const grid = screen.getByText('Item 1').parentElement;
    expect(grid).toHaveClass(customClass);
  });

  it('子要素を正しくレンダリングする', () => {
    render(
      <ResponsiveGrid>
        <div>First Item</div>
        <div>Second Item</div>
        <div>Third Item</div>
      </ResponsiveGrid>
    );

    expect(screen.getByText('First Item')).toBeInTheDocument();
    expect(screen.getByText('Second Item')).toBeInTheDocument();
    expect(screen.getByText('Third Item')).toBeInTheDocument();
  });

  it('部分的なカラム設定を正しく適用する', () => {
    render(
      <ResponsiveGrid cols={{ base: 1, lg: 3 }}>
        <div>Item 1</div>
      </ResponsiveGrid>
    );

    const grid = screen.getByText('Item 1').parentElement;
    expect(grid).toHaveClass('grid-cols-1');
    expect(grid).toHaveClass('lg:grid-cols-3');
    expect(grid).not.toHaveClass('md:grid-cols-2');
  });

  it('空のcolsオブジェクトを適切に処理する', () => {
    render(
      <ResponsiveGrid cols={{}}>
        <div>Item 1</div>
      </ResponsiveGrid>
    );

    const grid = screen.getByText('Item 1').parentElement;
    expect(grid).toHaveClass('grid');
    expect(grid).toHaveClass('gap-4');
  });
});