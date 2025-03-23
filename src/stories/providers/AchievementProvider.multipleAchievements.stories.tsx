import React, { useState } from 'react';
import { StoryFn, Meta } from '@storybook/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import achievementReducer from '../../redux/achievementSlice';
import notificationReducer from '../../redux/notificationSlice';
import { AchievementProvider } from '../../providers/AchievementProvider';
import { AchievementConfiguration, AchievementMetricValue, InitialAchievementMetrics } from '../../types';
import { useAchievement } from '../../hooks/useAchievement';
import { defaultAchievementIcons } from '../../assets/defaultIcons';

export default {
    title: 'Providers/AchievementProvider/MultipleAchievements',
    component: AchievementProvider,
} as Meta;

const Template: StoryFn<{ config: AchievementConfiguration; initialState: InitialAchievementMetrics }> = (args) => {
    const store = configureStore({
        reducer: {
            achievements: achievementReducer,
            notifications: notificationReducer,
        },
    });

    return (
        <Provider store={store}>
            <AchievementProvider config={args.config} initialState={args.initialState} icons={defaultAchievementIcons}>
                <TestComponent />
            </AchievementProvider>
        </Provider>
    );
};

const TestComponent = () => {
    const { metrics, updateMetrics, unlockedAchievements } = useAchievement();
    const [clickCount, setClickCount] = useState(metrics.clicks ? metrics.clicks[0] : 0);

    const handleButtonClick = () => {
        const newClickCount = clickCount + 1;
        setClickCount(newClickCount);

        updateMetrics({
            clicks: [newClickCount],
        });
    };

    return (
        <div>
            <p>Metrics: {JSON.stringify(metrics)}</p>
            <p>Unlocked Achievements: {JSON.stringify(unlockedAchievements)}</p>
            <button onClick={handleButtonClick}>Click Me</button>
        </div>
    );
};

export const Default = Template.bind({});
Default.args = {
    config: {
        clicks: [
            {
                isConditionMet: (value: AchievementMetricValue) => typeof value === 'number' && value >= 5,
                achievementDetails: {
                    achievementId: 'click_master',
                    achievementTitle: 'Click Master',
                    achievementDescription: 'Clicked 5 times!',
                    achievementIconKey: 'bronze',
                },
            },
            {
                isConditionMet: (value: AchievementMetricValue) => typeof value === 'number' && value >= 10,
                achievementDetails: {
                    achievementId: 'click_master',
                    achievementTitle: 'Click Master',
                    achievementDescription: 'Clicked 10 times!',
                    achievementIconKey: 'silver',
                },
            },
            {
                isConditionMet: (value: AchievementMetricValue) => typeof value === 'number' && value >= 15,
                achievementDetails: {
                    achievementId: 'click_master',
                    achievementTitle: 'Click Master',
                    achievementDescription: 'Clicked 15 times!',
                    achievementIconKey: 'gold',
                },
            },
        ],
    },
    initialState: {
        clicks: 0,
    },
};

Default.decorators = [
    (Story) => (
        <div style={{ position: 'relative' }}>
            <Story />
        </div>
    ),
];

Default.parameters = {
    badgesButton: {
        icon: defaultAchievementIcons.badge
    },
};