import { useAchievements } from './useAchievements';

export const useAchievementState = () => {
  const { snapshot } = useAchievements();
  return {
    unlockedIds: snapshot.unlockedIds,
    unlockedAchievements: snapshot.unlockedAchievements,
    allAchievements: snapshot.allAchievements,
    unlockedCount: snapshot.unlockedCount,
    totalCount: snapshot.totalCount,
    metrics: snapshot.metrics,
  };
};
