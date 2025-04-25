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
    title: 'Providers/AchievementProvider/Conditions',
    component: AchievementProvider,
} as Meta;

const allTypesConfig: AchievementConfiguration = {
    // Number type conditions
    score: [
        {
            isConditionMet: (value: AchievementMetricValue) => 
                typeof value === 'number' && value >= 100,
            achievementDetails: {
                achievementId: 'high_score',
                achievementTitle: 'High Score',
                achievementDescription: 'Reached 100 points',
                achievementIconKey: 'trophy'
            }
        }
    ],
    // String type conditions
    status: [
        {
            isConditionMet: (value: AchievementMetricValue) => 
                value === 'elite',
            achievementDetails: {
                achievementId: 'elite_status',
                achievementTitle: 'Elite Status',
                achievementDescription: 'Achieved elite status',
                achievementIconKey: 'star'
            }
        }
    ],
    // Boolean type conditions
    isComplete: [
        {
            isConditionMet: (value: AchievementMetricValue) => 
                value === true,
            achievementDetails: {
                achievementId: 'completion',
                achievementTitle: 'Task Complete',
                achievementDescription: 'Completed all tasks',
                achievementIconKey: 'success'
            }
        }
    ],
    // Date type conditions
    lastLogin: [
        {
            isConditionMet: (value: AchievementMetricValue) => 
                value instanceof Date && value >= new Date('2025-01-01'),
            achievementDetails: {
                achievementId: 'new_year_login',
                achievementTitle: 'New Year Login',
                achievementDescription: 'Logged in after Jan 1, 2025',
                achievementIconKey: 'calendar'
            }
        }
    ],
    // Multiple conditions for the same metric
    level: [
        {
            isConditionMet: (value: AchievementMetricValue) => 
                typeof value === 'number' && value >= 5,
            achievementDetails: {
                achievementId: 'level_5',
                achievementTitle: 'Apprentice',
                achievementDescription: 'Reached level 5',
                achievementIconKey: 'bronze'
            }
        },
        {
            isConditionMet: (value: AchievementMetricValue) => 
                typeof value === 'number' && value >= 10,
            achievementDetails: {
                achievementId: 'level_10',
                achievementTitle: 'Master',
                achievementDescription: 'Reached level 10',
                achievementIconKey: 'silver'
            }
        }
    ]
};

const ConditionTester = () => {
    const { metrics, updateMetrics } = useAchievement();

    // Number metric
    const handleScore = () => {
        updateMetrics({
            ...metrics,
            score: [100]
        });
    };

    // String metric
    const handleStatus = () => {
        updateMetrics({
            ...metrics,
            status: ['elite']
        });
    };

    // Boolean metric
    const handleComplete = () => {
        updateMetrics({
            ...metrics,
            isComplete: [true]
        });
    };

    // Date metric
    const handleDate = () => {
        updateMetrics({
            ...metrics,
            lastLogin: [new Date('2025-01-01')]
        });
    };

    // Multiple conditions
    const handleLevel = () => {
        const currentLevel = typeof metrics.level?.[0] === 'number' ? metrics.level[0] : 0;
        updateMetrics({
            ...metrics,
            level: [currentLevel + 5]
        });
    };

    // Add date-based achievement tests
    const handleTimeBasedAchievements = () => {
        const now = new Date();
        updateMetrics({
            loginTime: [now],
            streak: [7],
            offlineTime: [48], // hours
            sessionDuration: [120] // minutes
        });
    };

    const handleSeasonalAchievements = () => {
        updateMetrics({
            holidayLogin: [new Date('2024-12-25')],
            newYearLogin: [new Date('2025-01-01')],
            summerActivity: [true],
            seasonalEvents: [5]
        });
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Achievement Conditions Test</h2>
            <div style={{ marginBottom: '20px' }}>
                <h3>Current State:</h3>
                <pre>{JSON.stringify(metrics, null, 2)}</pre>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button 
                    onClick={handleScore}
                    style={{
                        padding: '10px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Set Score to 100
                </button>
                
                <button 
                    onClick={handleStatus}
                    style={{
                        padding: '10px',
                        backgroundColor: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Set Status to Elite
                </button>
                
                <button 
                    onClick={handleComplete}
                    style={{
                        padding: '10px',
                        backgroundColor: '#FF9800',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Mark as Complete
                </button>
                
                <button 
                    onClick={handleDate}
                    style={{
                        padding: '10px',
                        backgroundColor: '#9C27B0',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Set Future Date
                </button>
                
                <button 
                    onClick={handleLevel}
                    style={{
                        padding: '10px',
                        backgroundColor: '#E91E63',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Increase Level by 5
                </button>

                <button 
                    onClick={handleTimeBasedAchievements}
                    style={{
                        padding: '10px',
                        backgroundColor: '#3F51B5',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Test Time-Based
                </button>
                
                <button 
                    onClick={handleSeasonalAchievements}
                    style={{
                        padding: '10px',
                        backgroundColor: '#009688',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Test Seasonal
                </button>
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
                storageKey="conditions-test"
            >
                <ConditionTester />
            </AchievementProvider>
        </Provider>
    );
};

export const AllConditionTypes = Template.bind({});
AllConditionTypes.args = {
    config: allTypesConfig,
    initialState: {
        score: 0,
        status: '',
        isComplete: false,
        lastLogin: new Date('2024-01-01'),
        level: 0
    }
};

AllConditionTypes.parameters = {
    docs: {
        description: {
            story: 'Tests all supported achievement condition types including numbers, strings, booleans, dates, and multiple conditions for the same metric.',
        },
    },
};