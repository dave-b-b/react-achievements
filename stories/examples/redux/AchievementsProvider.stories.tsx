import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ReduxAchievementsProvider } from './AchievementsProvider';
import { useAchievements, BadgesButton, BadgesModal, defaultAchievementIcons } from '../../../src';
import { useDispatch, useSelector } from 'react-redux';
import { resetAchievements } from './store';
import type { RootState } from './store';

const meta: Meta<typeof ReduxAchievementsProvider> = {
  title: 'Examples/Redux',
  component: ReduxAchievementsProvider,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Example implementation using Redux for managing achievements state.'
      }
    }
  },
  tags: ['autodocs'],
};

export default meta;

// Demo component showcasing achievement functionality
const DemoComponent = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const { update, achievements, reset, getState } = useAchievements();
  const dispatch = useDispatch();
  
  // Get achievement details directly from Redux store
  const unlockedAchievementDetails = useSelector((state: RootState) => 
    state.achievements.unlockedAchievements
  );

  const handleReset = () => {
    reset();
    dispatch(resetAchievements());
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Achievement Demo (Redux)</h1>
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
        unlockedAchievements={unlockedAchievementDetails}
      />
      
      <BadgesModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        achievements={unlockedAchievementDetails}
        icons={{
          trophy: defaultAchievementIcons.trophy,
          login: '⭐',
          default: defaultAchievementIcons.default
        }}
      />
    </div>
  );
};

export const Default: StoryObj<typeof ReduxAchievementsProvider> = {
  render: () => (
    <ReduxAchievementsProvider>
      <DemoComponent />
    </ReduxAchievementsProvider>
  )
}; 