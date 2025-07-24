/**
 * 共通の文字列フォーマッター関数
 * 
 * コンポーネント外で定義することで、レンダリングごとの関数再生成を避け、
 * useCallbackの必要性を排除
 */

/**
 * 反撃方法を日本語表記に変換
 */
export const formatMethod = (method: string): string => {
  const methodMap: Record<string, string> = {
    normal: '通常',
    out_of_shield: 'ガード解除',
    guard_cancel_jump: 'ガーキャン空中攻撃',
    guard_cancel_grab: 'ガーキャン掴み',
    guard_cancel_up_b: 'ガーキャン上B',
    guard_cancel_up_smash: 'ガーキャン上スマ',
    guard_cancel_nair: 'ガーキャン空N',
    guard_cancel_up_tilt: 'ガーキャン上強',
    perfect_shield: 'ジャストシールド',
    roll_away: '回避(離脱)',
    roll_behind: '回避(後ろ)',
    spot_dodge: 'その場回避',
  };
  return methodMap[method] || method;
};

/**
 * 技タイプを日本語表記に変換
 */
export const formatMoveType = (type: string): string => {
  const typeMap: Record<string, string> = {
    normal: '通常技',
    special: '必殺技',
    grab: '掴み',
    throw: '投げ',
  };
  return typeMap[type] || type;
};