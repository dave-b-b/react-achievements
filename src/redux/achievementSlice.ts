import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
    AchievementConfiguration,
    InitialAchievementMetrics,
    AchievementMetrics,
} from '../types';

export interface AchievementState {
    config: AchievementConfiguration;
    metrics: AchievementMetrics;
    unlockedAchievements: string[];
    storageKey: string | null;
}

const initialState: AchievementState = {
    config: {},
    metrics: {},
    unlockedAchievements: [],
    storageKey: null,
};

export const achievementSlice = createSlice({
    name: 'achievements',
    initialState,
    reducers: {
        initialize: (state, action: PayloadAction<{ config: AchievementConfiguration; initialState?: InitialAchievementMetrics; storageKey: string }>) => {
            state.config = action.payload.config;
            state.storageKey = action.payload.storageKey;
            const storedState = action.payload.storageKey ? localStorage.getItem(action.payload.storageKey) : null;
            if (storedState) {
                try {
                    const parsedState = JSON.parse(storedState);
                    state.metrics = parsedState.achievements?.metrics || {};
                    state.unlockedAchievements = parsedState.achievements?.unlockedAchievements || [];
                } catch (error) {
                    console.error('Error parsing stored achievement state:', error);
                    state.metrics = action.payload.initialState ? Object.keys(action.payload.initialState).reduce((acc, key) => ({ ...acc, [key]: Array.isArray(action.payload.initialState![key]) ? action.payload.initialState![key] : [action.payload.initialState![key]] }), {}) : {};
                    state.unlockedAchievements = [];
                }
            } else {
                state.metrics = action.payload.initialState ? Object.keys(action.payload.initialState).reduce((acc, key) => ({ ...acc, [key]: Array.isArray(action.payload.initialState![key]) ? action.payload.initialState![key] : [action.payload.initialState![key]] }), {}) : {};
                state.unlockedAchievements = [];
            }
        },
        setMetrics: (state, action: PayloadAction<AchievementMetrics>) => {
            state.metrics = action.payload;
            if (state.storageKey) {
                localStorage.setItem(state.storageKey, JSON.stringify({ achievements: { metrics: state.metrics, unlockedAchievements: state.unlockedAchievements } }));
            }
        },
        unlockAchievement: (state, action: PayloadAction<string>) => {
            if (!state.unlockedAchievements.includes(action.payload)) {
                state.unlockedAchievements.push(action.payload);
                if (state.storageKey) {
                    localStorage.setItem(state.storageKey, JSON.stringify({ achievements: { metrics: state.metrics, unlockedAchievements: state.unlockedAchievements } }));
                }
            }
        },
        resetAchievements: (state) => {
            state.metrics = {};
            state.unlockedAchievements = [];
            if (state.storageKey) {
                localStorage.removeItem(state.storageKey);
            }
        },
    },
});

export const { initialize, setMetrics, unlockAchievement, resetAchievements } = achievementSlice.actions;

export default achievementSlice.reducer;