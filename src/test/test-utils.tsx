import React from 'react';
import { render as originalRender, RenderOptions } from '@testing-library/react';

// カスタムrender関数 - 確実にcontainerを作成
function customRender(ui: React.ReactElement, options: RenderOptions = {}) {
  // DOM環境の完全な初期化
  if (!global.document) {
    throw new Error('document is not available. Make sure jsdom is set up correctly.');
  }
  
  // 確実にdocument.bodyが存在することを保証
  if (!document.body) {
    document.body = document.createElement('body');
  }
  
  // containerが指定されていない場合は新しく作成
  if (!options.container) {
    const container = document.createElement('div');
    container.setAttribute('data-testid', 'test-container');
    document.body.appendChild(container);
    options.container = container;
  }
  
  // DOM要素が有効であることを確認
  if (!options.container.nodeType) {
    throw new Error('Container is not a valid DOM element');
  }
  
  return originalRender(ui, options);
}

// Named export
export { customRender as render };

// Re-export everything else from @testing-library/react
export * from '@testing-library/react';