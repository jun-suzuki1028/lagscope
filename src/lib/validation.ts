import { z } from 'zod';

export const MoveCategorySchema = z.enum([
  'jab',
  'tilt',
  'smash',
  'aerial',
  'special',
  'grab',
  'throw',
  'dodge',
  'movement',
  'dash'
]);

export const MoveTypeSchema = z.enum([
  'normal',
  'special',
  'grab',
  'throw',
  'dodge',
  'movement'
]);

export const MoveRangeSchema = z.enum([
  'close',
  'mid',
  'far',
  'projectile'
]);

export const HitboxTypeSchema = z.enum([
  'normal',
  'grab',
  'windbox',
  'reflector',
  'absorber'
]);

export const HitboxEffectSchema = z.enum([
  'normal',
  'fire',
  'electric',
  'freeze',
  'slash',
  'stab',
  'magic',
  'darkness',
  'aura',
  'flower',
  'bury',
  'paralyze',
  'sleep'
]);

export const OutOfShieldTypeSchema = z.enum([
  'normal',
  'jump_cancel',
  'grab',
  'up_b',
  'up_smash',
  'nair',
  'up_tilt'
]);

export const PunishMethodSchema = z.enum([
  'normal',
  'out_of_shield',
  'guard_cancel_jump',
  'guard_cancel_grab',
  'guard_cancel_up_b',
  'guard_cancel_up_smash',
  'guard_cancel_nair',
  'guard_cancel_up_tilt',
  'perfect_shield',
  'roll_away',
  'roll_behind',
  'spot_dodge'
]);

export const StalenessLevelSchema = z.enum([
  'fresh',
  'stale1',
  'stale2',
  'stale3',
  'stale4',
  'stale5',
  'stale6',
  'stale7',
  'stale8',
  'stale9'
]);

export const PositionSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number()
});

export const HitboxSchema = z.object({
  id: z.number().min(0),
  damage: z.number().min(0),
  angle: z.number().min(-180).max(361),
  baseKnockback: z.number().min(0),
  knockbackGrowth: z.number().min(0),
  hitboxType: HitboxTypeSchema,
  effect: HitboxEffectSchema,
  size: z.number().min(0),
  position: PositionSchema
});

export const HitboxDataSchema = z.object({
  hitboxes: z.array(HitboxSchema),
  multihit: z.boolean(),
  multihitFrames: z.array(z.number().min(0)).optional()
});

export const MovePropertiesSchema = z.object({
  isKillMove: z.boolean(),
  killPercent: z.number().min(0).max(999).optional(),
  hasArmor: z.boolean(),
  armorThreshold: z.number().min(0).optional(),
  isCommandGrab: z.boolean(),
  isSpike: z.boolean(),
  isMeteor: z.boolean(),
  hasInvincibility: z.boolean(),
  invincibilityFrames: z.array(z.number().min(0)).optional(),
  hasIntangibility: z.boolean(),
  intangibilityFrames: z.array(z.number().min(0)).optional(),
  canClank: z.boolean(),
  priority: z.number().min(0).max(255),
  transcendentPriority: z.boolean()
});

export const MoveSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  displayName: z.string().min(1),
  category: MoveCategorySchema,
  type: MoveTypeSchema,
  input: z.string().min(1),
  startup: z.number().min(1).max(999),
  active: z.number().min(1).max(999),
  recovery: z.number().min(0).max(999),
  totalFrames: z.number().min(1).max(999),
  onShield: z.number().min(-999).max(999),
  onHit: z.number().min(-999).max(999),
  onWhiff: z.number().min(-999).max(999),
  damage: z.union([z.number().min(0), z.array(z.number().min(0))]),
  baseKnockback: z.number().min(0),
  knockbackGrowth: z.number().min(0),
  range: MoveRangeSchema,
  hitboxData: HitboxDataSchema,
  properties: MovePropertiesSchema,
  notes: z.string().optional()
});

export const DodgeFramesSchema = z.object({
  spotDodge: z.object({
    startup: z.number().min(1),
    active: z.number().min(1),
    recovery: z.number().min(0),
    total: z.number().min(1)
  }),
  airDodge: z.object({
    startup: z.number().min(1),
    active: z.number().min(1),
    recovery: z.number().min(0),
    total: z.number().min(1)
  })
});

export const RollFramesSchema = z.object({
  forward: z.object({
    startup: z.number().min(1),
    active: z.number().min(1),
    recovery: z.number().min(0),
    total: z.number().min(1)
  }),
  backward: z.object({
    startup: z.number().min(1),
    active: z.number().min(1),
    recovery: z.number().min(0),
    total: z.number().min(1)
  })
});

export const MovementDataSchema = z.object({
  jumpSquat: z.number().min(1).max(20),
  fullHopHeight: z.number().min(0),
  shortHopHeight: z.number().min(0),
  airJumps: z.number().min(0).max(10),
  dodgeFrames: DodgeFramesSchema,
  rollFrames: RollFramesSchema
});

export const OutOfShieldOptionSchema = z.object({
  move: z.string().min(1),
  frames: z.number().min(1).max(999),
  type: OutOfShieldTypeSchema,
  effectiveness: z.number().min(0).max(10)
});

export const ShieldDataSchema = z.object({
  shieldHealth: z.number().min(0).max(100),
  shieldRegen: z.number().min(0),
  shieldRegenDelay: z.number().min(0),
  shieldStun: z.number().min(0),
  shieldReleaseFrames: z.number().min(1).max(20),
  shieldGrabFrames: z.number().min(1).max(20),
  outOfShieldOptions: z.array(OutOfShieldOptionSchema)
});

export const FighterSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  displayName: z.string().min(1),
  series: z.string().min(1),
  weight: z.number().min(1).max(200),
  fallSpeed: z.number().min(0),
  fastFallSpeed: z.number().min(0),
  gravity: z.number().min(0),
  walkSpeed: z.number().min(0),
  runSpeed: z.number().min(0),
  airSpeed: z.number().min(0),
  moves: z.array(MoveSchema),
  shieldData: ShieldDataSchema,
  movementData: MovementDataSchema,
  imageUrl: z.string().optional(),
  iconUrl: z.string().optional()
});

export const CalculationOptionsSchema = z.object({
  staleness: StalenessLevelSchema,
  rangeFilter: z.array(MoveRangeSchema),
  allowOutOfShield: z.boolean(),
  allowGuardCancel: z.boolean(),
  allowPerfectShield: z.boolean(),
  allowRolling: z.boolean(),
  allowSpotDodge: z.boolean(),
  minimumFrameAdvantage: z.number().min(-999).max(999),
  maximumFrameAdvantage: z.number().min(-999).max(999),
  minimumDamage: z.number().min(0),
  onlyGuaranteed: z.boolean(),
  includeKillMoves: z.boolean(),
  includeDIOptions: z.boolean(),
  includeSDIOptions: z.boolean(),
  positionFilter: z.array(z.string())
});

export const CalculationContextSchema = z.object({
  staleness: StalenessLevelSchema,
  shieldDamage: z.number().min(0),
  shieldStun: z.number().min(0),
  range: MoveRangeSchema,
  position: z.string(),
  options: CalculationOptionsSchema
});

export const PunishMoveSchema = z.object({
  move: MoveSchema,
  method: PunishMethodSchema,
  totalFrames: z.number().min(1),
  isGuaranteed: z.boolean(),
  probability: z.number().min(0).max(1),
  damage: z.number().min(0),
  killPercent: z.number().min(0).max(999).optional(),
  notes: z.string().optional()
});

export const PunishResultSchema = z.object({
  defendingFighter: FighterSchema,
  punishingMoves: z.array(PunishMoveSchema),
  frameAdvantage: z.number().min(-999).max(999),
  attackingMove: MoveSchema,
  calculationContext: CalculationContextSchema
});

export const FrameDataStatsSchema = z.object({
  totalFighters: z.number().min(0),
  totalMoves: z.number().min(0),
  lastUpdated: z.string(),
  version: z.string(),
  gameVersion: z.string(),
  dataSource: z.string(),
  accuracy: z.number().min(0).max(1)
});

export const GameMechanicsSchema = z.object({
  shieldHealthMax: z.number().min(0),
  shieldHealthMin: z.number().min(0),
  shieldRegenRate: z.number().min(0),
  shieldStunMultiplier: z.number().min(0),
  shieldDamageMultiplier: z.number().min(0),
  perfectShieldWindow: z.number().min(1),
  grabReleaseFrames: z.number().min(1),
  hitlagMultiplier: z.number().min(0),
  sdiMultiplier: z.number().min(0),
  diInfluence: z.number().min(0),
  stalenessMultipliers: z.record(StalenessLevelSchema, z.number().min(0))
});

export const ValidationErrorSchema = z.object({
  field: z.string(),
  message: z.string(),
  value: z.unknown().optional()
});

export const DataValidationResultSchema = z.object({
  isValid: z.boolean(),
  errors: z.array(ValidationErrorSchema),
  warnings: z.array(z.string())
});

export const DisplaySettingsSchema = z.object({
  showFrameData: z.boolean(),
  showDamage: z.boolean(),
  showKillPercent: z.boolean(),
  showProbability: z.boolean(),
  showNotes: z.boolean(),
  compactView: z.boolean(),
  animateResults: z.boolean(),
  playSound: z.boolean(),
  showTips: z.boolean()
});

export const UserPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  language: z.enum(['ja', 'en']),
  defaultOptions: CalculationOptionsSchema.partial(),
  favoriteFighters: z.array(z.string()),
  recentFighters: z.array(z.string()),
  customNotes: z.record(z.string(), z.string()),
  displaySettings: DisplaySettingsSchema
});

export const ExportOptionsSchema = z.object({
  format: z.enum(['json', 'csv', 'txt']),
  includeMetadata: z.boolean(),
  compress: z.boolean(),
  filterBy: z.object({
    fighters: z.array(z.string()).optional(),
    moves: z.array(z.string()).optional(),
    categories: z.array(MoveCategorySchema).optional()
  }).optional()
});

export const ImportResultSchema = z.object({
  success: z.boolean(),
  importedCount: z.number().min(0),
  errors: z.array(z.string()),
  warnings: z.array(z.string()),
  skippedCount: z.number().min(0)
});

export const SearchFiltersSchema = z.object({
  fighter: z.string().optional(),
  move: z.string().optional(),
  category: MoveCategorySchema.optional(),
  type: MoveTypeSchema.optional(),
  range: MoveRangeSchema.optional(),
  minDamage: z.number().min(0).optional(),
  maxDamage: z.number().min(0).optional(),
  minStartup: z.number().min(1).optional(),
  maxStartup: z.number().min(1).optional(),
  isKillMove: z.boolean().optional(),
  hasArmor: z.boolean().optional(),
  query: z.string().optional()
});

export const SortOptionSchema = z.enum([
  'name',
  'damage',
  'startup',
  'recovery',
  'total',
  'onShield',
  'range',
  'killPercent'
]);

export const SortDirectionSchema = z.enum(['asc', 'desc']);

export const SortConfigSchema = z.object({
  option: SortOptionSchema,
  direction: SortDirectionSchema
});

export const PaginationConfigSchema = z.object({
  page: z.number().min(1),
  limit: z.number().min(1).max(100),
  total: z.number().min(0)
});

export const ApiResponseSchema = <T extends z.ZodType>(dataSchema: T) => z.object({
  data: dataSchema,
  success: z.boolean(),
  message: z.string().optional(),
  errors: z.array(z.string()).optional(),
  pagination: PaginationConfigSchema.optional()
});

export const CacheEntrySchema = <T extends z.ZodType>(dataSchema: T) => z.object({
  data: dataSchema,
  timestamp: z.number().min(0),
  ttl: z.number().min(0),
  key: z.string()
});

export const PerformanceMetricsSchema = z.object({
  calculationTime: z.number().min(0),
  renderTime: z.number().min(0),
  memoryUsage: z.number().min(0),
  cacheHitRate: z.number().min(0).max(1),
  apiResponseTime: z.number().min(0)
});

export const DebugInfoSchema = z.object({
  version: z.string(),
  environment: z.string(),
  timestamp: z.string(),
  userAgent: z.string(),
  screenResolution: z.string(),
  viewportSize: z.string(),
  performance: PerformanceMetricsSchema,
  errors: z.array(z.string()),
  warnings: z.array(z.string())
});

export const ErrorLogSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  level: z.enum(['error', 'warning', 'info']),
  message: z.string(),
  stack: z.string().optional(),
  context: z.record(z.string(), z.unknown()).optional(),
  user: z.string().optional(),
  session: z.string().optional()
});

export const AnalyticsEventSchema = z.object({
  event: z.string(),
  properties: z.record(z.string(), z.unknown()),
  timestamp: z.string(),
  user: z.string().optional(),
  session: z.string().optional()
});

export const FeatureFlagSchema = z.object({
  key: z.string(),
  enabled: z.boolean(),
  description: z.string(),
  rollout: z.number().min(0).max(1),
  conditions: z.record(z.string(), z.unknown()).optional()
});

export const ConfigurationSchema = z.object({
  api: z.object({
    baseUrl: z.string().url(),
    timeout: z.number().min(0),
    retryAttempts: z.number().min(0).max(10)
  }),
  cache: z.object({
    defaultTtl: z.number().min(0),
    maxSize: z.number().min(0),
    strategy: z.enum(['lru', 'fifo', 'lfu'])
  }),
  ui: z.object({
    theme: z.enum(['light', 'dark', 'system']),
    animations: z.boolean(),
    compactMode: z.boolean()
  }),
  features: z.record(z.string(), z.boolean()),
  debug: z.boolean()
});

export type ValidatedFighter = z.infer<typeof FighterSchema>;
export type ValidatedMove = z.infer<typeof MoveSchema>;
export type ValidatedPunishResult = z.infer<typeof PunishResultSchema>;
export type ValidatedCalculationOptions = z.infer<typeof CalculationOptionsSchema>;
export type ValidatedUserPreferences = z.infer<typeof UserPreferencesSchema>;
export type ValidatedConfiguration = z.infer<typeof ConfigurationSchema>;

export function validateFighter(data: unknown): ValidatedFighter {
  return FighterSchema.parse(data);
}

export function validateMove(data: unknown): ValidatedMove {
  return MoveSchema.parse(data);
}

export function validatePunishResult(data: unknown): ValidatedPunishResult {
  return PunishResultSchema.parse(data);
}

export function validateCalculationOptions(data: unknown): ValidatedCalculationOptions {
  return CalculationOptionsSchema.parse(data);
}

export function validateUserPreferences(data: unknown): ValidatedUserPreferences {
  return UserPreferencesSchema.parse(data);
}

export function validateConfiguration(data: unknown): ValidatedConfiguration {
  return ConfigurationSchema.parse(data);
}

export function safeParse<T>(schema: z.ZodType<T>, data: unknown): { success: boolean; data?: T; errors?: z.ZodError } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}

export function validatePartial<T>(schema: z.ZodObject<z.ZodRawShape>, data: unknown): Partial<T> {
  const result = schema.partial().parse(data);
  return result as Partial<T>;
}

export function createValidationResult(errors: z.ZodError): z.infer<typeof DataValidationResultSchema> {
  const validationErrors = errors.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
    value: 'received' in err ? err.received : null
  }));

  return {
    isValid: false,
    errors: validationErrors,
    warnings: []
  };
}

export function isValidData<T>(schema: z.ZodType<T>, data: unknown): data is T {
  try {
    schema.parse(data);
    return true;
  } catch {
    return false;
  }
}

export const VALIDATION_MESSAGES = {
  REQUIRED: 'この項目は必須です',
  INVALID_FORMAT: 'フォーマットが正しくありません',
  OUT_OF_RANGE: '値が範囲外です',
  INVALID_URL: 'URLが無効です',
  INVALID_EMAIL: 'メールアドレスが無効です',
  TOO_SHORT: '値が短すぎます',
  TOO_LONG: '値が長すぎます',
  INVALID_TYPE: '型が正しくありません',
  INVALID_ENUM: '許可されていない値です'
} as const;

export function getValidationMessage(error: z.ZodIssue): string {
  switch (error.code) {
    case 'invalid_type':
      return VALIDATION_MESSAGES.INVALID_TYPE;
    case 'invalid_enum_value':
      return VALIDATION_MESSAGES.INVALID_ENUM;
    case 'too_small':
      return VALIDATION_MESSAGES.TOO_SHORT;
    case 'too_big':
      return VALIDATION_MESSAGES.TOO_LONG;
    case 'invalid_string':
      if (error.validation === 'url') {
        return VALIDATION_MESSAGES.INVALID_URL;
      }
      return VALIDATION_MESSAGES.INVALID_FORMAT;
    default:
      return error.message;
  }
}