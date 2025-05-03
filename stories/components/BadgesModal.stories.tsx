import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { BadgesModal } from '../../src/core/components/BadgesModal';
import { AchievementDetails } from '../../src/core/types';
import { defaultAchievementIcons } from '../../src/core/icons/defaultIcons';

const meta: Meta<typeof BadgesModal> = {
  title: 'Components/BadgesModal',
  component: BadgesModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof BadgesModal>;

const sampleAchievements: AchievementDetails[] = [
  {
    achievementId: '1',
    achievementTitle: 'First Login',
    achievementDescription: 'Logged in for the first time',
    achievementIconKey: 'firstStep',
  },
  {
    achievementId: '2',
    achievementTitle: 'Profile Complete',
    achievementDescription: 'Completed your profile information',
    achievementIconKey: 'achievement',
  },
  {
    achievementId: '3',
    achievementTitle: 'First Post',
    achievementDescription: 'Created your first post',
    achievementIconKey: 'writer',
  },
];

// Using the built-in defaultAchievementIcons for the story
// You can also define custom icons that override the defaults
const customIcons = {
  // Custom icons will take precedence over default icons with the same key
  achievement: '🌟', // Override the default icon for 'achievement'
  customIcon: '🚀', // Add a new icon not in the defaults
};

export const Default: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    achievements: sampleAchievements,
    // The component will automatically use defaultAchievementIcons, so no need to pass icons
  },
};

export const WithCustomIcons: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    achievements: sampleAchievements,
    // Custom icons will be merged with defaultAchievementIcons inside the component
    icons: customIcons,
  },
};

export const Empty: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    achievements: [],
  },
};

export const CustomStyling: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    achievements: sampleAchievements,
    icons: defaultIcons,
    styles: {
      overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
      },
      content: {
        background: '#121212',
        color: 'white',
        borderRadius: '16px',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)',
      },
      header: {
        borderBottom: '1px solid #333',
        paddingBottom: '16px',
      },
      achievementItem: {
        backgroundColor: '#1e1e1e',
        borderLeft: '4px solid #6200ea',
      },
      achievementTitle: {
        color: '#ffffff',
      },
      achievementDescription: {
        color: '#aaaaaa',
      },
    },
  },
}; 