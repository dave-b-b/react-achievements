// Core Types
export type { 
    AchievementMetrics, 
    AchievementConfiguration, 
    AchievementConfigurationType,
    SimpleAchievementConfig,
    SimpleAchievementDetails,
    CustomAchievementDetails,
    AchievementDetails, 
    AchievementCondition,
    AchievementMetricValue, 
    AchievementMetricArrayValue,
    InitialAchievementMetrics,
    AchievementState,
    AchievementStorage,
    AchievementContextValue,
    StylesProps,
    AchievementProviderProps,
} from './core/types';

// Core Storage Interface
export { LocalStorage } from './core/storage/LocalStorage';
export { MemoryStorage } from './core/storage/MemoryStorage';
export { StorageType } from './core/types';

// Core UI Components
export { BadgesButton } from './core/components/BadgesButton';
export { BadgesModal } from './core/components/BadgesModal';
export { ConfettiWrapper } from './core/components/ConfettiWrapper';

// Core Provider and Hooks
export { AchievementProvider, AchievementContext } from './providers/AchievementProvider';
export { useAchievements } from './hooks/useAchievements';
export { useSimpleAchievements } from './hooks/useSimpleAchievements';

// Core Styles
export { defaultStyles } from './core/styles/defaultStyles';

// Core Icons
export { defaultAchievementIcons } from './core/icons/defaultIcons';

// Configuration Utils
export { normalizeAchievements, isSimpleConfig } from './core/utils/configNormalizer';

// Helper utilities for easier achievement creation
export {
    AchievementBuilder,
    type AwardDetails,
} from './utils/achievementHelpers';

// Error Handling System (NEW in v3.3.0)
export {
    AchievementError,
    StorageQuotaError,
    ImportValidationError,
    StorageError,
    ConfigurationError,
    SyncError,
    isAchievementError,
    isRecoverableError
} from './core/errors/AchievementErrors';

// Data Export/Import (NEW in v3.3.0)
export {
    exportAchievementData,
    createConfigHash,
    type ExportedData
} from './core/utils/dataExport';

export {
    importAchievementData,
    type ImportOptions,
    type ImportResult
} from './core/utils/dataImport';