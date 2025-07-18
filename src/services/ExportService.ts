import type { PunishResult, PunishMove } from '../types/frameData';

export type ExportFormat = 'csv' | 'txt' | 'json';

export interface ExportOptions {
  format: ExportFormat;
  includeMetadata: boolean;
  fileName?: string;
}

export class ExportService {
  private static formatMethod(method: string): string {
    const methodMap: Record<string, string> = {
      normal: '通常',
      out_of_shield: 'ガード解除',
      guard_cancel_jump: 'ガーキャン空中攻撃',
      guard_cancel_grab: 'ガーキャン掴み',
      guard_cancel_up_b: 'ガーキャン上B',
      guard_cancel_up_smash: 'ガーキャン上スマ',
      guard_cancel_nair: 'ガーキャン空N',
      guard_cancel_up_tilt: 'ガーキャン上強',
      shield_drop: 'シールドドロップ',
      perfect_shield: 'ジャストシールド',
      roll_away: '回避(離脱)',
      roll_behind: '回避(後ろ)',
      spot_dodge: 'その場回避',
    };
    return methodMap[method] || method;
  }

  private static formatMoveType(type: string): string {
    const typeMap: Record<string, string> = {
      normal: '通常技',
      special: '必殺技',
      grab: '掴み',
      throw: '投げ',
    };
    return typeMap[type] || type;
  }

  private static flattenResults(results: PunishResult[]): Array<{
    result: PunishResult;
    move: PunishMove;
  }> {
    const flattened: Array<{
      result: PunishResult;
      move: PunishMove;
    }> = [];

    results.forEach(result => {
      result.punishingMoves.forEach(move => {
        flattened.push({ result, move });
      });
    });

    return flattened;
  }

  static exportToCSV(results: PunishResult[], options: ExportOptions): string {
    if (results.length === 0) {
      throw new Error('エクスポートするデータがありません');
    }

    const flattened = this.flattenResults(results);
    const headers = [
      '防御キャラクター',
      '技名',
      '技タイプ',
      'ダメージ',
      '発生フレーム',
      '全体フレーム',
      '反撃方法',
      '確定度',
      '成功率',
      '撃墜%',
      'フレーム有利',
      '攻撃技',
      '距離',
      'ワンパターン相殺',
    ];

    const rows = flattened.map(({ result, move }) => [
      result.defendingFighter.displayName,
      move.move.displayName,
      this.formatMoveType(move.move.type),
      move.damage.toString(),
      move.move.startup.toString(),
      move.totalFrames.toString(),
      this.formatMethod(move.method),
      move.isGuaranteed ? '確定' : '不確定',
      `${Math.round(move.probability * 100)}%`,
      move.killPercent?.toString() || '-',
      result.frameAdvantage.toString(),
      result.attackingMove.displayName,
      result.calculationContext.range,
      result.calculationContext.staleness,
    ]);

    let csvContent = headers.join(',') + '\n';
    csvContent += rows.map(row => 
      row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    if (options.includeMetadata) {
      const metadata = [
        `エクスポート日時: ${new Date().toLocaleString('ja-JP')}`,
        `データ件数: ${flattened.length}`,
        `キャラクター数: ${new Set(results.map(r => r.defendingFighter.id)).size}`,
        `生成元: LagScope - スマブラSP確定反撃計算ツール`,
      ];
      csvContent = metadata.join('\n') + '\n\n' + csvContent;
    }

    return csvContent;
  }

  static exportToText(results: PunishResult[], options: ExportOptions): string {
    if (results.length === 0) {
      throw new Error('エクスポートするデータがありません');
    }

    const flattened = this.flattenResults(results);
    let textContent = '';

    if (options.includeMetadata) {
      textContent += `LagScope - スマブラSP確定反撃計算結果\n`;
      textContent += `${'='.repeat(50)}\n`;
      textContent += `エクスポート日時: ${new Date().toLocaleString('ja-JP')}\n`;
      textContent += `データ件数: ${flattened.length}\n`;
      textContent += `キャラクター数: ${new Set(results.map(r => r.defendingFighter.id)).size}\n`;
      textContent += `${'='.repeat(50)}\n\n`;
    }

    // キャラクター別にグループ化
    const groupedByCharacter = flattened.reduce((acc, { result, move }) => {
      const characterId = result.defendingFighter.id;
      if (!acc[characterId]) {
        acc[characterId] = {
          fighter: result.defendingFighter,
          moves: [],
          context: result.calculationContext,
        };
      }
      acc[characterId].moves.push(move);
      return acc;
    }, {} as Record<string, {
      fighter: Fighter;
      moves: PunishMove[];
      context: CalculationContext;
    }>);

    Object.values(groupedByCharacter).forEach(({ fighter, moves, context }) => {
      textContent += `■ ${fighter.displayName}\n`;
      textContent += `  攻撃技: ${context.options ? results.find(r => r.defendingFighter.id === fighter.id)?.attackingMove.displayName : 'N/A'}\n`;
      textContent += `  フレーム有利: ${results.find(r => r.defendingFighter.id === fighter.id)?.frameAdvantage || 'N/A'}\n`;
      textContent += `  距離: ${context.range}\n`;
      textContent += `  ワンパターン相殺: ${context.staleness}\n`;
      textContent += `\n`;

      // 確定技と不確定技を分ける
      const guaranteedMoves = moves.filter(m => m.isGuaranteed);
      const uncertainMoves = moves.filter(m => !m.isGuaranteed);

      if (guaranteedMoves.length > 0) {
        textContent += `  【確定反撃】\n`;
        guaranteedMoves.forEach(move => {
          textContent += `    • ${move.move.displayName}`;
          textContent += ` (${this.formatMoveType(move.move.type)})`;
          textContent += ` - ${move.damage}% [${move.move.startup}F/${move.totalFrames}F]`;
          textContent += ` (${this.formatMethod(move.method)})`;
          if (move.killPercent) {
            textContent += ` 撃墜${move.killPercent}%`;
          }
          textContent += `\n`;
        });
        textContent += `\n`;
      }

      if (uncertainMoves.length > 0) {
        textContent += `  【不確定反撃】\n`;
        uncertainMoves.forEach(move => {
          textContent += `    • ${move.move.displayName}`;
          textContent += ` (${this.formatMoveType(move.move.type)})`;
          textContent += ` - ${move.damage}% [${move.move.startup}F/${move.totalFrames}F]`;
          textContent += ` (${this.formatMethod(move.method)})`;
          textContent += ` 成功率${Math.round(move.probability * 100)}%`;
          if (move.killPercent) {
            textContent += ` 撃墜${move.killPercent}%`;
          }
          textContent += `\n`;
        });
        textContent += `\n`;
      }

      textContent += `${'-'.repeat(30)}\n\n`;
    });

    return textContent;
  }

  static exportToJSON(results: PunishResult[], options: ExportOptions): string {
    if (results.length === 0) {
      throw new Error('エクスポートするデータがありません');
    }

    const exportData: Record<string, unknown> = {
      results,
    };

    if (options.includeMetadata) {
      exportData.metadata = {
        exportDate: new Date().toISOString(),
        exportTool: 'LagScope',
        version: '1.0.0',
        dataCount: this.flattenResults(results).length,
        characterCount: new Set(results.map(r => r.defendingFighter.id)).size,
        format: 'json',
      };
    }

    return JSON.stringify(exportData, null, 2);
  }

  static export(results: PunishResult[], options: ExportOptions): string {
    switch (options.format) {
      case 'csv':
        return this.exportToCSV(results, options);
      case 'txt':
        return this.exportToText(results, options);
      case 'json':
        return this.exportToJSON(results, options);
      default:
        throw new Error(`未サポートの形式です: ${options.format}`);
    }
  }

  static downloadFile(content: string, fileName: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // メモリリークを防ぐためURLを解放
    URL.revokeObjectURL(url);
  }

  static exportAndDownload(results: PunishResult[], options: ExportOptions): void {
    const content = this.export(results, options);
    
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const fileName = options.fileName || `lagscope-results-${timestamp}.${options.format}`;
    
    const mimeTypes = {
      csv: 'text/csv;charset=utf-8',
      txt: 'text/plain;charset=utf-8',
      json: 'application/json;charset=utf-8',
    };
    
    this.downloadFile(content, fileName, mimeTypes[options.format]);
  }

  static validateResults(results: PunishResult[]): void {
    if (!Array.isArray(results)) {
      throw new Error('結果は配列である必要があります');
    }

    if (results.length === 0) {
      throw new Error('エクスポートするデータがありません');
    }

    results.forEach((result, index) => {
      if (!result.defendingFighter || !result.defendingFighter.displayName) {
        throw new Error(`結果${index + 1}: 防御キャラクターが無効です`);
      }

      if (!result.punishingMoves || result.punishingMoves.length === 0) {
        throw new Error(`結果${index + 1}: 反撃技が設定されていません`);
      }

      result.punishingMoves.forEach((move, moveIndex) => {
        if (!move.move || !move.move.displayName) {
          throw new Error(`結果${index + 1}, 技${moveIndex + 1}: 技情報が無効です`);
        }
      });
    });
  }
}