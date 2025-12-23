import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Modal from 'react-modal';
import { BadgesButtonWithModal } from '../../src/core/components/BadgesButtonWithModal';
import { BadgesButton } from '../../src/core/components/BadgesButton';
import { BadgesModal } from '../../src/core/components/BadgesModal';
import { AchievementDetails, AchievementWithStatus } from '../../src/core/types';
import { defaultAchievementIcons } from '../../src/core/icons/defaultIcons';

// Set up Modal for Storybook environment
if (typeof window !== 'undefined') {
  Modal.setAppElement('#storybook-root');
}

/**
 * The BadgesButtonWithModal component combines BadgesButton and BadgesModal
 * with internal state management for a simplified API.
 *
 * This component is perfect for the common use case where you just want to
 * display achievements without managing modal state yourself.
 *
 * For advanced scenarios requiring multiple triggers or custom state management,
 * use BadgesButton and BadgesModal separately.
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
  title: 'Components/BadgesButtonWithModal',
  component: BadgesButtonWithModal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
A convenience component that combines BadgesButton and BadgesModal with internal state management.

**When to use:**
- Simple achievement display (90% of use cases)
- You don't need custom modal state management
- One button triggers one modal

**When NOT to use (use separate components instead):**
- Multiple triggers for the same modal (nav bar + shortcuts)
- Custom modal state management (Redux, Zustand, etc.)
- Complex modal interactions or animations
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

/**
 * Default usage - simplest possible implementation.
 * Just pass unlocked achievements and it works!
 */
export const Default: Story = {
  args: {
    unlockedAchievements: sampleUnlockedAchievements,
  },
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
  },
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
  },
};

/**
 * Position the button in different corners (fixed placement).
 */
export const TopRight: Story = {
  args: {
    unlockedAchievements: sampleUnlockedAchievements,
    position: 'top-right',
  },
};

/**
 * Inline mode - perfect for navigation bars, drawers, and sidebars.
 * No fixed positioning, flows with your layout.
 */
export const InlineMode: Story = {
  args: {
    unlockedAchievements: sampleUnlockedAchievements,
    placement: 'inline',
  },
  decorators: [
    (Story) => (
      <div style={{
        width: '250px',
        background: '#2d2d2d',
        borderRadius: '8px',
        padding: '12px'
      }}>
        <Story />
      </div>
    )
  ]
};

/**
 * Different themes for different app styles.
 */
export const GamifiedTheme: Story = {
  args: {
    unlockedAchievements: sampleUnlockedAchievements,
    theme: 'gamified',
  },
};

/**
 * Custom styling for button and modal.
 */
export const CustomStyling: Story = {
  args: {
    unlockedAchievements: sampleUnlockedAchievements,
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
};

/**
 * Comparison: BadgesButtonWithModal vs Manual Approach
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
          />
          <BadgesModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            achievements={sampleUnlockedAchievements}
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
        />
      </div>
    );

    return (
      <div style={{ display: 'flex', gap: '40px', flexDirection: 'column' }}>
        <SimplifiedApproach />
        <ManualApproach />
      </div>
    );
  },
};
