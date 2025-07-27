/**
 * テスト環境のグローバル型定義
 * React 18対応とテスト環境設定のための型拡張
 */

declare global {
  /**
   * React 18 テスト環境の制御フラグ
   */
  namespace NodeJS {
    interface Global {
      /** React Testing LibraryでACT警告を抑制 */
      IS_REACT_ACT_ENVIRONMENT: boolean;
      /** React 18のlegacy renderモードを強制 */
      IS_REACT_18_LEGACY_MODE: boolean;
    }
  }

  /**
   * ブラウザ環境でのテスト制御変数
   */
  interface Window {
    /** React Testing LibraryでのlegacyRoot強制使用 */
    FORCE_LEGACY_ROOT?: boolean;
    /** React 18のStrict Modeを無効化 */
    DISABLE_REACT_STRICT_MODE?: boolean;
  }

  /**
   * グローバル環境でのテスト制御変数
   */
  // eslint-disable-next-line no-var
  var IS_REACT_ACT_ENVIRONMENT: boolean;
  // eslint-disable-next-line no-var
  var IS_REACT_18_LEGACY_MODE: boolean;
  // eslint-disable-next-line no-var
  var FORCE_LEGACY_ROOT: boolean;
  // eslint-disable-next-line no-var
  var DISABLE_REACT_STRICT_MODE: boolean;

  /**
   * デバッグモード設定
   */
  // eslint-disable-next-line no-var
  var DEBUG_TESTS: string | undefined;
}

export {};