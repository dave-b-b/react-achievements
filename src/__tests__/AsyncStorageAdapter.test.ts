import { AsyncStorageAdapter } from '../core/storage/AsyncStorageAdapter';
import { AsyncAchievementStorage, AchievementMetrics } from '../core/types';
import { AchievementError, StorageError } from '../core/errors/AchievementErrors';

class MockAsyncStorage implements AsyncAchievementStorage {
    private metrics: AchievementMetrics = {};
    private unlocked: string[] = [];

    async getMetrics(): Promise<AchievementMetrics> {
        return this.metrics;
    }

    async setMetrics(metrics: AchievementMetrics): Promise<void> {
        this.metrics = metrics;
    }

    async getUnlockedAchievements(): Promise<string[]> {
        return this.unlocked;
    }

    async setUnlockedAchievements(achievements: string[]): Promise<void> {
        this.unlocked = achievements;
    }

    async clear(): Promise<void> {
        this.metrics = {};
        this.unlocked = [];
    }
}

describe('AsyncStorageAdapter', () => {
    describe('Eager Loading', () => {
        it('should load data eagerly during construction', async () => {
            const mockStorage = new MockAsyncStorage();
            await mockStorage.setMetrics({ score: [100] });
            await mockStorage.setUnlockedAchievements(['ach1', 'ach2']);

            const adapter = new AsyncStorageAdapter(mockStorage);

            // Wait a bit for eager loading
            await new Promise(resolve => setTimeout(resolve, 50));

            expect(adapter.getMetrics()).toEqual({ score: [100] });
            expect(adapter.getUnlockedAchievements()).toEqual(['ach1', 'ach2']);
        });

        it('should handle empty storage on initialization', async () => {
            const mockStorage = new MockAsyncStorage();
            const adapter = new AsyncStorageAdapter(mockStorage);

            await new Promise(resolve => setTimeout(resolve, 50));

            expect(adapter.getMetrics()).toEqual({});
            expect(adapter.getUnlockedAchievements()).toEqual([]);
        });
    });

    describe('Optimistic Updates', () => {
        it('should write to async storage in background', async () => {
            const mockStorage = new MockAsyncStorage();
            const adapter = new AsyncStorageAdapter(mockStorage);

            // Wait for initialization
            await new Promise(resolve => setTimeout(resolve, 50));

            // Synchronous write
            adapter.setMetrics({ score: [200] });

            // Cache updated immediately
            expect(adapter.getMetrics()).toEqual({ score: [200] });

            // Async storage updated after flush
            await adapter.flush();
            expect(await mockStorage.getMetrics()).toEqual({ score: [200] });
        });

        it('should update cache immediately for getMetrics', () => {
            const mockStorage = new MockAsyncStorage();
            const adapter = new AsyncStorageAdapter(mockStorage);

            adapter.setMetrics({ score: [100], level: [5] });

            // Should return updated cache immediately
            expect(adapter.getMetrics()).toEqual({ score: [100], level: [5] });
        });

        it('should update cache immediately for setUnlockedAchievements', async () => {
            const mockStorage = new MockAsyncStorage();
            const adapter = new AsyncStorageAdapter(mockStorage);

            await new Promise(resolve => setTimeout(resolve, 50));

            adapter.setUnlockedAchievements(['ach1', 'ach2', 'ach3']);

            // Cache updated immediately
            expect(adapter.getUnlockedAchievements()).toEqual(['ach1', 'ach2', 'ach3']);

            // Async storage updated after flush
            await adapter.flush();
            expect(await mockStorage.getUnlockedAchievements()).toEqual(['ach1', 'ach2', 'ach3']);
        });

        it('should clear cache immediately', async () => {
            const mockStorage = new MockAsyncStorage();
            const adapter = new AsyncStorageAdapter(mockStorage);

            await new Promise(resolve => setTimeout(resolve, 50));

            adapter.setMetrics({ score: [100] });
            adapter.setUnlockedAchievements(['ach1']);
            await adapter.flush();

            adapter.clear();

            // Cache cleared immediately
            expect(adapter.getMetrics()).toEqual({});
            expect(adapter.getUnlockedAchievements()).toEqual([]);

            // Async storage cleared after flush
            await adapter.flush();
            expect(await mockStorage.getMetrics()).toEqual({});
            expect(await mockStorage.getUnlockedAchievements()).toEqual([]);
        });
    });

    describe('Error Handling', () => {
        it('should handle errors via callback', async () => {
            const mockStorage = new MockAsyncStorage();
            const errors: AchievementError[] = [];

            const adapter = new AsyncStorageAdapter(mockStorage, {
                onError: (error) => errors.push(error)
            });

            await new Promise(resolve => setTimeout(resolve, 50));

            // Force an error
            mockStorage.setMetrics = async () => {
                throw new Error('Test error');
            };

            adapter.setMetrics({ score: [300] });
            await adapter.flush();

            expect(errors).toHaveLength(1);
            expect(errors[0]).toBeInstanceOf(StorageError);
            expect(errors[0].message).toContain('Failed to write metrics');
        });

        it('should handle initialization errors', async () => {
            const mockStorage = new MockAsyncStorage();
            const errors: AchievementError[] = [];

            // Force initialization error
            mockStorage.getMetrics = async () => {
                throw new Error('Init error');
            };

            const _adapter = new AsyncStorageAdapter(mockStorage, {
                onError: (error) => errors.push(error)
            });

            await new Promise(resolve => setTimeout(resolve, 50));

            expect(errors).toHaveLength(1);
            expect(errors[0]).toBeInstanceOf(StorageError);
            expect(errors[0].message).toContain('Failed to initialize storage');
        });

        it('should mark cache as loaded even on error', async () => {
            const mockStorage = new MockAsyncStorage();

            mockStorage.getMetrics = async () => {
                throw new Error('Init error');
            };

            const adapter = new AsyncStorageAdapter(mockStorage);

            await new Promise(resolve => setTimeout(resolve, 50));

            // Should return empty state instead of blocking
            expect(adapter.getMetrics()).toEqual({});
            expect(adapter.getUnlockedAchievements()).toEqual([]);
        });

        it('should pass through AchievementErrors unchanged', async () => {
            const mockStorage = new MockAsyncStorage();
            const errors: AchievementError[] = [];

            const adapter = new AsyncStorageAdapter(mockStorage, {
                onError: (error) => errors.push(error)
            });

            await new Promise(resolve => setTimeout(resolve, 50));

            const customError = new StorageError('Custom storage error');
            mockStorage.setMetrics = async () => {
                throw customError;
            };

            adapter.setMetrics({ score: [400] });
            await adapter.flush();

            expect(errors).toHaveLength(1);
            expect(errors[0]).toBe(customError);
        });
    });

    describe('Write Tracking', () => {
        it('should track pending writes', async () => {
            const mockStorage = new MockAsyncStorage();
            const adapter = new AsyncStorageAdapter(mockStorage);

            await new Promise(resolve => setTimeout(resolve, 50));

            // Multiple writes
            adapter.setMetrics({ score: [100] });
            adapter.setUnlockedAchievements(['ach1']);
            adapter.setMetrics({ score: [200] });

            // Flush should wait for all writes
            await adapter.flush();

            // All writes should be complete
            expect(await mockStorage.getMetrics()).toEqual({ score: [200] });
            expect(await mockStorage.getUnlockedAchievements()).toEqual(['ach1']);
        });

        it('should clear pending writes after flush', async () => {
            const mockStorage = new MockAsyncStorage();
            const adapter = new AsyncStorageAdapter(mockStorage);

            await new Promise(resolve => setTimeout(resolve, 50));

            adapter.setMetrics({ score: [100] });
            await adapter.flush();

            // Second flush should complete immediately
            const startTime = Date.now();
            await adapter.flush();
            const duration = Date.now() - startTime;

            expect(duration).toBeLessThan(10); // Should be nearly instant
        });
    });

    describe('Multiple Operations', () => {
        it('should handle rapid sequential updates', async () => {
            const mockStorage = new MockAsyncStorage();
            const adapter = new AsyncStorageAdapter(mockStorage);

            await new Promise(resolve => setTimeout(resolve, 50));

            // Rapid updates
            for (let i = 0; i < 10; i++) {
                adapter.setMetrics({ score: [i * 100] });
            }

            // Cache should have latest value
            expect(adapter.getMetrics()).toEqual({ score: [900] });

            // All writes should complete
            await adapter.flush();
            expect(await mockStorage.getMetrics()).toEqual({ score: [900] });
        });

        it('should handle interleaved metrics and achievements updates', async () => {
            const mockStorage = new MockAsyncStorage();
            const adapter = new AsyncStorageAdapter(mockStorage);

            await new Promise(resolve => setTimeout(resolve, 50));

            adapter.setMetrics({ score: [100] });
            adapter.setUnlockedAchievements(['ach1']);
            adapter.setMetrics({ score: [200], level: [2] });
            adapter.setUnlockedAchievements(['ach1', 'ach2']);

            await adapter.flush();

            expect(await mockStorage.getMetrics()).toEqual({ score: [200], level: [2] });
            expect(await mockStorage.getUnlockedAchievements()).toEqual(['ach1', 'ach2']);
        });
    });
});
