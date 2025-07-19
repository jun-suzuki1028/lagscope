import { describe, it, expect } from 'vitest';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { 
  ALL_CHARACTERS, 
  getCharacterInfo,
  getSeriesStatistics,
  getBaseRosterCount,
  getDLCCount 
} from '../data/charactersRegistry';
import { 
  generateFighterFromTemplate,
  CHARACTER_ADJUSTMENTS,
  GAME_MECHANICS
} from '../data/dataTemplate';
import { Fighter, FrameDataStats } from '../types/frameData';
import { FighterSchema, safeParse } from '../lib/validation';

describe('全キャラクターフレームデータ生成', () => {
  it('全88キャラクターのデータを生成し保存する', async () => {
    console.log('🚀 大乱闘スマッシュブラザーズ SPECIAL フレームデータ生成開始');
    console.log(`📊 対象キャラクター: ${ALL_CHARACTERS.length}体`);
    console.log(`📈 基本ファイター: ${getBaseRosterCount()}体`);
    console.log(`🎮 DLCファイター: ${getDLCCount()}体`);
    
    const seriesStats = getSeriesStatistics();
    console.log('📂 シリーズ別統計（上位5位）:');
    Object.entries(seriesStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .forEach(([series, count]) => {
        console.log(`   ${series}: ${count}体`);
      });

    // 1. ディレクトリ準備
    const publicDir = join(process.cwd(), 'public');
    const dataDir = join(publicDir, 'data');
    const charactersDir = join(dataDir, 'characters');
    
    if (!existsSync(publicDir)) mkdirSync(publicDir, { recursive: true });
    if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
    if (!existsSync(charactersDir)) mkdirSync(charactersDir, { recursive: true });
    
    console.log('📁 データディレクトリを準備しました');

    // 2. 全キャラクターデータ生成
    console.log('\n📝 キャラクターデータ生成中...');
    const fighters: Fighter[] = [];
    let generated = 0;
    let errors = 0;

    for (const charInfo of ALL_CHARACTERS) {
      try {
        const adjustments = CHARACTER_ADJUSTMENTS.find(adj => adj.characterId === charInfo.id);
        const partialFighter = generateFighterFromTemplate(charInfo, adjustments);
        
        // 必須フィールドを確実に設定
        const fighter: Fighter = {
          id: partialFighter.id!,
          name: partialFighter.name!,
          displayName: partialFighter.displayName!,
          series: partialFighter.series!,
          weight: partialFighter.weight!,
          fallSpeed: partialFighter.fallSpeed!,
          fastFallSpeed: partialFighter.fastFallSpeed!,
          gravity: partialFighter.gravity!,
          walkSpeed: partialFighter.walkSpeed!,
          runSpeed: partialFighter.runSpeed!,
          airSpeed: partialFighter.airSpeed!,
          moves: partialFighter.moves!,
          shieldData: partialFighter.shieldData!,
          movementData: partialFighter.movementData!,
          imageUrl: partialFighter.imageUrl,
          iconUrl: partialFighter.iconUrl
        };
        
        fighters.push(fighter);
        generated++;
        
        if (generated % 10 === 0 || generated <= 5) {
          console.log(`  ✅ ${charInfo.displayName} (${generated}/${ALL_CHARACTERS.length})`);
        }
        
      } catch (error) {
        console.error(`  ❌ ${charInfo.displayName} の生成に失敗:`, error);
        errors++;
      }
    }

    console.log(`✅ 生成完了: ${generated}体成功、${errors}体失敗`);
    expect(generated).toBe(ALL_CHARACTERS.length);
    expect(errors).toBe(0);

    // 3. データ検証
    console.log('\n🔍 データ検証中...');
    let validationSuccess = 0;
    let validationErrors = 0;
    const validationIssues: string[] = [];

    for (const fighter of fighters) {
      const parseResult = safeParse(FighterSchema, fighter);
      if (parseResult.success) {
        validationSuccess++;
      } else {
        validationErrors++;
        validationIssues.push(`${fighter.displayName}: ${parseResult.errors?.errors[0]?.message || 'Unknown error'}`);
      }
    }

    console.log(`  ✅ 検証完了: ${validationSuccess}体成功、${validationErrors}体エラー`);
    
    if (validationIssues.length > 0) {
      console.log('  ⚠️ 検証エラー（上位5件）:');
      validationIssues.slice(0, 5).forEach(error => {
        console.log(`    - ${error}`);
      });
    }

    expect(validationErrors).toBe(0);

    // 4. データ保存
    console.log('\n💾 データ保存中...');
    let saved = 0;
    
    // 個別キャラクターファイルの保存
    for (const fighter of fighters) {
      try {
        const filePath = join(charactersDir, `${fighter.id}.json`);
        writeFileSync(filePath, JSON.stringify(fighter, null, 2), 'utf-8');
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
      moveCount: f.moves.length,
      weight: f.weight,
      category: ALL_CHARACTERS.find(c => c.id === f.id)?.category || 'unlockable'
    }));
    
    writeFileSync(
      join(charactersDir, 'index.json'),
      JSON.stringify(fighterIndex, null, 2),
      'utf-8'
    );

    // 統合ファイルの保存
    writeFileSync(
      join(dataDir, 'all-fighters.json'),
      JSON.stringify(fighters, null, 2),
      'utf-8'
    );

    // ゲームメカニクスの保存
    writeFileSync(
      join(dataDir, 'game-mechanics.json'),
      JSON.stringify(GAME_MECHANICS, null, 2),
      'utf-8'
    );

    console.log(`  ✅ ${saved}体のデータを保存しました`);

    // 5. 品質レポート生成
    console.log('\n📋 品質レポート生成中...');
    const qualityReport = generateQualityReport(fighters);

    // 6. 統計データ生成
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

    writeFileSync(
      join(dataDir, 'stats.json'),
      JSON.stringify(stats, null, 2),
      'utf-8'
    );

    writeFileSync(
      join(dataDir, 'quality-report.json'),
      JSON.stringify({
        ...qualityReport,
        characterReports: Object.fromEntries(qualityReport.characterReports)
      }, null, 2),
      'utf-8'
    );

    // 7. 結果出力
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

    // アサーション
    expect(fighters.length).toBe(88);
    expect(saved).toBe(88);
    expect(stats.totalMoves).toBeGreaterThan(1500); // 88キャラ × 平均17技以上
    expect(qualityReport.overallScore).toBeGreaterThan(0.8); // 80%以上の品質
  });
});

function generateQualityReport(fighters: Fighter[]) {
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

  return report;
}