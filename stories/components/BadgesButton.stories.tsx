import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { BadgesButton } from '../../src/core/components/BadgesButton';
import { AchievementDetails } from '../../src/core/types';

const meta: Meta<typeof BadgesButton> = {
  title: 'Components/BadgesButton',
  component: BadgesButton,
  parameters: {
    layout: 'fullscreen',
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