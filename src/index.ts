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
    AchievementUIDensity,
    AchievementUIBackdropBlur,
    AchievementCondition,
    AchievementMetricValue,
    AchievementMetricArrayValue,
    InitialAchievementMetrics,
    AchievementState,
    AchievementStorage,
    AsyncAchievementStorage,
    AnyAchievementStorage,
    AchievementConfetti,
    AchievementContextValue, // @deprecated - use AchievementContextType instead
    StylesProps,
} from './core/types';

// Context Types
export type {
    AchievementContextType,
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
export { AchievementsWidget } from './core/components/AchievementsWidget';
export type {
    AchievementsWidgetPlacement,
    AchievementsWidgetPosition,
    AchievementsWidgetProps,
    AchievementsWidgetTriggerButtonProps,
    AchievementsWidgetTriggerProps,
} from './core/components/AchievementsWidget';
export { AchievementsList } from './core/components/AchievementsList';
export type {
    AchievementsListProps,
    AchievementsListRenderItemProps,
} from './core/components/AchievementsList';
export { AchievementsModal } from './core/components/AchievementsModal';
export type { AchievementsModalProps } from './core/components/AchievementsModal';
export { BadgesButton } from './core/components/BadgesButton';
export { BadgesModal } from './core/components/BadgesModal';
export { BadgesButtonWithModal } from './core/components/BadgesButtonWithModal';
export { ConfettiWrapper } from './core/components/ConfettiWrapper';
export { LevelProgress } from './core/components/LevelProgress';

// Core Provider and Hooks
export { AchievementProvider } from './providers/WebAchievementProvider';
export type { WebAchievementProviderProps as AchievementProviderProps } from './providers/WebAchievementProvider';
export {
    AchievementProvider as HeadlessAchievementProvider,
    AchievementContext,
} from './providers/AchievementProvider';
export { useAchievements } from './hooks/useAchievements';
export { useSimpleAchievements } from './hooks/useSimpleAchievements';
export { useAchievementState } from './hooks/useAchievementState';
export { useAchievementEngine } from './hooks/useAchievementEngine';

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

// Built-in UI components
export { BuiltInNotification } from './core/ui/BuiltInNotification';
export { BuiltInModal } from './core/ui/BuiltInModal';
export { BuiltInConfetti } from './core/ui/BuiltInConfetti';

// UI types and interfaces
export type {
    NotificationComponent,
    NotificationProps,
    ModalComponent,
    ModalProps,
    ConfettiComponent,
    ConfettiProps,
    ConfettiOptions,
    ConfettiShape,
    NotificationPosition,
    ThemeConfig,
    UIConfig,
} from './core/types';

// Theme system

// Custom hooks
export { useWindowSize } from './core/hooks/useWindowSize';

// Framework-agnostic achievement engine
export {AchievementEngine} from 'achievements-engine';
export type {
    AchievementEngineApi,
    AchievementSnapshot,
    AchievementUpdateResult,
} from 'achievements-engine';

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
