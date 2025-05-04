import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AchievementProvider } from '../../src/providers/AchievementProvider';
import { StorageType } from '../../src/core/types';
import { BadgesButton } from '../../src/core/components/BadgesButton';
import { BadgesModal } from '../../src/core/components/BadgesModal';
import { useAchievements } from '../../src/hooks/useAchievements';

/**
 * The `AchievementProvider` is the core component of the React Achievements system.
 * It manages achievement state, handles achievement unlocking logic, and provides
 * the achievement context to child components.
 * 
 * ## Features
 * - Manages achievement state and unlocking logic
 * - Supports multiple storage types (Memory, Local)
 * - Provides achievement context to child components
 * - Handles achievement notifications and animations
 * - Supports custom achievement icons
 */
const meta: Meta<typeof AchievementProvider> = {
  title: 'Providers/AchievementProvider',
  component: AchievementProvider,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A provider component that manages achievement state and unlocking logic in your React application.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    achievements: {
      description: 'Configuration object defining achievements and their unlock conditions',
      control: 'object'
    },
    storage: {
      description: 'Storage type for persisting achievement state',
      control: 'select',
      options: [StorageType.Memory, StorageType.Local],
      table: {
        defaultValue: { summary: StorageType.Memory }
      }
    },
    icons: {
      description: 'Custom icons mapping for achievements',
      control: 'object'
    },
    children: {
      description: 'Child components that will have access to the achievement context',
      control: false
    }
  }
};

export default meta;

// Achievement configuration for the demo
const achievementConfig = {
  score: [{
    isConditionMet: (value: number) => value >= 100,
    achievementDetails: {
      achievementId: 'score_100',
      achievementTitle: 'Century!',
      achievementDescription: 'Score 100 points',
      achievementIconKey: 'trophy'
    }
  }, {
    isConditionMet: (value: number) => value >= 200,
    achievementDetails: {
      achievementId: 'score_200',
      achievementTitle: 'Double Century!',
      achievementDescription: 'Score 200 points',
      achievementIconKey: 'star'
    }
  }],
  login: [{
    isConditionMet: (value: boolean) => value === true,
    achievementDetails: {
      achievementId: 'first_login',
      achievementTitle: 'First Login',
      achievementDescription: 'You logged in for the first time',
      achievementIconKey: 'login'
    }
  }]
};

const icons = {
  trophy: '🏆',
  star: '⭐',
  login: '🔑',
  default: '🎖️'
};

// Demo component showcasing achievement functionality
const DemoComponent = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const { update, achievements, reset, getState } = useAchievements();

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Achievement Demo</h1>
      <p>Click the buttons below to trigger achievements:</p>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button 
          onClick={() => update({ score: 100 })}
          style={{ padding: '10px 15px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Score 100 points
        </button>
        
        <button 
          onClick={() => update({ score: 200 })}
          style={{ padding: '10px 15px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Score 200 points
        </button>
        
        <button 
          onClick={() => update({ login: true })}
          style={{ padding: '10px 15px', backgroundColor: '#9C27B0', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Login
        </button>
        
        <button 
          onClick={reset}
          style={{ padding: '10px 15px', backgroundColor: '#F44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Reset Achievements
        </button>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Unlocked Achievements: {achievements.unlocked.length}</h2>
        <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
          {JSON.stringify(achievements.unlocked, null, 2)}
        </pre>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Current Metrics:</h2>
        <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
          {JSON.stringify(getState().metrics, null, 2)}
        </pre>
      </div>
      
      <BadgesButton 
        position="bottom-right" 
        onClick={() => setIsModalOpen(true)}
        unlockedAchievements={achievements.unlocked.map(id => {
          let achievement;
          Object.values(achievementConfig).forEach(categoryAchievements => {
            categoryAchievements.forEach(a => {
              if (a.achievementDetails.achievementId === id) {
                achievement = a.achievementDetails;
              }
            });
          });
          return achievement;
        }).filter(Boolean)}
      />
      
      <BadgesModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        achievements={achievements.unlocked.map(id => {
          let achievement;
          Object.values(achievementConfig).forEach(categoryAchievements => {
            categoryAchievements.forEach(a => {
              if (a.achievementDetails.achievementId === id) {
                achievement = a.achievementDetails;
              }
            });
          });
          return achievement;
        }).filter(Boolean)}
        icons={icons}
      />
    </div>
  );
};

/**
 * The Memory Storage variant stores achievement data in memory.
 * This is useful for:
 * - Development and testing
 * - Temporary achievement tracking
 * - Scenarios where persistence isn't needed
 */
export const WithMemoryStorage: StoryObj<typeof AchievementProvider> = {
  args: {
    achievements: achievementConfig,
    storage: StorageType.Memory,
    icons: icons
  },
  render: (args) => (
    <AchievementProvider {...args}>
      <DemoComponent />
    </AchievementProvider>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Uses in-memory storage for achievement data. Data is cleared when the page refreshes.'
      }
    }
  }
};

/**
 * The Local Storage variant persists achievement data in the browser.
 * This is useful for:
 * - Persisting achievements between sessions
 * - Production applications
 * - Long-term achievement tracking
 */
export const WithLocalStorage: StoryObj<typeof AchievementProvider> = {
  args: {
    achievements: achievementConfig,
    storage: StorageType.Local,
    icons: icons
  },
  render: (args) => (
    <AchievementProvider {...args}>
      <DemoComponent />
    </AchievementProvider>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Uses localStorage to persist achievement data between page refreshes and browser sessions.'
      }
    }
  }
};

/**
 * Example of using custom achievement configuration.
 * Demonstrates how to:
 * - Define custom achievement conditions
 * - Structure achievement details
 * - Set up achievement categories
 */
export const CustomAchievements: StoryObj<typeof AchievementProvider> = {
  args: {
    achievements: {
      customMetric: [{
        isConditionMet: (value: number) => value > 10,
        achievementDetails: {
          achievementId: 'custom_achievement',
          achievementTitle: 'Custom Achievement',
          achievementDescription: 'Unlocked through custom logic',
          achievementIconKey: 'star'
        }
      }]
    },
    storage: StorageType.Memory,
    icons: icons
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows how to configure custom achievements with unique unlock conditions.'
      }
    }
  }
}; 