// stories/AchievementProvider.ProviderTest.stories.tsx

import React, { useState, useEffect } from 'react';
import { StoryFn, Meta } from '@storybook/react';
import {Provider, useSelector} from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import achievementReducer from '../../src/redux/achievementSlice';
import notificationReducer from '../../src/redux/notificationSlice';
import { AchievementProvider } from '../../src';

import { AchievementConfiguration, AchievementMetricValue, InitialAchievementMetrics } from '../../src/types';
import { defaultAchievementIcons } from '../../src/assets/defaultIcons';
import { RootState } from '../../src/redux/store';
import {useAchievementContext} from "../../src/providers/AchievementProvider"; // Import RootState for useSelector

export default {
    title: 'Providers/AchievementProvider/ResetStorage',
    component: AchievementProvider,
} as Meta;

// Simulate unlocking an achievement and storing in localStorage initially
const STORAGE_KEY = 'reset-storage-test';
const initialStoredState = {
    achievements: {
        metrics: { clicks: [2] },
        unlockedAchievements: ['click_twice_reset_test'],
    },
};
localStorage.setItem(STORAGE_KEY, JSON.stringify(initialStoredState));

const Template: StoryFn<{ config: AchievementConfiguration; initialState: InitialAchievementMetrics }> = (args) => {
    const store = configureStore({
        reducer: {
            achievements: achievementReducer,
            notifications: notificationReducer,
        },
    });

    return (
        <Provider store={store}>
            <AchievementProvider
                config={args.config}
                initialState={args.initialState}
                icons={defaultAchievementIcons}
                storageKey={STORAGE_KEY}
            >
                <TestComponent />
            </AchievementProvider>
        </Provider>
    );
};


const TestComponent = () => {
    const { updateMetrics, unlockedAchievements, resetStorage } = useAchievementContext();
    const metrics = useSelector((state: RootState) => state.achievements.metrics);
    const [clickCount, setClickCount] = useState<number>(0); // Explicitly type clickCount as number
    const [resetClicked, setResetClicked] = useState(false);

    useEffect(() => {
        const currentClicks = metrics.clicks?.[0];
        setClickCount(typeof currentClicks === 'number' ? currentClicks : 0);
        if (resetClicked) {
            setResetClicked(false);
        }
    }, [metrics.clicks, resetClicked]);

    const handleButtonClick = () => {
        const newClickCount = clickCount + 1;
        setClickCount(newClickCount);
        updateMetrics({ clicks: [newClickCount] });
    };

    const handleResetClick = () => {
        resetStorage();
        setResetClicked(true);
    };

    return (
        <div>
            <p>Metrics: {JSON.stringify(metrics)}</p>
            <p>Unlocked Achievements: {JSON.stringify(unlockedAchievements)}</p>
            <p>Click Count (Local): {clickCount}</p>
            <button onClick={handleButtonClick}>Click Me</button>
            <button onClick={handleResetClick}>Reset Storage</button>
            {resetClicked && <p style={{ color: 'green' }}>Storage has been reset!</p>}
        </div>
    );
};

export const ResetLocalStorage = Template.bind({});
ResetLocalStorage.args = {
    config: {
        clicks: [
            {
                isConditionMet: (value: AchievementMetricValue) => typeof value === 'number' && value >= 2,
                achievementDetails: {
                    achievementId: 'click_twice_reset_test',
                    achievementTitle: 'Double Click (Reset Test)',
                    achievementDescription: 'Clicked twice for reset test!',
                    achievementIconKey: 'bronze',
                },
            },
        ],
    },
    initialState: {
        clicks: [0], // Initial state should be an array to match how updateMetrics works
    },
};

ResetLocalStorage.parameters = {
    docs: {
        description: {
            story: 'Tests the resetStorage function to clear localStorage and reset Redux state.',
        },
    },
};