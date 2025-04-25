import React, { useEffect } from 'react';
import { StoryFn, Meta } from '@storybook/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import achievementReducer from '../../src/redux/achievementSlice';
import { AchievementProvider } from '../../src';
import { AchievementConfiguration, AchievementMetricValue, InitialAchievementMetrics } from '../../src/types';
import { useAchievement } from '../../src/hooks/useAchievement';
import { defaultAchievementIcons } from '../../src/assets/defaultIcons';

export default {
    title: 'Providers/AchievementProvider/PreviousSavedState',
    component: AchievementProvider,
} as Meta;

const Template: StoryFn<{ config: AchievementConfiguration; initialState?: InitialAchievementMetrics }> = (args) => {
    const store = configureStore({
        reducer: {
            achievements: achievementReducer
        }
    });

    // Pre-populate localStorage with test data
    useEffect(() => {
        const testData = {
            metrics: {
                visits: [5],
                points: [150],
                achievements: [3]
            },
            unlockedAchievements: ['previous_visitor', 'point_collector']
        };
        localStorage.setItem('previous-state-test', JSON.stringify(testData));
    }, []);

    return (
        <Provider store={store}>
            <AchievementProvider
                config={args.config}
                initialState={args.initialState || {
                    previouslyAwardedAchievements: ['early_adopter', 'beta_tester']
                }}
                icons={defaultAchievementIcons}
                storageKey={'previous-state-test'}
            >
                <StateLoadTester />
            </AchievementProvider>
        </Provider>
    );
};

const StateLoadTester = () => {
    const { metrics, updateMetrics, unlockedAchievements, resetStorage } = useAchievement();

    const addNewAchievements = () => {
        updateMetrics({
            visits: [10],
            points: [200],
            achievements: [5]
        });
    };

    const clearAndReload = () => {
        resetStorage();
        window.location.reload();
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Previous State Test</h2>
            <div style={{ marginBottom: '20px' }}>
                <h3>Currently Loaded State:</h3>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <div>
                        <h4>Metrics:</h4>
                        <pre>{JSON.stringify(metrics, null, 2)}</pre>
                    </div>
                    <div>
                        <h4>Unlocked Achievements:</h4>
                        <pre>{JSON.stringify(unlockedAchievements, null, 2)}</pre>
                    </div>
                </div>
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                    onClick={addNewAchievements}
                    style={{
                        padding: '10px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Add New Achievements
                </button>
                
                <button 
                    onClick={clearAndReload}
                    style={{
                        padding: '10px',
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Clear & Reload
                </button>
            </div>
        </div>
    );
};

export const TestPreviousSavedState = Template.bind({});
TestPreviousSavedState.args = {
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
        clicks: 2,
        views: 4,
        points: 50,
        previouslyAwardedAchievements: ['view_watcher_bronze'] // 'view_watcher_bronze' should not trigger again
    }
};

TestPreviousSavedState.parameters = {
    docs: {
        description: {
            story: 'Tests loading and merging of previously saved state from localStorage and previously awarded achievements.',
        },
    },
};