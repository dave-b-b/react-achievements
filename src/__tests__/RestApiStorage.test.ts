import { RestApiStorage } from '../core/storage/RestApiStorage';
import { SyncError, StorageError } from '../core/errors/AchievementErrors';

// Mock fetch
global.fetch = jest.fn();

describe('RestApiStorage', () => {
    const config = {
        baseUrl: 'https://api.test.com',
        userId: 'user123'
    };

    beforeEach(() => {
        (fetch as jest.Mock).mockClear();
    });

    describe('Initialization', () => {
        it('should initialize with required config', () => {
            const storage = new RestApiStorage(config);
            expect(storage).toBeInstanceOf(RestApiStorage);
        });

        it('should use default timeout if not provided', async () => {
            (fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ metrics: {} })
            });

            const storage = new RestApiStorage(config);
            await storage.getMetrics();

            expect(fetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    signal: expect.any(AbortSignal)
                })
            );
        });

        it('should use custom timeout if provided', async () => {
            (fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ metrics: {} })
            });

            const storage = new RestApiStorage({ ...config, timeout: 5000 });
            await storage.getMetrics();

            expect(fetch).toHaveBeenCalled();
        });
    });

    describe('getMetrics', () => {
        it('should fetch metrics from API', async () => {
            (fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ metrics: { score: [100], level: [5] } })
            });

            const storage = new RestApiStorage(config);
            const metrics = await storage.getMetrics();

            expect(metrics).toEqual({ score: [100], level: [5] });
            expect(fetch).toHaveBeenCalledWith(
                'https://api.test.com/users/user123/achievements/metrics',
                expect.objectContaining({ method: 'GET' })
            );
        });

        it('should return empty object when API returns no metrics', async () => {
            (fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({})
            });

            const storage = new RestApiStorage(config);
            const metrics = await storage.getMetrics();

            expect(metrics).toEqual({});
        });

        it('should include custom headers in request', async () => {
            (fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ metrics: {} })
            });

            const storage = new RestApiStorage({
                ...config,
                headers: { 'Authorization': 'Bearer token123' }
            });
            await storage.getMetrics();

            expect(fetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'Authorization': 'Bearer token123',
                        'Content-Type': 'application/json'
                    })
                })
            );
        });
    });

    describe('setMetrics', () => {
        it('should save metrics to API', async () => {
            (fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

            const storage = new RestApiStorage(config);
            await storage.setMetrics({ score: [200], level: [10] });

            expect(fetch).toHaveBeenCalledWith(
                'https://api.test.com/users/user123/achievements/metrics',
                expect.objectContaining({
                    method: 'PUT',
                    body: JSON.stringify({ metrics: { score: [200], level: [10] } }),
                    headers: expect.objectContaining({
                        'Content-Type': 'application/json'
                    })
                })
            );
        });

        it('should handle empty metrics object', async () => {
            (fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

            const storage = new RestApiStorage(config);
            await storage.setMetrics({});

            expect(fetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    body: JSON.stringify({ metrics: {} })
                })
            );
        });
    });

    describe('getUnlockedAchievements', () => {
        it('should fetch unlocked achievements from API', async () => {
            (fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ unlocked: ['ach1', 'ach2', 'ach3'] })
            });

            const storage = new RestApiStorage(config);
            const unlocked = await storage.getUnlockedAchievements();

            expect(unlocked).toEqual(['ach1', 'ach2', 'ach3']);
            expect(fetch).toHaveBeenCalledWith(
                'https://api.test.com/users/user123/achievements/unlocked',
                expect.objectContaining({ method: 'GET' })
            );
        });

        it('should return empty array when API returns no achievements', async () => {
            (fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({})
            });

            const storage = new RestApiStorage(config);
            const unlocked = await storage.getUnlockedAchievements();

            expect(unlocked).toEqual([]);
        });
    });

    describe('setUnlockedAchievements', () => {
        it('should save unlocked achievements to API', async () => {
            (fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

            const storage = new RestApiStorage(config);
            await storage.setUnlockedAchievements(['ach1', 'ach2']);

            expect(fetch).toHaveBeenCalledWith(
                'https://api.test.com/users/user123/achievements/unlocked',
                expect.objectContaining({
                    method: 'PUT',
                    body: JSON.stringify({ unlocked: ['ach1', 'ach2'] })
                })
            );
        });

        it('should handle empty achievements array', async () => {
            (fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

            const storage = new RestApiStorage(config);
            await storage.setUnlockedAchievements([]);

            expect(fetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    body: JSON.stringify({ unlocked: [] })
                })
            );
        });
    });

    describe('clear', () => {
        it('should clear achievements via API', async () => {
            (fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

            const storage = new RestApiStorage(config);
            await storage.clear();

            expect(fetch).toHaveBeenCalledWith(
                'https://api.test.com/users/user123/achievements',
                expect.objectContaining({ method: 'DELETE' })
            );
        });
    });

    describe('Error Handling', () => {
        it('should throw SyncError on HTTP error', async () => {
            (fetch as jest.Mock).mockResolvedValue({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error'
            });

            const storage = new RestApiStorage(config);

            await expect(storage.getMetrics()).rejects.toThrow(SyncError);
            await expect(storage.getMetrics()).rejects.toThrow('HTTP 500: Internal Server Error');
        });

        it('should include status code in SyncError', async () => {
            (fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                status: 404,
                statusText: 'Not Found'
            });

            const storage = new RestApiStorage(config);

            try {
                await storage.getMetrics();
                fail('Should have thrown error');
            } catch (error) {
                expect(error).toBeInstanceOf(SyncError);
                expect((error as SyncError).statusCode).toBe(404);
            }
        });

        it('should throw SyncError on timeout', async () => {
            (fetch as jest.Mock).mockImplementation(() =>
                new Promise((resolve, reject) => {
                    const error = new Error('The operation was aborted');
                    error.name = 'AbortError';
                    setTimeout(() => reject(error), 100);
                })
            );

            const storage = new RestApiStorage({ ...config, timeout: 50 });

            await expect(storage.getMetrics()).rejects.toThrow(SyncError);
            await expect(storage.getMetrics()).rejects.toThrow('Request timeout');
        });

        it('should throw StorageError on network failure', async () => {
            (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

            const storage = new RestApiStorage(config);

            await expect(storage.getMetrics()).rejects.toThrow(StorageError);
        });

        it('should handle errors in setMetrics', async () => {
            (fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                status: 400,
                statusText: 'Bad Request'
            });

            const storage = new RestApiStorage(config);

            await expect(storage.setMetrics({ score: [100] })).rejects.toThrow(SyncError);
        });

        it('should handle errors in setUnlockedAchievements', async () => {
            (fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                status: 403,
                statusText: 'Forbidden'
            });

            const storage = new RestApiStorage(config);

            await expect(storage.setUnlockedAchievements(['ach1'])).rejects.toThrow(SyncError);
        });

        it('should handle errors in clear', async () => {
            (fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error'
            });

            const storage = new RestApiStorage(config);

            await expect(storage.clear()).rejects.toThrow(SyncError);
        });
    });

    describe('Different HTTP Status Codes', () => {
        it('should handle 401 Unauthorized', async () => {
            (fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                status: 401,
                statusText: 'Unauthorized'
            });

            const storage = new RestApiStorage(config);

            try {
                await storage.getMetrics();
                fail('Should have thrown error');
            } catch (error) {
                expect(error).toBeInstanceOf(SyncError);
                expect((error as SyncError).statusCode).toBe(401);
            }
        });

        it('should handle 503 Service Unavailable', async () => {
            (fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                status: 503,
                statusText: 'Service Unavailable'
            });

            const storage = new RestApiStorage(config);

            try {
                await storage.setMetrics({ score: [100] });
                fail('Should have thrown error');
            } catch (error) {
                expect(error).toBeInstanceOf(SyncError);
                expect((error as SyncError).statusCode).toBe(503);
            }
        });
    });

    describe('Multiple Users', () => {
        it('should isolate data between different users', async () => {
            (fetch as jest.Mock)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ metrics: { score: [100] } })
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ metrics: { score: [200] } })
                });

            const storage1 = new RestApiStorage({ ...config, userId: 'user1' });
            const storage2 = new RestApiStorage({ ...config, userId: 'user2' });

            const metrics1 = await storage1.getMetrics();
            const metrics2 = await storage2.getMetrics();

            expect(fetch).toHaveBeenCalledWith(
                'https://api.test.com/users/user1/achievements/metrics',
                expect.any(Object)
            );
            expect(fetch).toHaveBeenCalledWith(
                'https://api.test.com/users/user2/achievements/metrics',
                expect.any(Object)
            );
        });
    });

    describe('Request Cancellation', () => {
        it('should cancel request on timeout', async () => {
            let abortSignal: AbortSignal | undefined;

            (fetch as jest.Mock).mockImplementationOnce((url, options) => {
                abortSignal = options.signal;
                return new Promise((resolve) => {
                    setTimeout(() => resolve({ ok: true, json: async () => ({}) }), 1000);
                });
            });

            const storage = new RestApiStorage({ ...config, timeout: 50 });

            try {
                await storage.getMetrics();
            } catch (error) {
                // Expected to fail
            }

            // Signal should be aborted
            expect(abortSignal?.aborted).toBe(true);
        });
    });
});
