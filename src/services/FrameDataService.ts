import { Fighter } from '../types/frameData';
import { safeParse, FighterSchema } from '../lib/validation';

export interface FrameDataServiceError {
  code: 'NETWORK_ERROR' | 'PARSE_ERROR' | 'VALIDATION_ERROR' | 'NOT_FOUND';
  message: string;
  details?: unknown;
}

export interface FrameDataServiceOptions {
  baseUrl?: string;
  timeout?: number;
  retryAttempts?: number;
  cacheEnabled?: boolean;
  cacheTtl?: number;
}

export class FrameDataService {
  private static instance: FrameDataService;
  private cache = new Map<string, { data: Fighter; timestamp: number; ttl: number }>();
  private loadingPromises = new Map<string, Promise<Fighter>>();
  private options: Required<FrameDataServiceOptions>;

  private constructor(options: FrameDataServiceOptions = {}) {
    this.options = {
      baseUrl: options.baseUrl || '/data/characters',
      timeout: options.timeout || 5000,
      retryAttempts: options.retryAttempts || 3,
      cacheEnabled: options.cacheEnabled ?? true,
      cacheTtl: options.cacheTtl || 300000, // 5分
    };
  }

  public static getInstance(options?: FrameDataServiceOptions): FrameDataService {
    if (!FrameDataService.instance) {
      FrameDataService.instance = new FrameDataService(options);
    }
    return FrameDataService.instance;
  }

  public async getFighter(fighterId: string): Promise<Fighter> {
    if (this.options.cacheEnabled && this.isCacheValid(fighterId)) {
      const cached = this.cache.get(fighterId);
      if (cached) {
        return cached.data;
      }
      throw new Error(`Cache miss for fighter: ${fighterId}`);
    }

    if (this.loadingPromises.has(fighterId)) {
      const loadingPromise = this.loadingPromises.get(fighterId);
      if (loadingPromise) {
        return loadingPromise;
      }
      throw new Error(`Loading promise not found for fighter: ${fighterId}`);
    }

    const loadingPromise = this.loadFighterData(fighterId);
    this.loadingPromises.set(fighterId, loadingPromise);

    try {
      const fighter = await loadingPromise;
      this.loadingPromises.delete(fighterId);
      
      if (this.options.cacheEnabled) {
        this.cache.set(fighterId, {
          data: fighter,
          timestamp: Date.now(),
          ttl: this.options.cacheTtl,
        });
      }
      
      return fighter;
    } catch (error) {
      this.loadingPromises.delete(fighterId);
      throw error;
    }
  }

  public async getAllFighters(): Promise<Fighter[]> {
    try {
      const response = await this.fetchWithRetry(`${this.options.baseUrl}/index.json`);
      if (!response.ok) {
        throw this.createError('NETWORK_ERROR', `Failed to fetch fighters list: ${response.status}`);
      }

      const data = await response.json();
      const parseResult = safeParse(FighterSchema.array(), data);
      
      if (!parseResult.success) {
        throw this.createError('VALIDATION_ERROR', 'Invalid fighters data format', parseResult.errors);
      }

      return parseResult.data;
    } catch (error) {
      if (error instanceof Error && error.name === 'FrameDataServiceError') {
        throw error;
      }
      throw this.createError('NETWORK_ERROR', `Failed to load fighters list: ${error}`);
    }
  }

  public async getFightersByIds(fighterIds: string[]): Promise<Fighter[]> {
    const fighters = await Promise.allSettled(
      fighterIds.map(id => this.getFighter(id))
    );

    const results: Fighter[] = [];
    const errors: string[] = [];

    fighters.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        errors.push(`Failed to load ${fighterIds[index]}: ${result.reason}`);
      }
    });

    if (errors.length > 0) {
      // eslint-disable-next-line no-console
      console.warn('Some fighters failed to load:', errors);
    }

    return results;
  }

  public clearCache(): void {
    this.cache.clear();
  }

  public getCacheSize(): number {
    return this.cache.size;
  }

  public getCacheStats(): { size: number; hitRate: number } {
    const size = this.cache.size;
    const hitRate = 0; // TODO: 実装時にヒット率を計算
    return { size, hitRate };
  }

  private async loadFighterData(fighterId: string): Promise<Fighter> {
    try {
      const response = await this.fetchWithRetry(`${this.options.baseUrl}/${fighterId}.json`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw this.createError('NOT_FOUND', `Fighter '${fighterId}' not found`);
        }
        throw this.createError('NETWORK_ERROR', `Failed to fetch fighter data: ${response.status}`);
      }

      const rawData = await response.json();
      const parseResult = safeParse(FighterSchema, rawData);
      
      if (!parseResult.success) {
        throw this.createError('VALIDATION_ERROR', 'Invalid fighter data format', parseResult.errors);
      }

      return parseResult.data;
    } catch (error) {
      if (error instanceof Error && error.name === 'FrameDataServiceError') {
        throw error;
      }
      throw this.createError('NETWORK_ERROR', `Failed to load fighter data: ${error}`);
    }
  }

  private async fetchWithRetry(url: string, attempts = 0): Promise<Response> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.options.timeout);

      const response = await fetch(url, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      if (attempts < this.options.retryAttempts) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000));
        return this.fetchWithRetry(url, attempts + 1);
      }
      throw error;
    }
  }

  private isCacheValid(fighterId: string): boolean {
    const cached = this.cache.get(fighterId);
    if (!cached) return false;
    
    const age = Date.now() - cached.timestamp;
    return age < cached.ttl;
  }

  private createError(code: FrameDataServiceError['code'], message: string, details?: unknown): Error {
    const error = new Error(message);
    error.name = 'FrameDataServiceError';
    (error as FrameDataServiceError).code = code;
    (error as FrameDataServiceError).details = details;
    return error;
  }
}

export const frameDataService = FrameDataService.getInstance();