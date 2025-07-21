import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Fighter } from '../types/frameData';
import { expect } from 'vitest';

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

/**
 * テスト用のモックファイター作成
 */
export const createMockFighter = (overrides: Partial<Fighter> = {}): Fighter => ({
  id: 'test-fighter',
  name: 'Test Fighter',
  displayName: 'テストファイター',
  series: 'Test Series',
  weight: 100,
  fallSpeed: 1.5,
  fastFallSpeed: 2.4,
  gravity: 0.087,
  walkSpeed: 1.0,
  runSpeed: 1.5,
  airSpeed: 1.0,
  iconUrl: '/test-icon.png',
  moves: [],
  shieldData: {
    shieldHealth: 50,
    shieldRegen: 0.07,
    shieldRegenDelay: 30,
    shieldStun: 0.8665,
    shieldReleaseFrames: 11,
    shieldGrabFrames: 6,
    outOfShieldOptions: []
  },
  movementData: {
    jumpSquat: 3,
    fullHopHeight: 30.0,
    shortHopHeight: 15.0,
    airJumps: 1,
    dodgeFrames: {
      spotDodge: { startup: 3, active: 20, recovery: 4, total: 27 },
      airDodge: { startup: 3, active: 29, recovery: 28, total: 60 }
    },
    rollFrames: {
      forward: { startup: 4, active: 12, recovery: 15, total: 31 },
      backward: { startup: 4, active: 12, recovery: 15, total: 31 }
    }
  },
  ...overrides
});

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