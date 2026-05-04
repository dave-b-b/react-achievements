import * as root from '../index';
import * as web from '../web';
import * as headless from '../headless';

describe('package entry points', () => {
  it('exposes the web API from the root entry point', () => {
    expect(root.AchievementProvider).toBeDefined();
    expect(root.AchievementsWidget).toBeDefined();
    expect(root.AchievementsModal).toBeDefined();
    expect(root.AchievementsList).toBeDefined();
    expect(root.useSimpleAchievements).toBeDefined();
    expect(root.useAchievementState).toBeDefined();
    expect(root.AchievementEngine).toBeDefined();
    expect(root.StorageType).toBeDefined();
  });

  it('keeps the explicit web entry point aligned with the root API', () => {
    expect(web.AchievementProvider).toBe(root.AchievementProvider);
    expect(web.AchievementsWidget).toBe(root.AchievementsWidget);
    expect(web.AchievementsModal).toBe(root.AchievementsModal);
    expect(web.AchievementsList).toBe(root.AchievementsList);
  });

  it('keeps the headless entry point free of built-in web UI components', () => {
    const headlessExports = headless as unknown as Record<string, unknown>;

    expect(headless.AchievementProvider).toBe(root.HeadlessAchievementProvider);
    expect(headless.useSimpleAchievements).toBe(root.useSimpleAchievements);
    expect(headless.useAchievementState).toBe(root.useAchievementState);
    expect(headless.AchievementEngine).toBe(root.AchievementEngine);
    expect(headless.StorageType).toBe(root.StorageType);
    expect(headlessExports.AchievementsWidget).toBeUndefined();
    expect(headlessExports.AchievementsModal).toBeUndefined();
    expect(headlessExports.AchievementsList).toBeUndefined();
    expect(headlessExports.BuiltInNotification).toBeUndefined();
    expect(headlessExports.BuiltInConfetti).toBeUndefined();
  });
});
