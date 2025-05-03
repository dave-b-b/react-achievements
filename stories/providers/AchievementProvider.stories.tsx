import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AchievementProvider, AchievementContext } from '../../src/providers/AchievementProvider';
import { StorageType } from '../../src/core/types';
import { BadgesButton } from '../../src/core/components/BadgesButton';
import { BadgesModal } from '../../src/core/components/BadgesModal';
import { ConfettiWrapper } from '../../src/core/components/ConfettiWrapper';

// Define the meta information
const meta: Meta<typeof AchievementProvider> = {
  title: 'Providers/AchievementProvider',
  component: AchievementProvider,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;

// Define the achievement configuration for the stories
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

// Icons for the stories
const icons = {
  trophy: '🏆',
  star: '⭐',
  login: '🔑',
  default: '🎖️'
};

// Create a demo component that uses the achievement context
const DemoComponent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [newAchievement, setNewAchievement] = useState<any>(null);
  const [previousUnlocked, setPreviousUnlocked] = useState<string[]>([]);

  // Get the achievement context
  const achievementContext = React.useContext(AchievementContext);

  if (!achievementContext) {
    return <div>Achievement context not found</div>;
  }

  const { update, achievements, reset } = achievementContext;

  // Check for newly unlocked achievements
  const checkNewAchievements = () => {
    const currentUnlocked = achievements.unlocked;
    const newlyUnlocked = currentUnlocked.filter(id => !previousUnlocked.includes(id));
    
    if (newlyUnlocked.length > 0) {
      setPreviousUnlocked(currentUnlocked);
      
      // Find achievement details for the newly unlocked achievement
      const achievementId = newlyUnlocked[0];
      let achievement = null;
      
      // Search for the achievement in our config
      Object.values(achievementConfig).forEach(categoryAchievements => {
        categoryAchievements.forEach(a => {
          if (a.achievementDetails.achievementId === achievementId) {
            achievement = a.achievementDetails;
          }
        });
      });
      
      if (achievement) {
        setNewAchievement(achievement);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    }
  };

  // Effect to check for new achievements when the unlocked list changes
  React.useEffect(() => {
    checkNewAchievements();
  }, [achievements.unlocked.join(',')]);

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
      
      <ConfettiWrapper 
        show={showConfetti}
        achievement={newAchievement}
        icons={icons}
      />
    </div>
  );
};

// Story with Memory Storage
export const WithMemoryStorage = {
  render: () => (
    <AchievementProvider 
      achievements={achievementConfig} 
      storage={StorageType.Memory}
    >
      <DemoComponent />
    </AchievementProvider>
  ),
};

// Story with Local Storage
export const WithLocalStorage = {
  render: () => (
    <AchievementProvider 
      achievements={achievementConfig} 
      storage={StorageType.Local}
    >
      <DemoComponent />
    </AchievementProvider>
  ),
}; 