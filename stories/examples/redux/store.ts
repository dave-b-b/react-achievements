import { configureStore } from '@reduxjs/toolkit';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AchievementDetails } from '../../../src';

/**
 * Example Redux implementation for managing achievements state
 * This shows how to integrate the achievements system with Redux
 */

// Define the achievements state type
interface AchievementsState {
  unlockedAchievements: AchievementDetails[];
  progress: Record<string, number>;
}

// Initial state
const initialState: AchievementsState = {
  unlockedAchievements: [],
  progress: {},
};

// Create the achievements slice
const achievementsSlice = createSlice({
  name: 'achievements',
  initialState,
  reducers: {
    unlockAchievement: (state, action: PayloadAction<AchievementDetails>) => {
      const exists = state.unlockedAchievements.some(
        (a) => a.achievementId === action.payload.achievementId
      );
      if (!exists) {
        state.unlockedAchievements.push(action.payload);
      }
    },
    updateProgress: (state, action: PayloadAction<{ id: string; progress: number }>) => {
      state.progress[action.payload.id] = action.payload.progress;
    },
    resetAchievements: (state) => {
      state.unlockedAchievements = [];
      state.progress = {};
    },
  },
});

// Export actions
export const { unlockAchievement, updateProgress, resetAchievements } = achievementsSlice.actions;

// Create and export the store
export const store = configureStore({
  reducer: {
    achievements: achievementsSlice.reducer,
  },
});

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 