// Core Types
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
    AchievementContextValue, // @deprecated - use AchievementContextType instead
    StylesProps,
    AchievementProviderProps,
} from './core/types';

// Context Types
export type {
    AchievementContextType,  // NEW - current context interface
} from './providers/AchievementProvider';

// Type Guards
export { isAsyncStorage } from './core/types';

// Storage implementations from achievements-engine
export {
    LocalStorage,
    MemoryStorage,
    IndexedDBStorage,
    RestApiStorage,
    AsyncStorageAdapter,
    OfflineQueueStorage,
    StorageType
} from 'achievements-engine';

export type { RestApiStorageConfig } from 'achievements-engine';

// Core UI Components
export { BadgesButton } from './core/components/BadgesButton';
export { BadgesModal } from './core/components/BadgesModal';
export { BadgesButtonWithModal } from './core/components/BadgesButtonWithModal';
export { ConfettiWrapper } from './core/components/ConfettiWrapper';
export { LevelProgress } from './core/components/LevelProgress';

// Core Provider and Hooks
export { AchievementProvider, AchievementContext } from './providers/AchievementProvider';
export { useAchievements } from './hooks/useAchievements';
export { useSimpleAchievements } from './hooks/useSimpleAchievements';
export { useAchievementEngine } from './hooks/useAchievementEngine'; // NEW in v3.8.0

// Core Styles
export { defaultStyles } from './core/styles/defaultStyles';

// Core Icons
export { defaultAchievementIcons } from './core/icons/defaultIcons';

// Configuration and data utilities from achievements-engine
export {
    normalizeAchievements,
    isSimpleConfig,
    exportAchievementData,
    createConfigHash,
    importAchievementData
} from 'achievements-engine';

export type {
    ImportOptions,
    ImportResult,
    ExportedData
} from 'achievements-engine';

/**
 * Achievement Builder Utilities
 *
 * These utilities are re-exported from achievements-engine for backwards compatibility.
 * They provide a convenient builder API for creating achievement configurations.
 *
 * @see https://github.com/dave-b-b/achievements-engine for full documentation
 */
export {
    AchievementBuilder,
    type AwardDetails,
} from 'achievements-engine';

// Error classes from achievements-engine
export {
    AchievementError,
    StorageQuotaError,
    ImportValidationError,
    StorageError,
    ConfigurationError,
    SyncError,
    isAchievementError,
    isRecoverableError
} from 'achievements-engine';

// Built-in UI Components (NEW in v3.6.0)
export { BuiltInNotification } from './core/ui/BuiltInNotification';
export { BuiltInModal } from './core/ui/BuiltInModal';
export { BuiltInConfetti } from './core/ui/BuiltInConfetti';

// UI Types and Interfaces (NEW in v3.6.0)
export type {
    NotificationComponent,
    NotificationProps,
    ModalComponent,
    ModalProps,
    ConfettiComponent,
    ConfettiProps,
    NotificationPosition,
    ThemeConfig,
    UIConfig,
} from './core/types';

// Theme System (NEW in v3.6.0)

// Custom Hooks (NEW in v3.6.0)
export { useWindowSize } from './core/hooks/useWindowSize';

// Achievement Engine (NEW in v3.8.0) - Framework-agnostic core
export {AchievementEngine} from 'achievements-engine';
export type { AchievementEngineApi } from 'achievements-engine';

// Re-export engine types for convenience
export type {
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
