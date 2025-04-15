import { configureStore } from '@reduxjs/toolkit';
import achievementReducer from '../redux/achievementSlice';
import notificationReducer from '../redux/notificationSlice';
import { AchievementState } from './achievementSlice';
import { NotificationState } from './notificationSlice';

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