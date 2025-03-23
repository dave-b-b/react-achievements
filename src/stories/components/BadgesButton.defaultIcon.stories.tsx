// src/stories/components/BadgesButton.defaultIcon.stories.tsx
import React from 'react';
import { StoryFn, Meta } from '@storybook/react';
import BadgesButton from '../../components/BadgesButton';
import { AchievementDetails } from '../../types';
import { defaultAchievementIcons } from '../../assets/defaultIcons'
import {defaultStyles} from "../../defaultStyles";

export default {
    title: 'Components/BadgesButton',
    component: BadgesButton,
} as Meta;

const Template: StoryFn<{
    onClick: () => void;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    unlockedAchievements: AchievementDetails[];
    icon: React.ReactNode;
}> = (args) => <BadgesButton {...args} styles={defaultStyles.badgesButton} />;

export const WithDefaultIcon = Template.bind({});
WithDefaultIcon.args = {
    onClick: () => alert('Button Clicked!'),
    position: 'top-right',
    unlockedAchievements: [
        {
            achievementId: 'test1',
            achievementTitle: 'Test Achievement 1',
            achievementDescription: 'Description 1',
            achievementIconKey: 'default',
        },
    ],
    icon: defaultAchievementIcons.levelUp
};