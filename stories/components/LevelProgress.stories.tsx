import _React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { LevelProgress } from '../../src/core/components/LevelProgress';

const meta: Meta<typeof LevelProgress> = {
  title: 'Components/LevelProgress',
  component: LevelProgress,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    theme: {
      control: 'select',
      options: ['modern', 'minimal', 'gamified'],
    },
    showValues: {
      control: 'boolean',
    },
    showPercent: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof LevelProgress>;

export const Default: Story = {
  args: {
    level: 3,
    currentXP: 120,
    nextLevelXP: 200,
  },
};

export const MinimalTheme: Story = {
  args: {
    level: 8,
    currentXP: 480,
    nextLevelXP: 800,
    theme: 'minimal',
  },
};

export const GamifiedTheme: Story = {
  args: {
    level: 12,
    currentXP: 920,
    nextLevelXP: 1200,
    theme: 'gamified',
  },
};

export const CustomStyles: Story = {
  args: {
    level: 5,
    currentXP: 75,
    nextLevelXP: 150,
    showPercent: true,
    styles: {
      container: {
        background: '#121212',
        color: '#f5f5f5',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      },
      progressTrack: {
        backgroundColor: 'rgba(255,255,255,0.15)',
      },
      progressBar: {
        backgroundColor: '#ff6b6b',
      },
      progressText: {
        fontWeight: 600,
      },
    },
  },
};

export const NoValues: Story = {
  args: {
    level: 'Master',
    currentXP: 40,
    nextLevelXP: 100,
    showValues: false,
    showPercent: false,
  },
};
