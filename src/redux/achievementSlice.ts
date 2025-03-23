import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {AchievementConfig, Metrics, AchievementData, MetricValue, AppAchievementState} from '../types';

export interface AchievementState {
    metrics: Metrics;
    unlockedAchievements: string[];
    config: AchievementConfig;
    initialState: AppAchievementState;
    storageKey: string;
}

const initialState: AchievementState = {
    metrics: {},
    unlockedAchievements: [],
    config: {},
    initialState: {},
    storageKey: 'react-achievements',
};

const achievementSlice = createSlice({
    name: 'achievements',
    initialState,
    reducers: {
        initialize: (state, action: PayloadAction<{ config: AchievementConfig; initialState: AppAchievementState; storageKey: string }>) => {
            state.config = action.payload.config;
            state.initialState = action.payload.initialState;
            state.storageKey = action.payload.storageKey;
            const savedMetrics = localStorage.getItem(`${state.storageKey}-metrics`);
            state.metrics = savedMetrics ? JSON.parse(savedMetrics) : action.payload.initialState;
            const savedAchievements = localStorage.getItem(`${state.storageKey}-unlocked-achievements`);
            state.unlockedAchievements = savedAchievements ? JSON.parse(savedAchievements) : [];
        },
        setMetrics: (state, action: PayloadAction<Metrics>) => {
            state.metrics = action.payload;
            localStorage.setItem(`${state.storageKey}-metrics`, JSON.stringify(action.payload));
        },
        unlockAchievement: (state, action: PayloadAction<string>) => {
            if (!state.unlockedAchievements.includes(action.payload)) {
                state.unlockedAchievements.push(action.payload);
                localStorage.setItem(`${state.storageKey}-unlocked-achievements`, JSON.stringify(state.unlockedAchievements));
            }
        },
    },
});

export const { initialize, setMetrics, unlockAchievement } = achievementSlice.actions;
export default achievementSlice.reducer;