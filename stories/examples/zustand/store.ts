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

export const useAchievementsStore = create<AchievementsState>((set, _get) => ({
  unlockedAchievements: [],
  progress: {},
  unlockAchievement: (achievement) =>
    set((_state) => {
      // Check if achievement is already unlocked
      const isUnlocked = _state.unlockedAchievements.some(
        (a) => a.achievementId === achievement.achievementId
      );

      if (isUnlocked) {
        return _state;
      }

      return {
        ..._state,
        unlockedAchievements: [..._state.unlockedAchievements, achievement],
      };
    }),
  updateProgress: (achievementId, value) =>
    set((_state) => ({
      progress: {
        ..._state.progress,
        [achievementId]: value,
      },
    })),
  reset: () =>
    set({
      unlockedAchievements: [],
      progress: {},
    }),
})); 