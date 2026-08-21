import { useAchievements } from './useAchievements';
import { useAchievementState } from './useAchievementState';

/**
 * A simplified hook for achievement tracking.
 * Provides the local-first happy path for tracking, progress, and explicit state names.
 */
export const useSimpleAchievements = () => {
  const {
    update,
    increment: incrementMetric,
    event,
    refresh,
    reset,
    getState,
    exportData,
    importData,
    isLoading,
    error,
  } = useAchievements();
  const achievementState = useAchievementState();

  const track = (metric: string, value: any) => update({ [metric]: value });

  const increment = (metric: string, amount: number = 1) => {
    return incrementMetric(metric, amount);
  };

  const trackMultiple = (metrics: Record<string, any>) => update(metrics);
  const lockedAchievements = achievementState.allAchievements.filter(
    (achievement) => !achievement.isUnlocked
  );
  const nextAchievement = [...lockedAchievements]
    .filter((achievement) => achievement.progress)
    .sort((left, right) =>
      (right.progress?.percent || 0) - (left.progress?.percent || 0)
    )[0] || lockedAchievements[0];
  const completionPercent = achievementState.totalCount === 0
    ? 0
    : (achievementState.unlockedCount / achievementState.totalCount) * 100;

  return {
    track,
    increment,
    trackMultiple,
    unlockedIds: achievementState.unlockedIds,
    unlockedAchievements: achievementState.unlockedAchievements,
    allAchievements: achievementState.allAchievements,
    lockedAchievements,
    nextAchievement,
    unlockedCount: achievementState.unlockedCount,
    totalCount: achievementState.totalCount,
    completionPercent,
    metrics: achievementState.metrics,
    isLoading,
    error,
    event,
    emit: event,
    refresh,
    reset,
    getState,
    exportData,
    importData,
    getAllAchievements: () => achievementState.allAchievements,
    /**
     * @deprecated Use `unlockedIds` instead. This alias will be removed in the next major release.
     */
    unlocked: achievementState.unlockedIds,
    /**
     * @deprecated Use `allAchievements` instead. This alias will be removed in the next major release.
     */
    all: achievementState.allAchievements,
  };
};
