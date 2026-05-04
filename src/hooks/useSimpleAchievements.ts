import { useAchievements } from './useAchievements';
import { useAchievementState } from './useAchievementState';

/**
 * A simplified hook for achievement tracking.
 * Provides the v4 happy path for direct metric updates plus explicit state names.
 */
export const useSimpleAchievements = () => {
  const { update, reset, getState, exportData, importData } = useAchievements();
  const achievementState = useAchievementState();

  const track = (metric: string, value: any) => update({ [metric]: value });

  const increment = (metric: string, amount: number = 1) => {
    const currentState = getState();
    const currentMetricArray = currentState.metrics[metric] || [0];
    const currentValue = Array.isArray(currentMetricArray)
      ? currentMetricArray[0]
      : currentMetricArray;
    const newValue = (typeof currentValue === 'number' ? currentValue : 0) + amount;
    update({ [metric]: newValue });
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
     * @deprecated Use `unlockedIds` instead. This alias will be removed in 4.2.
     */
    unlocked: achievementState.unlockedIds,
    /**
     * @deprecated Use `allAchievements` instead. This alias will be removed in 4.2.
     */
    all: achievementState.allAchievements,
  };
};
