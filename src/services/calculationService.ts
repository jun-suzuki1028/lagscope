import { FrameCalculator } from '../lib/FrameCalculator';
import type { Fighter, Move, CalculationOptions, PunishResult, PunishMove } from '../types/frameData';

export interface CalculationRequest {
  attackingFighter: Fighter;
  attackMove: Move;
  defendingFighters: Fighter[];
  options: CalculationOptions;
}

/**
 * 効率化されたフィルタリング関数
 * 早期リターンによりパフォーマンスを最適化
 */
function isValidPunishMove(
  move: PunishMove, 
  frameAdvantage: number, 
  options: CalculationOptions
): boolean {
  // 最も高速な条件から順に評価（早期リターン最適化）
  
  // 数値比較（最高速）
  if (move.damage < options.minimumDamage) return false;
  if (frameAdvantage < options.minimumFrameAdvantage || 
      frameAdvantage > options.maximumFrameAdvantage) return false;
  
  // ブール値比較（高速）
  if (options.onlyGuaranteed && !move.isGuaranteed) return false;
  if (!options.includeKillMoves && move.move.properties.isKillMove) return false;
  
  // 配列検索（低速、最後に実行）
  if (!options.rangeFilter.includes(move.move.range)) return false;
  
  return true;
}

/**
 * 最適化されたソート関数
 * 安定ソートとパフォーマンスを両立
 */
function sortPunishMoves(moves: PunishMove[]): PunishMove[] {
  return moves.sort((a, b) => {
    // 確定技を優先（ブール値比較で高速）
    if (a.isGuaranteed !== b.isGuaranteed) {
      return a.isGuaranteed ? -1 : 1;
    }
    // ダメージ順（数値比較で高速）
    return b.damage - a.damage;
  });
}

export async function calculatePunishOptions(request: CalculationRequest): Promise<PunishResult[]> {
  const { attackMove, defendingFighters, options } = request;
  const results: PunishResult[] = [];

  try {
    // Promise.allでの並列処理も検討できるが、メモリ使用量とのトレードオフ
    // 現在は安定性を優先して順次処理を維持
    for (const defender of defendingFighters) {
      const punishResult = FrameCalculator.calculatePunishWindow(
        attackMove,
        defender,
        options.staleness,
        options
      );

      // 最適化されたフィルタリング
      const filteredMoves = punishResult.punishingMoves.filter(move => 
        isValidPunishMove(move, punishResult.frameAdvantage, options)
      );

      if (filteredMoves.length > 0) {
        results.push({
          ...punishResult,
          punishingMoves: sortPunishMoves(filteredMoves)
        });
      }
    }

    return results;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Calculation failed:', error);
    throw new Error('計算中にエラーが発生しました');
  }
}

export function validateCalculationRequest(request: Partial<CalculationRequest>): string[] {
  const errors: string[] = [];

  if (!request.attackingFighter) {
    errors.push('攻撃側キャラクターが選択されていません');
  }

  if (!request.attackMove) {
    errors.push('攻撃技が選択されていません');
  }

  if (!request.defendingFighters || request.defendingFighters.length === 0) {
    errors.push('防御側キャラクターが選択されていません');
  }

  if (!request.options) {
    errors.push('計算オプションが設定されていません');
  }

  return errors;
}