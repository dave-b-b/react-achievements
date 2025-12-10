import { AchievementStorage, AchievementMetrics, AchievementMetricValue, isDate } from '../types';
import { StorageQuotaError, StorageError } from '../errors/AchievementErrors';

export class LocalStorage implements AchievementStorage {
    private storageKey: string;

    constructor(storageKey: string) {
        this.storageKey = storageKey;
    }

    private serializeValue(value: AchievementMetricValue): any {
        if (isDate(value)) {
            return { __type: 'Date', value: value.toISOString() };
        }
        return value;
    }

    private deserializeValue(value: any): AchievementMetricValue {
        if (value && typeof value === 'object' && value.__type === 'Date') {
            return new Date(value.value);
        }
        return value;
    }

    private serializeMetrics(metrics: AchievementMetrics): any {
        const serialized: any = {};
        for (const [key, values] of Object.entries(metrics)) {
            serialized[key] = values.map(this.serializeValue);
        }
        return serialized;
    }

    private deserializeMetrics(metrics: any): AchievementMetrics {
        if (!metrics) return {};
        const deserialized: AchievementMetrics = {};
        for (const [key, values] of Object.entries(metrics)) {
            deserialized[key] = (values as any[]).map(this.deserializeValue);
        }
        return deserialized;
    }

    private getStorageData(): { metrics: AchievementMetrics; unlockedAchievements: string[] } {
        const data = localStorage.getItem(this.storageKey);
        if (!data) return { metrics: {}, unlockedAchievements: [] };
        try {
            const parsed = JSON.parse(data);
            return {
                metrics: this.deserializeMetrics(parsed.metrics || {}),
                unlockedAchievements: parsed.unlockedAchievements || []
            };
        } catch (e) {
            return { metrics: {}, unlockedAchievements: [] };
        }
    }

    private setStorageData(data: { metrics: AchievementMetrics; unlockedAchievements: string[] }): void {
        try {
            const serialized = {
                metrics: this.serializeMetrics(data.metrics),
                unlockedAchievements: data.unlockedAchievements
            };
            const jsonString = JSON.stringify(serialized);
            localStorage.setItem(this.storageKey, jsonString);
        } catch (error) {
            // Throw proper error instead of silently failing
            if (error instanceof DOMException &&
                (error.name === 'QuotaExceededError' ||
                 error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
                const serialized = {
                    metrics: this.serializeMetrics(data.metrics),
                    unlockedAchievements: data.unlockedAchievements
                };
                const bytesNeeded = JSON.stringify(serialized).length;
                throw new StorageQuotaError(bytesNeeded);
            }

            if (error instanceof Error) {
                if (error.message && error.message.includes('QuotaExceeded')) {
                    const serialized = {
                        metrics: this.serializeMetrics(data.metrics),
                        unlockedAchievements: data.unlockedAchievements
                    };
                    const bytesNeeded = JSON.stringify(serialized).length;
                    throw new StorageQuotaError(bytesNeeded);
                }
                throw new StorageError(`Failed to save achievement data: ${error.message}`, error);
            }

            throw new StorageError('Failed to save achievement data');
        }
    }

    getMetrics(): AchievementMetrics {
        return this.getStorageData().metrics;
    }

    setMetrics(metrics: AchievementMetrics): void {
        const data = this.getStorageData();
        this.setStorageData({ ...data, metrics });
    }

    getUnlockedAchievements(): string[] {
        return this.getStorageData().unlockedAchievements;
    }

    setUnlockedAchievements(achievements: string[]): void {
        const data = this.getStorageData();
        this.setStorageData({ ...data, unlockedAchievements: achievements });
    }

    clear(): void {
        localStorage.removeItem(this.storageKey);
    }
} 