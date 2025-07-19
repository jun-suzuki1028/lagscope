export interface Fighter {
  id: string;
  name: string;
  displayName: string;
  series: string;
  weight: number;
  fallSpeed: number;
  fastFallSpeed: number;
  gravity: number;
  walkSpeed: number;
  runSpeed: number;
  airSpeed: number;
  moves: Move[];
  shieldData: ShieldData;
  movementData: MovementData;
  imageUrl?: string;
  iconUrl?: string;
}

export interface Move {
  id: string;
  name: string;
  displayName: string;
  category: MoveCategory;
  type: MoveType;
  input: string;
  startup: number;
  active: number;
  recovery: number;
  totalFrames: number;
  onShield: number;
  onHit: number;
  onWhiff: number;
  damage: number | number[];
  baseKnockback: number;
  knockbackGrowth: number;
  range: MoveRange;
  hitboxData: HitboxData;
  properties: MoveProperties;
  notes?: string;
}

export interface ShieldData {
  shieldHealth: number;
  shieldRegen: number;
  shieldRegenDelay: number;
  shieldStun: number;
  shieldReleaseFrames: number;
  shieldDropFrames: number;
  shieldGrabFrames: number;
  outOfShieldOptions: OutOfShieldOption[];
}

export interface MovementData {
  jumpSquat: number;
  fullHopHeight: number;
  shortHopHeight: number;
  airJumps: number;
  dodgeFrames: DodgeFrames;
  rollFrames: RollFrames;
}

export interface DodgeFrames {
  spotDodge: {
    startup: number;
    active: number;
    recovery: number;
    total: number;
  };
  airDodge: {
    startup: number;
    active: number;
    recovery: number;
    total: number;
  };
}

export interface RollFrames {
  forward: {
    startup: number;
    active: number;
    recovery: number;
    total: number;
  };
  backward: {
    startup: number;
    active: number;
    recovery: number;
    total: number;
  };
}

export interface HitboxData {
  hitboxes: Hitbox[];
  multihit: boolean;
  multihitFrames?: number[];
}

export interface Hitbox {
  id: number;
  damage: number;
  angle: number;
  baseKnockback: number;
  knockbackGrowth: number;
  hitboxType: HitboxType;
  effect: HitboxEffect;
  size: number;
  position: Position;
}

export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface MoveProperties {
  isKillMove: boolean;
  killPercent?: number;
  hasArmor: boolean;
  armorThreshold?: number;
  isCommandGrab: boolean;
  isSpike: boolean;
  isMeteor: boolean;
  hasInvincibility: boolean;
  invincibilityFrames?: number[];
  hasIntangibility: boolean;
  intangibilityFrames?: number[];
  canClank: boolean;
  priority: number;
  transcendentPriority: boolean;
}

export interface OutOfShieldOption {
  move: string;
  frames: number;
  type: OutOfShieldType;
  effectiveness: number;
}

export type MoveCategory = 
  | 'jab'
  | 'tilt'
  | 'smash'
  | 'aerial'
  | 'special'
  | 'grab'
  | 'throw'
  | 'dodge'
  | 'movement'
  | 'dash';

export type MoveType = 
  | 'normal'
  | 'special'
  | 'grab'
  | 'throw'
  | 'dodge'
  | 'movement';

export type MoveRange = 
  | 'close'
  | 'mid'
  | 'far'
  | 'projectile';

export type HitboxType = 
  | 'normal'
  | 'grab'
  | 'windbox'
  | 'reflector'
  | 'absorber';

export type HitboxEffect = 
  | 'normal'
  | 'fire'
  | 'electric'
  | 'freeze'
  | 'slash'
  | 'stab'
  | 'magic'
  | 'darkness'
  | 'aura'
  | 'flower'
  | 'bury'
  | 'paralyze'
  | 'sleep';

export type OutOfShieldType = 
  | 'normal'
  | 'jump_cancel'
  | 'grab'
  | 'up_b'
  | 'up_smash'
  | 'nair'
  | 'up_tilt';

export interface PunishResult {
  defendingFighter: Fighter;
  punishingMoves: PunishMove[];
  frameAdvantage: number;
  attackingMove: Move;
  calculationContext: CalculationContext;
}

export interface PunishMove {
  move: Move;
  method: PunishMethod;
  totalFrames: number;
  isGuaranteed: boolean;
  probability: number;
  damage: number;
  killPercent?: number;
  notes?: string;
}

export interface CalculationContext {
  staleness: StalenessLevel;
  shieldDamage: number;
  shieldStun: number;
  range: MoveRange;
  position: string;
  options: CalculationOptions;
}

export type PunishMethod = 
  | 'normal'
  | 'out_of_shield'
  | 'guard_cancel_jump'
  | 'guard_cancel_grab'
  | 'guard_cancel_up_b'
  | 'guard_cancel_up_smash'
  | 'guard_cancel_nair'
  | 'guard_cancel_up_tilt'
  | 'shield_drop'
  | 'perfect_shield'
  | 'roll_away'
  | 'roll_behind'
  | 'spot_dodge';

export interface CalculationOptions {
  staleness: StalenessLevel;
  rangeFilter: MoveRange[];
  allowOutOfShield: boolean;
  allowGuardCancel: boolean;
  allowShieldDrop: boolean;
  allowPerfectShield: boolean;
  allowRolling: boolean;
  allowSpotDodge: boolean;
  minimumFrameAdvantage: number;
  maximumFrameAdvantage: number;
  minimumDamage: number;
  onlyGuaranteed: boolean;
  includeKillMoves: boolean;
  includeDIOptions: boolean;
  includeSDIOptions: boolean;
  positionFilter: string[];
}

export type StalenessLevel = 
  | 'fresh'
  | 'stale1'
  | 'stale2'
  | 'stale3'
  | 'stale4'
  | 'stale5'
  | 'stale6'
  | 'stale7'
  | 'stale8'
  | 'stale9';

export interface FrameDataStats {
  totalFighters: number;
  totalMoves: number;
  lastUpdated: string;
  version: string;
  gameVersion: string;
  dataSource: string;
  accuracy: number;
}

export interface GameMechanics {
  shieldHealthMax: number;
  shieldHealthMin: number;
  shieldRegenRate: number;
  shieldStunMultiplier: number;
  shieldDamageMultiplier: number;
  perfectShieldWindow: number;
  grabReleaseFrames: number;
  hitlagMultiplier: number;
  sdiMultiplier: number;
  diInfluence: number;
  stalenessMultipliers: Record<StalenessLevel, number>;
}

export interface MatchupData {
  attackingFighter: string;
  defendingFighter: string;
  advantageousPositions: string[];
  disadvantageousPositions: string[];
  neutralPositions: string[];
  keyMoves: string[];
  counterMoves: string[];
  notes?: string;
}

export interface TierListData {
  tier: string;
  rank: number;
  fighters: string[];
  criteria: string;
  lastUpdated: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'ja' | 'en';
  defaultOptions: Partial<CalculationOptions>;
  favoriteFighters: string[];
  recentFighters: string[];
  customNotes: Record<string, string>;
  displaySettings: DisplaySettings;
}

export interface DisplaySettings {
  showFrameData: boolean;
  showDamage: boolean;
  showKillPercent: boolean;
  showProbability: boolean;
  showNotes: boolean;
  compactView: boolean;
  animateResults: boolean;
  playSound: boolean;
  showTips: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

export interface DataValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: string[];
}

export interface FrameDataSource {
  id: string;
  name: string;
  url: string;
  type: 'official' | 'community' | 'user';
  reliability: number;
  lastUpdated: string;
  version: string;
}

export interface ImportResult {
  success: boolean;
  importedCount: number;
  errors: string[];
  warnings: string[];
  skippedCount: number;
}

export interface ExportOptions {
  format: 'json' | 'csv' | 'txt';
  includeMetadata: boolean;
  compress: boolean;
  filterBy?: {
    fighters?: string[];
    moves?: string[];
    categories?: MoveCategory[];
  };
}

export interface SearchFilters {
  fighter?: string;
  move?: string;
  category?: MoveCategory;
  type?: MoveType;
  range?: MoveRange;
  minDamage?: number;
  maxDamage?: number;
  minStartup?: number;
  maxStartup?: number;
  isKillMove?: boolean;
  hasArmor?: boolean;
  query?: string;
}

export type SortOption = 
  | 'name'
  | 'damage'
  | 'startup'
  | 'recovery'
  | 'total'
  | 'onShield'
  | 'range'
  | 'killPercent';

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  option: SortOption;
  direction: SortDirection;
}

export interface PaginationConfig {
  page: number;
  limit: number;
  total: number;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
  pagination?: PaginationConfig;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  key: string;
}

export interface PerformanceMetrics {
  calculationTime: number;
  renderTime: number;
  memoryUsage: number;
  cacheHitRate: number;
  apiResponseTime: number;
}

export interface DebugInfo {
  version: string;
  environment: string;
  timestamp: string;
  userAgent: string;
  screenResolution: string;
  viewportSize: string;
  performance: PerformanceMetrics;
  errors: string[];
  warnings: string[];
}

export interface ErrorLog {
  id: string;
  timestamp: string;
  level: 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
  user?: string;
  session?: string;
}

export interface AnalyticsEvent {
  event: string;
  properties: Record<string, unknown>;
  timestamp: string;
  user?: string;
  session?: string;
}

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  description: string;
  rollout: number;
  conditions?: Record<string, unknown>;
}

export interface Configuration {
  api: {
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
  };
  cache: {
    defaultTtl: number;
    maxSize: number;
    strategy: 'lru' | 'fifo' | 'lfu';
  };
  ui: {
    theme: 'light' | 'dark' | 'system';
    animations: boolean;
    compactMode: boolean;
  };
  features: Record<string, boolean>;
  debug: boolean;
}