import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { BadgesButtonWithModal, BadgesButton, BadgesModal } from '../../src';
import type { AchievementDetails, AchievementWithStatus } from '../../src';

/**
 * Compatibility story for the deprecated BadgesButtonWithModal wrapper.
 *
 * New v4 integrations should use AchievementsWidget, AchievementsModal, and
 * AchievementsList because they read provider state directly.
 *
 * @component
 * @example
 * ```tsx
 * <BadgesButtonWithModal
 *   unlockedAchievements={achievements.unlocked}
 * />
 * ```
 */
const meta: Meta<typeof BadgesButtonWithModal> = {
  title: 'Compatibility/BadgesButtonWithModal',
  component: BadgesButtonWithModal,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
A deprecated v3 compatibility component that combines BadgesButton and BadgesModal with internal state management.

For new app integrations, use AchievementsWidget. It reads provider state directly and supports fixed, inline, and custom trigger placements.

These stories exist so existing v3 users can compare compatibility behavior while migrating.
        `
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    unlockedAchievements: {
      description: 'Array of unlocked achievement objects to display'
    },
    position: {
      description: 'Position for fixed placement mode',
      control: 'select',
      options: ['top-left', 'top-right', 'bottom-left', 'bottom-right']
    },
    placement: {
      description: 'Placement mode: fixed (floating) or inline (for navigation)',
      control: 'select',
      options: ['fixed', 'inline']
    },
    showAllAchievements: {
      description: 'Show both locked and unlocked achievements',
      control: 'boolean'
    },
    showUnlockConditions: {
      description: 'Show hints on how to unlock locked achievements',
      control: 'boolean'
    },
    theme: {
      description: 'Theme name for styling',
      control: 'select',
      options: ['modern', 'minimal', 'gamified']
    }
  }
};

export default meta;
type Story = StoryObj<typeof BadgesButtonWithModal>;
type BadgesButtonWithModalArgs = React.ComponentProps<typeof BadgesButtonWithModal>;

const previewFrameStyles: React.CSSProperties = {
  position: 'relative',
  minHeight: '560px',
  overflow: 'hidden',
  padding: '24px',
  boxSizing: 'border-box',
  background:
    'linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%)',
};

const getPreviewModalStyles = (
  styles: BadgesButtonWithModalArgs['modalStyles'] = {}
): BadgesButtonWithModalArgs['modalStyles'] => ({
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

const getPreviewButtonStyles = (
  args: BadgesButtonWithModalArgs
): React.CSSProperties | undefined => {
  if (args.placement === 'inline') {
    return args.buttonStyles;
  }

  return {
    position: 'absolute',
    ...args.buttonStyles,
  };
};

const renderCompatibilityPreview = (args: BadgesButtonWithModalArgs) => (
  <div style={previewFrameStyles}>
    <BadgesButtonWithModal
      {...args}
      buttonStyles={getPreviewButtonStyles(args)}
      modalStyles={getPreviewModalStyles(args.modalStyles)}
    />
  </div>
);

const sampleUnlockedAchievements: AchievementDetails[] = [
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

const allAchievementsWithStatus: AchievementWithStatus[] = [
  ...sampleUnlockedAchievements.map(a => ({ ...a, isUnlocked: true })),
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

const legacyStoryIcons = {
  firstStep: '🚪',
  achievement: '🌟',
  writer: '✍️',
  community: '🤝',
  winner: '🏆',
};

/**
 * Default compatibility usage.
 */
export const Default: Story = {
  args: {
    unlockedAchievements: sampleUnlockedAchievements,
    icons: legacyStoryIcons,
  },
  render: renderCompatibilityPreview,
};

/**
 * Show all achievements including locked ones.
 * Great for motivating users by showing what's available.
 */
export const ShowAllAchievements: Story = {
  args: {
    unlockedAchievements: sampleUnlockedAchievements,
    showAllAchievements: true,
    allAchievements: allAchievementsWithStatus,
    icons: legacyStoryIcons,
  },
  render: renderCompatibilityPreview,
};

/**
 * Show unlock conditions to help users understand how to progress.
 */
export const WithUnlockConditions: Story = {
  args: {
    unlockedAchievements: sampleUnlockedAchievements,
    showAllAchievements: true,
    allAchievements: allAchievementsWithStatus,
    showUnlockConditions: true,
    icons: legacyStoryIcons,
  },
  render: renderCompatibilityPreview,
};

/**
 * Position the button in different corners (fixed placement).
 */
export const TopRight: Story = {
  args: {
    unlockedAchievements: sampleUnlockedAchievements,
    position: 'top-right',
    icons: legacyStoryIcons,
  },
  render: renderCompatibilityPreview,
};

/**
 * Inline compatibility mode for navigation bars, drawers, and sidebars.
 */
export const InlineMode: Story = {
  args: {
    unlockedAchievements: sampleUnlockedAchievements,
    placement: 'inline',
    icons: legacyStoryIcons,
  },
  render: (args) => (
    <div style={previewFrameStyles}>
      <div
        style={{
          width: '260px',
          background: '#2d2d2d',
          borderRadius: '8px',
          padding: '12px',
        }}
      >
        <BadgesButtonWithModal
          {...args}
          modalStyles={getPreviewModalStyles(args.modalStyles)}
        />
      </div>
    </div>
  ),
};

/**
 * Different themes for different app styles.
 */
export const GamifiedTheme: Story = {
  args: {
    unlockedAchievements: sampleUnlockedAchievements,
    theme: 'gamified',
    icons: legacyStoryIcons,
  },
  render: renderCompatibilityPreview,
};

/**
 * Custom styling for button and modal.
 */
export const CustomStyling: Story = {
  args: {
    unlockedAchievements: sampleUnlockedAchievements,
    icons: legacyStoryIcons,
    buttonStyles: {
      backgroundColor: '#6200ea',
      borderRadius: '8px',
      padding: '12px 24px',
    },
    modalStyles: {
      overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
      },
      content: {
        background: '#121212',
        color: 'white',
        borderRadius: '16px',
      },
    },
  },
  render: renderCompatibilityPreview,
};

/**
 * Compatibility comparison: combined wrapper vs separate legacy wrappers.
 *
 * This story shows the difference between using the combined component
 * and managing state manually with separate components.
 */
export const ComparisonWithManualApproach: Story = {
  render: () => {
    const ManualApproach = () => {
      const [isModalOpen, setIsModalOpen] = useState(false);

      return (
        <div>
          <h3>Manual Approach (Separate Components)</h3>
          <pre style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px' }}>
{`const [isModalOpen, setIsModalOpen] = useState(false);

<BadgesButton
  onClick={() => setIsModalOpen(true)}
  unlockedAchievements={achievements}
/>

<BadgesModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  achievements={achievements}
/>`}
          </pre>
          <BadgesButton
            onClick={() => setIsModalOpen(true)}
            unlockedAchievements={sampleUnlockedAchievements}
            placement="inline"
          />
          <BadgesModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            achievements={sampleUnlockedAchievements}
            icons={legacyStoryIcons}
            styles={getPreviewModalStyles()}
          />
        </div>
      );
    };

    const SimplifiedApproach = () => (
      <div>
        <h3>Simplified Approach (BadgesButtonWithModal)</h3>
        <pre style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px' }}>
{`<BadgesButtonWithModal
  unlockedAchievements={achievements}
/>`}
        </pre>
        <BadgesButtonWithModal
          unlockedAchievements={sampleUnlockedAchievements}
          placement="inline"
          icons={legacyStoryIcons}
          modalStyles={getPreviewModalStyles()}
        />
      </div>
    );

    return (
      <div style={previewFrameStyles}>
        <div style={{ display: 'flex', gap: '40px', flexDirection: 'column' }}>
          <SimplifiedApproach />
          <ManualApproach />
        </div>
      </div>
    );
  },
};
