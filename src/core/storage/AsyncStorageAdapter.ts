import { AchievementStorage, AsyncAchievementStorage, AchievementMetrics } from '../types';
import { StorageError, AchievementError } from '../errors/AchievementErrors';

export class AsyncStorageAdapter implements AchievementStorage {
    private asyncStorage: AsyncAchievementStorage;
    private cache: {
        metrics: AchievementMetrics;
        unlocked: string[];
        loaded: boolean;
    };
    private pendingWrites: Promise<void>[] = [];
    private onError?: (error: AchievementError) => void;

    constructor(
        asyncStorage: AsyncAchievementStorage,
        options?: { onError?: (error: AchievementError) => void }
    ) {
        this.asyncStorage = asyncStorage;
        this.onError = options?.onError;
        this.cache = {
            metrics: {},
            unlocked: [],
            loaded: false
        };

        // Eagerly load data from async storage (non-blocking)
        this.initializeCache();
    }

    /**
     * Initialize cache by loading from async storage
     * This happens in the background during construction
     */
    private async initializeCache(): Promise<void> {
        try {
            const [metrics, unlocked] = await Promise.all([
                this.asyncStorage.getMetrics(),
                this.asyncStorage.getUnlockedAchievements()
            ]);

            this.cache.metrics = metrics;
            this.cache.unlocked = unlocked;
            this.cache.loaded = true;
        } catch (error) {
            // Handle initialization errors
            console.error('Failed to initialize async storage:', error);
            if (this.onError) {
                const storageError = error instanceof AchievementError
                    ? error
                    : new StorageError('Failed to initialize storage', error as Error);
                this.onError(storageError);
            }
            // Set to empty state on error
            this.cache.loaded = true; // Mark as loaded even on error to prevent blocking
        }
    }

    /**
     * Wait for cache to be loaded (used internally)
     * Returns immediately if already loaded, otherwise waits
     */
    private async ensureCacheLoaded(): Promise<void> {
        while (!this.cache.loaded) {
            await new Promise(resolve => setTimeout(resolve, 10));
        }
    }

    /**
     * SYNC READ: Returns cached metrics immediately
     * Cache is loaded eagerly during construction
     */
    getMetrics(): AchievementMetrics {
        return this.cache.metrics;
    }

    /**
     * SYNC WRITE: Updates cache immediately, writes to storage in background
     * Uses optimistic updates - assumes write will succeed
     */
    setMetrics(metrics: AchievementMetrics): void {
        // Update cache immediately (optimistic update)
        this.cache.metrics = metrics;

        // Write to async storage in background
        const writePromise = this.asyncStorage.setMetrics(metrics).catch(error => {
            console.error('Failed to write metrics to async storage:', error);
            if (this.onError) {
                const storageError = error instanceof AchievementError
                    ? error
                    : new StorageError('Failed to write metrics', error as Error);
                this.onError(storageError);
            }
        });

        // Track pending write for cleanup/testing
        this.pendingWrites.push(writePromise);
    }

    /**
     * SYNC READ: Returns cached unlocked achievements immediately
     */
    getUnlockedAchievements(): string[] {
        return this.cache.unlocked;
    }

    /**
     * SYNC WRITE: Updates cache immediately, writes to storage in background
     */
    setUnlockedAchievements(achievements: string[]): void {
        // Update cache immediately (optimistic update)
        this.cache.unlocked = achievements;

        // Write to async storage in background
        const writePromise = this.asyncStorage.setUnlockedAchievements(achievements).catch(error => {
            console.error('Failed to write unlocked achievements to async storage:', error);
            if (this.onError) {
                const storageError = error instanceof AchievementError
                    ? error
                    : new StorageError('Failed to write achievements', error as Error);
                this.onError(storageError);
            }
        });

        // Track pending write
        this.pendingWrites.push(writePromise);
    }

    /**
     * SYNC CLEAR: Clears cache immediately, clears storage in background
     */
    clear(): void {
        // Clear cache immediately
        this.cache.metrics = {};
        this.cache.unlocked = [];

        // Clear async storage in background
        const clearPromise = this.asyncStorage.clear().catch(error => {
            console.error('Failed to clear async storage:', error);
            if (this.onError) {
                const storageError = error instanceof AchievementError
                    ? error
                    : new StorageError('Failed to clear storage', error as Error);
                this.onError(storageError);
            }
        });

        // Track pending write
        this.pendingWrites.push(clearPromise);
    }

    /**
     * Wait for all pending writes to complete (useful for testing/cleanup)
     * NOT part of AchievementStorage interface - utility method
     */
    async flush(): Promise<void> {
        await Promise.all(this.pendingWrites);
        this.pendingWrites = [];
    }
}
