import { FrameCalculator } from '../lib/FrameCalculator';
import type { Fighter, Move, CalculationOptions, PunishResult } from '../types/frameData';

export interface CalculationRequest {
  attackingFighter: Fighter;
  attackMove: Move;
  defendingFighters: Fighter[];
  options: CalculationOptions;
}

export async function calculatePunishOptions(request: CalculationRequest): Promise<PunishResult[]> {
  const { attackMove, defendingFighters, options } = request;
  const results: PunishResult[] = [];

  try {
    for (const defender of defendingFighters) {
      const punishResult = FrameCalculator.calculatePunishWindow(
        attackMove,
        defender,
        options.staleness,
        options
      );

      // フィルタリング適用
      const filteredMoves = punishResult.punishingMoves.filter(move => {
        // 距離フィルタ
        if (!options.rangeFilter.includes(move.move.range)) {
          return false;
        }

        // フレーム有利範囲
        if (punishResult.frameAdvantage < options.minimumFrameAdvantage ||
            punishResult.frameAdvantage > options.maximumFrameAdvantage) {
          return false;
        }

        // ダメージ範囲
        if (move.damage < options.minimumDamage) {
          return false;
        }

        // 確定のみフィルタ
        if (options.onlyGuaranteed && !move.isGuaranteed) {
          return false;
        }

        // 撃墜技フィルタ
        if (!options.includeKillMoves && move.move.properties.isKillMove) {
          return false;
        }

        return true;
      });

      if (filteredMoves.length > 0) {
        results.push({
          ...punishResult,
          punishingMoves: filteredMoves.sort((a, b) => {
            // 確定技を優先、その後ダメージでソート
            if (a.isGuaranteed !== b.isGuaranteed) {
              return a.isGuaranteed ? -1 : 1;
            }
            return b.damage - a.damage;
          })
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