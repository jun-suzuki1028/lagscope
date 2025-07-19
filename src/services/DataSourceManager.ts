import { 
  Fighter, 
  FrameDataSource, 
  FrameDataStats, 
  ImportResult,
  DataValidationResult
} from '../types/frameData';
import { 
  FighterSchema, 
  safeParse,
  createValidationResult 
} from '../lib/validation';

export interface DataUpdateConfig {
  autoUpdate: boolean;
  updateInterval: number; // minutes
  sources: FrameDataSource[];
  primarySource: string;
  fallbackSources: string[];
  verificationThreshold: number; // 0-1, minimum accuracy required
}

export interface DataUpdate {
  id: string;
  timestamp: string;
  source: FrameDataSource;
  affectedFighters: string[];
  changedFields: string[];
  version: string;
  success: boolean;
  errors: string[];
}

export interface AccuracyReport {
  source: FrameDataSource;
  totalChecks: number;
  passedChecks: number;
  accuracy: number;
  inconsistencies: DataInconsistency[];
  lastVerified: string;
}

export interface DataInconsistency {
  fighterId: string;
  field: string;
  sourceValue: unknown;
  expectedValue: unknown;
  confidence: number;
  notes?: string;
}

export class DataSourceManager {
  private static instance: DataSourceManager;
  private config: DataUpdateConfig;
  private updateHistory: DataUpdate[] = [];
  private accuracyReports = new Map<string, AccuracyReport>();
  private verificationQueue: string[] = [];

  private constructor(config: DataUpdateConfig) {
    this.config = config;
    this.initializeDefaultSources();
  }

  public static getInstance(config?: DataUpdateConfig): DataSourceManager {
    if (!DataSourceManager.instance) {
      if (!config) {
        throw new Error('DataSourceManager requires configuration on first initialization');
      }
      DataSourceManager.instance = new DataSourceManager(config);
    }
    return DataSourceManager.instance;
  }

  private initializeDefaultSources(): void {
    const defaultSources: FrameDataSource[] = [
      {
        id: 'ultimate-frame-data',
        name: 'Ultimate Frame Data',
        url: 'https://ultimateframedata.com/',
        type: 'community',
        reliability: 0.95,
        lastUpdated: new Date().toISOString(),
        version: 'v13.0.1'
      },
      {
        id: 'dustloop-wiki',
        name: 'Dustloop Wiki',
        url: 'https://www.dustloop.com/wiki/index.php?title=Super_Smash_Bros._Ultimate',
        type: 'community',
        reliability: 0.90,
        lastUpdated: new Date().toISOString(),
        version: 'latest'
      },
      {
        id: 'internal-verified',
        name: 'Internal Verified Data',
        url: '/data/verified/',
        type: 'user',
        reliability: 1.0,
        lastUpdated: new Date().toISOString(),
        version: '1.0.0'
      }
    ];

    if (this.config.sources.length === 0) {
      this.config.sources = defaultSources;
      this.config.primarySource = 'ultimate-frame-data';
      this.config.fallbackSources = ['dustloop-wiki', 'internal-verified'];
    }
  }

  public async updateFromSource(sourceId: string, forcedUpdate = false): Promise<ImportResult> {
    const source = this.getSource(sourceId);
    if (!source) {
      return {
        success: false,
        importedCount: 0,
        errors: [`Source not found: ${sourceId}`],
        warnings: [],
        skippedCount: 0
      };
    }

    try {
      const fighters = await this.fetchFightersFromSource(source);
      const validationResult = await this.validateFightersData(fighters);
      
      if (!validationResult.isValid && !forcedUpdate) {
        return {
          success: false,
          importedCount: 0,
          errors: validationResult.errors.map(e => e.message),
          warnings: validationResult.warnings,
          skippedCount: fighters.length
        };
      }

      const importResult = await this.importFighters(fighters, source);
      
      // 更新履歴に記録
      const updateRecord: DataUpdate = {
        id: `${sourceId}-${Date.now()}`,
        timestamp: new Date().toISOString(),
        source,
        affectedFighters: fighters.map(f => f.id),
        changedFields: [], // TODO: 実際の変更を検出
        version: source.version,
        success: importResult.success,
        errors: importResult.errors
      };
      
      this.updateHistory.push(updateRecord);
      
      // 正確性検証をキューに追加
      fighters.forEach(fighter => {
        if (!this.verificationQueue.includes(fighter.id)) {
          this.verificationQueue.push(fighter.id);
        }
      });

      return importResult;
    } catch (error) {
      return {
        success: false,
        importedCount: 0,
        errors: [`Failed to update from source ${sourceId}: ${error}`],
        warnings: [],
        skippedCount: 0
      };
    }
  }

  public async verifyDataAccuracy(sourceId: string): Promise<AccuracyReport> {
    const source = this.getSource(sourceId);
    if (!source) {
      throw new Error(`Source not found: ${sourceId}`);
    }

    const inconsistencies: DataInconsistency[] = [];
    let totalChecks = 0;
    let passedChecks = 0;

    try {
      const fighters = await this.fetchFightersFromSource(source);
      
      for (const fighter of fighters) {
        const crossSourceChecks = await this.performCrossSourceVerification(fighter);
        totalChecks += crossSourceChecks.totalChecks;
        passedChecks += crossSourceChecks.passedChecks;
        inconsistencies.push(...crossSourceChecks.inconsistencies);
      }

      const accuracy = totalChecks > 0 ? passedChecks / totalChecks : 0;
      
      const report: AccuracyReport = {
        source,
        totalChecks,
        passedChecks,
        accuracy,
        inconsistencies,
        lastVerified: new Date().toISOString()
      };

      this.accuracyReports.set(sourceId, report);
      return report;
    } catch (error) {
      throw new Error(`Failed to verify data accuracy for ${sourceId}: ${error}`);
    }
  }

  public async performScheduledUpdates(): Promise<void> {
    if (!this.config.autoUpdate) {
      return;
    }

    for (const source of this.config.sources) {
      const lastUpdate = new Date(source.lastUpdated);
      const now = new Date();
      const minutesSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60);

      if (minutesSinceUpdate >= this.config.updateInterval) {
        try {
          await this.updateFromSource(source.id);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(`Scheduled update failed for ${source.id}:`, error);
        }
      }
    }
  }

  public async processVerificationQueue(): Promise<void> {
    while (this.verificationQueue.length > 0) {
      const fighterId = this.verificationQueue.shift();
      if (fighterId) {
        try {
          await this.verifySingleFighter(fighterId);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(`Verification failed for fighter ${fighterId}:`, error);
        }
      }
    }
  }

  public getDataStats(): FrameDataStats {
    const primarySource = this.getSource(this.config.primarySource);
    
    return {
      totalFighters: 86, // SSBU roster size
      totalMoves: 0, // TODO: calculate from actual data
      lastUpdated: new Date().toISOString(),
      version: primarySource?.version || '1.0.0',
      gameVersion: 'v13.0.1',
      dataSource: primarySource?.name || 'Unknown',
      accuracy: this.calculateOverallAccuracy()
    };
  }

  public getUpdateHistory(): DataUpdate[] {
    return [...this.updateHistory].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  public getAccuracyReports(): AccuracyReport[] {
    return Array.from(this.accuracyReports.values());
  }

  public addCustomSource(source: FrameDataSource): void {
    this.config.sources.push(source);
  }

  public removeSource(sourceId: string): boolean {
    const index = this.config.sources.findIndex(s => s.id === sourceId);
    if (index >= 0) {
      this.config.sources.splice(index, 1);
      this.accuracyReports.delete(sourceId);
      return true;
    }
    return false;
  }

  public updateConfiguration(newConfig: Partial<DataUpdateConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  private getSource(sourceId: string): FrameDataSource | undefined {
    return this.config.sources.find(s => s.id === sourceId);
  }

  private async fetchFightersFromSource(source: FrameDataSource): Promise<Fighter[]> {
    // ソース種別に応じた取得ロジック
    switch (source.type) {
      case 'official':
        return this.fetchFromOfficialAPI(source);
      case 'community':
        return this.fetchFromCommunitySource(source);
      case 'user':
        return this.fetchFromUserData(source);
      default:
        throw new Error(`Unsupported source type: ${source.type}`);
    }
  }

  private async fetchFromOfficialAPI(_source: FrameDataSource): Promise<Fighter[]> {
    // TODO: 公式APIがある場合の実装
    throw new Error('Official API not yet implemented');
  }

  private async fetchFromCommunitySource(_source: FrameDataSource): Promise<Fighter[]> {
    // TODO: コミュニティソースからのスクレイピング実装
    // 現在はモックデータを返す
    const { mockFighters } = await import('../data/mockData');
    return mockFighters;
  }

  private async fetchFromUserData(source: FrameDataSource): Promise<Fighter[]> {
    try {
      const response = await fetch(`${source.url}fighters.json`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      const parseResult = safeParse(FighterSchema.array(), data);
      
      if (!parseResult.success) {
        throw new Error('Invalid data format');
      }
      
      return parseResult.data as Fighter[];
    } catch (error) {
      throw new Error(`Failed to fetch user data: ${error}`);
    }
  }

  private async validateFightersData(fighters: Fighter[]): Promise<DataValidationResult> {
    const errors: Array<{ field: string; message: string; value?: unknown }> = [];
    const warnings: string[] = [];

    for (const fighter of fighters) {
      const parseResult = safeParse(FighterSchema, fighter);
      if (!parseResult.success && parseResult.errors) {
        const validationResult = createValidationResult(parseResult.errors);
        errors.push(...validationResult.errors);
      }

      // 追加のビジネスロジック検証
      if (fighter.moves.length === 0) {
        warnings.push(`Fighter ${fighter.name} has no moves defined`);
      }

      if (fighter.weight < 60 || fighter.weight > 150) {
        warnings.push(`Fighter ${fighter.name} has unusual weight: ${fighter.weight}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private async importFighters(fighters: Fighter[], _source: FrameDataSource): Promise<ImportResult> {
    let importedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const fighter of fighters) {
      try {
        // TODO: 実際のデータベース/ストレージへの保存実装
        // 現在は成功とみなす
        importedCount++;
      } catch (error) {
        errors.push(`Failed to import ${fighter.name}: ${error}`);
        skippedCount++;
      }
    }

    return {
      success: errors.length === 0,
      importedCount,
      errors,
      warnings,
      skippedCount
    };
  }

  private async performCrossSourceVerification(_fighter: Fighter): Promise<{
    totalChecks: number;
    passedChecks: number;
    inconsistencies: DataInconsistency[];
  }> {
    // TODO: 複数ソース間でのデータ整合性チェック実装
    return {
      totalChecks: 1,
      passedChecks: 1,
      inconsistencies: []
    };
  }

  private async verifySingleFighter(fighterId: string): Promise<void> {
    // TODO: 単一ファイターの検証実装
    // eslint-disable-next-line no-console
    console.log(`Verifying fighter: ${fighterId}`);
  }

  private calculateOverallAccuracy(): number {
    const reports = Array.from(this.accuracyReports.values());
    if (reports.length === 0) return 1.0;

    const totalAccuracy = reports.reduce((sum, report) => sum + report.accuracy, 0);
    return totalAccuracy / reports.length;
  }
}

// シングルトンインスタンスのエクスポート用ファクトリー
export function createDataSourceManager(config: DataUpdateConfig): DataSourceManager {
  return DataSourceManager.getInstance(config);
}

// デフォルト設定
export const DEFAULT_DATA_UPDATE_CONFIG: DataUpdateConfig = {
  autoUpdate: true,
  updateInterval: 60, // 1 hour
  sources: [],
  primarySource: 'ultimate-frame-data',
  fallbackSources: ['dustloop-wiki'],
  verificationThreshold: 0.90
};