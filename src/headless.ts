export type {
  AchievementMetrics,
  AchievementConfiguration,
  AchievementConfigurationType,
  SimpleAchievementConfig,
  SimpleAchievementDetails,
  CustomAchievementDetails,
  AchievementDetails,
  AchievementWithStatus,
  AchievementCondition,
  AchievementMetricValue,
  AchievementMetricArrayValue,
  InitialAchievementMetrics,
  AchievementState,
  AchievementStorage,
  AsyncAchievementStorage,
  AnyAchievementStorage,
  AchievementContextValue,
} from './core/types';

export type { AchievementContextType, AchievementProviderProps } from './providers/AchievementProvider';

export { isAsyncStorage } from './core/types';

export {
  AchievementProvider,
  AchievementContext,
} from './providers/AchievementProvider';
export { useAchievements } from './hooks/useAchievements';
export { useSimpleAchievements } from './hooks/useSimpleAchievements';
export { useAchievementState } from './hooks/useAchievementState';
export { useAchievementEngine } from './hooks/useAchievementEngine';

export {
  LocalStorage,
  MemoryStorage,
  IndexedDBStorage,
  RestApiStorage,
  AsyncStorageAdapter,
  OfflineQueueStorage,
  StorageType,
  normalizeAchievements,
  isSimpleConfig,
  exportAchievementData,
  createConfigHash,
  importAchievementData,
  AchievementBuilder,
  AchievementEngine,
  AchievementError,
  StorageQuotaError,
  ImportValidationError,
  StorageError,
  ConfigurationError,
  SyncError,
  isAchievementError,
  isRecoverableError,
} from 'achievements-engine';

export type {
  RestApiStorageConfig,
  ImportOptions,
  ImportResult,
  ExportedData,
  AwardDetails,
  AchievementEngineApi,
  EngineConfig,
  EngineEvent,
  AchievementUnlockedEvent,
  MetricUpdatedEvent,
  StateChangedEvent,
  ErrorEvent,
  EventMapping,
  MetricUpdater,
  UnsubscribeFn,
} from 'achievements-engine';
