import { useAchievements } from './useAchievements';

export const useAchievementState = () => {
  const { achievements, getAllAchievements, getState } = useAchievements();
  const allAchievements = getAllAchievements();
  const unlockedIds = achievements.unlocked;
  const unlockedAchievementSet = new Set(unlockedIds);
  const unlockedAchievements = allAchievements.filter((achievement) =>
    unlockedAchievementSet.has(achievement.achievementId)
  );

  return {
    unlockedIds,
    unlockedAchievements,
    allAchievements,
    unlockedCount: unlockedIds.length,
    totalCount: allAchievements.length,
    metrics: getState().metrics,
  };
};
