import { LocalStorage, AchievementMetrics } from '../index';

describe('LocalStorage', () => {
  let storage: LocalStorage;
  let mockLocalStorage: { [key: string]: any };
  let originalLocalStorage: Storage;

  beforeEach(() => {
    // Store original localStorage
    originalLocalStorage = window.localStorage;
    
    // Create a fresh mock localStorage before each test
    mockLocalStorage = {};
    const mockStorage = {
      getItem: jest.fn((key: string) => mockLocalStorage[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        mockLocalStorage[key] = value;
      }),
      removeItem: jest.fn((key: string) => {
        delete mockLocalStorage[key];
      }),
      clear: jest.fn(),
      length: 0,
      key: jest.fn(),
    };
    
    Object.defineProperty(window, 'localStorage', {
      value: mockStorage,
      writable: true
    });
    
    storage = new LocalStorage('test-achievements');
  });

  afterEach(() => {
    jest.clearAllMocks();
    // Restore original localStorage
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      writable: true
    });
  });

  describe('Initialization', () => {
    it('should initialize with empty state when storage is empty', () => {
      expect(storage.getMetrics()).toEqual({});
      expect(storage.getUnlockedAchievements()).toEqual([]);
      expect(localStorage.getItem).toHaveBeenCalledWith('test-achievements');
    });

    it('should initialize with empty state when storage contains invalid JSON', () => {
      localStorage.getItem = jest.fn().mockReturnValue('invalid-json');
      expect(storage.getMetrics()).toEqual({});
      expect(storage.getUnlockedAchievements()).toEqual([]);
    });
  });

  describe('Metrics Management', () => {
    it('should store and retrieve metrics correctly', () => {
      const testMetrics: AchievementMetrics = {
        clicks: [1, 2, 3],
        score: [100]
      };

      storage.setMetrics(testMetrics);
      expect(storage.getMetrics()).toEqual(testMetrics);
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('should handle Date objects in metrics', () => {
      const now = new Date();
      const testMetrics: AchievementMetrics = {
        lastLogin: [now]
      };

      storage.setMetrics(testMetrics);
      const retrieved = storage.getMetrics();
      
      expect(retrieved.lastLogin[0]).toBeInstanceOf(Date);
      expect((retrieved.lastLogin[0] as Date).getTime()).toBe(now.getTime());
    });

    it('should merge new metrics with existing storage data', () => {
      const initialMetrics: AchievementMetrics = {
        clicks: [1, 2, 3]
      };
      
      const newMetrics: AchievementMetrics = {
        score: [100]
      };

      storage.setMetrics(initialMetrics);
      storage.setMetrics(newMetrics);

      expect(storage.getMetrics()).toEqual(newMetrics);
    });
  });

  describe('Unlocked Achievements Management', () => {
    it('should store and retrieve unlocked achievements correctly', () => {
      const achievements = ['achievement1', 'achievement2'];
      
      storage.setUnlockedAchievements(achievements);
      expect(storage.getUnlockedAchievements()).toEqual(achievements);
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('should maintain unlocked achievements order', () => {
      const achievements = ['achievement3', 'achievement1', 'achievement2'];
      
      storage.setUnlockedAchievements(achievements);
      expect(storage.getUnlockedAchievements()).toEqual(achievements);
    });

    it('should handle empty unlocked achievements array', () => {
      storage.setUnlockedAchievements([]);
      expect(storage.getUnlockedAchievements()).toEqual([]);
    });
  });

  describe('Storage Operations', () => {
    it('should clear storage correctly', () => {
      const testMetrics: AchievementMetrics = {
        clicks: [1, 2, 3]
      };
      const achievements = ['achievement1'];

      storage.setMetrics(testMetrics);
      storage.setUnlockedAchievements(achievements);
      storage.clear();

      expect(storage.getMetrics()).toEqual({});
      expect(storage.getUnlockedAchievements()).toEqual([]);
      expect(localStorage.removeItem).toHaveBeenCalledWith('test-achievements');
    });

    it('should handle storage quota exceeded errors', () => {
      // Mock localStorage.setItem to throw quota exceeded error
      const mockSetItem = jest.fn().mockImplementation(() => {
        const error = new Error('QuotaExceededError');
        error.name = 'QuotaExceededError';
        throw error;
      });
      
      Object.defineProperty(window.localStorage, 'setItem', {
        value: mockSetItem,
        writable: true
      });

      const testMetrics: AchievementMetrics = {
        clicks: Array(1000000).fill(1) // Large array to trigger quota error
      };

      // The operation should fail silently
      storage.setMetrics(testMetrics);

      // Should have attempted to save
      expect(mockSetItem).toHaveBeenCalled();

      // Storage should remain unchanged
      expect(storage.getMetrics()).toEqual({});
    });

    it('should handle concurrent storage operations', async () => {
      const achievements1 = ['achievement1', 'achievement2'];
      const achievements2 = ['achievement3', 'achievement4'];

      // Simulate concurrent operations
      await Promise.all([
        storage.setUnlockedAchievements(achievements1),
        storage.setUnlockedAchievements(achievements2)
      ]);

      // The last write should win
      expect(storage.getUnlockedAchievements()).toEqual(achievements2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle malformed date values in storage', () => {
      // Setup storage with malformed date
      localStorage.getItem = jest.fn().mockReturnValue(JSON.stringify({
        metrics: {
          lastLogin: [{ __type: 'Date', value: 'invalid-date' }]
        },
        unlockedAchievements: []
      }));

      const metrics = storage.getMetrics();
      expect(metrics.lastLogin[0]).toBeInstanceOf(Date);
      expect((metrics.lastLogin[0] as Date).toString()).toBe('Invalid Date');
    });

    it('should handle undefined or null values in metrics', () => {
      const testMetrics: any = {
        nullValue: [null],
        undefinedValue: [undefined],
        validValue: [1]
      };

      storage.setMetrics(testMetrics);
      const retrieved = storage.getMetrics();
      
      expect(retrieved.nullValue).toEqual([null]);
      // Since JSON.stringify converts undefined to null, we expect null in storage
      expect(retrieved.undefinedValue).toEqual([null]);
      expect(retrieved.validValue).toEqual([1]);
    });

    it('should handle special characters in achievement IDs', () => {
      const achievements = ['achievement/1', 'achievement.2', 'achievement-3'];
      
      storage.setUnlockedAchievements(achievements);
      expect(storage.getUnlockedAchievements()).toEqual(achievements);
    });
  });
}); 