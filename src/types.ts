export interface AchievementData {
    id: string;
    title: string;
    description: string;
    icon: string;
}

export type MetricValue = number | string | boolean | Date;

export interface Metrics {
    [key: string]: MetricValue[];
}

export interface AchievementCondition {
    check: (value: MetricValue[]) => boolean;
    data: AchievementData;
}

export interface AchievementConfig {
    [key: string]: AchievementCondition[];
}