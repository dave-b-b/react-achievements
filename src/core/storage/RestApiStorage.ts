import { AsyncAchievementStorage, AchievementMetrics } from '../types';
import { StorageError, SyncError, AchievementError } from '../errors/AchievementErrors';

export interface RestApiStorageConfig {
    baseUrl: string;              // e.g., 'https://api.example.com'
    userId: string;               // User identifier
    headers?: Record<string, string>; // Custom headers (auth tokens, etc.)
    timeout?: number;             // Request timeout in ms (default: 10000)
}

export class RestApiStorage implements AsyncAchievementStorage {
    private config: Required<RestApiStorageConfig>;

    constructor(config: RestApiStorageConfig) {
        this.config = {
            timeout: 10000,
            headers: {},
            ...config
        };
    }

    /**
     * Generic fetch wrapper with timeout and error handling
     */
    private async fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...this.config.headers,
                    ...options.headers
                },
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new SyncError(
                    `HTTP ${response.status}: ${response.statusText}`,
                    { statusCode: response.status }
                );
            }

            return response;
        } catch (error) {
            clearTimeout(timeoutId);

            if (error instanceof Error && error.name === 'AbortError') {
                throw new SyncError('Request timeout', { timeout: this.config.timeout });
            }

            throw error;
        }
    }

    async getMetrics(): Promise<AchievementMetrics> {
        try {
            const url = `${this.config.baseUrl}/users/${this.config.userId}/achievements/metrics`;
            const response = await this.fetchWithTimeout(url, { method: 'GET' });
            const data = await response.json();
            return data.metrics || {};
        } catch (error) {
            // Re-throw SyncError and other AchievementErrors (but not StorageError)
            // Multiple checks for Jest compatibility
            const err = error as any;
            if (err?.constructor?.name === 'SyncError' || err?.name === 'SyncError') {
                throw error;
            }
            // Also check instanceof for normal cases
            if (error instanceof AchievementError && !(error instanceof StorageError)) {
                throw error;
            }
            throw new StorageError('Failed to fetch metrics from API', error as Error);
        }
    }

    async setMetrics(metrics: AchievementMetrics): Promise<void> {
        try {
            const url = `${this.config.baseUrl}/users/${this.config.userId}/achievements/metrics`;
            await this.fetchWithTimeout(url, {
                method: 'PUT',
                body: JSON.stringify({ metrics })
            });
        } catch (error) {
            const err = error as any;
            if (err?.constructor?.name === 'SyncError' || err?.name === 'SyncError') throw error;
            if (error instanceof AchievementError && !(error instanceof StorageError)) throw error;
            throw new StorageError('Failed to save metrics to API', error as Error);
        }
    }

    async getUnlockedAchievements(): Promise<string[]> {
        try {
            const url = `${this.config.baseUrl}/users/${this.config.userId}/achievements/unlocked`;
            const response = await this.fetchWithTimeout(url, { method: 'GET' });
            const data = await response.json();
            return data.unlocked || [];
        } catch (error) {
            const err = error as any;
            if (err?.constructor?.name === 'SyncError' || err?.name === 'SyncError') throw error;
            if (error instanceof AchievementError && !(error instanceof StorageError)) throw error;
            throw new StorageError('Failed to fetch unlocked achievements from API', error as Error);
        }
    }

    async setUnlockedAchievements(achievements: string[]): Promise<void> {
        try {
            const url = `${this.config.baseUrl}/users/${this.config.userId}/achievements/unlocked`;
            await this.fetchWithTimeout(url, {
                method: 'PUT',
                body: JSON.stringify({ unlocked: achievements })
            });
        } catch (error) {
            const err = error as any;
            if (err?.constructor?.name === 'SyncError' || err?.name === 'SyncError') throw error;
            if (error instanceof AchievementError && !(error instanceof StorageError)) throw error;
            throw new StorageError('Failed to save unlocked achievements to API', error as Error);
        }
    }

    async clear(): Promise<void> {
        try {
            const url = `${this.config.baseUrl}/users/${this.config.userId}/achievements`;
            await this.fetchWithTimeout(url, { method: 'DELETE' });
        } catch (error) {
            const err = error as any;
            if (err?.constructor?.name === 'SyncError' || err?.name === 'SyncError') throw error;
            if (error instanceof AchievementError && !(error instanceof StorageError)) throw error;
            throw new StorageError('Failed to clear achievements via API', error as Error);
        }
    }
}
