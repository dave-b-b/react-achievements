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
    title: 'Providers/AchievementProvider/TestPreviousSavedState',
    component: AchievementProvider,
} as Meta;

const Template: StoryFn<{ config: AchievementConfiguration; initialState: InitialAchievementMetrics & { previouslyAwardedAchievements?: string[] } }> = (args) => {
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
                storageKey={'previous-state-test'}
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
        const newClickCount = clickCount + 1;
        setClickCount(newClickCount);
        updateMetrics({ 
            ...metrics,
            clicks: [newClickCount] 
        });
    };

    const handleView = () => {
        const newViewCount = viewCount + 1;
        setViewCount(newViewCount);
        updateMetrics({ 
            ...metrics,
            views: [newViewCount] 
        });
    };

    const handlePointGain = () => {
        const newPointCount = pointCount + 50;
        setPointCount(newPointCount);
        updateMetrics({ 
            ...metrics,
            points: [newPointCount] 
        });
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

export const TestPreviousSavedState = Template.bind({});
TestPreviousSavedState.args = {
    config: {
        visits: [
            {
                isConditionMet: (value: AchievementMetricValue) => 
                    typeof value === 'number' && value >= 5,
                achievementDetails: {
                    achievementId: 'previous_visitor',
                    achievementTitle: 'Regular Visitor',
                    achievementDescription: 'Visited 5 times',
                    achievementIconKey: 'return'
                }
            },
            {
                isConditionMet: (value: AchievementMetricValue) => 
                    typeof value === 'number' && value >= 10,
                achievementDetails: {
                    achievementId: 'frequent_visitor',
                    achievementTitle: 'Frequent Visitor',
                    achievementDescription: 'Visited 10 times',
                    achievementIconKey: 'star'
                }
            }
        ],
        points: [
            {
                isConditionMet: (value: AchievementMetricValue) => 
                    typeof value === 'number' && value >= 150,
                achievementDetails: {
                    achievementId: 'point_collector',
                    achievementTitle: 'Point Collector',
                    achievementDescription: 'Earned 150 points',
                    achievementIconKey: 'trophy'
                }
            },
            {
                isConditionMet: (value: AchievementMetricValue) => 
                    typeof value === 'number' && value >= 200,
                achievementDetails: {
                    achievementId: 'point_master',
                    achievementTitle: 'Point Master',
                    achievementDescription: 'Earned 200 points',
                    achievementIconKey: 'gold'
                }
            }
        ],
        achievements: [
            {
                isConditionMet: (value: AchievementMetricValue) => 
                    typeof value === 'number' && value >= 3,
                achievementDetails: {
                    achievementId: 'achievement_collector',
                    achievementTitle: 'Achievement Collector',
                    achievementDescription: 'Unlocked 3 other achievements',
                    achievementIconKey: 'collection'
                }
            },
            {
                isConditionMet: (value: AchievementMetricValue) => 
                    typeof value === 'number' && value >= 5,
                achievementDetails: {
                    achievementId: 'achievement_master',
                    achievementTitle: 'Achievement Master',
                    achievementDescription: 'Unlocked 5 other achievements',
                    achievementIconKey: 'diamond'
                }
            }
        ]
    },
    initialState: {
        visits: 0,
        points: 0,
        achievements: 0,
        previouslyAwardedAchievements: ['early_adopter', 'beta_tester']
    }
};

TestPreviousSavedState.decorators = [
    (Story) => (
        <div style={{ position: 'relative' }}>
            <Story />
            <ResetStorageButton storageKey={'previous-state-test'} />
        </div>
    ),
];

TestPreviousSavedState.parameters = {
    badgesButton: {
        icon: defaultAchievementIcons.badge,
    },
    docs: {
        description: {
            story: 'Tests the behavior when an achievement is already in the previouslyAwardedAchievements array in the initialState.',
        },
    },
};

const ResetStorageButton = ({ storageKey }: { storageKey: string }) => {
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