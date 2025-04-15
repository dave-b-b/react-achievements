import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AchievementDetails } from '../types';

export interface NotificationState {
    notifications: AchievementDetails[];
}

const initialState: NotificationState = {
    notifications: [],
};

const notificationSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        addNotification: (state, action: PayloadAction<AchievementDetails>) => {
            state.notifications.push(action.payload);
        },
        clearNotifications: (state) => {
            state.notifications = [];
        },
    },
});

export const { addNotification, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;