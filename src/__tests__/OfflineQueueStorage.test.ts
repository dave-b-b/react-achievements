/**
 * @jest-environment jsdom
 */

// Mock localStorage before importing OfflineQueueStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value; },
        removeItem: (key: string) => { delete store[key]; },
        clear: () => { store = {}; }
    };
})();

// In jsdom environment, localStorage exists but we want to use our controlled mock
// Override it before importing the module
Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
    configurable: true
});

Object.defineProperty(global, 'localStorage', {
    value: localStorageMock,
    writable: true,
    configurable: true
});

// Mock navigator.onLine (jsdom provides navigator, we just mock onLine)
let navigatorOnline = true;
Object.defineProperty(navigator, 'onLine', {
    get: () => navigatorOnline,
    configurable: true
});

import { OfflineQueueStorage } from '../core/storage/OfflineQueueStorage';
import { AsyncAchievementStorage, AchievementMetrics } from '../core/types';
import { StorageError } from '../core/errors/AchievementErrors';

class MockAsyncStorage implements AsyncAchievementStorage {
    public callCount = { get: 0, set: 0, clear: 0 };
    private metrics: AchievementMetrics = {};
    private unlocked: string[] = [];
    public shouldFail = false;

    async getMetrics(): Promise<AchievementMetrics> {
        this.callCount.get++;
        if (this.shouldFail) throw new Error('Mock error');
        return this.metrics;
    }

    async setMetrics(metrics: AchievementMetrics): Promise<void> {
        this.callCount.set++;
        if (this.shouldFail) throw new Error('Mock error');
        this.metrics = metrics;
    }

    async getUnlockedAchievements(): Promise<string[]> {
        this.callCount.get++;
        if (this.shouldFail) throw new Error('Mock error');
        return this.unlocked;
    }

    async setUnlockedAchievements(achievements: string[]): Promise<void> {
        this.callCount.set++;
        if (this.shouldFail) throw new Error('Mock error');
        this.unlocked = achievements;
    }

    async clear(): Promise<void> {
        this.callCount.clear++;
        if (this.shouldFail) throw new Error('Mock error');
        this.metrics = {};
        this.unlocked = [];
    }
}

describe('OfflineQueueStorage', () => {
    beforeEach(() => {
        navigatorOnline = true;
        localStorageMock.clear();
    });

    describe('Online Operations', () => {
        it('should pass through operations when online', async () => {
            const mockStorage = new MockAsyncStorage();
            const offlineStorage = new OfflineQueueStorage(mockStorage);

            await offlineStorage.setMetrics({ score: [100] });
            await offlineStorage.sync();

            expect(mockStorage.callCount.set).toBe(1);
            expect(await mockStorage.getMetrics()).toEqual({ score: [100] });
        });

        it('should read from inner storage when online', async () => {
            const mockStorage = new MockAsyncStorage();
            await mockStorage.setMetrics({ score: [200] });

            const offlineStorage = new OfflineQueueStorage(mockStorage);
            const metrics = await offlineStorage.getMetrics();

            expect(metrics).toEqual({ score: [200] });
            expect(mockStorage.callCount.get).toBe(1);
        });

        it('should clear inner storage when online', async () => {
            const mockStorage = new MockAsyncStorage();
            await mockStorage.setMetrics({ score: [100] });

            const offlineStorage = new OfflineQueueStorage(mockStorage);
            await offlineStorage.clear();
            await offlineStorage.sync();

            expect(mockStorage.callCount.clear).toBe(1);
            expect(await mockStorage.getMetrics()).toEqual({});
        });
    });

    describe('Offline Operations', () => {
        it('should queue operations when offline', async () => {
            navigatorOnline = false;
            const mockStorage = new MockAsyncStorage();
            const offlineStorage = new OfflineQueueStorage(mockStorage);

            await offlineStorage.setMetrics({ score: [100] });

            // Should not call inner storage yet
            expect(mockStorage.callCount.set).toBe(0);

            // Should have queued operation
            expect(offlineStorage.getQueueStatus().pending).toBe(1);
        });

        it('should queue multiple operations when offline', async () => {
            navigatorOnline = false;
            const mockStorage = new MockAsyncStorage();
            const offlineStorage = new OfflineQueueStorage(mockStorage);

            await offlineStorage.setMetrics({ score: [100] });
            await offlineStorage.setUnlockedAchievements(['ach1']);
            await offlineStorage.setMetrics({ score: [200] });

            expect(mockStorage.callCount.set).toBe(0);
            expect(offlineStorage.getQueueStatus().pending).toBe(3);
        });

        it('should throw StorageError when reading while offline', async () => {
            navigatorOnline = false;
            const mockStorage = new MockAsyncStorage();
            mockStorage.shouldFail = true;

            const offlineStorage = new OfflineQueueStorage(mockStorage);

            await expect(offlineStorage.getMetrics()).rejects.toThrow(StorageError);
            await expect(offlineStorage.getMetrics()).rejects.toThrow('Cannot read metrics while offline');
        });

        it('should throw StorageError when reading achievements while offline', async () => {
            navigatorOnline = false;
            const mockStorage = new MockAsyncStorage();
            mockStorage.shouldFail = true;

            const offlineStorage = new OfflineQueueStorage(mockStorage);

            await expect(offlineStorage.getUnlockedAchievements()).rejects.toThrow(StorageError);
            await expect(offlineStorage.getUnlockedAchievements()).rejects.toThrow('Cannot read achievements while offline');
        });
    });

    describe('Queue Synchronization', () => {
        it('should sync queued operations when back online', async () => {
            const mockStorage = new MockAsyncStorage();
            const offlineStorage = new OfflineQueueStorage(mockStorage);

            // Go offline
            navigatorOnline = false;
            (offlineStorage as any).handleOffline();

            await offlineStorage.setMetrics({ score: [100] });
            expect(mockStorage.callCount.set).toBe(0);

            // Go back online
            navigatorOnline = true;
            (offlineStorage as any).handleOnline();
            await offlineStorage.sync();

            // Should have synced
            expect(mockStorage.callCount.set).toBe(1);
            expect(offlineStorage.getQueueStatus().pending).toBe(0);
        });

        it('should process operations in order', async () => {
            const mockStorage = new MockAsyncStorage();
            const offlineStorage = new OfflineQueueStorage(mockStorage);

            navigatorOnline = false;

            await offlineStorage.setMetrics({ score: [100] });
            await offlineStorage.setMetrics({ score: [200] });
            await offlineStorage.setMetrics({ score: [300] });

            navigatorOnline = true;
            await offlineStorage.sync();

            // Final value should be 300
            expect(await mockStorage.getMetrics()).toEqual({ score: [300] });
        });

        it('should handle mixed operation types in queue', async () => {
            const mockStorage = new MockAsyncStorage();
            const offlineStorage = new OfflineQueueStorage(mockStorage);

            navigatorOnline = false;

            await offlineStorage.setMetrics({ score: [100] });
            await offlineStorage.setUnlockedAchievements(['ach1']);
            await offlineStorage.setMetrics({ score: [200] });
            await offlineStorage.setUnlockedAchievements(['ach1', 'ach2']);

            navigatorOnline = true;
            await offlineStorage.sync();

            expect(await mockStorage.getMetrics()).toEqual({ score: [200] });
            expect(await mockStorage.getUnlockedAchievements()).toEqual(['ach1', 'ach2']);
        });

        it('should stop processing queue on error', async () => {
            const mockStorage = new MockAsyncStorage();
            const offlineStorage = new OfflineQueueStorage(mockStorage);

            navigatorOnline = false;
            (offlineStorage as any).handleOffline();

            await offlineStorage.setMetrics({ score: [100] });
            await offlineStorage.setMetrics({ score: [200] });
            await offlineStorage.setMetrics({ score: [300] });

            navigatorOnline = true;
            (offlineStorage as any).handleOnline();

            // Make second operation fail
            let callCount = 0;
            const originalSetMetrics = mockStorage.setMetrics.bind(mockStorage);
            mockStorage.setMetrics = async (metrics: AchievementMetrics) => {
                callCount++;
                if (callCount === 2) throw new Error('Network error');
                return originalSetMetrics(metrics);
            };

            await offlineStorage.sync();

            // Should have attempted first operation, failed on second
            expect(offlineStorage.getQueueStatus().pending).toBeGreaterThan(0);
        });
    });

    describe('Queue Persistence', () => {
        it('should persist queue to localStorage', async () => {
            navigatorOnline = false;
            const mockStorage = new MockAsyncStorage();
            const offlineStorage = new OfflineQueueStorage(mockStorage);

            await offlineStorage.setMetrics({ score: [100] });

            const queueData = localStorageMock.getItem('achievements_offline_queue');
            expect(queueData).toBeTruthy();

            const queue = JSON.parse(queueData!);
            expect(queue).toHaveLength(1);
            expect(queue[0].type).toBe('setMetrics');
        });

        it('should load queue from localStorage on initialization', async () => {
            navigatorOnline = false;

            // Manually create queued operation in localStorage
            const queueData = [{
                id: 'test_1',
                type: 'setMetrics',
                data: { score: [500] },
                timestamp: Date.now()
            }];
            localStorageMock.setItem('achievements_offline_queue', JSON.stringify(queueData));

            const mockStorage = new MockAsyncStorage();
            const offlineStorage = new OfflineQueueStorage(mockStorage);

            // Wait for initialization
            await new Promise(resolve => setTimeout(resolve, 50));

            expect(offlineStorage.getQueueStatus().pending).toBe(1);

            // Go online and sync
            navigatorOnline = true;
            (offlineStorage as any).handleOnline();
            await offlineStorage.sync();

            expect(await mockStorage.getMetrics()).toEqual({ score: [500] });
        });

        it('should clear queue from localStorage after sync', async () => {
            const mockStorage = new MockAsyncStorage();
            const offlineStorage = new OfflineQueueStorage(mockStorage);

            navigatorOnline = false;
            (offlineStorage as any).handleOffline();
            await offlineStorage.setMetrics({ score: [100] });

            navigatorOnline = true;
            (offlineStorage as any).handleOnline();
            await offlineStorage.sync();

            const queueData = localStorageMock.getItem('achievements_offline_queue');
            const queue = JSON.parse(queueData!);
            expect(queue).toHaveLength(0);
        });
    });

    describe('Clear Operation', () => {
        it('should clear queue when clear succeeds online', async () => {
            const mockStorage = new MockAsyncStorage();
            const offlineStorage = new OfflineQueueStorage(mockStorage);

            navigatorOnline = false;
            await offlineStorage.setMetrics({ score: [100] });

            navigatorOnline = true;
            await offlineStorage.clear();
            await offlineStorage.sync();

            expect(offlineStorage.getQueueStatus().pending).toBe(0);
            expect(await mockStorage.getMetrics()).toEqual({});
        });

        it('should queue clear operation when offline', async () => {
            navigatorOnline = false;
            const mockStorage = new MockAsyncStorage();
            const offlineStorage = new OfflineQueueStorage(mockStorage);

            await offlineStorage.clear();

            expect(offlineStorage.getQueueStatus().pending).toBe(1);
            expect(mockStorage.callCount.clear).toBe(0);
        });
    });

    describe('Fallback to Queue on Online Failure', () => {
        it('should queue operation if write fails while online', async () => {
            const mockStorage = new MockAsyncStorage();
            const offlineStorage = new OfflineQueueStorage(mockStorage);

            // Make writes fail
            mockStorage.shouldFail = true;

            await offlineStorage.setMetrics({ score: [100] });

            // Should have queued operation
            expect(offlineStorage.getQueueStatus().pending).toBe(1);

            // Fix the error and sync
            mockStorage.shouldFail = false;
            await offlineStorage.sync();

            expect(await mockStorage.getMetrics()).toEqual({ score: [100] });
        });

        it('should queue achievement update if write fails while online', async () => {
            const mockStorage = new MockAsyncStorage();
            const offlineStorage = new OfflineQueueStorage(mockStorage);

            mockStorage.shouldFail = true;

            await offlineStorage.setUnlockedAchievements(['ach1']);

            expect(offlineStorage.getQueueStatus().pending).toBe(1);

            mockStorage.shouldFail = false;
            await offlineStorage.sync();

            expect(await mockStorage.getUnlockedAchievements()).toEqual(['ach1']);
        });
    });

    describe('getQueueStatus', () => {
        it('should return current queue status', async () => {
            navigatorOnline = false;
            const mockStorage = new MockAsyncStorage();
            const offlineStorage = new OfflineQueueStorage(mockStorage);

            await offlineStorage.setMetrics({ score: [100] });
            await offlineStorage.setUnlockedAchievements(['ach1']);

            const status = offlineStorage.getQueueStatus();

            expect(status.pending).toBe(2);
            expect(status.operations).toHaveLength(2);
            expect(status.operations[0].type).toBe('setMetrics');
            expect(status.operations[1].type).toBe('setUnlockedAchievements');
        });

        it('should return empty status when queue is empty', () => {
            const mockStorage = new MockAsyncStorage();
            const offlineStorage = new OfflineQueueStorage(mockStorage);

            const status = offlineStorage.getQueueStatus();

            expect(status.pending).toBe(0);
            expect(status.operations).toHaveLength(0);
        });
    });

    describe('destroy', () => {
        it('should cleanup event listeners', () => {
            const mockStorage = new MockAsyncStorage();
            const offlineStorage = new OfflineQueueStorage(mockStorage);

            // Just verify it doesn't throw
            expect(() => offlineStorage.destroy()).not.toThrow();
        });
    });

    describe('Auto-sync on Online Event', () => {
        it('should automatically process queue when online event fires', async () => {
            const mockStorage = new MockAsyncStorage();
            const offlineStorage = new OfflineQueueStorage(mockStorage);

            navigatorOnline = false;
            (offlineStorage as any).handleOffline();
            await offlineStorage.setMetrics({ score: [100] });

            expect(offlineStorage.getQueueStatus().pending).toBe(1);

            // Simulate going back online
            navigatorOnline = true;

            // Manually trigger the online event handler (since we can't dispatch real events in Node)
            await (offlineStorage as any).handleOnline();

            // Give it a moment to process
            await new Promise(resolve => setTimeout(resolve, 50));

            expect(offlineStorage.getQueueStatus().pending).toBe(0);
        });
    });

    describe('Concurrent Queue Processing', () => {
        it('should not process queue concurrently', async () => {
            const mockStorage = new MockAsyncStorage();
            const offlineStorage = new OfflineQueueStorage(mockStorage);

            navigatorOnline = false;

            await offlineStorage.setMetrics({ score: [100] });
            await offlineStorage.setMetrics({ score: [200] });

            navigatorOnline = true;

            // Try to sync multiple times concurrently
            const syncPromises = [
                offlineStorage.sync(),
                offlineStorage.sync(),
                offlineStorage.sync()
            ];

            await Promise.all(syncPromises);

            // Should have processed operations exactly once
            expect(offlineStorage.getQueueStatus().pending).toBe(0);
        });
    });
});
