import React from 'react';
import { StoryFn, Meta } from '@storybook/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import achievementReducer from '../../src/redux/achievementSlice';
import notificationReducer from '../../src/redux/notificationSlice';
import { AchievementProvider } from '../../src';
import { AchievementConfiguration, AchievementMetricValue } from '../../src/types';
import { useAchievement } from '../../src/hooks/useAchievement';
import { defaultAchievementIcons } from '../../src/assets/defaultIcons';

export default {
    title: 'Providers/AchievementProvider/ConditionTypes',
    component: AchievementProvider,
} as Meta;

const Template: StoryFn<{ config: AchievementConfiguration }> = (args) => {
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
                initialState={{}}
                icons={defaultAchievementIcons}
                storageKey={'condition-types-test'}
            >
                <TestComponent />
            </AchievementProvider>
        </Provider>
    );
};

const TestComponent = () => {
    const { updateMetrics, metrics } = useAchievement();

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

    return (
        <div style={{ padding: '20px' }}>
            <h2>Test Different Achievement Conditions</h2>
            <p>Current Metrics: {JSON.stringify(metrics)}</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button onClick={handleScore}>Set Score to 100</button>
                <button onClick={handleStatus}>Set Status to Elite</button>
                <button onClick={handleComplete}>Complete Task</button>
                <button onClick={handleDate}>Set Login Date</button>
            </div>
        </div>
    );
};

export const AllConditionTypes = Template.bind({});
AllConditionTypes.args = {
    config: {
        score: [
            {
                isConditionMet: (value: AchievementMetricValue) => 
                    typeof value === 'number' && value >= 100,
                achievementDetails: {
                    achievementId: 'high_score',
                    achievementTitle: 'High Score',
                    achievementDescription: 'Reached 100 points!',
                    achievementIconKey: 'trophy'
                }
            }
        ],
        status: [
            {
                isConditionMet: (value: AchievementMetricValue) => 
                    typeof value === 'string' && value === 'elite',
                achievementDetails: {
                    achievementId: 'elite_status',
                    achievementTitle: 'Elite Status',
                    achievementDescription: 'Reached elite status!',
                    achievementIconKey: 'star'
                }
            }
        ],
        isComplete: [
            {
                isConditionMet: (value: AchievementMetricValue) => 
                    typeof value === 'boolean' && value === true,
                achievementDetails: {
                    achievementId: 'task_complete',
                    achievementTitle: 'Task Complete',
                    achievementDescription: 'Completed the task!',
                    achievementIconKey: 'checkmark'
                }
            }
        ],
        lastLogin: [
            {
                isConditionMet: (value: AchievementMetricValue) => 
                    value instanceof Date && 
                    value.getTime() >= new Date('2025-01-01').getTime(),
                achievementDetails: {
                    achievementId: 'new_year_login',
                    achievementTitle: 'New Year Login',
                    achievementDescription: 'Logged in after New Year 2025!',
                    achievementIconKey: 'calendar'
                }
            }
        ]
    }
};

AllConditionTypes.parameters = {
    docs: {
        description: {
            story: 'Demonstrates different types of achievement conditions: number comparison, string equality, boolean check, and date comparison.',
        },
    },
};