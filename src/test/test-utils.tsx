/**
 * React Testing Library用のカスタムテストユーティリティ
 * React 18 createRoot対応とDOMコンテナ問題の回避
 */

import { ReactElement } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';

/**
 * カスタムレンダー関数
 * DOM要素の作成エラーを回避し、確実にレンダリングを実行
 */
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'container'> & {
    container?: Element;
  }
): RenderResult => {
  // コンテナが指定されていない場合は新しいものを作成
  let container = options?.container;
  
  if (!container) {
    container = document.createElement('div');
    container.id = 'custom-test-container';
    
    // DOM要素として確実に認識されるよう設定
    Object.defineProperty(container, 'nodeType', {
      value: Node.ELEMENT_NODE,
      writable: false
    });
    
    document.body.appendChild(container);
  }

  return render(ui, {
    ...options,
    container: container as HTMLElement,
  });
};

// re-export everything
// eslint-disable-next-line react-refresh/only-export-components
export * from '@testing-library/react';

// override render method
export { customRender as render };