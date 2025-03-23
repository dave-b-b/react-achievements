import { configureStore } from '@reduxjs/toolkit';
import achievementReducer, { AchievementState } from '../redux/achievementSlice';
import notificationReducer, { NotificationState } from '../redux/notificationSlice';

export interface RootState {
    achievements: AchievementState;
    notifications: NotificationState;
}

const store = configureStore({
    reducer: {
        achievements: achievementReducer,
        notifications: notificationReducer,
    },
});

export type AppDispatch = typeof store.dispatch;
export default store;