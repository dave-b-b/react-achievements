import { AsyncAchievementStorage, AchievementMetrics } from '../types';
import { StorageError } from '../errors/AchievementErrors';

interface QueuedOperation {
    id: string;
    type: 'setMetrics' | 'setUnlockedAchievements' | 'clear';
    data?: any;
    timestamp: number;
}

export class OfflineQueueStorage implements AsyncAchievementStorage {
    private innerStorage: AsyncAchievementStorage;
    private queue: QueuedOperation[] = [];
    private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
    private isSyncing: boolean = false;
    private queueStorageKey: string = 'achievements_offline_queue';

    constructor(innerStorage: AsyncAchievementStorage) {
        this.innerStorage = innerStorage;

        // Load queued operations from localStorage
        this.loadQueue();

        // Listen for online/offline events (only in browser environment)
        if (typeof window !== 'undefined') {
            window.addEventListener('online', this.handleOnline);
            window.addEventListener('offline', this.handleOffline);
        }

        // Process queue if already online
        if (this.isOnline) {
            this.processQueue();
        }
    }

    private loadQueue(): void {
        try {
            if (typeof localStorage !== 'undefined') {
                const queueData = localStorage.getItem(this.queueStorageKey);
                if (queueData) {
                    this.queue = JSON.parse(queueData);
                }
            }
        } catch (error) {
            console.error('Failed to load offline queue:', error);
            this.queue = [];
        }
    }

    private saveQueue(): void {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem(this.queueStorageKey, JSON.stringify(this.queue));
            }
        } catch (error) {
            console.error('Failed to save offline queue:', error);
        }
    }

    private handleOnline = (): void => {
        this.isOnline = true;
        console.log('[OfflineQueue] Back online, processing queue...');
        this.processQueue();
    };

    private handleOffline = (): void => {
        this.isOnline = false;
        console.log('[OfflineQueue] Offline mode activated');
    };

    private async processQueue(): Promise<void> {
        if (this.isSyncing || this.queue.length === 0 || !this.isOnline) {
            return;
        }

        this.isSyncing = true;

        try {
            // Process operations in order
            while (this.queue.length > 0 && this.isOnline) {
                const operation = this.queue[0];

                try {
                    switch (operation.type) {
                        case 'setMetrics':
                            await this.innerStorage.setMetrics(operation.data);
                            break;
                        case 'setUnlockedAchievements':
                            await this.innerStorage.setUnlockedAchievements(operation.data);
                            break;
                        case 'clear':
                            await this.innerStorage.clear();
                            break;
                    }

                    // Operation succeeded, remove from queue
                    this.queue.shift();
                    this.saveQueue();
                } catch (error) {
                    console.error('Failed to sync queued operation:', error);
                    // Stop processing on error, will retry later
                    break;
                }
            }
        } finally {
            this.isSyncing = false;
        }
    }

    private queueOperation(type: QueuedOperation['type'], data?: any): void {
        const operation: QueuedOperation = {
            id: `${Date.now()}_${Math.random()}`,
            type,
            data,
            timestamp: Date.now()
        };

        this.queue.push(operation);
        this.saveQueue();

        // Try to process queue if online
        if (this.isOnline) {
            this.processQueue();
        }
    }

    async getMetrics(): Promise<AchievementMetrics> {
        // Reads always try to hit the server first
        try {
            return await this.innerStorage.getMetrics();
        } catch (error) {
            if (!this.isOnline) {
                throw new StorageError('Cannot read metrics while offline');
            }
            throw error;
        }
    }

    async setMetrics(metrics: AchievementMetrics): Promise<void> {
        if (this.isOnline) {
            try {
                await this.innerStorage.setMetrics(metrics);
                return;
            } catch (error) {
                // Failed while online, queue it
                console.warn('Failed to set metrics, queuing for later:', error);
            }
        }

        // Queue operation if offline or if online operation failed
        this.queueOperation('setMetrics', metrics);
    }

    async getUnlockedAchievements(): Promise<string[]> {
        // Reads always try to hit the server first
        try {
            return await this.innerStorage.getUnlockedAchievements();
        } catch (error) {
            if (!this.isOnline) {
                throw new StorageError('Cannot read achievements while offline');
            }
            throw error;
        }
    }

    async setUnlockedAchievements(achievements: string[]): Promise<void> {
        if (this.isOnline) {
            try {
                await this.innerStorage.setUnlockedAchievements(achievements);
                return;
            } catch (error) {
                // Failed while online, queue it
                console.warn('Failed to set unlocked achievements, queuing for later:', error);
            }
        }

        // Queue operation if offline or if online operation failed
        this.queueOperation('setUnlockedAchievements', achievements);
    }

    async clear(): Promise<void> {
        if (this.isOnline) {
            try {
                await this.innerStorage.clear();
                // Also clear the queue
                this.queue = [];
                this.saveQueue();
                return;
            } catch (error) {
                console.warn('Failed to clear, queuing for later:', error);
            }
        }

        // Queue operation if offline or if online operation failed
        this.queueOperation('clear');
    }

    /**
     * Manually trigger queue processing (useful for testing)
     */
    async sync(): Promise<void> {
        await this.processQueue();
    }

    /**
     * Get current queue status (useful for debugging)
     */
    getQueueStatus(): { pending: number; operations: QueuedOperation[] } {
        return {
            pending: this.queue.length,
            operations: [...this.queue]
        };
    }

    /**
     * Cleanup listeners (call on unmount)
     */
    destroy(): void {
        if (typeof window !== 'undefined') {
            window.removeEventListener('online', this.handleOnline);
            window.removeEventListener('offline', this.handleOffline);
        }
    }
}
