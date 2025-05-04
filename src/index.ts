// Core Types
export type { 
    AchievementMetrics, 
    AchievementConfiguration, 
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
export { StorageType } from './core/types';

// Core UI Components
export { BadgesButton } from './core/components/BadgesButton';
export { BadgesModal } from './core/components/BadgesModal';
export { ConfettiWrapper } from './core/components/ConfettiWrapper';

// Core Provider and Hooks
export { AchievementProvider, AchievementContext } from './providers/AchievementProvider';
export { useAchievements } from './hooks/useAchievements';

// Core Styles
export { defaultStyles } from './core/styles/defaultStyles';

// Core Icons
export { defaultAchievementIcons } from './core/icons/defaultIcons';