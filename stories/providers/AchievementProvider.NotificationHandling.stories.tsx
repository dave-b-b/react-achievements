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
    title: 'Providers/AchievementProvider/NotificationHandling',
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
                storageKey={'notification-test'}
            >
                <TestComponent />
            </AchievementProvider>
        </Provider>
    );
};

const TestComponent = () => {
    const { updateMetrics } = useAchievement();

    const testSequentialNotifications = () => {
        // Trigger multiple achievements in quick succession
        updateMetrics({
            quick_achievements: [1, 2, 3, 4, 5]
        });
    };

    const testDelayedNotifications = async () => {
        // Test notifications with delays between them
        updateMetrics({ achievement1: [1] });
        setTimeout(() => updateMetrics({ achievement2: [1] }), 2000);
        setTimeout(() => updateMetrics({ achievement3: [1] }), 4000);
    };

    const testConcurrentNotifications = () => {
        // Test multiple achievements unlocking simultaneously
        updateMetrics({
            concurrent1: [1],
            concurrent2: [1],
            concurrent3: [1]
        });
    };

    // Add test for rapid achievement unlocks
    const testRapidUnlocks = () => {
        // Trigger 5 achievements in rapid succession
        for (let i = 0; i < 5; i++) {
            updateMetrics({ rapid_achievements: [i + 1] });
        }
    };

    // Add stress test
    const testHighVolume = () => {
        // Update 20 different metrics simultaneously
        const updates: Record<string, number[]> = {};
        for (let i = 0; i < 20; i++) {
            updates[`high_volume_${i}`] = [1];
        }
        updateMetrics(updates);
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Notification Handling Test</h2>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button 
                    onClick={testSequentialNotifications}
                    style={{
                        padding: '10px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Test Sequential Notifications
                </button>
                
                <button 
                    onClick={testDelayedNotifications}
                    style={{
                        padding: '10px',
                        backgroundColor: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Test Delayed Notifications
                </button>
                
                <button 
                    onClick={testConcurrentNotifications}
                    style={{
                        padding: '10px',
                        backgroundColor: '#FF9800',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Test Concurrent Notifications
                </button>

                <button 
                    onClick={testRapidUnlocks}
                    style={{
                        padding: '10px',
                        backgroundColor: '#673AB7',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Test Rapid Unlocks
                </button>
                
                <button 
                    onClick={testHighVolume}
                    style={{
                        padding: '10px',
                        backgroundColor: '#607D8B',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Test High Volume
                </button>
            </div>
        </div>
    );
};

export const NotificationTests = Template.bind({});
NotificationTests.args = {
    config: {
        quick_achievements: [
            {
                isConditionMet: (value: AchievementMetricValue) => 
                    typeof value === 'number' && value >= 1,
                achievementDetails: {
                    achievementId: 'quick1',
                    achievementTitle: 'Quick Achievement 1',
                    achievementDescription: 'Testing sequential notifications',
                    achievementIconKey: 'star'
                }
            },
            {
                isConditionMet: (value: AchievementMetricValue) => 
                    typeof value === 'number' && value >= 2,
                achievementDetails: {
                    achievementId: 'quick2',
                    achievementTitle: 'Quick Achievement 2',
                    achievementDescription: 'Testing sequential notifications',
                    achievementIconKey: 'star'
                }
            }
        ],
        achievement1: [
            {
                isConditionMet: (value: AchievementMetricValue) => 
                    typeof value === 'number' && value >= 1,
                achievementDetails: {
                    achievementId: 'delayed1',
                    achievementTitle: 'Delayed Achievement 1',
                    achievementDescription: 'Testing delayed notifications',
                    achievementIconKey: 'clock'
                }
            }
        ],
        achievement2: [
            {
                isConditionMet: (value: AchievementMetricValue) => 
                    typeof value === 'number' && value >= 1,
                achievementDetails: {
                    achievementId: 'delayed2',
                    achievementTitle: 'Delayed Achievement 2',
                    achievementDescription: 'Testing delayed notifications',
                    achievementIconKey: 'clock'
                }
            }
        ],
        achievement3: [
            {
                isConditionMet: (value: AchievementMetricValue) => 
                    typeof value === 'number' && value >= 1,
                achievementDetails: {
                    achievementId: 'delayed3',
                    achievementTitle: 'Delayed Achievement 3',
                    achievementDescription: 'Testing delayed notifications',
                    achievementIconKey: 'clock'
                }
            }
        ],
        concurrent1: [
            {
                isConditionMet: (value: AchievementMetricValue) => 
                    typeof value === 'number' && value >= 1,
                achievementDetails: {
                    achievementId: 'concurrent1',
                    achievementTitle: 'Concurrent Achievement 1',
                    achievementDescription: 'Testing concurrent notifications',
                    achievementIconKey: 'flash'
                }
            }
        ],
        concurrent2: [
            {
                isConditionMet: (value: AchievementMetricValue) => 
                    typeof value === 'number' && value >= 1,
                achievementDetails: {
                    achievementId: 'concurrent2',
                    achievementTitle: 'Concurrent Achievement 2',
                    achievementDescription: 'Testing concurrent notifications',
                    achievementIconKey: 'flash'
                }
            }
        ],
        concurrent3: [
            {
                isConditionMet: (value: AchievementMetricValue) => 
                    typeof value === 'number' && value >= 1,
                achievementDetails: {
                    achievementId: 'concurrent3',
                    achievementTitle: 'Concurrent Achievement 3',
                    achievementDescription: 'Testing concurrent notifications',
                    achievementIconKey: 'flash'
                }
            }
        ],
        ...Array.from({ length: 20 }, (_, i) => ({
            [`high_volume_${i}`]: [{
                isConditionMet: (value: AchievementMetricValue) => 
                    typeof value === 'number' && value >= 1,
                achievementDetails: {
                    achievementId: `volume_${i}`,
                    achievementTitle: `Volume Achievement ${i + 1}`,
                    achievementDescription: 'Testing high volume notifications',
                    achievementIconKey: 'flash'
                }
            }]
        })).reduce((acc, curr) => ({ ...acc, ...curr }), {})
    }
};