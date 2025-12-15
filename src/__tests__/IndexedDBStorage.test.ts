import { IndexedDBStorage } from '../core/storage/IndexedDBStorage';
import { IDBFactory } from 'fake-indexeddb';

describe('IndexedDBStorage', () => {
    beforeEach(() => {
        // Reset IndexedDB to a fresh state between tests (recommended by fakeIndexedDB docs)
        // This is much faster than deleting databases
        (global as any).indexedDB = new IDBFactory();
    });

    describe('Initialization', () => {
        it('should initialize with default database name', async () => {
            const storage = new IndexedDBStorage();
            await storage.setMetrics({ score: [100] });
            const metrics = await storage.getMetrics();

            expect(metrics).toEqual({ score: [100] });
        });

        it('should initialize with custom database name', async () => {
            const storage = new IndexedDBStorage('custom-db-name');
            await storage.setMetrics({ score: [200] });
            const metrics = await storage.getMetrics();

            expect(metrics).toEqual({ score: [200] });
        });
    });

    describe('Metrics Operations', () => {
        it('should store and retrieve metrics', async () => {
            const storage = new IndexedDBStorage();

            await storage.setMetrics({ score: [100], level: [5] });
            const metrics = await storage.getMetrics();

            expect(metrics).toEqual({ score: [100], level: [5] });
        });

        it('should overwrite existing metrics', async () => {
            const storage = new IndexedDBStorage();

            await storage.setMetrics({ score: [100] });
            await storage.setMetrics({ score: [200], level: [10] });
            const metrics = await storage.getMetrics();

            expect(metrics).toEqual({ score: [200], level: [10] });
        });

        it('should return empty object when no metrics exist', async () => {
            const storage = new IndexedDBStorage();
            const metrics = await storage.getMetrics();

            expect(metrics).toEqual({});
        });

        it('should handle complex metrics data', async () => {
            const storage = new IndexedDBStorage();
            const complexMetrics = {
                score: [100, 200, 300],
                level: [1, 2, 3, 4, 5],
                combo: [10, 20, 30]
            };

            await storage.setMetrics(complexMetrics);
            const metrics = await storage.getMetrics();

            expect(metrics).toEqual(complexMetrics);
        });
    });

    describe('Unlocked Achievements Operations', () => {
        it('should store and retrieve unlocked achievements', async () => {
            const storage = new IndexedDBStorage();

            await storage.setUnlockedAchievements(['ach1', 'ach2', 'ach3']);
            const unlocked = await storage.getUnlockedAchievements();

            expect(unlocked).toEqual(['ach1', 'ach2', 'ach3']);
        });

        it('should overwrite existing unlocked achievements', async () => {
            const storage = new IndexedDBStorage();

            await storage.setUnlockedAchievements(['ach1']);
            await storage.setUnlockedAchievements(['ach1', 'ach2', 'ach3']);
            const unlocked = await storage.getUnlockedAchievements();

            expect(unlocked).toEqual(['ach1', 'ach2', 'ach3']);
        });

        it('should return empty array when no achievements exist', async () => {
            const storage = new IndexedDBStorage();
            const unlocked = await storage.getUnlockedAchievements();

            expect(unlocked).toEqual([]);
        });

        it('should handle empty achievements array', async () => {
            const storage = new IndexedDBStorage();

            await storage.setUnlockedAchievements(['ach1']);
            await storage.setUnlockedAchievements([]);
            const unlocked = await storage.getUnlockedAchievements();

            expect(unlocked).toEqual([]);
        });
    });

    describe('Clear Operation', () => {
        it('should clear all data', async () => {
            const storage = new IndexedDBStorage();

            await storage.setMetrics({ score: [100], level: [5] });
            await storage.setUnlockedAchievements(['ach1', 'ach2']);

            await storage.clear();

            expect(await storage.getMetrics()).toEqual({});
            expect(await storage.getUnlockedAchievements()).toEqual([]);
        });

        it('should be idempotent', async () => {
            const storage = new IndexedDBStorage();

            await storage.setMetrics({ score: [100] });
            await storage.clear();
            await storage.clear(); // Second clear

            expect(await storage.getMetrics()).toEqual({});
            expect(await storage.getUnlockedAchievements()).toEqual([]);
        });

        it('should allow setting data after clear', async () => {
            const storage = new IndexedDBStorage();

            await storage.setMetrics({ score: [100] });
            await storage.clear();
            await storage.setMetrics({ score: [200] });

            expect(await storage.getMetrics()).toEqual({ score: [200] });
        });
    });

    describe('Concurrent Operations', () => {
        it('should handle concurrent reads and writes', async () => {
            const storage = new IndexedDBStorage();

            // Start multiple operations concurrently
            const operations = [
                storage.setMetrics({ score: [100] }),
                storage.setUnlockedAchievements(['ach1']),
                storage.getMetrics(),
                storage.getUnlockedAchievements()
            ];

            await Promise.all(operations);

            const finalMetrics = await storage.getMetrics();
            const finalUnlocked = await storage.getUnlockedAchievements();

            expect(finalMetrics).toEqual({ score: [100] });
            expect(finalUnlocked).toEqual(['ach1']);
        });

        it('should handle rapid sequential writes', async () => {
            const storage = new IndexedDBStorage();

            for (let i = 0; i < 10; i++) {
                await storage.setMetrics({ score: [i * 100] });
            }

            const metrics = await storage.getMetrics();
            expect(metrics).toEqual({ score: [900] });
        });
    });

    describe('Data Persistence', () => {
        it('should persist data across storage instances', async () => {
            const storage1 = new IndexedDBStorage('persist-test');
            await storage1.setMetrics({ score: [100] });
            await storage1.setUnlockedAchievements(['ach1']);

            // Create new instance with same database name
            const storage2 = new IndexedDBStorage('persist-test');
            const metrics = await storage2.getMetrics();
            const unlocked = await storage2.getUnlockedAchievements();

            expect(metrics).toEqual({ score: [100] });
            expect(unlocked).toEqual(['ach1']);
            // No cleanup needed - beforeEach will reset IDBFactory
        });

        it('should isolate data between different database names', async () => {
            const storage1 = new IndexedDBStorage('db1');
            const storage2 = new IndexedDBStorage('db2');

            await storage1.setMetrics({ score: [100] });
            await storage2.setMetrics({ score: [200] });

            expect(await storage1.getMetrics()).toEqual({ score: [100] });
            expect(await storage2.getMetrics()).toEqual({ score: [200] });
            // No cleanup needed - beforeEach will reset IDBFactory
        });
    });

    describe('Large Data Handling', () => {
        it('should handle large metrics objects', async () => {
            const storage = new IndexedDBStorage();

            // Create large metrics object
            const largeMetrics: any = {};
            for (let i = 0; i < 100; i++) {
                largeMetrics[`metric${i}`] = [i, i * 2, i * 3];
            }

            await storage.setMetrics(largeMetrics);
            const retrieved = await storage.getMetrics();

            expect(retrieved).toEqual(largeMetrics);
        });

        it('should handle large achievement arrays', async () => {
            const storage = new IndexedDBStorage();

            // Create large achievement array
            const largeArray = Array.from({ length: 1000 }, (_, i) => `achievement_${i}`);

            await storage.setUnlockedAchievements(largeArray);
            const retrieved = await storage.getUnlockedAchievements();

            expect(retrieved).toEqual(largeArray);
            expect(retrieved.length).toBe(1000);
        });
    });
});
