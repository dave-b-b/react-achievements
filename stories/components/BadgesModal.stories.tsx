import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Modal from 'react-modal';
import { BadgesModal } from '../../src/core/components/BadgesModal';
import { AchievementDetails } from '../../src/core/types';
import { defaultAchievementIcons } from '../../src/core/icons/defaultIcons';

// Set up Modal for Storybook environment
if (typeof window !== 'undefined') {
  Modal.setAppElement('#storybook-root');
}

/**
 * The BadgesModal component displays a list of achievements in a modal dialog.
 * It supports custom styling and icons, making it highly customizable for different themes and designs.
 * 
 * @component
 * @example
 * ```tsx
 * <BadgesModal
 *   isOpen={true}
 *   onClose={() => {}}
 *   achievements={achievements}
 *   icons={customIcons}
 * />
 * ```
 */
const meta: Meta<typeof BadgesModal> = {
  title: 'Components/BadgesModal',
  component: BadgesModal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A modal component that displays user achievements with customizable styling and icons.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    isOpen: {
      description: 'Controls whether the modal is visible',
      control: 'boolean'
    },
    onClose: {
      description: 'Callback function called when the modal should close'
    },
    achievements: {
      description: 'Array of achievement objects to display'
    },
    icons: {
      description: 'Custom icons mapping for achievement display'
    },
    styles: {
      description: 'Custom styles to override default modal styling'
    }
  }
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
    icons: defaultAchievementIcons, // Explicitly set default icons
  },
};

export const WithCustomIcons: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    achievements: sampleAchievements,
    icons: customIcons,
  },
};

export const Empty: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    achievements: [],
    icons: defaultAchievementIcons,
  },
};

export const CustomStyling: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    achievements: sampleAchievements,
    icons: defaultAchievementIcons,
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