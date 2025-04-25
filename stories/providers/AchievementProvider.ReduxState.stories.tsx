import React from 'react';
import { StoryFn, Meta } from '@storybook/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import achievementReducer from '../../src/redux/achievementSlice';
import notificationReducer from '../../src/redux/notificationSlice';
import { AchievementProvider } from '../../src';
import { AchievementConfiguration, InitialAchievementMetrics, AchievementMetricValue } from '../../src/types';
import { useAchievement } from '../../src/hooks/useAchievement';
import { defaultAchievementIcons } from '../../src/assets/defaultIcons';

export default {
    title: 'Providers/AchievementProvider/ReduxState',
    component: AchievementProvider,
} as Meta;

const complexConfig: AchievementConfiguration = {
    points: [
        {
            isConditionMet: (value: AchievementMetricValue) => 
                typeof value === 'number' && value >= 100,
            achievementDetails: {
                achievementId: 'points_100',
                achievementTitle: 'Point Collector',
                achievementDescription: 'Earned 100 points',
                achievementIconKey: 'trophy'
            }
        }
    ],
    kills: [
        {
            isConditionMet: (value: AchievementMetricValue) => 
                typeof value === 'number' && value >= 10,
            achievementDetails: {
                achievementId: 'kills_10',
                achievementTitle: 'Monster Hunter',
                achievementDescription: 'Defeated 10 monsters',
                achievementIconKey: 'sword'
            }
        }
    ],
    items: [
        {
            isConditionMet: (value: AchievementMetricValue) => 
                typeof value === 'number' && value >= 5,
            achievementDetails: {
                achievementId: 'items_5',
                achievementTitle: 'Collector',
                achievementDescription: 'Collected 5 items',
                achievementIconKey: 'itemCollected'
            }
        }
    ],
    persistTest: [
        {
            isConditionMet: (value: AchievementMetricValue) => 
                typeof value === 'number' && value >= 100,
            achievementDetails: {
                achievementId: 'persist_test',
                achievementTitle: 'Persistence Test',
                achievementDescription: 'Testing state persistence',
                achievementIconKey: 'save'
            }
        }
    ]
};

const StateDisplay = () => {
    const { metrics, updateMetrics, unlockedAchievements, resetStorage } = useAchievement();
    
    const updatePoints = () => {
        const currentPoints = typeof metrics.points?.[0] === 'number' ? metrics.points[0] : 0;
        updateMetrics({
            ...metrics,
            points: [currentPoints + 50]
        });
    };

    const updateKills = () => {
        const currentKills = typeof metrics.kills?.[0] === 'number' ? metrics.kills[0] : 0;
        updateMetrics({
            ...metrics,
            kills: [currentKills + 5]
        });
    };

    const updateItems = () => {
        const currentItems = typeof metrics.items?.[0] === 'number' ? metrics.items[0] : 0;
        updateMetrics({
            ...metrics,
            items: [currentItems + 2]
        });
    };

    // Add state mutation tests
    const handleComplexStateUpdates = () => {
        // Test batch updates
        const batchUpdates = Array.from({ length: 10 }, (_, i) => ({
            [`metric_${i}`]: [i * 10]
        }));
        
        batchUpdates.forEach(update => {
            updateMetrics(update);
        });

        // Test nested metric updates
        updateMetrics({
            nested: {
                level1: {
                    level2: [1]
                }
            }
        } as any);

        // Test array manipulation
        updateMetrics((prevMetrics) => ({
            ...prevMetrics,
            arrayMetric: [...(prevMetrics.arrayMetric || []), 1]
        }));
    };

    const handleStateReset = () => {
        resetStorage();
    };

    const handlePersistenceTest = () => {
        // Add data to be persisted
        updateMetrics({
            persistTest: [100],
            multiValue: [1, 2, 3]
        });
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Redux State Test</h2>
            <div style={{ marginBottom: '20px' }}>
                <h3>Current State:</h3>
                <pre>{JSON.stringify(metrics, null, 2)}</pre>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button 
                    onClick={updatePoints}
                    style={{
                        padding: '10px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Add 50 Points
                </button>
                
                <button 
                    onClick={updateKills}
                    style={{
                        padding: '10px',
                        backgroundColor: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Add 5 Kills
                </button>
                
                <button 
                    onClick={updateItems}
                    style={{
                        padding: '10px',
                        backgroundColor: '#FF9800',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Add 2 Items
                </button>

                <button 
                    onClick={handleComplexStateUpdates}
                    style={{
                        padding: '10px',
                        backgroundColor: '#3F51B5',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Test Complex Updates
                </button>
                
                <button 
                    onClick={handleStateReset}
                    style={{
                        padding: '10px',
                        backgroundColor: '#F44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Reset State
                </button>
                
                <button 
                    onClick={handlePersistenceTest}
                    style={{
                        padding: '10px',
                        backgroundColor: '#009688',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Test Persistence
                </button>
            </div>

            <div style={{ marginTop: '20px' }}>
                <h3>Current Metrics:</h3>
                <pre>{JSON.stringify(metrics, null, 2)}</pre>
                
                <h3>Unlocked Achievements:</h3>
                <pre>{JSON.stringify(unlockedAchievements, null, 2)}</pre>
            </div>
        </div>
    );
};

const Template: StoryFn<{ config: AchievementConfiguration; initialState: InitialAchievementMetrics }> = (args) => {
    const store = configureStore({
        reducer: {
            achievements: achievementReducer,
            notifications: notificationReducer
        }
    });

    return (
        <Provider store={store}>
            <AchievementProvider
                config={args.config}
                initialState={args.initialState}
                icons={defaultAchievementIcons}
                storageKey="redux-state-test"
            >
                <StateDisplay />
            </AchievementProvider>
        </Provider>
    );
};

export const ReduxStateTest = Template.bind({});
ReduxStateTest.args = {
    config: complexConfig,
    initialState: {
        points: 0,
        kills: 0,
        items: 0
    }
};

ReduxStateTest.parameters = {
    docs: {
        description: {
            story: 'Tests the Redux state management with multiple metrics and complex achievement conditions.',
        },
    },
};

// Add to config
export const ReduxStateTests = Template.bind({});
ReduxStateTests.args = {
    config: {
        ...complexConfig,
        persistTest: [
            {
                isConditionMet: (value: AchievementMetricValue) => 
                    typeof value === 'number' && value >= 100,
                achievementDetails: {
                    achievementId: 'persist_test',
                    achievementTitle: 'Persistence Test',
                    achievementDescription: 'Testing state persistence',
                    achievementIconKey: 'save'
                }
            }
        ],
        ...Array.from({ length: 10 }, (_, i) => ({
            [`metric_${i}`]: [{
                isConditionMet: (value: AchievementMetricValue) => 
                    typeof value === 'number' && value >= i * 10,
                achievementDetails: {
                    achievementId: `batch_${i}`,
                    achievementTitle: `Batch Achievement ${i}`,
                    achievementDescription: `Testing batch update ${i}`,
                    achievementIconKey: 'star'
                }
            }]
        })).reduce((acc, curr) => ({ ...acc, ...curr }), {})
    }
};