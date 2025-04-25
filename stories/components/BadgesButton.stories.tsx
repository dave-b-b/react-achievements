import React from 'react';
import { StoryFn, Meta } from '@storybook/react';
import BadgesButton from '../../src/components/BadgesButton';
import { AchievementDetails } from '../../src/types';
import { defaultStyles } from '../../src/defaultStyles';
import { defaultAchievementIcons } from '../../src/assets/defaultIcons';

export default {
    title: 'Components/BadgesButton',
    component: BadgesButton,
} as Meta;

const sampleAchievements: AchievementDetails[] = [
    {
        achievementId: 'test1',
        achievementTitle: 'Test Achievement 1',
        achievementDescription: 'Description 1',
        achievementIconKey: 'star'
    }
];

const Template: StoryFn<{
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    onClick: () => void;
    unlockedAchievements: AchievementDetails[];
    icons?: Record<string, string>;
}> = (args) => (
    <div style={{ width: '100%', height: '400px', position: 'relative', border: '1px dashed #ccc' }}>
        <BadgesButton {...args} styles={defaultStyles.badgesButton} />
    </div>
);

// Test each position
export const TopLeft = Template.bind({});
TopLeft.args = {
    position: 'top-left',
    onClick: () => {},
    unlockedAchievements: sampleAchievements,
    icons: defaultAchievementIcons
};

export const TopRight = Template.bind({});
TopRight.args = {
    position: 'top-right',
    onClick: () => {},
    unlockedAchievements: sampleAchievements,
    icons: defaultAchievementIcons
};

export const BottomLeft = Template.bind({});
BottomLeft.args = {
    position: 'bottom-left',
    onClick: () => {},
    unlockedAchievements: sampleAchievements,
    icons: defaultAchievementIcons
};

export const BottomRight = Template.bind({});
BottomRight.args = {
    position: 'bottom-right',
    onClick: () => {},
    unlockedAchievements: sampleAchievements,
    icons: defaultAchievementIcons
};

// Test with no achievements
export const NoAchievements = Template.bind({});
NoAchievements.args = {
    position: 'top-right',
    onClick: () => {},
    unlockedAchievements: [],
    icons: defaultAchievementIcons
};

// Test with missing icon key
export const MissingIconKey = Template.bind({});
MissingIconKey.args = {
    position: 'top-right',
    onClick: () => {},
    unlockedAchievements: [
        {
            achievementId: 'test1',
            achievementTitle: 'Missing Icon Key',
            achievementDescription: 'Testing missing icon key'
        }
    ],
    icons: defaultAchievementIcons
};

// Test with undefined icons
export const UndefinedIcons = Template.bind({});
UndefinedIcons.args = {
    position: 'top-right',
    onClick: () => {},
    unlockedAchievements: sampleAchievements
};

// Test with empty icons object
export const EmptyIcons = Template.bind({});
EmptyIcons.args = {
    position: 'top-right',
    onClick: () => {},
    unlockedAchievements: sampleAchievements,
    icons: {}
};