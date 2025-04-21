// src/redux/achievementSlice.ts
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
    previouslyAwardedAchievements: string[];
    storageKey: string | null;
}

const initialState: AchievementState = {
    config: {},
    metrics: {},
    unlockedAchievements: [],
    previouslyAwardedAchievements: [], // Initialize as empty
    storageKey: null,
};

export const achievementSlice = createSlice({
    name: 'achievements',
    initialState,
    reducers: {
        initialize: (state, action: PayloadAction<{ config: AchievementConfiguration; initialState?: InitialAchievementMetrics & { previouslyAwardedAchievements?: string[] }; storageKey: string }>) => {
            state.config = action.payload.config;
            state.storageKey = action.payload.storageKey;
            const storedState = action.payload.storageKey ? localStorage.getItem(action.payload.storageKey) : null;

            const initialMetrics = action.payload.initialState ? Object.keys(action.payload.initialState)
                .filter(key => key !== 'previouslyAwardedAchievements')
                .reduce((acc, key) => ({ ...acc, [key]: Array.isArray(action.payload.initialState![key]) ? action.payload.initialState![key] : [action.payload.initialState![key]] }), {}) : {};

            const initialAwarded = action.payload.initialState?.previouslyAwardedAchievements || [];

            if (storedState) {
                try {
                    const parsedState = JSON.parse(storedState);
                    state.metrics = parsedState.achievements?.metrics || initialMetrics;
                    state.unlockedAchievements = parsedState.achievements?.unlockedAchievements || [];
                    state.previouslyAwardedAchievements = parsedState.achievements?.previouslyAwardedAchievements || initialAwarded; // Prioritize stored, fallback to initial
                } catch (error) {
                    console.error('Error parsing stored achievement state:', error);
                    state.metrics = initialMetrics;
                    state.unlockedAchievements = [];
                    state.previouslyAwardedAchievements = initialAwarded;
                }
            } else {
                state.metrics = initialMetrics;
                state.unlockedAchievements = [];
                state.previouslyAwardedAchievements = initialAwarded;
            }
        },
        setMetrics: (state, action: PayloadAction<AchievementMetrics>) => {
            state.metrics = action.payload;
            if (state.storageKey) {
                localStorage.setItem(state.storageKey, JSON.stringify({ achievements: { metrics: state.metrics, unlockedAchievements: state.unlockedAchievements, previouslyAwardedAchievements: state.previouslyAwardedAchievements } }));
            }
        },
        unlockAchievement: (state, action: PayloadAction<string>) => {
            if (!state.unlockedAchievements.includes(action.payload)) {
                state.unlockedAchievements.push(action.payload);
                if (state.storageKey) {
                    localStorage.setItem(state.storageKey, JSON.stringify({ achievements: { metrics: state.metrics, unlockedAchievements: state.unlockedAchievements, previouslyAwardedAchievements: state.previouslyAwardedAchievements } }));
                }
            }
        },
        markAchievementAsAwarded: (state, action: PayloadAction<string>) => {
            if (!state.previouslyAwardedAchievements.includes(action.payload)) {
                state.previouslyAwardedAchievements.push(action.payload);
                if (state.storageKey) {
                    localStorage.setItem(state.storageKey, JSON.stringify({ achievements: { metrics: state.metrics, unlockedAchievements: state.unlockedAchievements, previouslyAwardedAchievements: state.previouslyAwardedAchievements } }));
                }
            }
        },
        resetAchievements: (state) => {
            state.metrics = {};
            state.unlockedAchievements = [];
            state.previouslyAwardedAchievements = [];
            if (state.storageKey) {
                localStorage.removeItem(state.storageKey);
            }
        },
    },
});

export const { initialize, setMetrics, unlockAchievement, resetAchievements, markAchievementAsAwarded } = achievementSlice.actions;

export default achievementSlice.reducer;