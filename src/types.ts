import {Styles} from "./defaultStyles";

export type AchievementMetricValue = number | string | boolean | Date;

export interface AchievementState {
    metrics: Record<string, AchievementMetricValue[]>;
    unlockedAchievements: string[];
}

export interface AchievementDetails {
    achievementId: string;
    achievementTitle: string;
    achievementDescription: string;
    achievementIconKey?: string;
}

export type AchievementIconRecord = Record<string, string>;

export interface AchievementUnlockCondition {
    isConditionMet: (value: AchievementMetricValue, state?: AchievementState) => boolean;
    achievementDetails: AchievementDetails;
}

export interface AchievementConfiguration {
    [metricName: string]: AchievementUnlockCondition[];
}

export type InitialAchievementMetrics = Record<string, AchievementMetricValue | AchievementMetricValue[] | undefined>;
export type AchievementMetrics = Record<string, AchievementMetricValue[]>;

export interface AchievementProviderProps {
    children: React.ReactNode;
    config: AchievementConfiguration;
    initialState?: InitialAchievementMetrics & { previouslyAwardedAchievements?: string[] };
    storageKey?: string;
    badgesButtonPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    styles?: Partial<Styles>;
    icons?: Record<string, string>;
}