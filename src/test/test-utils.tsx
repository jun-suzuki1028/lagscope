import React from 'react';
import { render as originalRender, RenderOptions, renderHook as originalRenderHook } from '@testing-library/react';

// カスタムrender関数 - DOM要素の確実な作成
function customRender(ui: React.ReactElement, options: RenderOptions = {}) {
  // DOM環境の基本チェック
  if (!document || !document.body) {
    throw new Error('DOM環境が初期化されていません');
  }
  
  // container が指定されていない場合、新しいcontainerを作成
  if (!options.container) {
    const container = document.createElement('div');
    
    // DOMに追加してからcontainerとして使用
    document.body.appendChild(container);
    options.container = container;
    
    // テスト完了後にクリーンアップするためのフラグ
    container.setAttribute('data-auto-cleanup', 'true');
  }
  
  return originalRender(ui, options);
}

// カスタムrenderHook関数 - RTLのデフォルト動作を使用
function customRenderHook<Result, Props>(
  render: (initialProps: Props) => Result,
  options?: Parameters<typeof originalRenderHook<Result, Props>>[1]
) {
  return originalRenderHook<Result, Props>(render, options);
}

// Named exports
export { customRender as render, customRenderHook as renderHook };

// Re-export everything else from @testing-library/react
// eslint-disable-next-line react-refresh/only-export-components
export * from '@testing-library/react';