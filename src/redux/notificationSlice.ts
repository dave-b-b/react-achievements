import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface NotificationState {
    notifications: string[];
}

const initialState: NotificationState = {
    notifications: [],
};

export const notificationSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        addNotification: (state, action: PayloadAction<string>) => {
            state.notifications.push(action.payload);
        },
        clearNotifications: (state) => {
            state.notifications = [];
        },
    },
});

export const { addNotification, clearNotifications } = notificationSlice.actions;

export default notificationSlice.reducer;