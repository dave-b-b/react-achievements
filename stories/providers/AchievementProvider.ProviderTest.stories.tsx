import React from 'react';
import { StoryFn, Meta } from '@storybook/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import achievementReducer from '../../src/redux/achievementSlice';
import notificationReducer from '../../src/redux/notificationSlice';
import { AchievementProvider } from '../../src';
import {
    AchievementConfiguration,
    AchievementMetrics,
    AchievementDetails,
    InitialAchievementMetrics, AchievementMetricValue
} from '../../src/types';

// Create a test store
const createTestStore = (initialState = {}) => {
    return configureStore({
        reducer: {
            achievements: achievementReducer,
            notifications: notificationReducer
        },
        preloadedState: initialState
    });
};

// Define achievement details according to the correct interface
const firstVisitAchievement: AchievementDetails = {
    achievementId: 'first-visit',
    achievementTitle: 'Welcome!',
    achievementDescription: 'Visit the application for the first time',
    achievementIconKey: 'star'
};

// Simple test achievement configuration with proper types
const testAchievementConfig: AchievementConfiguration = {
    'pageVisits': [
        {
            isConditionMet: (value: AchievementMetricValue) => 
                typeof value === 'number' && value >= 1,
            achievementDetails: firstVisitAchievement
        }
    ]
};

// Initial metrics structure following the AchievementMetrics interface
const initialMetrics: AchievementMetrics = {
    'pageVisits': [1]
};

// Initial state for achievements following InitialAchievementMetrics interface
const initialAchievementState: InitialAchievementMetrics = {
    'pageVisits': 0
};

export default {
    title: 'Achievement System/AchievementProvider Test',
    component: AchievementProvider,
    parameters: {
        controls: { expanded: true },
        docs: {
            description: {
                component: 'This story tests the basic functionality of the AchievementProvider component.'
            }
        }
    },
    argTypes: {
        storageKey: {
            control: 'text',
            description: 'Key used for localStorage',
            defaultValue: 'test-achievements'
        },
        badgesButtonPosition: {
            control: 'select',
            options: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
            description: 'Position of the badges button',
            defaultValue: 'top-right'
        }
    }
} as Meta;

// Create a wrapper component for the story
interface ProviderTestProps {
    storageKey?: string;
    badgesButtonPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

const ProviderTest = (args: { storageKey?: "test-achievements" | undefined; badgesButtonPosition?: "top-right" | undefined; }) => {
    const { storageKey = 'test-achievements', badgesButtonPosition = 'top-right' } = args;

    const store = createTestStore({
        achievements: {
            metrics: initialMetrics,
            unlockedAchievements: [],
            config: testAchievementConfig
        },
        notifications: {
            notifications: []
        }
    });

    // State to track trigger count
    const [triggerCount, setTriggerCount] = React.useState(0);

    const triggerAchievement = () => {
        const event = new CustomEvent('achievement-trigger', {
            detail: {
                metric: 'pageVisits',
                value: 1
            }
        });
        window.dispatchEvent(event);
        setTriggerCount(prevCount => prevCount + 1);
    };

    return (
        <Provider store={store}>
            <AchievementProvider
                config={testAchievementConfig}
                initialState={initialAchievementState}
                storageKey={storageKey}
                badgesButtonPosition={badgesButtonPosition}
            >
                <div style={{
                    padding: '2rem',
                    border: '1px solid #eaeaea',
                    borderRadius: '8px',
                    maxWidth: '600px',
                    margin: '0 auto',
                    background: '#f9f9f9'
                }}>
                    <h1>Achievement Provider Test</h1>
                    <p>This story tests the basic functionality of the AchievementProvider component.</p>

                    {/* ... rest of the component's JSX ... */}
                    <div style={{ marginTop: '2rem' }}>
                        <div style={{ marginBottom: '1rem' }}>
                            <strong>Configuration:</strong>
                            <ul>
                                <li>Storage Key: {storageKey}</li>
                                <li>Badges Button Position: {badgesButtonPosition}</li>
                                <li>Achievement triggers: {triggerCount}</li>
                            </ul>
                        </div>

                        <div style={{
                            marginTop: '1rem',
                            padding: '1rem',
                            background: '#f0f0f0',
                            borderRadius: '4px',
                            fontFamily: 'monospace',
                            fontSize: '14px'
                        }}>
                            <strong>Achievement Configuration:</strong>
                            <pre>{JSON.stringify(testAchievementConfig, null, 2)}</pre>

                            <strong>Initial Metrics:</strong>
                            <pre>{JSON.stringify(initialMetrics, null, 2)}</pre>

                            <strong>Initial Achievement State:</strong>
                            <pre>{JSON.stringify(initialAchievementState, null, 2)}</pre>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                            <button
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    background: '#0070f3',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                                onClick={triggerAchievement}
                            >
                                Trigger Achievement
                            </button>

                            <button
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    background: '#f5f5f5',
                                    color: '#333',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                                onClick={() => {
                                    localStorage.removeItem(storageKey);
                                    window.location.reload();
                                }}
                            >
                                Reset Storage
                            </button>
                        </div>

                        <div style={{
                            marginTop: '2rem',
                            padding: '1rem',
                            border: '1px dashed #ccc',
                            borderRadius: '4px',
                            background: '#fff'
                        }}>
                            <h3>Test Instructions:</h3>
                            <ol>
                                <li>Click the "Trigger Achievement" button to simulate a page visit</li>
                                <li>Observe the achievement notification that appears</li>
                                <li>Click on the badges button to view unlocked achievements</li>
                                <li>Use the "Reset Storage" button to clear stored achievements and start fresh</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </AchievementProvider>
        </Provider>
    );
};

export const BasicProviderTest = (args: { storageKey?: "test-achievements" | undefined; badgesButtonPosition?: "top-right" | undefined; }) => (
    <ProviderTest {...args} />
);
BasicProviderTest.storyName = 'Basic Provider Test';