// src/redux/achievementSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
    InitialAchievementMetrics,
    AchievementMetrics,
    AchievementDetails,
    AchievementMetricValue,
} from '../types';

// Helper function to serialize dates
const serializeValue = (value: AchievementMetricValue): string | number | boolean => {
    if (value instanceof Date) {
        return value.toISOString();
    }
    return value;
};

// Helper function to process metrics for storage
const processMetrics = (metrics: AchievementMetrics): Record<string, (string | number | boolean)[]> => {
    return Object.entries(metrics).reduce((acc, [key, values]) => ({
        ...acc,
        [key]: values.map(serializeValue)
    }), {});
};

export interface AchievementState {
    metrics: Record<string, (string | number | boolean)[]>;
    unlockedAchievements: string[];
    storageKey: string | null;
    pendingNotifications: AchievementDetails[];
}

const initialState: AchievementState = {
    metrics: {},
    unlockedAchievements: [],
    storageKey: null,
    pendingNotifications: [],
};

export const achievementSlice = createSlice({
    name: 'achievements',
    initialState,
    reducers: {
        initialize: (state, action: PayloadAction<{ 
            initialState?: InitialAchievementMetrics & { unlockedAchievements?: string[] }; 
            storageKey: string 
        }>) => {
            state.storageKey = action.payload.storageKey;

            // Load from storage first
            if (action.payload.storageKey) {
                const stored = localStorage.getItem(action.payload.storageKey);
                if (stored) {
                    try {
                        const parsed = JSON.parse(stored);
                        state.metrics = parsed.metrics || {};
                        state.unlockedAchievements = parsed.unlockedAchievements || [];
                        return;
                    } catch (error) {
                        console.error('Error parsing stored achievements:', error);
                    }
                }
            }

            // If no storage or parse error, use initial state
            if (action.payload.initialState) {
                const { unlockedAchievements, ...metrics } = action.payload.initialState;
                state.metrics = Object.entries(metrics).reduce((acc, [key, value]) => ({
                    ...acc,
                    [key]: Array.isArray(value) ? value.map(serializeValue) : [serializeValue(value as AchievementMetricValue)]
                }), {});
                state.unlockedAchievements = unlockedAchievements || [];
            }
        },

        setMetrics: (state, action: PayloadAction<AchievementMetrics>) => {
            state.metrics = processMetrics(action.payload);
            if (state.storageKey) {
                localStorage.setItem(state.storageKey, JSON.stringify({
                    metrics: state.metrics,
                    unlockedAchievements: state.unlockedAchievements
                }));
            }
        },

        unlockAchievement: (state, action: PayloadAction<AchievementDetails>) => {
            if (!state.unlockedAchievements.includes(action.payload.achievementId)) {
                state.unlockedAchievements.push(action.payload.achievementId);
                state.pendingNotifications.push(action.payload);
                if (state.storageKey) {
                    localStorage.setItem(state.storageKey, JSON.stringify({
                        metrics: state.metrics,
                        unlockedAchievements: state.unlockedAchievements
                    }));
                }
            }
        },

        clearNotifications: (state) => {
            state.pendingNotifications = [];
        },

        resetAchievements: (state) => {
            state.metrics = {};
            state.unlockedAchievements = [];
            state.pendingNotifications = [];
            if (state.storageKey) {
                localStorage.removeItem(state.storageKey);
            }
        },
    },
});

export const { initialize, setMetrics, resetAchievements, unlockAchievement, clearNotifications } = achievementSlice.actions;

export default achievementSlice.reducer;