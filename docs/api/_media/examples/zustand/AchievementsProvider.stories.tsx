import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useAchievements } from '../../../src';
import { useAchievementsStore } from './store';
import { ZustandAchievementsProvider } from './AchievementsProvider';
import { BadgesButton } from '../../../src/core/components/BadgesButton';
import { BadgesModal } from '../../../src/core/components/BadgesModal';

const meta: Meta<typeof ZustandAchievementsProvider> = {
  title: 'Examples/Zustand/AchievementsProvider',
  component: ZustandAchievementsProvider,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof ZustandAchievementsProvider>;

// Demo component showcasing achievement functionality
const DemoComponent = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const { update, reset, getState } = useAchievements();
  const { unlockedAchievements, reset: resetStore } = useAchievementsStore();

  const handleReset = () => {
    reset();
    resetStore();
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Achievement Demo (Zustand)</h1>
      <p>Click the buttons below to trigger achievements:</p>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button 
          onClick={() => update({ score: 100 })}
          style={{ padding: '10px 15px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Score 100 points
        </button>
        
        <button 
          onClick={() => update({ login: true })}
          style={{ padding: '10px 15px', backgroundColor: '#9C27B0', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Login
        </button>
        
        <button 
          onClick={handleReset}
          style={{ padding: '10px 15px', backgroundColor: '#F44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Reset Achievements
        </button>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Unlocked Achievements: {unlockedAchievements.length}</h2>
        <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
          {JSON.stringify(unlockedAchievements, null, 2)}
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
        unlockedAchievements={unlockedAchievements}
      />
      
      <BadgesModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        achievements={unlockedAchievements}
        icons={{
          trophy: '🏆',
          login: '🔑',
          default: '🎖️'
        }}
      />
    </div>
  );
};

export const Default: Story = {
  render: () => (
    <ZustandAchievementsProvider>
      <DemoComponent />
    </ZustandAchievementsProvider>
  ),
}; 