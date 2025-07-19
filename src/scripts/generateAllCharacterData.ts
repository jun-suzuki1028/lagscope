#!/usr/bin/env node

/**
 * 全キャラクターのフレームデータ生成スクリプト
 * SPECIALの全88キャラクター分のデータを一括生成
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { 
  ALL_CHARACTERS, 
  getSeriesStatistics,
  getBaseRosterCount,
  getDLCCount 
} from '../data/charactersRegistry';
import { 
  generateFighterFromTemplate,
  CHARACTER_ADJUSTMENTS,
  GAME_MECHANICS
} from '../data/dataTemplate';
import { 
  dataBatchProcessor 
} from '../services/DataBatchProcessor';
import { Fighter, FrameDataStats } from '../types/frameData';

async function main() {
  console.log('🚀 大乱闘スマッシュブラザーズ SPECIAL フレームデータ生成開始');
  console.log(`📊 対象キャラクター: ${ALL_CHARACTERS.length}体`);
  console.log(`📈 基本ファイター: ${getBaseRosterCount()}体`);
  console.log(`🎮 DLCファイター: ${getDLCCount()}体`);
  
  const seriesStats = getSeriesStatistics();
  console.log('📂 シリーズ別統計:');
  Object.entries(seriesStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .forEach(([series, count]) => {
      console.log(`   ${series}: ${count}体`);
    });

  try {
    // データディレクトリの準備
    await prepareDirectories();
    
    // 全キャラクターデータの生成
    console.log('\n📝 キャラクターデータ生成中...');
    const generatedData = await generateAllCharacterData();
    
    // データの検証
    console.log('\n🔍 データ検証中...');
    const validationResults = await validateGeneratedData(generatedData);
    
    // データの保存
    console.log('\n💾 データ保存中...');
    await saveGeneratedData(generatedData);
    
    // 品質レポートの生成
    console.log('\n📋 品質レポート生成中...');
    const qualityReport = await generateQualityReport(generatedData);
    
    // 統計データの生成
    console.log('\n📊 統計データ生成中...');
    const stats = generateFrameDataStats(generatedData, qualityReport);
    
    // 結果の出力
    console.log('\n✅ 生成完了！');
    printResults(validationResults, qualityReport, stats);
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
  }
}

/**
 * データディレクトリの準備
 */
async function prepareDirectories(): Promise<void> {
  const dataDir = join(process.cwd(), 'public', 'data');
  const charactersDir = join(dataDir, 'characters');
  const verifiedDir = join(dataDir, 'verified');
  
  try {
    mkdirSync(dataDir, { recursive: true });
    mkdirSync(charactersDir, { recursive: true });
    mkdirSync(verifiedDir, { recursive: true });
    console.log('📁 データディレクトリを準備しました');
  } catch (error) {
    console.error('❌ ディレクトリ作成エラー:', error);
    throw error;
  }
}

/**
 * 全キャラクターデータの生成
 */
async function generateAllCharacterData(): Promise<Fighter[]> {
  const fighters: Fighter[] = [];
  let generated = 0;
  let errors = 0;

  for (const charInfo of ALL_CHARACTERS) {
    try {
      console.log(`  生成中: ${charInfo.displayName} (${charInfo.id})`);
      
      const adjustments = CHARACTER_ADJUSTMENTS.find(adj => adj.characterId === charInfo.id);
      const partialFighter = generateFighterFromTemplate(charInfo, adjustments);
      
      // 必須フィールドを確実に設定
      if (!partialFighter.id || !partialFighter.name || !partialFighter.displayName || 
          !partialFighter.series || partialFighter.weight === undefined || 
          partialFighter.fallSpeed === undefined || !partialFighter.moves ||
          !partialFighter.shieldData || !partialFighter.movementData) {
        throw new Error(`Missing required fields for fighter: ${charInfo.displayName}`);
      }

      const fighter: Fighter = {
        id: partialFighter.id,
        name: partialFighter.name,
        displayName: partialFighter.displayName,
        series: partialFighter.series,
        weight: partialFighter.weight,
        fallSpeed: partialFighter.fallSpeed,
        fastFallSpeed: partialFighter.fastFallSpeed || 0,
        gravity: partialFighter.gravity || 0,
        walkSpeed: partialFighter.walkSpeed || 0,
        runSpeed: partialFighter.runSpeed || 0,
        airSpeed: partialFighter.airSpeed || 0,
        moves: partialFighter.moves,
        shieldData: partialFighter.shieldData,
        movementData: partialFighter.movementData,
        imageUrl: partialFighter.imageUrl,
        iconUrl: partialFighter.iconUrl
      };
      
      fighters.push(fighter);
      generated++;
      
    } catch (error) {
      console.error(`  ❌ ${charInfo.displayName} の生成に失敗:`, error);
      errors++;
    }
  }

  console.log(`✅ 生成完了: ${generated}体成功、${errors}体失敗`);
  return fighters;
}

/**
 * 生成データの検証
 */
async function validateGeneratedData(fighters: Fighter[]): Promise<{
  successCount: number;
  errorCount: number;
  validationErrors: string[];
}> {
  console.log('  バッチ検証実行中...');
  
  const processor = dataBatchProcessor;
  const result = await processor.processAllCharacters({
    validateOnly: true,
    includeCharacters: fighters.map(f => f.id),
    generateMissingData: false,
    parallelProcessing: true,
    batchSize: 20
  });

  console.log(`  ✅ 検証完了: ${result.successCount}体成功、${result.errorCount}体エラー`);
  
  if (result.validationErrors.length > 0) {
    console.log('  ⚠️ 検証エラー:');
    result.validationErrors.slice(0, 5).forEach(error => {
      console.log(`    - ${error}`);
    });
    if (result.validationErrors.length > 5) {
      console.log(`    ... 他 ${result.validationErrors.length - 5} 件`);
    }
  }

  return result;
}

/**
 * データの保存
 */
async function saveGeneratedData(fighters: Fighter[]): Promise<void> {
  const dataDir = join(process.cwd(), 'public', 'data');
  const charactersDir = join(dataDir, 'characters');
  
  // 個別キャラクターファイルの保存
  let saved = 0;
  for (const fighter of fighters) {
    try {
      const filePath = join(charactersDir, `${fighter.id}.json`);
      writeFileSync(filePath, JSON.stringify(fighter, null, 2));
      saved++;
    } catch (error) {
      console.error(`  ❌ ${fighter.displayName} の保存に失敗:`, error);
    }
  }

  // インデックスファイルの保存
  const fighterIndex = fighters.map(f => ({
    id: f.id,
    name: f.name,
    displayName: f.displayName,
    series: f.series,
    moveCount: f.moves.length
  }));
  
  writeFileSync(
    join(charactersDir, 'index.json'),
    JSON.stringify(fighterIndex, null, 2)
  );

  // 統合ファイルの保存
  writeFileSync(
    join(dataDir, 'all-fighters.json'),
    JSON.stringify(fighters, null, 2)
  );

  // ゲームメカニクスの保存
  writeFileSync(
    join(dataDir, 'game-mechanics.json'),
    JSON.stringify(GAME_MECHANICS, null, 2)
  );

  console.log(`  ✅ ${saved}体のデータを保存しました`);
}

/**
 * 品質レポートの生成
 */
async function generateQualityReport(fighters: Fighter[]): Promise<{
  overallScore: number;
  completeness: number;
  accuracy: number;
  totalIssues: number;
  characterReports: Map<string, any>;
}> {
  const report = {
    overallScore: 0,
    completeness: 0,
    accuracy: 0,
    totalIssues: 0,
    characterReports: new Map()
  };

  let totalScore = 0;
  let totalCompleteness = 0;
  let totalAccuracy = 0;
  let totalIssues = 0;

  for (const fighter of fighters) {
    const expectedMoveCount = 20;
    const moveCount = fighter.moves.length;
    const completeness = Math.min(1, moveCount / expectedMoveCount);
    
    // 必須技のチェック
    const requiredMoves = ['jab1', 'ftilt', 'utilt', 'dtilt', 'fsmash', 'usmash', 'dsmash'];
    const missingMoves = requiredMoves.filter(move => 
      !fighter.moves.some(m => m.name === move)
    );
    
    const accuracy = missingMoves.length === 0 ? 1 : Math.max(0, 1 - (missingMoves.length / requiredMoves.length));
    const score = (completeness + accuracy) / 2;

    const charReport = {
      characterId: fighter.id,
      score,
      completeness,
      accuracy,
      moveCount,
      expectedMoveCount,
      missingMoves,
      issues: missingMoves.length > 0 ? [`Missing moves: ${missingMoves.join(', ')}`] : []
    };

    report.characterReports.set(fighter.id, charReport);
    totalScore += score;
    totalCompleteness += completeness;
    totalAccuracy += accuracy;
    totalIssues += missingMoves.length;
  }

  const count = fighters.length;
  report.overallScore = count > 0 ? totalScore / count : 0;
  report.completeness = count > 0 ? totalCompleteness / count : 0;
  report.accuracy = count > 0 ? totalAccuracy / count : 0;
  report.totalIssues = totalIssues;

  // 品質レポートの保存
  const reportData = {
    ...report,
    characterReports: Object.fromEntries(report.characterReports)
  };
  
  writeFileSync(
    join(process.cwd(), 'public', 'data', 'quality-report.json'),
    JSON.stringify(reportData, null, 2)
  );

  return report;
}

/**
 * フレームデータ統計の生成
 */
function generateFrameDataStats(
  fighters: Fighter[], 
  qualityReport: { accuracy: number }
): FrameDataStats {
  const totalMoves = fighters.reduce((sum, f) => sum + f.moves.length, 0);
  
  const stats: FrameDataStats = {
    totalFighters: fighters.length,
    totalMoves,
    lastUpdated: new Date().toISOString(),
    version: '1.0.0',
    gameVersion: 'v13.0.1',
    dataSource: 'Generated Template + Adjustments',
    accuracy: qualityReport.accuracy
  };

  // 統計データの保存
  writeFileSync(
    join(process.cwd(), 'public', 'data', 'stats.json'),
    JSON.stringify(stats, null, 2)
  );

  return stats;
}

/**
 * 結果の出力
 */
function printResults(
  _validationResults: { successCount: number; errorCount: number; validationErrors: string[] }, 
  qualityReport: { overallScore: number; completeness: number; accuracy: number; totalIssues: number }, 
  stats: FrameDataStats
): void {
  console.log('\n📈 生成結果サマリー:');
  console.log(`  キャラクター数: ${stats.totalFighters}体`);
  console.log(`  総技数: ${stats.totalMoves}技`);
  console.log(`  平均技数: ${Math.round(stats.totalMoves / stats.totalFighters)}技/キャラクター`);
  console.log(`  データ完成度: ${Math.round(qualityReport.completeness * 100)}%`);
  console.log(`  データ正確性: ${Math.round(qualityReport.accuracy * 100)}%`);
  console.log(`  総合品質スコア: ${Math.round(qualityReport.overallScore * 100)}%`);
  
  if (qualityReport.totalIssues > 0) {
    console.log(`  ⚠️ 修正が必要な項目: ${qualityReport.totalIssues}件`);
  }

  console.log(`\n💾 保存場所:`);
  console.log(`  個別データ: public/data/characters/`);
  console.log(`  統合データ: public/data/all-fighters.json`);
  console.log(`  品質レポート: public/data/quality-report.json`);
  console.log(`  統計データ: public/data/stats.json`);
  
  console.log('\n🎉 全キャラクターのフレームデータ生成が完了しました！');
}

if (require.main === module) {
  main().catch(console.error);
}

export { main as generateAllCharacterData };