import React from 'react';
import { StoryFn, Meta } from '@storybook/react';
import BadgesModal from '../../src/components/BadgesModal';
import { defaultStyles } from '../../src/defaultStyles';
import { defaultAchievementIcons } from '../../src/assets/defaultIcons';

export default {
    title: 'Modals/BadgesModal',
    component: BadgesModal,
} as Meta;

const Template: StoryFn = (args) => (
    <BadgesModal {...args} styles={defaultStyles.badgesModal} />
);

export const Empty = Template.bind({});
Empty.args = {
    isOpen: true,
    achievements: [],
    onClose: () => console.log('Modal closed'),
};

export const WithAchievements = Template.bind({});
WithAchievements.args = {
    isOpen: true,
    achievements: [
        {
            achievementId: 'achievement1',
            achievementTitle: 'First Achievement',
            achievementDescription: 'You did it!',
            achievementIconKey: 'trophy'
        },
        {
            achievementId: 'achievement2',
            achievementTitle: 'Second Achievement',
            achievementDescription: 'You did it again!',
            achievementIconKey: 'star'
        },
        {
            achievementId: 'achievement3',
            achievementTitle: 'Third Achievement',
            achievementDescription: 'Hat trick!',
            achievementIconKey: 'crown'
        }
    ],
    onClose: () => console.log('Modal closed'),
    icons: defaultAchievementIcons
};

export const WithCustomStyles = Template.bind({});
WithCustomStyles.args = {
    isOpen: true,
    achievements: WithAchievements.args.achievements,
    onClose: () => console.log('Modal closed'),
    icons: defaultAchievementIcons,
    styles: {
        ...defaultStyles.badgesModal,
        overlay: {
            ...defaultStyles.badgesModal.overlay,
            backgroundColor: 'rgba(0, 0, 0, 0.8)'
        },
        content: {
            ...defaultStyles.badgesModal.content,
            backgroundColor: '#2a2a2a',
            color: '#ffffff'
        },
        title: {
            ...defaultStyles.badgesModal.title,
            color: '#ffd700'
        },
        badge: {
            ...defaultStyles.badgesModal.badge,
            backgroundColor: '#1a1a1a',
            padding: '15px',
            borderRadius: '8px'
        }
    }
};