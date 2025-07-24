import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect } from 'vitest';
// 新しいモックデータを再エクスポート
export { 
  createMockFighter, 
  createMockMove, 
  mockFightersArray,
  mockMario,
  mockPikachu,
  mockKazuya,
  createMockJab,
  createMockSmash,
  createMockAerial,
  createMockGrab
} from './mock-data';

/**
 * テスト用の共通ヘルパー関数
 * CI環境での安定性を向上させるためのユーティリティ
 */

/**
 * モーダルを安全に開くヘルパー関数
 */
export const openCharacterModal = async (user: ReturnType<typeof userEvent.setup>) => {
  const modalButton = screen.getByRole('button', { name: 'キャラクター選択モーダルを開く' });
  await user.click(modalButton);
  
  // モーダルが完全に表示されるまで待機
  await waitFor(() => {
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  }, { timeout: 3000 });
  
  return screen.getByRole('dialog');
};

/**
 * キャラクター選択を安全に実行するヘルパー関数
 */
export const selectCharacterSafely = async (
  user: ReturnType<typeof userEvent.setup>,
  characterName: string
) => {
  await openCharacterModal(user);
  
  // キャラクターカードの出現を待機
  const characterCard = await waitFor(() => {
    return screen.getByRole('button', { name: new RegExp(characterName, 'i') });
  }, { timeout: 3000 });
  
  await user.click(characterCard);
  
  // モーダルが閉じるまで待機
  await waitFor(() => {
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  }, { timeout: 2000 });
};

// createMockFighterは./mock-data.tsに移動したため、レガシー関数として残す
// 注意: 新しいテストでは mock-data.ts の createMockFighter を使用してください

/**
 * CI環境用の安定したアサーション
 */
export const expectElementToBeVisible = async (
  role: string, 
  name: string | RegExp,
  timeout = 3000
) => {
  await waitFor(() => {
    const element = screen.getByRole(role, { name });
    expect(element).toBeInTheDocument();
    expect(element).toBeVisible();
  }, { timeout });
};

/**
 * レスポンシブテスト用のビューポート設定
 */
export const setViewport = (width: number, height: number = 800) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
  
  // resize イベントを発火
  window.dispatchEvent(new Event('resize'));
};

/**
 * エラー状態のモック作成
 */
export const createErrorState = (message: string = 'テストエラー') => ({
  loading: false,
  error: message,
  data: null,
  lastFetch: null,
});

/**
 * ローディング状態のモック作成
 */
export const createLoadingState = () => ({
  loading: true,
  error: null,
  data: null,
  lastFetch: null,
});

/**
 * 成功状態のモック作成
 */
export const createSuccessState = (data: unknown) => ({
  loading: false,
  error: null,
  data,
  lastFetch: Date.now(),
});

/**
 * CI環境での非同期テスト用のタイムアウト設定
 */
export const CI_TIMEOUT = process.env.CI ? 10000 : 5000;

/**
 * デバッグ用のDOM状態出力
 */
export const debugDOMState = (title: string = 'DOM State') => {
  if (process.env.NODE_ENV === 'test' && process.env.DEBUG_TESTS) {
    // eslint-disable-next-line no-console
    console.log(`\n=== ${title} ===`);
    // eslint-disable-next-line no-console
    console.log(document.body.innerHTML);
    // eslint-disable-next-line no-console
    console.log('==================\n');
  }
};

/**
 * 技選択のヘルパー関数
 */
export const selectMove = async (
  user: ReturnType<typeof userEvent.setup>,
  moveId: string
) => {
  const dropdown = screen.getByTestId('move-select');
  await user.selectOptions(dropdown, moveId);
};

/**
 * 検索機能のヘルパー関数
 */
export const searchCharacters = async (
  user: ReturnType<typeof userEvent.setup>,
  searchTerm: string
) => {
  const searchInput = screen.getByRole('searchbox');
  await user.clear(searchInput);
  await user.type(searchInput, searchTerm);
};

/**
 * キーボードイベントのヘルパー関数
 */
export const pressKey = async (
  user: ReturnType<typeof userEvent.setup>,
  key: string
) => {
  await user.keyboard(`{${key}}`);
};

/**
 * 複数の状態をテストするためのヘルパー
 */
export const testElementStates = async (
  getElement: () => HTMLElement,
  states: Array<{
    description: string;
    setup?: () => void | Promise<void>;
    assertion: (element: HTMLElement) => void;
  }>
) => {
  for (const state of states) {
    if (state.setup) {
      await state.setup();
    }
    const element = getElement();
    state.assertion(element);
  }
};

/**
 * アクセシビリティ属性の検証ヘルパー
 */
export const expectAccessibilityAttributes = (
  element: HTMLElement,
  attributes: Record<string, string>
) => {
  Object.entries(attributes).forEach(([attr, value]) => {
    expect(element).toHaveAttribute(attr, value);
  });
};

/**
 * フォーム要素の検証ヘルパー
 */
export const expectFormElement = (
  element: HTMLElement,
  expectedRole: string,
  expectedValue?: string
) => {
  expect(element).toHaveAttribute('role', expectedRole);
  if (expectedValue) {
    expect(element).toHaveValue(expectedValue);
  }
};

/**
 * CSS クラスの存在確認ヘルパー
 */
export const expectElementClasses = (
  element: HTMLElement,
  expectedClasses: string[]
) => {
  expectedClasses.forEach(className => {
    expect(element).toHaveClass(className);
  });
};

/**
 * 要素の可視性チェックヘルパー
 */
export const expectElementVisibility = (
  element: HTMLElement,
  shouldBeVisible: boolean
) => {
  if (shouldBeVisible) {
    expect(element).toBeInTheDocument();
    expect(element).toBeVisible();
  } else {
    expect(element).not.toBeInTheDocument();
  }
};

/**
 * ローディング状態のテストヘルパー
 */
export const expectLoadingState = (isLoading: boolean) => {
  if (isLoading) {
    expect(screen.getByText('キャラクターデータを読み込み中...')).toBeInTheDocument();
  } else {
    expect(screen.queryByText('キャラクターデータを読み込み中...')).not.toBeInTheDocument();
  }
};

/**
 * エラー状態のテストヘルパー
 */
export const expectErrorState = (hasError: boolean, errorMessage?: string) => {
  if (hasError) {
    expect(screen.getByText('キャラクターデータの読み込みエラー')).toBeInTheDocument();
    if (errorMessage) {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    }
  } else {
    expect(screen.queryByText('キャラクターデータの読み込みエラー')).not.toBeInTheDocument();
  }
};