import React from 'react';
import { StoryFn, Meta } from '@storybook/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import achievementReducer from '../../src/redux/achievementSlice';
import { AchievementProvider } from '../../src';
import { AchievementConfiguration, AchievementMetricValue } from '../../src/types';
import { useAchievement } from '../../src/hooks/useAchievement';
import { defaultAchievementIcons } from '../../src/assets/defaultIcons';

export default {
    title: 'Providers/AchievementProvider/ComplexConditions',
    component: AchievementProvider,
} as Meta;

const Template: StoryFn<{ config: AchievementConfiguration }> = (args) => {
    const store = configureStore({
        reducer: {
            achievements: achievementReducer
        }
    });

    return (
        <Provider store={store}>
            <AchievementProvider
                config={args.config}
                initialState={{}}
                icons={defaultAchievementIcons}
                storageKey={'complex-conditions-test'}
            >
                <TestComponent />
            </AchievementProvider>
        </Provider>
    );
};

const TestComponent = () => {
    const { updateMetrics } = useAchievement();

    const testDateConditions = () => {
        updateMetrics({
            lastLogin: [new Date()],
            consecutiveLogins: [5],
            loginStreak: [true]
        });
    };

    const testTimeBasedConditions = () => {
        const now = new Date();
        updateMetrics({
            loginTime: [now],
            earlyBird: [now.getHours() < 6],
            nightOwl: [now.getHours() >= 22]
        });
    };

    const testCombinedConditions = () => {
        updateMetrics({
            experience: [1000],
            level: [10],
            questsCompleted: [25],
            achievement: [true]
        });
    };

    const testProgressiveConditions = () => {
        updateMetrics({
            skillLevel: [1, 2, 3, 4, 5]
        });
    };

    // Add progress-based achievement tests
    const testProgressBasedAchievements = () => {
        // Test incremental progress
        for (let i = 1; i <= 5; i++) {
            updateMetrics({
                questProgress: [i * 20] // Progress from 20% to 100%
            });
        }

        // Test multi-step achievements
        updateMetrics({
            multiStep: {
                step1: [true],
                step2: [true],
                step3: [true]
            }
        } as any);

        // Test dependent achievements
        updateMetrics({
            prerequisite: [true],
            dependent: [100]
        });
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Complex Conditions Test</h2>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button 
                    onClick={testDateConditions}
                    style={{
                        padding: '10px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Test Date Conditions
                </button>
                
                <button 
                    onClick={testTimeBasedConditions}
                    style={{
                        padding: '10px',
                        backgroundColor: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Test Time-Based Conditions
                </button>
                
                <button 
                    onClick={testCombinedConditions}
                    style={{
                        padding: '10px',
                        backgroundColor: '#FF9800',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Test Combined Conditions
                </button>
                
                <button 
                    onClick={testProgressiveConditions}
                    style={{
                        padding: '10px',
                        backgroundColor: '#9C27B0',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Test Progressive Conditions
                </button>

                <button 
                    onClick={testProgressBasedAchievements}
                    style={{
                        padding: '10px',
                        backgroundColor: '#00BCD4',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Test Progress-Based
                </button>
            </div>
        </div>
    );
};

export const ComplexConditionTests = Template.bind({});
ComplexConditionTests.args = {
    config: {
        // Date-based conditions
        lastLogin: [
            {
                isConditionMet: (value: AchievementMetricValue) => 
                    value instanceof Date && value.getTime() > new Date('2025-01-01').getTime(),
                achievementDetails: {
                    achievementId: 'future_login',
                    achievementTitle: 'Future Login',
                    achievementDescription: 'Logged in after 2025',
                    achievementIconKey: 'calendar'
                }
            }
        ],
        // Time-based conditions
        loginTime: [
            {
                isConditionMet: (value: AchievementMetricValue) => {
                    if (!(value instanceof Date)) return false;
                    const hour = value.getHours();
                    return hour >= 22 || hour < 6;
                },
                achievementDetails: {
                    achievementId: 'night_owl',
                    achievementTitle: 'Night Owl',
                    achievementDescription: 'Logged in during night hours',
                    achievementIconKey: 'moon'
                }
            }
        ],
        // Combined numeric and boolean conditions
        experience: [
            {
                isConditionMet: (value: AchievementMetricValue) => 
                    typeof value === 'number' && value >= 1000,
                achievementDetails: {
                    achievementId: 'experienced',
                    achievementTitle: 'Experienced',
                    achievementDescription: 'Gained 1000 experience points',
                    achievementIconKey: 'star'
                }
            }
        ],
        level: [
            {
                isConditionMet: (value: AchievementMetricValue) => 
                    typeof value === 'number' && value >= 10,
                achievementDetails: {
                    achievementId: 'high_level',
                    achievementTitle: 'High Level',
                    achievementDescription: 'Reached level 10',
                    achievementIconKey: 'levelUp'
                }
            }
        ],
        // Progressive conditions
        skillLevel: [
            {
                isConditionMet: (value: AchievementMetricValue) => 
                    typeof value === 'number' && value >= 1,
                achievementDetails: {
                    achievementId: 'skill_novice',
                    achievementTitle: 'Novice',
                    achievementDescription: 'Reached skill level 1',
                    achievementIconKey: 'bronze'
                }
            },
            {
                isConditionMet: (value: AchievementMetricValue) => 
                    typeof value === 'number' && value >= 3,
                achievementDetails: {
                    achievementId: 'skill_intermediate',
                    achievementTitle: 'Intermediate',
                    achievementDescription: 'Reached skill level 3',
                    achievementIconKey: 'silver'
                }
            },
            {
                isConditionMet: (value: AchievementMetricValue) => 
                    typeof value === 'number' && value >= 5,
                achievementDetails: {
                    achievementId: 'skill_master',
                    achievementTitle: 'Master',
                    achievementDescription: 'Reached skill level 5',
                    achievementIconKey: 'gold'
                }
            }
        ],
        // Progress-based conditions
        questProgress: [
            {
                isConditionMet: (value: AchievementMetricValue) => 
                    typeof value === 'number' && value >= 20,
                achievementDetails: {
                    achievementId: 'progress_20',
                    achievementTitle: 'Getting Started',
                    achievementDescription: 'Quest 20% complete',
                    achievementIconKey: 'bronze'
                }
            },
            {
                isConditionMet: (value: AchievementMetricValue) => 
                    typeof value === 'number' && value >= 50,
                achievementDetails: {
                    achievementId: 'progress_50',
                    achievementTitle: 'Halfway There',
                    achievementDescription: 'Quest 50% complete',
                    achievementIconKey: 'silver'
                }
            },
            {
                isConditionMet: (value: AchievementMetricValue) => 
                    typeof value === 'number' && value >= 100,
                achievementDetails: {
                    achievementId: 'progress_100',
                    achievementTitle: 'Quest Master',
                    achievementDescription: 'Quest 100% complete',
                    achievementIconKey: 'gold'
                }
            }
        ],
        prerequisite: [
            {
                isConditionMet: (value: AchievementMetricValue) => value === true,
                achievementDetails: {
                    achievementId: 'prerequisite',
                    achievementTitle: 'Prerequisites Met',
                    achievementDescription: 'Unlocked advanced achievements',
                    achievementIconKey: 'unlock'
                }
            }
        ],
        dependent: [
            {
                isConditionMet: (value: AchievementMetricValue, state) => {
                    const prereqMet = state.unlockedAchievements.includes('prerequisite');
                    return prereqMet && typeof value === 'number' && value >= 100;
                },
                achievementDetails: {
                    achievementId: 'dependent',
                    achievementTitle: 'Advanced Achievement',
                    achievementDescription: 'Completed an advanced challenge',
                    achievementIconKey: 'diamond'
                }
            }
        ]
    }
};