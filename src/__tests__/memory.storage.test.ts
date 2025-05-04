import { MemoryStorage } from '../core/storage/MemoryStorage';

describe('MemoryStorage', () => {
  let storage: MemoryStorage;

  beforeEach(() => {
    storage = new MemoryStorage();
  });

  it('should initialize with empty metrics and achievements', () => {
    expect(storage.getMetrics()).toEqual({});
    expect(storage.getUnlockedAchievements()).toEqual([]);
  });

  it('should store and retrieve metrics', () => {
    const metrics = {
      score: [100],
      level: [5]
    };
    
    storage.setMetrics(metrics);
    expect(storage.getMetrics()).toEqual(metrics);
  });

  it('should store and retrieve unlocked achievements', () => {
    const achievements = ['achievement1', 'achievement2'];
    
    storage.setUnlockedAchievements(achievements);
    expect(storage.getUnlockedAchievements()).toEqual(achievements);
  });

  it('should clear all stored data', () => {
    storage.setMetrics({ score: [100] });
    storage.setUnlockedAchievements(['achievement1']);
    
    storage.clear();
    
    expect(storage.getMetrics()).toEqual({});
    expect(storage.getUnlockedAchievements()).toEqual([]);
  });

  it('should maintain separate instances', () => {
    const storage1 = new MemoryStorage();
    const storage2 = new MemoryStorage();
    
    storage1.setMetrics({ score: [100] });
    storage1.setUnlockedAchievements(['achievement1']);
    
    expect(storage2.getMetrics()).toEqual({});
    expect(storage2.getUnlockedAchievements()).toEqual([]);
  });
}); 