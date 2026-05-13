import { useAchievements } from './useAchievements';
import { useAchievementState } from './useAchievementState';

/**
 * A simplified hook for achievement tracking.
 * Provides the v4 happy path for direct metric updates plus explicit state names.
 */
export const useSimpleAchievements = () => {
  const { update, reset, getState, exportData, importData, engine } = useAchievements();
  const achievementState = useAchievementState();

  const track = (metric: string, value: any) => update({ [metric]: value });

  const increment = (metric: string, amount: number = 1) => {
    return engine.increment(metric, amount);
  };

  const trackMultiple = (metrics: Record<string, any>) => update(metrics);

  return {
    track,
    increment,
    trackMultiple,
    unlockedIds: achievementState.unlockedIds,
    unlockedAchievements: achievementState.unlockedAchievements,
    allAchievements: achievementState.allAchievements,
    unlockedCount: achievementState.unlockedCount,
    totalCount: achievementState.totalCount,
    metrics: achievementState.metrics,
    reset,
    getState,
    exportData,
    importData,
    getAllAchievements: () => achievementState.allAchievements,
    /**
     * @deprecated Use `unlockedIds` instead. This alias will be removed in 5.0.
     */
    unlocked: achievementState.unlockedIds,
    /**
     * @deprecated Use `allAchievements` instead. This alias will be removed in 5.0.
     */
    all: achievementState.allAchievements,
  };
};
