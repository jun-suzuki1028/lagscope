/**
 * ゲームメカニクス関連の定数
 * スマブラSPECIALの基本システム値を定義
 */
export const GAME_MECHANICS = {
  /** シールド解除に必要なフレーム数 */
  SHIELD_RELEASE_FRAMES: 11,
  
  /** シールドグラブに必要なフレーム数 */
  SHIELD_GRAB_FRAMES: 11,
  
  /** シールドヒットストップの基本値 */
  SHIELD_HITSTOP_BASE: 2,
  
  /** 攻撃ヒットストップの基本値 */
  ATTACK_HITSTOP_BASE: 3,
} as const;

/**
 * アプリケーション設定の定数
 */
export const APP_CONFIG = {
  /** 計算結果の最大表示件数 */
  MAX_RESULTS_DISPLAY: 100,
  
  /** 検索時の最小文字数 */
  MIN_SEARCH_LENGTH: 1,
  
  /** デバウンス時間（ミリ秒） */
  DEBOUNCE_DELAY: 300,
  
  /** デフォルトの最小ダメージ */
  DEFAULT_MIN_DAMAGE: 0,
  
  /** デフォルトの最小フレーム有利 */
  DEFAULT_MIN_FRAME_ADVANTAGE: 1,
  
  /** デフォルトの最大フレーム有利 */
  DEFAULT_MAX_FRAME_ADVANTAGE: 30,
} as const;

/**
 * UI関連の定数
 */
export const UI_CONFIG = {
  /** モバイルブレークポイント（px） */
  MOBILE_BREAKPOINT: 768,
  
  /** タブレットブレークポイント（px） */
  TABLET_BREAKPOINT: 1024,
  
  /** アニメーション時間（ミリ秒） */
  ANIMATION_DURATION: 200,
  
  /** ツールチップ表示遅延（ミリ秒） */
  TOOLTIP_DELAY: 500,
} as const;

/**
 * フレームデータの範囲制限
 */
export const FRAME_DATA_LIMITS = {
  /** 発生フレームの最小値 */
  MIN_STARTUP_FRAME: 1,
  
  /** 発生フレームの最大値 */
  MAX_STARTUP_FRAME: 200,
  
  /** 全体フレームの最小値 */
  MIN_TOTAL_FRAMES: 1,
  
  /** 全体フレームの最大値 */
  MAX_TOTAL_FRAMES: 300,
  
  /** ダメージの最小値 */
  MIN_DAMAGE: 0,
  
  /** ダメージの最大値 */
  MAX_DAMAGE: 999,
} as const;

/**
 * 技の属性に関する定数
 */
export const MOVE_PROPERTIES = {
  /** 撃墜技と判定されるダメージ閾値 */
  KILL_MOVE_DAMAGE_THRESHOLD: 15,
  
  /** 強技と判定されるダメージ閾値 */
  STRONG_MOVE_DAMAGE_THRESHOLD: 12,
  
  /** 弱技と判定されるダメージ閾値 */
  WEAK_MOVE_DAMAGE_THRESHOLD: 8,
} as const;