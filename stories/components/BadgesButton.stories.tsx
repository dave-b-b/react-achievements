import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { BadgesButton } from '../../src';
import type { AchievementDetails } from '../../src';

const meta: Meta<typeof BadgesButton> = {
  title: 'Compatibility/BadgesButton',
  component: BadgesButton,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '`BadgesButton` is a deprecated v3 compatibility wrapper. Use `AchievementsWidget` for new app integrations.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    position: {
      control: 'select',
      options: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof BadgesButton>;

const sampleAchievements: AchievementDetails[] = [
  {
    achievementId: '1',
    achievementTitle: 'First Login',
    achievementDescription: 'Logged in for the first time',
  },
  {
    achievementId: '2',
    achievementTitle: 'Profile Complete',
    achievementDescription: 'Completed your profile information',
  },
];

export const TopLeft: Story = {
  args: {
    position: 'top-left',
    unlockedAchievements: sampleAchievements,
    onClick: () => alert('Button clicked!'),
  },
};

export const TopRight: Story = {
  args: {
    position: 'top-right',
    unlockedAchievements: sampleAchievements,
    onClick: () => alert('Button clicked!'),
  },
};

export const BottomLeft: Story = {
  args: {
    position: 'bottom-left',
    unlockedAchievements: sampleAchievements,
    onClick: () => alert('Button clicked!'),
  },
};

export const BottomRight: Story = {
  args: {
    position: 'bottom-right',
    unlockedAchievements: sampleAchievements,
    onClick: () => alert('Button clicked!'),
  },
};

export const CustomStyled: Story = {
  args: {
    position: 'top-right',
    unlockedAchievements: sampleAchievements,
    onClick: () => alert('Button clicked!'),
    styles: {
      backgroundColor: '#6200ea',
      borderRadius: '4px',
      padding: '12px 24px',
      fontSize: '18px',
    },
  },
};

export const NoAchievements: Story = {
  args: {
    position: 'top-right',
    unlockedAchievements: [],
    onClick: () => alert('Button clicked!'),
  },
};

export const InlineDrawerItem: Story = {
  args: {
    placement: 'inline',
    unlockedAchievements: sampleAchievements,
    onClick: () => alert('Button clicked!'),
    styles: {
      color: '#e5e7eb',
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: '6px',
      font: 'inherit',
    },
  },
  decorators: [
    (Story) => (
      <div
        style={{
          width: '260px',
          minHeight: '360px',
          background: '#111827',
          color: '#ffffff',
          padding: '18px',
          display: 'grid',
          alignContent: 'start',
          gap: '8px',
        }}
      >
        <strong style={{ padding: '10px 12px' }}>Legacy Drawer</strong>
        <span style={{ padding: '10px 12px', color: '#d1d5db' }}>Dashboard</span>
        <span style={{ padding: '10px 12px', color: '#d1d5db' }}>Settings</span>
        <Story />
      </div>
    ),
  ],
};
