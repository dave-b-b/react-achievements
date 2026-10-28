import type * as Engine from 'achievements-engine';
import type { ConfettiOptions } from './ui/interfaces';

// The engine owns achievement data. React refines only celebration options.
export type AchievementConfetti = false | ConfettiOptions;
export type AchievementDetails = Engine.AchievementDetails<AchievementConfetti>;
export type AchievementWithStatus = Engine.AchievementWithStatus<AchievementConfetti>;
export type AchievementCondition = Engine.AchievementCondition<AchievementConfetti>;
export type AchievementConfiguration = Engine.AchievementConfiguration<AchievementConfetti>;
export type SimpleAchievementDetails = Engine.SimpleAchievementDetails<AchievementConfetti>;
export type CustomAchievementDetails = Engine.CustomAchievementDetails<AchievementConfetti>;
export type SimpleAchievementConfig = Engine.SimpleAchievementConfig<AchievementConfetti>;
export type AchievementConfigurationType = Engine.AchievementConfigurationType<AchievementConfetti>;

export type {
    AchievementMetricValue,
    AchievementMetricArrayValue,
    AchievementMetrics,
    InitialAchievementMetrics,
    AchievementState,
    AchievementStorage,
    AsyncAchievementStorage,
    AnyAchievementStorage,
} from 'achievements-engine';
export { isDate, isAsyncStorage, StorageType } from 'achievements-engine';

// Local bindings used by the legacy React context and provider interfaces below.
import type {
    AchievementMetrics,
    InitialAchievementMetrics,
    AchievementStorage,
} from 'achievements-engine';

export type AchievementUIDensity = 'comfortable' | 'compact';
export type AchievementUIBackdropBlur = number | string;

/**
 * @deprecated This type is outdated and will be removed in the next major release.
 * Use AchievementContextType from 'react-achievements' instead.
 *
 * This legacy interface does not include the 'engine' property.
 *
 * @example
 * ```typescript
 * // Old (deprecated)
 * import { AchievementContextValue } from 'react-achievements';
 *
 * // New (recommended)
 * import { AchievementContextType } from 'react-achievements';
 * ```
 */
export interface AchievementContextValue {
    updateMetrics: (metrics: AchievementMetrics | ((prev: AchievementMetrics) => AchievementMetrics)) => void;
    unlockedAchievements: string[];
    resetStorage: () => void;
}

export interface StylesProps {
    badgesButton?: React.CSSProperties;
    badgesModal?: {
        overlay?: React.CSSProperties;
        content?: React.CSSProperties;
        header?: React.CSSProperties;
        closeButton?: React.CSSProperties;
        achievementList?: React.CSSProperties;
        achievementItem?: React.CSSProperties;
        achievementTitle?: React.CSSProperties;
        achievementDescription?: React.CSSProperties;
        achievementIcon?: React.CSSProperties;
        lockIcon?: React.CSSProperties;
        lockedAchievementItem?: React.CSSProperties;
    };
    levelProgress?: {
        container?: React.CSSProperties;
        header?: React.CSSProperties;
        levelLabel?: React.CSSProperties;
        valueText?: React.CSSProperties;
        progressTrack?: React.CSSProperties;
        progressBar?: React.CSSProperties;
        progressText?: React.CSSProperties;
    };
}

export interface AchievementProviderProps {
    children: React.ReactNode;
    config: AchievementConfiguration;
    initialState?: InitialAchievementMetrics & { previouslyAwardedAchievements?: string[] };
    storageKey?: string;
    badgesButtonPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    styles?: Partial<StylesProps>;
    icons?: Record<string, string>;
    storage?: AchievementStorage;
    onAchievementUnlocked?: (achievement: AchievementDetails) => void;
}

// Re-export UI types for convenience
export type {
    NotificationProps,
    NotificationComponent,
    ModalProps,
    ModalComponent,
    ConfettiProps,
    ConfettiComponent,
    ConfettiOptions,
    ConfettiShape,
    NotificationPosition,
    ThemeConfig,
    UIConfig,
} from './ui/interfaces';
