import React, { useState, useEffect } from 'react';
import { StoryFn, Meta } from '@storybook/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import achievementReducer from '../../src/redux/achievementSlice';
import notificationReducer from '../../src/redux/notificationSlice';
import { AchievementProvider } from '../../src';
import { AchievementConfiguration, AchievementMetricValue, InitialAchievementMetrics } from '../../src/types';
import { useAchievement } from '../../src/hooks/useAchievement';
import { defaultAchievementIcons } from '../../src/assets/defaultIcons';

export default {
    title: 'Providers/AchievementProvider/MultipleMetrics',
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
            <AchievementProvider
                config={args.config}
                initialState={args.initialState}
                icons={defaultAchievementIcons}
                storageKey={'multiple-metrics-test'}
            >
                <TestComponent />
            </AchievementProvider>
        </Provider>
    );
};

const TestComponent = () => {
    const { metrics, updateMetrics, unlockedAchievements } = useAchievement();
    const initialClick = typeof metrics.clicks?.[0] === 'number' ? metrics.clicks[0] : 0;
    const [clickCount, setClickCount] = useState<number>(0);
    const initialView = typeof metrics.views?.[0] === 'number' ? metrics.views[0] : 0;
    const [viewCount, setViewCount] = useState<number>(0);
    const initialPoint = typeof metrics.points?.[0] === 'number' ? metrics.points[0] : 0;
    const [pointCount, setPointCount] = useState<number>(0);

    const handleButtonClick = () => {
        setClickCount((prevCount) => prevCount + 1);
        updateMetrics({ clicks: [clickCount + 1] });
    };

    const handleView = () => {
        setViewCount((prevCount) => prevCount + 1);
        updateMetrics({ views: [viewCount + 1] });
    };

    const handlePointGain = () => {
        setPointCount((prevCount) => prevCount + 50);
        updateMetrics({ points: [pointCount + 50] });
    };

    useEffect(() => {
        const initialClicks = typeof metrics.clicks?.[0] === 'number' ? metrics.clicks[0] : 0;
        const initialViews = typeof metrics.views?.[0] === 'number' ? metrics.views[0] : 0;
        const initialPoints = typeof metrics.points?.[0] === 'number' ? metrics.points[0] : 0;

        setClickCount(initialClicks);
        setViewCount(initialViews);
        setPointCount(initialPoints);
    }, [metrics]);

    return (
        <div>
            <p>Metrics: {JSON.stringify(metrics)}</p>
            <p>Unlocked Achievements: {JSON.stringify(unlockedAchievements)}</p>
            <button onClick={handleButtonClick}>Click Me</button>
            <button onClick={handleView}>View Page</button>
            <button onClick={handlePointGain}>Gain Points</button>
        </div>
    );
};

export const MultipleMetrics = Template.bind({});
MultipleMetrics.args = {
    config: {
        clicks: [
            {
                isConditionMet: (value: AchievementMetricValue) => typeof value === 'number' && value >= 5,
                achievementDetails: {
                    achievementId: 'click_master_bronze',
                    achievementTitle: 'Bronze Click Master',
                    achievementDescription: 'Clicked 5 times!',
                    achievementIconKey: 'bronze',
                },
            },
        ],
        views: [
            {
                isConditionMet: (value: AchievementMetricValue) => typeof value === 'number' && value >= 3,
                achievementDetails: {
                    achievementId: 'view_watcher_bronze',
                    achievementTitle: 'Bronze View Watcher',
                    achievementDescription: 'Viewed 3 times!',
                    achievementIconKey: 'bronze',
                },
            },
        ],
        points: [
            {
                isConditionMet: (value: AchievementMetricValue) => typeof value === 'number' && value >= 100,
                achievementDetails: {
                    achievementId: 'point_collector_bronze',
                    achievementTitle: 'Bronze Point Collector',
                    achievementDescription: 'Collected 100 points!',
                    achievementIconKey: 'bronze',
                },
            },
        ],
    },
    initialState: {},
};

MultipleMetrics.decorators = [
    (Story) => (
        <div style={{ position: 'relative' }}>
            <Story />
            <ResetStorageButton />
        </div>
    ),
];

MultipleMetrics.parameters = {
    badgesButton: {
        icon: defaultAchievementIcons.badge,
    },
};

const ResetStorageButton = () => {
    const storageKey = 'multiple-metrics-test';

    const handleResetStorage = () => {
        localStorage.removeItem(storageKey);
        window.location.reload();
    };

    return (
        <button
            style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                padding: '8px 16px',
                background: '#f5f5f5',
                color: '#333',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer',
            }}
            onClick={handleResetStorage}
        >
            Reset Storage
        </button>
    );
};