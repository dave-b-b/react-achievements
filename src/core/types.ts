export type AchievementMetricValue = number | string | boolean | Date | null | undefined;
export type AchievementMetricArrayValue = AchievementMetricValue | AchievementMetricValue[];

export const isDate = (value: any): value is Date => {
    return value instanceof Date;
};

export interface AchievementMetrics {
    [key: string]: AchievementMetricValue[];
}

export interface AchievementDetails {
    achievementId: string;
    achievementTitle: string;
    achievementDescription: string;
    achievementIconKey?: string;
}

export interface AchievementWithStatus extends AchievementDetails {
    isUnlocked: boolean;
}

export interface AchievementCondition {
    isConditionMet: (value: AchievementMetricArrayValue, state: AchievementState) => boolean;
    achievementDetails: {
        achievementId: string;
        achievementTitle: string;
        achievementDescription: string;
        achievementIconKey: string;
    };
}

export interface AchievementConfiguration {
    [key: string]: AchievementCondition[];
}

// Simple API types
export interface SimpleAchievementDetails {
    title: string;
    description?: string;
    icon?: string;
}

export interface CustomAchievementDetails extends SimpleAchievementDetails {
    condition: (metrics: Record<string, any>) => boolean;
}

export interface SimpleAchievementConfig {
    [metric: string]: {
        [threshold: string]: SimpleAchievementDetails | CustomAchievementDetails;
    };
}

// Union type for backward compatibility
export type AchievementConfigurationType = AchievementConfiguration | SimpleAchievementConfig;

export interface InitialAchievementMetrics {
    [key: string]: AchievementMetricValue;
}

export interface AchievementState {
    metrics: AchievementMetrics;
    unlockedAchievements: string[];
}

export interface AchievementStorage {
    getMetrics(): AchievementMetrics;
    setMetrics(metrics: AchievementMetrics): void;
    getUnlockedAchievements(): string[];
    setUnlockedAchievements(achievements: string[]): void;
    clear(): void;
}

// Async storage interface - all operations return Promises
export interface AsyncAchievementStorage {
    getMetrics(): Promise<AchievementMetrics>;
    setMetrics(metrics: AchievementMetrics): Promise<void>;
    getUnlockedAchievements(): Promise<string[]>;
    setUnlockedAchievements(achievements: string[]): Promise<void>;
    clear(): Promise<void>;
}

// Union type for provider to accept both sync and async storage
export type AnyAchievementStorage = AchievementStorage | AsyncAchievementStorage;

// Type guard to detect async storage
export function isAsyncStorage(storage: AnyAchievementStorage): storage is AsyncAchievementStorage {
    // Check if methods return Promises
    const testResult = (storage as any).getMetrics();
    return testResult && typeof testResult.then === 'function';
}

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

export enum StorageType {
    Local = 'local',           // Synchronous localStorage
    Memory = 'memory',         // Synchronous in-memory storage
    IndexedDB = 'indexeddb',   // Asynchronous IndexedDB storage
    RestAPI = 'restapi'        // Asynchronous REST API storage
} 