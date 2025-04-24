import {Styles} from "./defaultStyles";

export type AchievementMetricValue = number | string | boolean | Date;

export interface AchievementDetails {
    achievementId: string;
    achievementTitle: string;
    achievementDescription: string;
    achievementIconKey?: string;
}

export type AchievementIconRecord = Record<string, string>;

export interface AchievementConfiguration {
    [metricName: string]: Array<AchievementUnlockCondition<AchievementMetricValue>>;
}

export type InitialAchievementMetrics = Record<string, AchievementMetricValue | AchievementMetricValue[] | undefined>;
export type AchievementMetrics = Record<string, AchievementMetricValue[]>;

export interface AchievementProviderProps {
    children: React.ReactNode;
    config: AchievementConfiguration;
    initialState?: InitialAchievementMetrics & { previouslyAwardedAchievements?: string[] }; // Add optional previouslyAwardedAchievements
    storageKey?: string;
    badgesButtonPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    styles?: Partial<Styles>;
    icons?: Record<string, string>;
}

export interface AchievementUnlockCondition<T extends AchievementMetricValue> {
    isConditionMet: (value: T) => boolean;
    achievementDetails: AchievementDetails;
}

export interface SerializedAchievementUnlockCondition {
    achievementDetails: AchievementDetails;
    conditionType: 'number' | 'string' | 'boolean' | 'date';
    conditionValue: any;
}

export interface SerializedAchievementConfiguration {
    [metricName: string]: SerializedAchievementUnlockCondition[];
}