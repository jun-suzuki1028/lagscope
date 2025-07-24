import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Tailwind CSSクラス名を結合・統合するユーティリティ関数
 * 
 * - clsx: 条件付きクラス名の結合
 * - twMerge: Tailwindクラスの重複・競合を解決
 * 
 * @param inputs - クラス名（文字列、配列、オブジェクト、条件式）
 * @returns 統合されたクラス名文字列
 * 
 * @example
 * ```tsx
 * cn('bg-red-500', 'bg-blue-500') // 'bg-blue-500' (後勝ち)
 * cn('px-4', isActive && 'bg-blue-500') // 条件付きクラス
 * cn(['px-4', 'py-2'], { 'bg-blue-500': isActive }) // 配列・オブジェクト形式
 * ```
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}