import type { 
  Fighter, 
  Move, 
  PunishResult, 
  CalculationOptions, 
  MoveCategory, 
  MoveType, 
  MoveRange,
  SortDirection
} from './frameData';
import type React from 'react';

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

export type Immutable<T> = {
  readonly [P in keyof T]: T[P];
};

export type NonNullable<T> = T extends null | undefined ? never : T;

export type Awaited<T> = T extends PromiseLike<infer U> ? U : T;

export type ArrayElement<T> = T extends readonly (infer U)[] ? U : never;

export type ValueOf<T> = T[keyof T];

export type UnionToIntersection<U> = (
  U extends unknown ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

export type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

export type XOR<T, U> = T | U extends object
  ? (Without<T, U> & U) | (Without<U, T> & T)
  : T | U;

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type Brand<T, B> = T & { __brand: B };

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type Nominal<T, _B> = T & { readonly __brand: unique symbol };

export type FighterId = Brand<string, 'FighterId'>;
export type MoveId = Brand<string, 'MoveId'>;
export type Percentage = Brand<number, 'Percentage'>;
export type FrameCount = Brand<number, 'FrameCount'>;
export type Damage = Brand<number, 'Damage'>;

export interface WithId<T = string> {
  id: T;
}

export interface WithTimestamp {
  createdAt: string;
  updatedAt: string;
}

export interface WithMetadata {
  metadata: Record<string, unknown>;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface Sorted<T> {
  items: T[];
  sortBy: keyof T;
  sortDirection: SortDirection;
}

export interface Filtered<T> {
  items: T[];
  filters: Partial<T>;
  appliedFilters: string[];
}

export interface Searchable<T> {
  items: T[];
  query: string;
  searchFields: (keyof T)[];
}

export interface CacheableData<T> {
  data: T;
  timestamp: number;
  ttl: number;
  key: string;
  hit: boolean;
}

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
}

export interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isSubmitting: boolean;
  isDirty: boolean;
}

export interface ValidationResult<T> {
  isValid: boolean;
  data?: T;
  errors: Array<{
    field: keyof T;
    message: string;
    value: unknown;
  }>;
  warnings: string[];
}

export interface ApiResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode?: number;
  timestamp: string;
}

export interface EventHandler<T = unknown> {
  (event: T): void;
}

export interface EventHandlerWithId<T = unknown> {
  (id: string, event: T): void;
}

export interface Subscription {
  unsubscribe(): void;
}

export interface Observable<T> {
  subscribe(observer: (value: T) => void): Subscription;
}

export interface Store<T> {
  getState(): T;
  setState(state: Partial<T>): void;
  subscribe(listener: (state: T) => void): Subscription;
}

export interface Action<T = unknown> {
  type: string;
  payload?: T;
}

export interface Reducer<T> {
  (state: T, action: Action): T;
}

export interface Middleware<T> {
  (store: Store<T>): (next: (action: Action) => void) => (action: Action) => void;
}

export interface Plugin<T> {
  name: string;
  install(store: Store<T>): void;
  uninstall?(store: Store<T>): void;
}

export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
    };
    fontWeight: {
      light: number;
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
    lineHeight: {
      tight: number;
      normal: number;
      relaxed: number;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
  };
  borderRadius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
  shadows: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  breakpoints: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  animations: {
    duration: {
      fast: string;
      normal: string;
      slow: string;
    };
    easing: {
      linear: string;
      easeIn: string;
      easeOut: string;
      easeInOut: string;
    };
  };
}

export type ComponentProps<T = Record<string, unknown>> = {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  testId?: string;
  'data-testid'?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  role?: string;
  tabIndex?: number;
  onFocus?: EventHandler<React.FocusEvent>;
  onBlur?: EventHandler<React.FocusEvent>;
  onKeyDown?: EventHandler<React.KeyboardEvent>;
  onKeyUp?: EventHandler<React.KeyboardEvent>;
  onMouseEnter?: EventHandler<React.MouseEvent>;
  onMouseLeave?: EventHandler<React.MouseEvent>;
  onClick?: EventHandler<React.MouseEvent>;
} & T;

export interface SelectOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  description?: string;
  group?: string;
}

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  headerRender?: () => React.ReactNode;
}

export interface TableRow<T> {
  id: string;
  data: T;
  selected?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: EventHandler<React.MouseEvent>;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  preventClose?: boolean;
  zIndex?: number;
}

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  closable?: boolean;
  onClose?: () => void;
}

export interface LoadingState {
  isLoading: boolean;
  progress?: number;
  message?: string;
}

export interface ErrorState {
  hasError: boolean;
  error?: Error;
  message?: string;
  stack?: string;
  timestamp?: number;
}

export interface EmptyState {
  isEmpty: boolean;
  title?: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
}

export interface ContextMenuProps {
  items: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
    disabled?: boolean;
    onClick: () => void;
    type?: 'item' | 'divider';
  }>;
  position: { x: number; y: number };
  onClose: () => void;
}

export interface DragAndDropProps<T> {
  items: T[];
  onReorder: (items: T[]) => void;
  onDrop?: (item: T, targetIndex: number) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  dragHandle?: boolean;
  disabled?: boolean;
}

export interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  onScroll?: (scrollTop: number) => void;
}

export interface InfiniteScrollProps<T> {
  items: T[];
  hasMore: boolean;
  onLoadMore: () => void;
  loading?: boolean;
  threshold?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
}

export interface FilterConfig<T> {
  field: keyof T;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'contains' | 'startsWith' | 'endsWith';
  value: unknown;
  label?: string;
}

export interface UtilsSortConfig<T> {
  field: keyof T;
  direction: SortDirection;
}

export interface UtilsPaginationConfig {
  page: number;
  limit: number;
  total: number;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: boolean;
  pageSizeOptions?: number[];
}

export interface DataTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  error?: string;
  empty?: EmptyState;
  selectable?: boolean;
  selectedRows?: string[];
  onSelectionChange?: (selectedRows: string[]) => void;
  sortable?: boolean;
  sortConfig?: UtilsSortConfig<T>;
  onSortChange?: (sortConfig: UtilsSortConfig<T>) => void;
  filterable?: boolean;
  filters?: FilterConfig<T>[];
  onFiltersChange?: (filters: FilterConfig<T>[]) => void;
  pagination?: UtilsPaginationConfig;
  onPaginationChange?: (pagination: UtilsPaginationConfig) => void;
  actions?: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: (row: T) => void;
    disabled?: (row: T) => boolean;
  }>;
  bulkActions?: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: (selectedRows: T[]) => void;
    disabled?: (selectedRows: T[]) => boolean;
  }>;
}

export interface FighterSummary {
  id: string;
  name: string;
  displayName: string;
  series: string;
  weight: number;
  totalMoves: number;
  averageStartup: number;
  averageDamage: number;
  killMoves: number;
  fastestMove: string;
  strongestMove: string;
  shieldReleaseFrames: number;
  jumpSquat: number;
}

export interface MoveSummary {
  id: string;
  name: string;
  displayName: string;
  category: MoveCategory;
  type: MoveType;
  startup: number;
  damage: number;
  onShield: number;
  range: MoveRange;
  isKillMove: boolean;
  killPercent?: number;
  fighterId: string;
  fighterName: string;
}

export interface CalculationSummary {
  totalCalculations: number;
  averageCalculationTime: number;
  guaranteedPunishes: number;
  probablePunishes: number;
  totalDamage: number;
  killOptions: number;
  fastestPunish: number;
  strongestPunish: number;
  calculationOptions: CalculationOptions;
  timestamp: string;
}

export interface PerformanceProfile {
  renderTime: number;
  calculationTime: number;
  dataLoadTime: number;
  totalTime: number;
  memoryUsage: number;
  componentRerenders: number;
  apiCalls: number;
  cacheHits: number;
  cacheMisses: number;
}

export interface AnalyticsData {
  event: string;
  timestamp: string;
  userId?: string;
  sessionId?: string;
  properties: Record<string, unknown>;
  context: {
    userAgent: string;
    url: string;
    referrer: string;
    viewport: {
      width: number;
      height: number;
    };
    performance: PerformanceProfile;
  };
}

export interface FeatureToggle {
  key: string;
  enabled: boolean;
  description: string;
  rollout: number;
  conditions: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

export interface ConfigurationOverride {
  key: string;
  value: unknown;
  environment: string;
  userId?: string;
  sessionId?: string;
  expiresAt?: string;
}

export interface CacheStrategy {
  name: string;
  maxSize: number;
  ttl: number;
  strategy: 'lru' | 'fifo' | 'lfu';
  compression: boolean;
  serialization: 'json' | 'msgpack' | 'binary';
}

export interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
  retries?: number;
  cache?: boolean;
  cacheTtl?: number;
}

export interface WebSocketMessage<T = unknown> {
  type: string;
  payload: T;
  timestamp: string;
  id: string;
}

export interface ServiceWorkerMessage<T = unknown> {
  type: string;
  payload: T;
  timestamp: string;
  origin: string;
}

export type EventMap = {
  'fighter:selected': Fighter;
  'move:selected': Move;
  'calculation:start': CalculationOptions;
  'calculation:complete': PunishResult[];
  'calculation:error': Error;
  'data:loaded': { fighters: Fighter[]; moves: Move[] };
  'data:error': Error;
  'theme:changed': string;
  'settings:updated': Record<string, unknown>;
  'navigation:changed': string;
  'modal:opened': string;
  'modal:closed': string;
  'toast:shown': ToastProps;
  'toast:hidden': string;
  'error:occurred': Error;
  'performance:measured': PerformanceProfile;
  'analytics:tracked': AnalyticsData;
};

export type EventListener<T extends keyof EventMap> = (data: EventMap[T]) => void;

export interface EventEmitter {
  on<T extends keyof EventMap>(event: T, listener: EventListener<T>): void;
  off<T extends keyof EventMap>(event: T, listener: EventListener<T>): void;
  emit<T extends keyof EventMap>(event: T, data: EventMap[T]): void;
  once<T extends keyof EventMap>(event: T, listener: EventListener<T>): void;
  removeAllListeners<T extends keyof EventMap>(event?: T): void;
}

export interface Logger {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
  group(label: string): void;
  groupEnd(): void;
  time(label: string): void;
  timeEnd(label: string): void;
  table(data: Record<string, unknown>): void;
}