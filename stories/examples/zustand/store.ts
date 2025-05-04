import { create } from 'zustand';
import { AchievementDetails } from '../../../src';

/**
 * Example Zustand implementation for managing achievements state
 */

interface AchievementsState {
  unlockedAchievements: AchievementDetails[];
  progress: Record<string, number>;
  unlockAchievement: (achievement: AchievementDetails) => void;
  updateProgress: (achievementId: string, value: number) => void;
  reset: () => void;
}

export const useAchievementsStore = create<AchievementsState>((set, get) => ({
  unlockedAchievements: [],
  progress: {},
  unlockAchievement: (achievement) =>
    set((state) => {
      // Check if achievement is already unlocked
      const isUnlocked = state.unlockedAchievements.some(
        (a) => a.achievementId === achievement.achievementId
      );

      if (isUnlocked) {
        return state;
      }

      return {
        ...state,
        unlockedAchievements: [...state.unlockedAchievements, achievement],
      };
    }),
  updateProgress: (achievementId, value) =>
    set((state) => ({
      progress: {
        ...state.progress,
        [achievementId]: value,
      },
    })),
  reset: () =>
    set({
      unlockedAchievements: [],
      progress: {},
    }),
})); 