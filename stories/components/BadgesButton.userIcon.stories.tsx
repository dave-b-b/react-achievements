// src/stories/components/BadgesButton.userIcon.stories.tsx
import React from 'react';
import { StoryFn, Meta } from '@storybook/react';
import BadgesButton from '../../src/components/BadgesButton';
import { AchievementDetails } from '../../src/types';
import { defaultStyles } from '../../src/defaultStyles';
import MenuIcon from '@mui/icons-material/Menu';

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

export const WithUserIcon = Template.bind({});
WithUserIcon.args = {
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
    icon: <MenuIcon />,
};