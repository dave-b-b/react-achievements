import React from 'react';
import { StoryFn, Meta } from '@storybook/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import achievementReducer from '../../src/redux/achievementSlice';
import notificationReducer from '../../src/redux/notificationSlice';
import { AchievementProvider } from '../../src';
import { AchievementConfiguration } from '../../src/types';
import { useAchievement } from '../../src/hooks/useAchievement';
import { defaultAchievementIcons } from '../../src/assets/defaultIcons';

export default {
    title: 'Providers/AchievementProvider/Icons',
    component: AchievementProvider,
} as Meta;

// Group icons by category for better organization
const iconCategories = {
    'Progress & Milestones': ['levelUp', 'questComplete', 'monsterDefeated', 'itemCollected', 'challengeCompleted', 'milestoneReached', 'firstStep', 'newBeginnings', 'breakthrough', 'growth'],
    'Social & Engagement': ['shared', 'liked', 'commented', 'followed', 'invited', 'communityMember', 'supporter', 'connected', 'participant', 'influencer'],
    'Time & Activity': ['activeDay', 'activeWeek', 'activeMonth', 'earlyBird', 'nightOwl', 'streak', 'dedicated', 'punctual', 'consistent', 'marathon'],
    'Creativity & Skill': ['artist', 'writer', 'innovator', 'creator', 'expert', 'master', 'pioneer', 'performer', 'thinker', 'explorer'],
    'Achievement Types': ['bronze', 'silver', 'gold', 'diamond', 'legendary', 'epic', 'rare', 'common', 'special', 'hidden'],
    'Numbers & Counters': ['one', 'ten', 'hundred', 'thousand'],
    'Actions & Interactions': ['clicked', 'used', 'found', 'built', 'solved', 'discovered', 'unlocked', 'upgraded', 'repaired', 'defended'],
    'Placeholders': ['default', 'loading', 'error', 'success', 'failure'],
    'Miscellaneous': ['trophy', 'star', 'flag', 'puzzle', 'gem', 'crown', 'medal', 'ribbon', 'badge', 'shield']
};

// Create achievements for each icon
const generateIconConfig = () => {
    const config: AchievementConfiguration = {};
    Object.entries(iconCategories).forEach(([category, icons]) => {
        icons.forEach(icon => {
            config[`trigger_${icon}`] = [{
                isConditionMet: (value: boolean) => value === true,
                achievementDetails: {
                    achievementId: `icon_${icon}`,
                    achievementTitle: `${icon.charAt(0).toUpperCase() + icon.slice(1)} Icon`,
                    achievementDescription: `This achievement uses the ${icon} icon`,
                    achievementIconKey: icon
                }
            }];
        });
    });
    return config;
};

const Template: StoryFn = () => {
    const store = configureStore({
        reducer: {
            achievements: achievementReducer,
            notifications: notificationReducer,
        },
    });

    const customIcons = {
        ...defaultAchievementIcons,
        customIcon1: '🌈',
        customIcon2: 'https://example.com/custom-icon.png'
    };

    return (
        <Provider store={store}>
            <AchievementProvider
                config={generateIconConfig()}
                initialState={{}}
                icons={customIcons}
                storageKey={'icons-showcase'}
            >
                <IconShowcase />
            </AchievementProvider>
        </Provider>
    );
};

const IconShowcase = () => {
    const { updateMetrics } = useAchievement();

    const triggerAchievement = (icon: string) => {
        updateMetrics({
            [`trigger_${icon}`]: [true]
        });
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Achievement Icons Showcase</h1>
            <p>Click an icon to see it in an achievement notification.</p>
            
            {Object.entries(iconCategories).map(([category, icons]) => (
                <div key={category} style={{ marginBottom: '30px' }}>
                    <h2>{category}</h2>
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                        gap: '10px' 
                    }}>
                        {icons.map(icon => (
                            <button
                                key={icon}
                                onClick={() => triggerAchievement(icon)}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    padding: '10px',
                                    border: '1px solid #ccc',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                <span style={{ fontSize: '24px' }}>
                                    {defaultAchievementIcons[icon]}
                                </span>
                                <span style={{ marginTop: '5px', fontSize: '12px' }}>
                                    {icon}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            ))}

            <div style={{ marginTop: '30px' }}>
                <h2>Custom Icons</h2>
                <p>You can also add your own custom icons:</p>
                <pre>
                    {`
const customIcons = {
    ...defaultAchievementIcons,
    customIcon1: '🌈',
    customIcon2: 'https://example.com/custom-icon.png'
};
                    `}
                </pre>
            </div>
        </div>
    );
};

export const IconsShowcase = Template.bind({});
IconsShowcase.parameters = {
    docs: {
        description: {
            story: 'Showcases all built-in icons categorized by type and demonstrates how to use custom icons.',
        },
    },
};