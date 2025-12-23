import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ContextAchievementsProvider } from './AchievementsContext';
import { useAchievements, BadgesButton, BadgesModal, defaultAchievementIcons } from '../../../src/index';
import { AchievementDetails } from '../../../src/core/types';

const meta: Meta<typeof ContextAchievementsProvider> = {
  title: 'Examples/Context API',
  component: ContextAchievementsProvider,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Example implementation using React Context API for managing achievements state.'
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

  const achievementConfig = {
    score: [{
      achievementDetails: {
        achievementId: 'score_100',
        achievementTitle: 'Century!',
        achievementDescription: 'Score 100 points',
        achievementIconKey: 'trophy'
      }
    }],
    login: [{
      achievementDetails: {
        achievementId: 'first_login',
        achievementTitle: 'First Login',
        achievementDescription: 'You logged in for the first time',
        achievementIconKey: 'login'
      }
    }]
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Achievement Demo (Context API)</h1>
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
        position="top-right" 
        onClick={() => setIsModalOpen(true)}
        unlockedAchievements={achievements.unlocked.map(id => {
          let achievementDetails;
          Object.values(achievementConfig).forEach(categoryAchievements => {
            categoryAchievements.forEach(achievement => {
              if (achievement.achievementDetails.achievementId === id) {
                achievementDetails = achievement.achievementDetails;
              }
            });
          });
          return achievementDetails;
        }).filter(Boolean) as unknown as AchievementDetails[]}
      />
      
      <BadgesModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        achievements={achievements.unlocked.map(id => {
          let achievementDetails;
          Object.values(achievementConfig).forEach(categoryAchievements => {
            categoryAchievements.forEach(achievement => {
              if (achievement.achievementDetails.achievementId === id) {
                achievementDetails = achievement.achievementDetails;
              }
            });
          });
          return achievementDetails;
        }).filter(Boolean) as unknown as AchievementDetails[]}
        icons={{
          trophy: defaultAchievementIcons.trophy,
          login: '🏆',
          default: '🎖️'
        }}
      />
    </div>
  );
};

export const Default: StoryObj<typeof ContextAchievementsProvider> = {
  render: () => (
    <ContextAchievementsProvider>
      <DemoComponent />
    </ContextAchievementsProvider>
  )
}; 