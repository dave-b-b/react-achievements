import React from 'react';
import { StoryFn, Meta } from '@storybook/react';
import BadgesModal from '../../src/components/BadgesModal';
import { AchievementDetails } from '../../src/types';
import { defaultStyles } from '../../src/defaultStyles';
import { defaultAchievementIcons } from '../../src/assets/defaultIcons';

export default {
    title: 'Modals/BadgesModal',
    component: BadgesModal,
} as Meta;

const Template: StoryFn<{
    isOpen: boolean;
    achievements: AchievementDetails[];
    onClose: () => void;
    icons?: Record<string, string>;
}> = (args) => <BadgesModal {...args} styles={defaultStyles.badgesModal} />;

// Test with no achievements
export const NoAchievements = Template.bind({});
NoAchievements.args = {
    isOpen: true,
    achievements: [],
    onClose: () => {},
    icons: defaultAchievementIcons
};

// Test with missing icons
export const MissingIcons = Template.bind({});
MissingIcons.args = {
    isOpen: true,
    achievements: [
        {
            achievementId: 'test1',
            achievementTitle: 'Missing Icon Test',
            achievementDescription: 'Testing missing icon handling',
            achievementIconKey: 'nonexistent_icon'
        }
    ],
    onClose: () => {},
    icons: {}
};

// Test with undefined icons prop
export const UndefinedIcons = Template.bind({});
UndefinedIcons.args = {
    isOpen: true,
    achievements: [
        {
            achievementId: 'test1',
            achievementTitle: 'No Icons Prop Test',
            achievementDescription: 'Testing undefined icons prop',
            achievementIconKey: 'star'
        }
    ],
    onClose: () => {}
};

// Test modal closed state
export const ModalClosed = Template.bind({});
ModalClosed.args = {
    isOpen: false,
    achievements: [
        {
            achievementId: 'test1',
            achievementTitle: 'Hidden Achievement',
            achievementDescription: 'This should not be visible',
            achievementIconKey: 'star'
        }
    ],
    onClose: () => {},
    icons: defaultAchievementIcons
};

// Test with long content
export const WithLongContent = Template.bind({});
WithLongContent.args = {
    isOpen: true,
    achievements: Array(20).fill(null).map((_, index) => ({
        achievementId: `test${index}`,
        achievementTitle: `Achievement ${index + 1}`,
        achievementDescription: 'Testing scroll behavior with many achievements',
        achievementIconKey: 'star'
    })),
    onClose: () => {},
    icons: defaultAchievementIcons
};

// Test with missing achievementIconKey
export const NoIconKey = Template.bind({});
NoIconKey.args = {
    isOpen: true,
    achievements: [
        {
            achievementId: 'test1',
            achievementTitle: 'No Icon Key',
            achievementDescription: 'Testing missing achievementIconKey'
        }
    ],
    onClose: () => {},
    icons: defaultAchievementIcons
};

// Test with extremely long achievement titles
export const LongTitles = Template.bind({});
LongTitles.args = {
    isOpen: true,
    achievements: [
        {
            achievementId: 'test1',
            achievementTitle: 'This is an extremely long achievement title that should test text wrapping and modal layout handling in extreme cases',
            achievementDescription: 'Testing long title handling',
            achievementIconKey: 'star'
        }
    ],
    onClose: () => {},
    icons: defaultAchievementIcons
};

// Test with special characters in titles
export const SpecialCharacters = Template.bind({});
SpecialCharacters.args = {
    isOpen: true,
    achievements: [
        {
            achievementId: 'test1',
            achievementTitle: '🎮 Special → Characters ←✨',
            achievementDescription: 'Testing special character handling',
            achievementIconKey: 'star'
        }
    ],
    onClose: () => {},
    icons: defaultAchievementIcons
};