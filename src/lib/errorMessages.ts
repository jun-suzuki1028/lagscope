// Common error message presets
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'ネットワークエラーが発生しました。インターネット接続を確認してください。',
  DATA_LOAD_ERROR: 'データの読み込みに失敗しました。',
  VALIDATION_ERROR: '入力内容に問題があります。',
  CALCULATION_ERROR: '計算処理でエラーが発生しました。',
  UNKNOWN_ERROR: '予期しないエラーが発生しました。',
  PERMISSION_ERROR: '権限がありません。',
  TIMEOUT_ERROR: 'タイムアウトしました。',
  SERVER_ERROR: 'サーバーエラーが発生しました。',
  CLIENT_ERROR: 'クライアントエラーが発生しました。',
  FIGHTER_NOT_FOUND: '指定されたファイターが見つかりません。',
  MOVE_NOT_FOUND: '指定された技が見つかりません。',
  INVALID_CALCULATION: '計算に必要なデータが不足しています。',
} as const;

export type ErrorMessageKey = keyof typeof ERROR_MESSAGES;