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
    title: 'Providers/AchievementProvider/LocalStorage',
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
                storageKey={'persistence-test'}
            >
                <PersistenceTest />
            </AchievementProvider>
        </Provider>
    );
};

const PersistenceTest = () => {
    const { updateMetrics, metrics, unlockedAchievements, resetStorage } = useAchievement();
    
    const incrementScore = () => {
        updateMetrics({
            score: [(metrics.score?.[0] as number || 0) + 10]
        });
    };

    const clearStorage = () => {
        resetStorage();
        window.location.reload();
    };

    // Display current storage state
    const storageData = localStorage.getItem('persistence-test');
    const parsedStorage = storageData ? JSON.parse(storageData) : null;

    return (
        <div style={{ padding: '20px' }}>
            <h2>Local Storage Persistence Demo</h2>
            <div style={{ marginBottom: '20px' }}>
                <p>Current Score: {metrics.score?.[0] || 0}</p>
                <p>Unlocked Achievements: {unlockedAchievements.length}</p>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button onClick={incrementScore}>
                    Increment Score (+10)
                </button>
                <button onClick={() => window.location.reload()}>
                    Reload Page
                </button>
                <button onClick={clearStorage} style={{ backgroundColor: '#ff4444', color: 'white' }}>
                    Clear Storage & Reload
                </button>
            </div>

            <div style={{ marginTop: '20px' }}>
                <h3>Current Local Storage Contents:</h3>
                <pre style={{ 
                    background: '#f5f5f5', 
                    padding: '10px', 
                    borderRadius: '4px',
                    maxHeight: '200px',
                    overflow: 'auto'
                }}>
                    {JSON.stringify(parsedStorage, null, 2)}
                </pre>
            </div>

            <div style={{ marginTop: '20px' }}>
                <h3>Instructions:</h3>
                <ol>
                    <li>Click "Increment Score" a few times to unlock achievements</li>
                    <li>Click "Reload Page" to see that your progress persists</li>
                    <li>Click "Clear Storage & Reload" to reset everything</li>
                </ol>
            </div>
        </div>
    );
};

export const PersistenceDemo = Template.bind({});
PersistenceDemo.args = {
    config: {
        score: [
            {
                isConditionMet: (value: AchievementMetricValue) => 
                    typeof value === 'number' && value >= 20,
                achievementDetails: {
                    achievementId: 'score_20',
                    achievementTitle: 'Score 20',
                    achievementDescription: 'Reached a score of 20!',
                    achievementIconKey: 'bronze'
                }
            },
            {
                isConditionMet: (value: AchievementMetricValue) => 
                    typeof value === 'number' && value >= 50,
                achievementDetails: {
                    achievementId: 'score_50',
                    achievementTitle: 'Score 50',
                    achievementDescription: 'Reached a score of 50!',
                    achievementIconKey: 'silver'
                }
            },
            {
                isConditionMet: (value: AchievementMetricValue) => 
                    typeof value === 'number' && value >= 100,
                achievementDetails: {
                    achievementId: 'score_100',
                    achievementTitle: 'Score 100',
                    achievementDescription: 'Reached a score of 100!',
                    achievementIconKey: 'gold'
                }
            }
        ]
    }
};

PersistenceDemo.parameters = {
    docs: {
        description: {
            story: 'Demonstrates how achievement progress persists across page reloads using local storage.',
        },
    },
};