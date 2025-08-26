import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ConfettiWrapper } from '../../src/core/components/ConfettiWrapper';
import { defaultAchievementIcons } from '../../src/core/icons/defaultIcons';

const meta: Meta<typeof ConfettiWrapper> = {
  title: 'Components/ConfettiWrapper',
  component: ConfettiWrapper,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ConfettiWrapper>;

export const Active: Story = {
  args: {
    show: true,
    // The component will automatically use defaultAchievementIcons
  },
};

export const Hidden: Story = {
  args: {
    show: false,
  },
};

export const WithDefaultIcons: Story = {
  args: {
    show: true,
    // Using a key from defaultAchievementIcons
  },
};

export const WithCustomIcons: Story = {
  args: {
    show: true,
    // Custom icon that's not in the defaults
  },
};

// Informational story to show how defaultAchievementIcons are used
export const DefaultIconsInfo: Story = {
  render: () => (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Default Achievement Icons</h2>
      <p>This component automatically uses the <code>defaultAchievementIcons</code> from the library. 
         You can reference any of these icons by using their key in the <code>achievementIconKey</code> property.</p>
      
      <p>You can also provide custom icons that will override or extend the defaults.</p>
      
      <h3>Example Icons:</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
        {Object.entries(defaultAchievementIcons).slice(0, 20).map(([key, icon]) => (
          <div key={key} style={{ 
            padding: '10px', 
            borderRadius: '8px', 
            background: '#f5f5f5',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{ fontSize: '24px' }}>{icon}</span>
            <span style={{ fontSize: '14px' }}>{key}</span>
          </div>
        ))}
      </div>
      <p><i>View all icons in the defaultAchievementIcons documentation.</i></p>
    </div>
  )
}; 