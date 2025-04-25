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
    const [clickCount, setClickCount] = useState(0);
    const [viewCount, setViewCount] = useState(0);
    const [pointCount, setPointCount] = useState(0);

    // Initialize state from metrics
    useEffect(() => {
        const initialClicks = typeof metrics.clicks?.[0] === 'number' ? metrics.clicks[0] : 0;
        const initialViews = typeof metrics.views?.[0] === 'number' ? metrics.views[0] : 0;
        const initialPoints = typeof metrics.points?.[0] === 'number' ? metrics.points[0] : 0;

        setClickCount(initialClicks);
        setViewCount(initialViews);
        setPointCount(initialPoints);
    }, [metrics]);

    const handleButtonClick = () => {
        setClickCount(prev => prev + 1);
        updateMetrics({ clicks: [clickCount + 1] });
    };

    const handleView = () => {
        setViewCount(prev => prev + 1);
        updateMetrics({ views: [viewCount + 1] });
    };

    const handlePointGain = () => {
        setPointCount(prev => prev + 50);
        updateMetrics({ points: [pointCount + 50] });
    };

    // New handler for testing multiple simultaneous achievements
    const handleMultipleAchievements = () => {
        const newClicks = clickCount + 5;
        const newViews = viewCount + 3;
        const newPoints = pointCount + 100;
        
        setClickCount(newClicks);
        setViewCount(newViews);
        setPointCount(newPoints);
        
        // Update all metrics at once
        updateMetrics({
            clicks: [newClicks],
            views: [newViews],
            points: [newPoints]
        });
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Multiple Metrics Test</h2>
            <div style={{ marginBottom: '20px' }}>
                <h3>Current State:</h3>
                <pre>{JSON.stringify(metrics, null, 2)}</pre>
                <h3>Unlocked Achievements:</h3>
                <pre>{JSON.stringify(unlockedAchievements, null, 2)}</pre>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button 
                    onClick={handleButtonClick}
                    style={{
                        padding: '10px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Click (+1)
                </button>
                
                <button 
                    onClick={handleView}
                    style={{
                        padding: '10px',
                        backgroundColor: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    View Page (+1)
                </button>
                
                <button 
                    onClick={handlePointGain}
                    style={{
                        padding: '10px',
                        backgroundColor: '#FF9800',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Add Points (+50)
                </button>

                <button 
                    onClick={handleMultipleAchievements}
                    style={{
                        padding: '10px',
                        backgroundColor: '#9C27B0',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Trigger Multiple Achievements
                </button>
            </div>
        </div>
    );
};

export const MultipleMetrics = Template.bind({});
MultipleMetrics.args = {
    config: {
        clicks: [
            {
                isConditionMet: (value: AchievementMetricValue) => 
                    typeof value === 'number' && value >= 5,
                achievementDetails: {
                    achievementId: 'click_master_bronze',
                    achievementTitle: 'Bronze Click Master',
                    achievementDescription: 'Clicked 5 times!',
                    achievementIconKey: 'bronze',
                }
            },
            {
                isConditionMet: (value: AchievementMetricValue) => 
                    typeof value === 'number' && value >= 10,
                achievementDetails: {
                    achievementId: 'click_master_silver',
                    achievementTitle: 'Silver Click Master',
                    achievementDescription: 'Clicked 10 times!',
                    achievementIconKey: 'silver',
                }
            }
        ],
        views: [
            {
                isConditionMet: (value: AchievementMetricValue) => 
                    typeof value === 'number' && value >= 3,
                achievementDetails: {
                    achievementId: 'view_watcher_bronze',
                    achievementTitle: 'Bronze View Watcher',
                    achievementDescription: 'Viewed 3 times!',
                    achievementIconKey: 'bronze',
                }
            },
            {
                isConditionMet: (value: AchievementMetricValue) => 
                    typeof value === 'number' && value >= 5,
                achievementDetails: {
                    achievementId: 'view_watcher_silver',
                    achievementTitle: 'Silver View Watcher',
                    achievementDescription: 'Viewed 5 times!',
                    achievementIconKey: 'silver',
                }
            }
        ],
        points: [
            {
                isConditionMet: (value: AchievementMetricValue) => 
                    typeof value === 'number' && value >= 100,
                achievementDetails: {
                    achievementId: 'point_collector_bronze',
                    achievementTitle: 'Bronze Point Collector',
                    achievementDescription: 'Collected 100 points!',
                    achievementIconKey: 'bronze',
                }
            },
            {
                isConditionMet: (value: AchievementMetricValue) => 
                    typeof value === 'number' && value >= 200,
                achievementDetails: {
                    achievementId: 'point_collector_silver',
                    achievementTitle: 'Silver Point Collector',
                    achievementDescription: 'Collected 200 points!',
                    achievementIconKey: 'silver',
                }
            }
        ]
    },
    initialState: {}
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