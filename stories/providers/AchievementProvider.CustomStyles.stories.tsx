import React, { useEffect } from 'react';
import { StoryFn, Meta } from '@storybook/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import achievementReducer from '../../src/redux/achievementSlice';
import notificationReducer from '../../src/redux/notificationSlice';
import { AchievementProvider } from '../../src';
import { AchievementConfiguration, AchievementMetricValue } from '../../src/types';
import { useAchievement } from '../../src/hooks/useAchievement';
import { defaultAchievementIcons } from '../../src/assets/defaultIcons';
import { defaultStyles } from '../../src/defaultStyles';

export default {
    title: 'Providers/AchievementProvider/Customization',
    component: AchievementProvider,
} as Meta;

const customStyles = {
    achievementModal: {
        ...defaultStyles.achievementModal,
        overlay: {
            ...defaultStyles.achievementModal.overlay,
            backgroundColor: 'rgba(25, 25, 25, 0.9)',
        },
        content: {
            ...defaultStyles.achievementModal.content,
            backgroundColor: '#2a2a2a',
            color: '#ffffff',
            border: '2px solid #ffd700',
            boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)',
        },
        title: {
            ...defaultStyles.achievementModal.title,
            color: '#ffd700',
            fontFamily: 'Georgia, serif',
            textTransform: 'uppercase',
        },
        description: {
            ...defaultStyles.achievementModal.description,
            color: '#cccccc',
            fontStyle: 'italic',
        },
        button: {
            ...defaultStyles.achievementModal.button,
            backgroundColor: '#ffd700',
            color: '#000000',
            fontWeight: 'bold',
            padding: '12px 24px',
            borderRadius: '25px',
            transition: 'all 0.3s ease',
            ':hover': {
                backgroundColor: '#ffed4a',
                transform: 'scale(1.05)',
            },
        },
    },
    badgesModal: {
        ...defaultStyles.badgesModal,
        overlay: {
            ...defaultStyles.badgesModal.overlay,
            backgroundColor: 'rgba(25, 25, 25, 0.9)',
        },
        content: {
            ...defaultStyles.badgesModal.content,
            backgroundColor: '#2a2a2a',
            color: '#ffffff',
            border: '2px solid #ffd700',
        },
        title: {
            ...defaultStyles.badgesModal.title,
            color: '#ffd700',
            textAlign: 'center',
            fontSize: '28px',
        },
        badgeContainer: {
            ...defaultStyles.badgesModal.badgeContainer,
            gap: '20px',
            padding: '20px',
        },
        badge: {
            ...defaultStyles.badgesModal.badge,
            backgroundColor: '#1a1a1a',
            padding: '15px',
            borderRadius: '10px',
            transition: 'transform 0.3s ease',
            ':hover': {
                transform: 'scale(1.05)',
            },
        },
        badgeTitle: {
            ...defaultStyles.badgesModal.badgeTitle,
            color: '#ffd700',
            marginTop: '10px',
        },
    },
    badgesButton: {
        ...defaultStyles.badgesButton,
        backgroundColor: '#ffd700',
        color: '#000000',
        fontWeight: 'bold',
        padding: '12px 24px',
        borderRadius: '25px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease',
        ':hover': {
            backgroundColor: '#ffed4a',
            transform: 'scale(1.05)',
        },
    },
};

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
                storageKey={'custom-styles-test'}
                styles={customStyles}
            >
                <TestComponent />
            </AchievementProvider>
        </Provider>
    );
};

const TestComponent = () => {
    const { updateMetrics } = useAchievement();

    useEffect(() => {
        // Trigger an achievement immediately to show styled modal
        updateMetrics({
            score: [100]
        });
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            <h2>Style Customization Demo</h2>
            <p>This story demonstrates comprehensive style customization for all components.</p>
            <ul>
                <li>Custom achievement notification modal styling</li>
                <li>Custom badges modal styling</li>
                <li>Custom badges button styling</li>
            </ul>
            <p>Click the badges button to see the styled badges modal.</p>
        </div>
    );
};

export const CustomizedStyles = Template.bind({});
CustomizedStyles.args = {
    config: {
        score: [
            {
                isConditionMet: (value: AchievementMetricValue) => 
                    typeof value === 'number' && value >= 100,
                achievementDetails: {
                    achievementId: 'style_test',
                    achievementTitle: 'Style Master',
                    achievementDescription: 'Witness the custom styling in action!',
                    achievementIconKey: 'star'
                }
            }
        ]
    }
};

CustomizedStyles.parameters = {
    docs: {
        description: {
            story: 'Demonstrates comprehensive style customization for all components in the achievement system.',
        },
    },
};