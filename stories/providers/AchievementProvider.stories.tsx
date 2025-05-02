import React, { useState } from 'react';
import { StoryFn, Meta } from '@storybook/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import achievementsReducer from '../../src/redux/achievementSlice';
import notificationReducer from '../../src/redux/notificationSlice';
import { AchievementProvider } from '../../src/providers/AchievementProvider';
import { defaultStyles } from '../../src/defaultStyles';
import { defaultAchievementIcons } from '../../src/assets/defaultIcons';

export default {
    title: 'Providers/AchievementProvider',
    component: AchievementProvider,
} as Meta;

const createTestStore = () => {
    return configureStore({
        reducer: {
            achievements: achievementsReducer,
            notifications: notificationReducer
        }
    });
};

const DemoApp = () => {
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(1);

    const handleUpdateScore = () => {
        setScore(prev => prev + 10);
        window.dispatchEvent(
            new CustomEvent('updateMetrics', {
                detail: { score: [score + 10] }
            })
        );
    };

    const handleLevelUp = () => {
        setLevel(prev => prev + 1);
        window.dispatchEvent(
            new CustomEvent('updateMetrics', {
                detail: { level: [level + 1] }
            })
        );
    };

    const handleReset = () => {
        window.dispatchEvent(new CustomEvent('resetAchievements'));
        setScore(0);
        setLevel(1);
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Achievement Demo</h2>
            <div style={{ marginBottom: '20px' }}>
                <p>Score: {score}</p>
                <p>Level: {level}</p>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button onClick={handleUpdateScore}>Add Score (+10)</button>
                <button onClick={handleLevelUp}>Level Up</button>
                <button onClick={handleReset}>Reset Achievements</button>
            </div>
        </div>
    );
};

const Template: StoryFn<typeof AchievementProvider> = (args) => {
    const store = createTestStore();
    
    return (
        <Provider store={store}>
            <AchievementProvider {...args}>
                <DemoApp />
            </AchievementProvider>
        </Provider>
    );
};

export const Default = Template.bind({});
Default.args = {
    config: {
        score: [
            {
                isConditionMet: (value, state) => value >= 50,
                achievementDetails: {
                    achievementId: 'score-50',
                    achievementTitle: 'Halfway There!',
                    achievementDescription: 'Reach a score of 50',
                    achievementIconKey: 'star'
                }
            },
            {
                isConditionMet: (value, state) => value >= 100,
                achievementDetails: {
                    achievementId: 'score-100',
                    achievementTitle: 'Century Club',
                    achievementDescription: 'Reach a score of 100',
                    achievementIconKey: 'trophy'
                }
            }
        ],
        level: [
            {
                isConditionMet: (value, state) => value >= 5,
                achievementDetails: {
                    achievementId: 'level-5',
                    achievementTitle: 'Level 5 Master',
                    achievementDescription: 'Reach level 5',
                    achievementIconKey: 'crown'
                }
            }
        ]
    },
    storageKey: 'storybook-achievements',
    badgesButtonPosition: 'top-right',
    styles: defaultStyles,
    icons: defaultAchievementIcons
};

export const CustomStyles = Template.bind({});
CustomStyles.args = {
    ...Default.args,
    styles: {
        badgesButton: {
            ...defaultStyles.badgesButton,
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
        },
        badgesModal: {
            ...defaultStyles.badgesModal,
            backgroundColor: '#f0f0f0',
            borderRadius: '10px',
            padding: '20px'
        }
    }
}; 