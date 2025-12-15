import { AsyncAchievementStorage, AchievementMetrics } from '../types';
import { StorageError } from '../errors/AchievementErrors';

export class IndexedDBStorage implements AsyncAchievementStorage {
    private dbName: string;
    private storeName: string = 'achievements';
    private db: IDBDatabase | null = null;
    private initPromise: Promise<void>;

    constructor(dbName: string = 'react-achievements') {
        this.dbName = dbName;
        this.initPromise = this.initDB();
    }

    /**
     * Initialize IndexedDB database and object store
     */
    private async initDB(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);

            request.onerror = () => {
                reject(new StorageError('Failed to open IndexedDB'));
            };

            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;

                // Create object store if it doesn't exist
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName);
                }
            };
        });
    }

    /**
     * Generic get operation from IndexedDB
     */
    private async get<T>(key: string): Promise<T | null> {
        await this.initPromise;
        if (!this.db) throw new StorageError('Database not initialized');

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.get(key);

            request.onsuccess = () => {
                resolve(request.result || null);
            };

            request.onerror = () => {
                reject(new StorageError(`Failed to read from IndexedDB: ${key}`));
            };
        });
    }

    /**
     * Generic set operation to IndexedDB
     */
    private async set(key: string, value: any): Promise<void> {
        await this.initPromise;
        if (!this.db) throw new StorageError('Database not initialized');

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.put(value, key);

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = () => {
                reject(new StorageError(`Failed to write to IndexedDB: ${key}`));
            };
        });
    }

    /**
     * Delete operation from IndexedDB
     */
    private async delete(key: string): Promise<void> {
        await this.initPromise;
        if (!this.db) throw new StorageError('Database not initialized');

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(key);

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = () => {
                reject(new StorageError(`Failed to delete from IndexedDB: ${key}`));
            };
        });
    }

    async getMetrics(): Promise<AchievementMetrics> {
        const metrics = await this.get<AchievementMetrics>('metrics');
        return metrics || {};
    }

    async setMetrics(metrics: AchievementMetrics): Promise<void> {
        await this.set('metrics', metrics);
    }

    async getUnlockedAchievements(): Promise<string[]> {
        const unlocked = await this.get<string[]>('unlocked');
        return unlocked || [];
    }

    async setUnlockedAchievements(achievements: string[]): Promise<void> {
        await this.set('unlocked', achievements);
    }

    async clear(): Promise<void> {
        await Promise.all([
            this.delete('metrics'),
            this.delete('unlocked')
        ]);
    }
}
