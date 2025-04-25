import { configureStore } from '@reduxjs/toolkit';
import achievementReducer from './achievementSlice';
import { AchievementState } from './achievementSlice';

export interface RootState {
    achievements: AchievementState;
}

const store = configureStore({
    reducer: {
        achievements: achievementReducer,
    },
});

export type AppDispatch = typeof store.dispatch;
export default store;