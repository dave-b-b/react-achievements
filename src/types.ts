export type MetricValue = number | boolean | string | any;

export interface Metrics {
    [key: string]: MetricValue;
}

export interface AchievementData {
    id: string;
    title: string;
    description: string;
    icon: string;
}

export interface AchievementCondition {
    check: (metricValue: MetricValue) => boolean;
    data: AchievementData;
}

export interface AchievementConfig {
    [metricKey: string]: AchievementCondition[];
}