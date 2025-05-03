import React, { useState, useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AchievementProvider, AchievementContext } from '../../src/providers/AchievementProvider';
import { StorageType } from '../../src/core/types';
import { BadgesButton } from '../../src/core/components/BadgesButton';
import { BadgesModal } from '../../src/core/components/BadgesModal';
import { ConfettiWrapper } from '../../src/core/components/ConfettiWrapper';
import { toast } from 'react-toastify';

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
  // Track which achievements we've already shown notifications for
  const [notifiedAchievements, setNotifiedAchievements] = useState<Set<string>>(new Set());
  // Track if we're ready to process achievements
  const [isReady, setIsReady] = useState(false);

  // Get the achievement context
  const achievementContext = React.useContext(AchievementContext);

  if (!achievementContext) {
    return <div>Achievement context not found</div>;
  }

  const { update, achievements, reset, getState } = achievementContext;

  // Handle initial load to synchronize with unlocked achievements
  useEffect(() => {
    if (!isReady) {
      setPreviousUnlocked(achievements.unlocked);
      // Mark all existing achievements as notified
      setNotifiedAchievements(new Set(achievements.unlocked));
      setIsReady(true);
    }
  }, [achievements.unlocked, isReady]);

  // Check for newly unlocked achievements
  useEffect(() => {
    if (!isReady) return;
    
    const currentUnlocked = achievements.unlocked;
    // Find achievements that are newly unlocked and haven't been notified yet
    const newlyUnlocked = currentUnlocked.filter(id => 
      !previousUnlocked.includes(id) && !notifiedAchievements.has(id)
    );
    
    if (newlyUnlocked.length > 0) {
      setPreviousUnlocked(currentUnlocked);
      
      // Find the first new achievement's details
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
        // Only show for new achievements
        setNewAchievement(achievement);
        setShowConfetti(true);
        
        // Mark this achievement as notified
        setNotifiedAchievements(prev => new Set([...prev, achievementId]));
        
        // Hide confetti after delay
        setTimeout(() => {
          setShowConfetti(false);
          setNewAchievement(null);
        }, 3000);
      }
    }
  }, [achievements.unlocked, previousUnlocked, notifiedAchievements, isReady]);

  // Handle reset
  const handleReset = () => {
    // Clear the achievements
    reset();
    
    // Also clear our local tracking
    setPreviousUnlocked([]);
    setNotifiedAchievements(new Set());
    setShowConfetti(false);
    setNewAchievement(null);
    
    // Dismiss any active toasts
    toast.dismiss();
    
    // Let the user know achievements have been reset
    toast.info("All achievements have been reset", {
      position: "top-right",
      autoClose: 2000,
      toastId: "achievements-reset" // Prevent duplicates
    });
  };

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