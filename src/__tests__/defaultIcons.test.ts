import { defaultAchievementIcons } from '../index';

describe('defaultAchievementIcons', () => {
  it('should export an object with icon keys', () => {
    expect(defaultAchievementIcons).toBeDefined();
    expect(typeof defaultAchievementIcons).toBe('object');
    expect(Object.keys(defaultAchievementIcons).length).toBeGreaterThan(0);
  });

  it('should contain required fallback icons', () => {
    expect(defaultAchievementIcons.default).toBeDefined();
    expect(defaultAchievementIcons.loading).toBeDefined();
    expect(defaultAchievementIcons.error).toBeDefined();
    expect(defaultAchievementIcons.success).toBeDefined();
    expect(defaultAchievementIcons.trophy).toBeDefined();
    expect(defaultAchievementIcons.star).toBeDefined();
  });

  it('should have string values for all icons', () => {
    Object.values(defaultAchievementIcons).forEach(icon => {
      expect(typeof icon).toBe('string');
      expect(icon.length).toBeGreaterThan(0);
    });
  });
}); 