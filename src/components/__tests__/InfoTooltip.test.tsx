import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { expect, test, describe } from 'vitest';
import InfoTooltip from '../InfoTooltip';

describe('InfoTooltip', () => {
  test('デフォルトの情報アイコンが表示される', () => {
    render(<InfoTooltip content="テストコンテンツ" />);
    
    const button = screen.getByRole('button', { name: '詳細情報' });
    expect(button).toBeInTheDocument();
  });

  test('ホバー時にツールチップが表示される', () => {
    render(<InfoTooltip content="テストコンテンツ" />);
    
    const button = screen.getByRole('button', { name: '詳細情報' });
    
    // ホバー前はツールチップが非表示
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    
    // ホバー
    fireEvent.mouseEnter(button);
    
    // ツールチップが表示される
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    expect(screen.getByText('テストコンテンツ')).toBeInTheDocument();
  });

  test('ホバー終了時にツールチップが非表示になる', () => {
    render(<InfoTooltip content="テストコンテンツ" />);
    
    const button = screen.getByRole('button', { name: '詳細情報' });
    
    // ホバー
    fireEvent.mouseEnter(button);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    
    // ホバー終了
    fireEvent.mouseLeave(button);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  test('フォーカス時にツールチップが表示される', () => {
    render(<InfoTooltip content="テストコンテンツ" />);
    
    const button = screen.getByRole('button', { name: '詳細情報' });
    
    // フォーカス前は非表示
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    
    // フォーカス
    fireEvent.focus(button);
    
    // ツールチップが表示される
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });

  test('ブラー時にツールチップが非表示になる', () => {
    render(<InfoTooltip content="テストコンテンツ" />);
    
    const button = screen.getByRole('button', { name: '詳細情報' });
    
    // フォーカス
    fireEvent.focus(button);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    
    // ブラー
    fireEvent.blur(button);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  test('複雑なコンテンツが表示される', () => {
    const complexContent = (
      <div>
        <h3>タイトル</h3>
        <p>説明文</p>
        <ul>
          <li>項目1</li>
          <li>項目2</li>
        </ul>
      </div>
    );
    
    render(<InfoTooltip content={complexContent} />);
    
    const button = screen.getByRole('button', { name: '詳細情報' });
    fireEvent.mouseEnter(button);
    
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    expect(screen.getByText('タイトル')).toBeInTheDocument();
    expect(screen.getByText('説明文')).toBeInTheDocument();
    expect(screen.getByText('項目1')).toBeInTheDocument();
    expect(screen.getByText('項目2')).toBeInTheDocument();
  });

  test('カスタムクラス名が適用される', () => {
    render(<InfoTooltip content="テスト" className="custom-class" />);
    
    const container = screen.getByRole('button', { name: '詳細情報' }).parentElement;
    expect(container).toHaveClass('custom-class');
  });

  test('カスタム子要素が表示される', () => {
    render(
      <InfoTooltip content="テスト">
        <span>カスタムアイコン</span>
      </InfoTooltip>
    );
    
    expect(screen.getByText('カスタムアイコン')).toBeInTheDocument();
  });
});