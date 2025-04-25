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
    title: 'Providers/AchievementProvider/MetricUpdates',
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
                storageKey={'metric-updates-test'}
            >
                <TestComponent />
            </AchievementProvider>
        </Provider>
    );
};

const TestComponent = () => {
    const { metrics, updateMetrics } = useAchievement();

    const testSingleMetricUpdate = () => {
        updateMetrics({ score: [100] });
    };

    const testMultipleMetricUpdates = () => {
        updateMetrics({
            score: [100],
            kills: [10],
            level: [5]
        });
    };

    const testInvalidMetricUpdate = () => {
        // @ts-ignore - Testing invalid type handling
        updateMetrics({ score: "invalid" });
    };

    const testFunctionUpdate = () => {
        updateMetrics((prev) => ({
            ...prev,
            score: [typeof prev.score?.[0] === 'number' ? (prev.score[0] + 50) : 50]
        }));
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Metric Updates Test</h2>
            <div style={{ marginBottom: '20px' }}>
                <h3>Current State:</h3>
                <pre>{JSON.stringify(metrics, null, 2)}</pre>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button 
                    onClick={testSingleMetricUpdate}
                    style={{
                        padding: '10px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Single Metric Update
                </button>
                
                <button 
                    onClick={testMultipleMetricUpdates}
                    style={{
                        padding: '10px',
                        backgroundColor: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Multiple Metric Updates
                </button>
                
                <button 
                    onClick={testInvalidMetricUpdate}
                    style={{
                        padding: '10px',
                        backgroundColor: '#FF9800',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Invalid Update
                </button>
                
                <button 
                    onClick={testFunctionUpdate}
                    style={{
                        padding: '10px',
                        backgroundColor: '#9C27B0',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Function Update
                </button>
            </div>
        </div>
    );
};

export const MetricUpdateTests = Template.bind({});
MetricUpdateTests.args = {
    config: {
        score: [
            {
                isConditionMet: (value: AchievementMetricValue) => 
                    typeof value === 'number' && value >= 100,
                achievementDetails: {
                    achievementId: 'score_100',
                    achievementTitle: 'High Score',
                    achievementDescription: 'Reached 100 points',
                    achievementIconKey: 'star'
                }
            }
        ],
        kills: [
            {
                isConditionMet: (value: AchievementMetricValue) => 
                    typeof value === 'number' && value >= 10,
                achievementDetails: {
                    achievementId: 'kills_10',
                    achievementTitle: 'Hunter',
                    achievementDescription: 'Defeated 10 enemies',
                    achievementIconKey: 'sword'
                }
            }
        ],
        level: [
            {
                isConditionMet: (value: AchievementMetricValue) => 
                    typeof value === 'number' && value >= 5,
                achievementDetails: {
                    achievementId: 'level_5',
                    achievementTitle: 'Level Up',
                    achievementDescription: 'Reached level 5',
                    achievementIconKey: 'levelUp'
                }
            }
        ]
    }
};