// Core Types
export type { 
    AchievementMetrics, 
    AchievementConfiguration, 
    AchievementDetails, 
    AchievementUnlockCondition, 
    AchievementMetricValue, 
    InitialAchievementMetrics,
    AchievementState,
    AchievementStorage,
    AchievementContextValue,
    StylesProps,
    AchievementProviderProps,
} from './core/types';

// Core Storage Interface
export { LocalStorage } from './core/storage/LocalStorage';

// Core UI Components
export { BadgesButton } from './core/components/BadgesButton';
export { BadgesModal } from './core/components/BadgesModal';
export { ConfettiWrapper } from './core/components/ConfettiWrapper';

// Core Provider and Hooks
export { AchievementProvider } from './providers/AchievementProvider';
export { useAchievements } from './hooks/useAchievements';

// Core Styles
export { defaultStyles } from './core/styles/defaultStyles';

// Core Icons
export { defaultAchievementIcons } from './core/icons/defaultIcons';