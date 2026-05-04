import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { BadgesModal } from '../../src';
import type { AchievementDetails, AchievementWithStatus } from '../../src';

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
  title: 'Compatibility/BadgesModal',
  component: BadgesModal,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '`BadgesModal` is a deprecated v3 compatibility wrapper. Use `AchievementsModal` for new modal integrations, or `AchievementsWidget` when you want the trigger and modal together.'
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
type BadgesModalArgs = React.ComponentProps<typeof BadgesModal>;

const previewFrameStyles: React.CSSProperties = {
  position: 'relative',
  minHeight: '560px',
  overflow: 'hidden',
  background:
    'linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%)',
};

const getPreviewModalStyles = (
  styles: BadgesModalArgs['styles'] = {}
): BadgesModalArgs['styles'] => ({
  ...styles,
  overlay: {
    position: 'absolute',
    inset: 0,
    minHeight: '560px',
    padding: '32px',
    boxSizing: 'border-box',
    ...styles.overlay,
  },
  content: {
    maxHeight: 'calc(100% - 64px)',
    maxWidth: '560px',
    ...styles.content,
  },
});

const renderModalPreview = (args: BadgesModalArgs) => (
  <div style={previewFrameStyles}>
    <BadgesModal
      {...args}
      isOpen={true}
      styles={getPreviewModalStyles(args.styles)}
    />
  </div>
);

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

const legacyStoryIcons = {
  firstStep: '🚪',
  achievement: '🌟',
  writer: '✍️',
  community: '🤝',
  winner: '🏆',
};

const customIcons = {
  ...legacyStoryIcons,
  achievement: '🚀',
};

export const Default: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    achievements: sampleAchievements,
    icons: legacyStoryIcons,
  },
  render: renderModalPreview,
};

export const WithCustomIcons: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    achievements: sampleAchievements,
    icons: customIcons,
  },
  render: renderModalPreview,
};

export const Empty: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    achievements: [],
    icons: legacyStoryIcons,
  },
  render: renderModalPreview,
};

export const CustomStyling: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    achievements: sampleAchievements,
    icons: legacyStoryIcons,
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
  render: renderModalPreview,
};

// Sample achievements with unlock status for the new feature
const achievementsWithStatus: AchievementWithStatus[] = [
  {
    achievementId: '1',
    achievementTitle: 'First Login',
    achievementDescription: 'Logged in for the first time',
    achievementIconKey: 'firstStep',
    isUnlocked: true,
  },
  {
    achievementId: '2',
    achievementTitle: 'Profile Complete',
    achievementDescription: 'Completed your profile information',
    achievementIconKey: 'achievement',
    isUnlocked: true,
  },
  {
    achievementId: '3',
    achievementTitle: 'First Post',
    achievementDescription: 'Created your first post',
    achievementIconKey: 'writer',
    isUnlocked: false,
  },
  {
    achievementId: '4',
    achievementTitle: 'Social Butterfly',
    achievementDescription: 'Follow 10 other users',
    achievementIconKey: 'community',
    isUnlocked: false,
  },
  {
    achievementId: '5',
    achievementTitle: 'Master Contributor',
    achievementDescription: 'Create 100 posts',
    achievementIconKey: 'winner',
    isUnlocked: false,
  },
];

/**
 * Shows all achievements including locked ones.
 * Locked achievements are displayed with reduced opacity and a lock icon.
 */
export const ShowAllAchievements: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    achievements: [],
    showAllAchievements: true,
    allAchievements: achievementsWithStatus,
    icons: legacyStoryIcons,
  },
  render: renderModalPreview,
};

/**
 * Shows all achievements with unlock condition hints.
 * This helps users understand what they need to do to unlock each achievement.
 */
export const WithUnlockConditions: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    achievements: [],
    showAllAchievements: true,
    showUnlockConditions: true,
    allAchievements: achievementsWithStatus,
    icons: legacyStoryIcons,
  },
  render: renderModalPreview,
}; 
