export interface AchievementDetails {
    achievementId: string;
    achievementTitle: string;
    achievementDescription: string;
    achievementIconKey: string;
}

export type AchievementIconRecord = Record<string, string>;

export type InitialAchievementMetrics = Record<string, number | boolean>;

export type AchievementMetricValue = number | string | boolean | Date;

export interface AchievementMetrics {
    [metricName: string]: AchievementMetricValue[];
}

export interface AchievementUnlockCondition<T extends AchievementMetricValue = AchievementMetricValue> {
    isConditionMet: (metricValue: T) => boolean;
    achievementDetails: AchievementDetails;
}

export interface AchievementConfiguration {
    [metricName: string]: AchievementUnlockCondition[];
}