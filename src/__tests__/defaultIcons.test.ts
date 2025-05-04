import { defaultAchievementIcons } from '../index';

describe('defaultAchievementIcons', () => {
  it('should export an object with icon keys', () => {
    expect(defaultAchievementIcons).toBeDefined();
    expect(typeof defaultAchievementIcons).toBe('object');
    expect(Object.keys(defaultAchievementIcons).length).toBeGreaterThan(0);
  });

  it('should contain required fallback icons', () => {
    expect(defaultAchievementIcons.default).toBeDefined();
    expect(defaultAchievementIcons.trophy).toBeDefined();
    expect(defaultAchievementIcons.star).toBeDefined();
  });

  it('should contain icons for different categories', () => {
    // Progress & Milestones
    expect(defaultAchievementIcons.levelUp).toBeDefined();
    expect(defaultAchievementIcons.questComplete).toBeDefined();
    
    // Social & Engagement
    expect(defaultAchievementIcons.shared).toBeDefined();
    expect(defaultAchievementIcons.liked).toBeDefined();
    
    // Time & Activity
    expect(defaultAchievementIcons.streak).toBeDefined();
    expect(defaultAchievementIcons.activeDay).toBeDefined();
    
    // Achievement Types
    expect(defaultAchievementIcons.bronze).toBeDefined();
    expect(defaultAchievementIcons.silver).toBeDefined();
    expect(defaultAchievementIcons.gold).toBeDefined();
  });

  it('should have string values for all icons', () => {
    Object.values(defaultAchievementIcons).forEach(icon => {
      expect(typeof icon).toBe('string');
      expect(icon.length).toBeGreaterThan(0);
    });
  });
}); 