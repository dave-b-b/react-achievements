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
    title: 'Providers/AchievementProvider/ErrorHandling',
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
                storageKey={'error-handling-test'}
            >
                <ErrorTester />
            </AchievementProvider>
        </Provider>
    );
};

const ErrorTester = () => {
    const { updateMetrics } = useAchievement();

    const testInvalidMetricType = () => {
        // @ts-ignore - Testing type validation
        updateMetrics({ score: "invalid" });
    };

    const testNullMetric = () => {
        // @ts-ignore - Testing null handling
        updateMetrics({ score: null });
    };

    const testUndefinedMetric = () => {
        // @ts-ignore - Testing undefined handling
        updateMetrics({ score: undefined });
    };

    const testCircularReference = () => {
        const circular: any = {};
        circular.self = circular;
        // @ts-ignore - Testing circular reference
        updateMetrics({ circular });
    };

    const testMalformedCondition = () => {
        updateMetrics({ malformed: [true] });
    };

    const testOverflowCondition = () => {
        updateMetrics({ overflow: [Number.MAX_SAFE_INTEGER + 1] });
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Error Handling Test</h2>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button 
                    onClick={testInvalidMetricType}
                    style={{
                        padding: '10px',
                        backgroundColor: '#F44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Test Invalid Type
                </button>
                
                <button 
                    onClick={testNullMetric}
                    style={{
                        padding: '10px',
                        backgroundColor: '#795548',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Test Null Metric
                </button>
                
                <button 
                    onClick={testUndefinedMetric}
                    style={{
                        padding: '10px',
                        backgroundColor: '#607D8B',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Test Undefined Metric
                </button>
                
                <button 
                    onClick={testCircularReference}
                    style={{
                        padding: '10px',
                        backgroundColor: '#9C27B0',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Test Circular Reference
                </button>
                
                <button 
                    onClick={testMalformedCondition}
                    style={{
                        padding: '10px',
                        backgroundColor: '#FF5722',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Test Malformed Condition
                </button>
                
                <button 
                    onClick={testOverflowCondition}
                    style={{
                        padding: '10px',
                        backgroundColor: '#673AB7',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Test Overflow
                </button>
            </div>
        </div>
    );
};

export const ErrorHandlingTests = Template.bind({});
ErrorHandlingTests.args = {
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
        malformed: [
            {
                // @ts-ignore - Testing malformed condition
                isConditionMet: 'not a function',
                achievementDetails: {
                    achievementId: 'malformed',
                    achievementTitle: 'Malformed Achievement',
                    achievementDescription: 'Testing malformed condition',
                    achievementIconKey: 'error'
                }
            }
        ],
        overflow: [
            {
                isConditionMet: (value: AchievementMetricValue) => 
                    typeof value === 'number' && !Number.isSafeInteger(value),
                achievementDetails: {
                    achievementId: 'overflow',
                    achievementTitle: 'Overflow Achievement',
                    achievementDescription: 'Testing numeric overflow',
                    achievementIconKey: 'warning'
                }
            }
        ]
    }
};

ErrorHandlingTests.parameters = {
    docs: {
        description: {
            story: 'Tests error handling for various edge cases and invalid inputs in the achievement system.',
        },
    },
};