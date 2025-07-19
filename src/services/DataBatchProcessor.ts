import { 
  Fighter,
  ImportResult,
  DataValidationResult,
  FrameDataStats
} from '../types/frameData';
import { 
  CharacterInfo, 
  ALL_CHARACTERS,
  getAllCharacterIds,
  getCharacterInfo 
} from '../data/charactersRegistry';
import { 
  generateFighterFromTemplate,
  generateAllCharacterData,
  CHARACTER_ADJUSTMENTS 
} from '../data/dataTemplate';
import { 
  FighterSchema,
  safeParse,
  createValidationResult 
} from '../lib/validation';
import { frameDataService } from './FrameDataService';

export interface BatchProcessingOptions {
  validateOnly: boolean;
  includeCharacters?: string[];
  excludeCharacters?: string[];
  generateMissingData: boolean;
  overwriteExisting: boolean;
  parallelProcessing: boolean;
  batchSize: number;
}

export interface BatchProcessingResult {
  totalProcessed: number;
  successCount: number;
  errorCount: number;
  skippedCount: number;
  generatedCount: number;
  validationErrors: string[];
  processingErrors: string[];
  characterResults: CharacterProcessingResult[];
  stats: FrameDataStats;
  executionTime: number;
}

export interface CharacterProcessingResult {
  characterId: string;
  characterName: string;
  success: boolean;
  action: 'validated' | 'generated' | 'imported' | 'skipped' | 'error';
  errors: string[];
  warnings: string[];
  dataQuality: {
    completeness: number;
    accuracy: number;
    issues: string[];
  };
}

export interface DataQualityReport {
  overallScore: number;
  completeness: number;
  accuracy: number;
  consistency: number;
  totalIssues: number;
  criticalIssues: number;
  characterReports: Map<string, CharacterQualityReport>;
}

export interface CharacterQualityReport {
  characterId: string;
  score: number;
  completeness: number;
  accuracy: number;
  moveCount: number;
  expectedMoveCount: number;
  missingMoves: string[];
  invalidData: string[];
  inconsistencies: string[];
}

export class DataBatchProcessor {
  private static instance: DataBatchProcessor;

  private constructor() {}

  public static getInstance(): DataBatchProcessor {
    if (!DataBatchProcessor.instance) {
      DataBatchProcessor.instance = new DataBatchProcessor();
    }
    return DataBatchProcessor.instance;
  }

  /**
   * 全キャラクターデータの一括処理
   */
  public async processAllCharacters(
    options: Partial<BatchProcessingOptions> = {}
  ): Promise<BatchProcessingResult> {
    const startTime = Date.now();
    
    const config: BatchProcessingOptions = {
      validateOnly: false,
      generateMissingData: true,
      overwriteExisting: false,
      parallelProcessing: true,
      batchSize: 10,
      ...options
    };

    const characterIds = this.getTargetCharacterIds(config);
    const characterResults: CharacterProcessingResult[] = [];
    
    let totalProcessed = 0;
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    let generatedCount = 0;
    const validationErrors: string[] = [];
    const processingErrors: string[] = [];

    try {
      if (config.parallelProcessing) {
        // 並列処理
        const batches = this.createBatches(characterIds, config.batchSize);
        
        for (const batch of batches) {
          const batchResults = await Promise.allSettled(
            batch.map(id => this.processCharacter(id, config))
          );
          
          batchResults.forEach((result, index) => {
            const characterId = batch[index];
            totalProcessed++;
            
            if (result.status === 'fulfilled') {
              characterResults.push(result.value);
              if (result.value.success) {
                successCount++;
                if (result.value.action === 'generated') {
                  generatedCount++;
                }
              } else {
                errorCount++;
                validationErrors.push(...result.value.errors);
              }
            } else {
              errorCount++;
              const errorResult: CharacterProcessingResult = {
                characterId,
                characterName: getCharacterInfo(characterId)?.displayName || characterId,
                success: false,
                action: 'error',
                errors: [result.reason?.toString() || 'Unknown error'],
                warnings: [],
                dataQuality: { completeness: 0, accuracy: 0, issues: ['Processing failed'] }
              };
              characterResults.push(errorResult);
              processingErrors.push(`${characterId}: ${result.reason}`);
            }
          });
        }
      } else {
        // シーケンシャル処理
        for (const characterId of characterIds) {
          try {
            const result = await this.processCharacter(characterId, config);
            characterResults.push(result);
            totalProcessed++;
            
            if (result.success) {
              successCount++;
              if (result.action === 'generated') {
                generatedCount++;
              }
            } else {
              errorCount++;
              validationErrors.push(...result.errors);
            }
          } catch (error) {
            errorCount++;
            totalProcessed++;
            const errorResult: CharacterProcessingResult = {
              characterId,
              characterName: getCharacterInfo(characterId)?.displayName || characterId,
              success: false,
              action: 'error',
              errors: [error?.toString() || 'Unknown error'],
              warnings: [],
              dataQuality: { completeness: 0, accuracy: 0, issues: ['Processing failed'] }
            };
            characterResults.push(errorResult);
            processingErrors.push(`${characterId}: ${error}`);
          }
        }
      }

      const stats = this.generateStats(characterResults);
      const executionTime = Date.now() - startTime;

      return {
        totalProcessed,
        successCount,
        errorCount,
        skippedCount,
        generatedCount,
        validationErrors,
        processingErrors,
        characterResults,
        stats,
        executionTime
      };
    } catch (error) {
      throw new Error(`Batch processing failed: ${error}`);
    }
  }

  /**
   * 単一キャラクターの処理
   */
  private async processCharacter(
    characterId: string,
    config: BatchProcessingOptions
  ): Promise<CharacterProcessingResult> {
    const characterInfo = getCharacterInfo(characterId);
    if (!characterInfo) {
      return {
        characterId,
        characterName: characterId,
        success: false,
        action: 'error',
        errors: ['Character not found in registry'],
        warnings: [],
        dataQuality: { completeness: 0, accuracy: 0, issues: ['Character not found'] }
      };
    }

    try {
      // 既存データの確認
      let existingData: Fighter | null = null;
      try {
        existingData = await frameDataService.getFighter(characterId);
      } catch {
        // データが存在しない場合は null のまま
      }

      // データ生成が必要かチェック
      if (!existingData && config.generateMissingData) {
        // データ生成
        const generatedData = generateFighterFromTemplate(characterInfo);
        const validationResult = this.validateFighterData(generatedData as Fighter);
        
        if (!validationResult.isValid && !config.validateOnly) {
          return {
            characterId,
            characterName: characterInfo.displayName,
            success: false,
            action: 'error',
            errors: validationResult.errors.map(e => e.message),
            warnings: validationResult.warnings,
            dataQuality: this.assessDataQuality(generatedData as Fighter, validationResult)
          };
        }

        if (config.validateOnly) {
          return {
            characterId,
            characterName: characterInfo.displayName,
            success: validationResult.isValid,
            action: 'validated',
            errors: validationResult.errors.map(e => e.message),
            warnings: validationResult.warnings,
            dataQuality: this.assessDataQuality(generatedData as Fighter, validationResult)
          };
        }

        // TODO: 実際のデータ保存処理を実装
        // await this.saveFighterData(generatedData as Fighter);
        
        return {
          characterId,
          characterName: characterInfo.displayName,
          success: true,
          action: 'generated',
          errors: [],
          warnings: validationResult.warnings,
          dataQuality: this.assessDataQuality(generatedData as Fighter, validationResult)
        };
      }

      // 既存データの検証
      if (existingData) {
        const validationResult = this.validateFighterData(existingData);
        
        if (config.overwriteExisting && config.generateMissingData) {
          const updatedData = generateFighterFromTemplate(characterInfo);
          // TODO: データ更新処理を実装
          
          return {
            characterId,
            characterName: characterInfo.displayName,
            success: true,
            action: 'imported',
            errors: [],
            warnings: validationResult.warnings,
            dataQuality: this.assessDataQuality(updatedData as Fighter, validationResult)
          };
        }

        return {
          characterId,
          characterName: characterInfo.displayName,
          success: validationResult.isValid,
          action: 'validated',
          errors: validationResult.errors.map(e => e.message),
          warnings: validationResult.warnings,
          dataQuality: this.assessDataQuality(existingData, validationResult)
        };
      }

      // スキップされた場合
      return {
        characterId,
        characterName: characterInfo.displayName,
        success: true,
        action: 'skipped',
        errors: [],
        warnings: ['No data found and generation disabled'],
        dataQuality: { completeness: 0, accuracy: 0, issues: ['No data'] }
      };
    } catch (error) {
      return {
        characterId,
        characterName: characterInfo.displayName,
        success: false,
        action: 'error',
        errors: [error?.toString() || 'Unknown processing error'],
        warnings: [],
        dataQuality: { completeness: 0, accuracy: 0, issues: ['Processing error'] }
      };
    }
  }

  /**
   * データ品質評価レポート生成
   */
  public async generateQualityReport(): Promise<DataQualityReport> {
    const characterIds = getAllCharacterIds();
    const characterReports = new Map<string, CharacterQualityReport>();
    
    let totalScore = 0;
    let totalCompleteness = 0;
    let totalAccuracy = 0;
    let totalConsistency = 0;
    let totalIssues = 0;
    let criticalIssues = 0;

    for (const characterId of characterIds) {
      try {
        const fighter = await frameDataService.getFighter(characterId);
        const report = this.evaluateCharacterQuality(fighter);
        characterReports.set(characterId, report);
        
        totalScore += report.score;
        totalCompleteness += report.completeness;
        totalAccuracy += report.accuracy;
        totalIssues += report.invalidData.length + report.inconsistencies.length;
        
        if (report.score < 0.5) {
          criticalIssues++;
        }
      } catch (error) {
        const errorReport: CharacterQualityReport = {
          characterId,
          score: 0,
          completeness: 0,
          accuracy: 0,
          moveCount: 0,
          expectedMoveCount: 20, // 概算
          missingMoves: ['All moves missing'],
          invalidData: ['Data not found'],
          inconsistencies: []
        };
        characterReports.set(characterId, errorReport);
        criticalIssues++;
      }
    }

    const count = characterReports.size;
    return {
      overallScore: count > 0 ? totalScore / count : 0,
      completeness: count > 0 ? totalCompleteness / count : 0,
      accuracy: count > 0 ? totalAccuracy / count : 0,
      consistency: Math.max(0, 1 - (totalIssues / (count * 10))), // 仮の計算
      totalIssues,
      criticalIssues,
      characterReports
    };
  }

  /**
   * データ検証
   */
  private validateFighterData(fighter: Fighter): DataValidationResult {
    const parseResult = safeParse(FighterSchema, fighter);
    
    if (!parseResult.success && parseResult.errors) {
      return createValidationResult(parseResult.errors);
    }

    const warnings: string[] = [];
    
    // 追加のビジネスロジック検証
    if (fighter.moves.length < 15) {
      warnings.push(`Fighter ${fighter.name} has unusually few moves: ${fighter.moves.length}`);
    }

    if (fighter.weight < 60 || fighter.weight > 150) {
      warnings.push(`Fighter ${fighter.name} has unusual weight: ${fighter.weight}`);
    }

    return {
      isValid: true,
      errors: [],
      warnings
    };
  }

  /**
   * データ品質評価
   */
  private assessDataQuality(
    fighter: Fighter, 
    validationResult: DataValidationResult
  ): { completeness: number; accuracy: number; issues: string[] } {
    const expectedMoveCount = 20; // 標準的な技数
    const completeness = Math.min(1, fighter.moves.length / expectedMoveCount);
    const accuracy = validationResult.isValid ? 1 : 0.5;
    const issues = [
      ...validationResult.errors.map(e => e.message),
      ...validationResult.warnings
    ];

    return { completeness, accuracy, issues };
  }

  /**
   * キャラクター品質評価
   */
  private evaluateCharacterQuality(fighter: Fighter): CharacterQualityReport {
    const expectedMoveCount = 20;
    const moveCount = fighter.moves.length;
    const completeness = Math.min(1, moveCount / expectedMoveCount);
    
    const missingMoves: string[] = [];
    const invalidData: string[] = [];
    const inconsistencies: string[] = [];

    // 必須技のチェック
    const requiredMoves = ['jab1', 'ftilt', 'utilt', 'dtilt', 'fsmash', 'usmash', 'dsmash', 
                          'nair', 'fair', 'bair', 'uair', 'dair', 'grab', 'fthrow', 'bthrow', 
                          'uthrow', 'dthrow', 'neutral_b', 'side_b', 'up_b', 'down_b'];
    
    for (const requiredMove of requiredMoves) {
      if (!fighter.moves.some(move => move.name === requiredMove)) {
        missingMoves.push(requiredMove);
      }
    }

    // データ整合性チェック
    for (const move of fighter.moves) {
      if (move.startup < 1) {
        invalidData.push(`${move.name}: Invalid startup frames (${move.startup})`);
      }
      if (move.totalFrames !== move.startup + move.active + move.recovery) {
        inconsistencies.push(`${move.name}: Total frames mismatch`);
      }
      if (move.damage < 0) {
        invalidData.push(`${move.name}: Invalid damage (${move.damage})`);
      }
    }

    const accuracy = invalidData.length === 0 ? 1 : Math.max(0, 1 - (invalidData.length / moveCount));
    const score = (completeness + accuracy) / 2;

    return {
      characterId: fighter.id,
      score,
      completeness,
      accuracy,
      moveCount,
      expectedMoveCount,
      missingMoves,
      invalidData,
      inconsistencies
    };
  }

  /**
   * 対象キャラクターIDの取得
   */
  private getTargetCharacterIds(config: BatchProcessingOptions): string[] {
    let characterIds = getAllCharacterIds();

    if (config.includeCharacters) {
      characterIds = characterIds.filter(id => config.includeCharacters!.includes(id));
    }

    if (config.excludeCharacters) {
      characterIds = characterIds.filter(id => !config.excludeCharacters!.includes(id));
    }

    return characterIds;
  }

  /**
   * バッチ作成
   */
  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    
    return batches;
  }

  /**
   * 統計生成
   */
  private generateStats(results: CharacterProcessingResult[]): FrameDataStats {
    const successfulResults = results.filter(r => r.success);
    const totalMoves = successfulResults.reduce((sum, r) => sum + (r.dataQuality.completeness * 20), 0);
    
    return {
      totalFighters: results.length,
      totalMoves: Math.floor(totalMoves),
      lastUpdated: new Date().toISOString(),
      version: '1.0.0',
      gameVersion: 'v13.0.1',
      dataSource: 'Generated + Community',
      accuracy: successfulResults.length > 0 ? 
        successfulResults.reduce((sum, r) => sum + r.dataQuality.accuracy, 0) / successfulResults.length : 0
    };
  }
}

export const dataBatchProcessor = DataBatchProcessor.getInstance();