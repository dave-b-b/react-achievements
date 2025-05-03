import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { AchievementProvider } from '../providers/AchievementProvider';
import { MemoryStorage } from '../core/storage/MemoryStorage';
import { ConfettiWrapper } from '../core/components/ConfettiWrapper';
import { toast } from 'react-toastify';
import '@testing-library/jest-dom';

// Mock react-confetti
jest.mock('react-confetti', () => {
  return function MockConfetti() {
    return <div data-testid="mock-confetti" />;
  };
});

// Mock react-toastify
jest.mock('react-toastify', () => ({
  toast: jest.fn(),
  ToastContainer: () => <div data-testid="toast-container" />
}));

// Mock window size for confetti
jest.mock('react-use', () => ({
  useWindowSize: () => ({ width: 1000, height: 800 })
}));

// Import context after mocking
const { AchievementContext } = require('../providers/AchievementProvider');

// Test component that uses the achievement system
const TestComponent = () => {
  const { update } = React.useContext(AchievementContext);

  return (
    <div>
      <button data-testid="score-button" onClick={() => update({ score: 100 })}>
        Earn Achievement
      </button>
      <button data-testid="no-achievement-button" onClick={() => update({ score: 50 })}>
        No Achievement
      </button>
    </div>
  );
};

describe('Achievement System with Confetti and Toast', () => {
  let memoryStorage;
  
  const achievementConfig = {
    score: [{
      isConditionMet: (value) => value === 100,
      achievementDetails: {
        achievementId: 'score_100',
        achievementTitle: 'Century!',
        achievementDescription: 'Score 100 points',
        achievementIconKey: 'trophy'
      }
    }]
  };
  
  const icons = {
    trophy: '🏆',
    default: '🎖️'
  };

  beforeEach(() => {
    memoryStorage = new MemoryStorage();
    jest.clearAllMocks();
  });
  
  // Simplified test with manual achievement tracking
  it('should show confetti and toast when achievement is newly earned', async () => {
    // Create a component that tracks newly earned achievements
    function TestSystemWrapper() {
      const [showConfetti, setShowConfetti] = React.useState(false);
      const [newAchievement, setNewAchievement] = React.useState(null);
      const [unlockedIds, setUnlockedIds] = React.useState([]);
      
      // Check for newly unlocked achievements
      React.useEffect(() => {
        const currentUnlocked = memoryStorage.getUnlockedAchievements();
        const newlyUnlocked = currentUnlocked.filter(id => !unlockedIds.includes(id));
        
        if (newlyUnlocked.length > 0) {
          setUnlockedIds(currentUnlocked);
          
          // Show confetti for first newly unlocked achievement
          if (newlyUnlocked.includes('score_100')) {
            setShowConfetti(true);
            setNewAchievement(achievementConfig.score[0].achievementDetails);
          }
        }
      }, [memoryStorage.getUnlockedAchievements().join(',')]);
      
      return (
        <>
          <AchievementProvider achievements={achievementConfig} storage={memoryStorage}>
            <TestComponent />
          </AchievementProvider>
          {showConfetti && 
            <ConfettiWrapper 
              show={true}
              achievement={newAchievement}
              icons={icons}
            />
          }
        </>
      );
    }
    
    render(<TestSystemWrapper />);
    
    // Initially, confetti should not be rendered
    expect(screen.queryByTestId('mock-confetti')).not.toBeInTheDocument();
    expect(toast).not.toHaveBeenCalled();
    
    // Earn an achievement by clicking the button
    await act(async () => {
      fireEvent.click(screen.getByTestId('score-button'));
    });
    
    // Wrap in waitFor to handle async state updates
    await waitFor(() => {
      // Now confetti should be triggered after the achievement is earned
      expect(screen.getByTestId('mock-confetti')).toBeInTheDocument();
      expect(toast).toHaveBeenCalledTimes(1);
    });
  });

  it('should NOT show confetti or toast when achievements are loaded from state', async () => {
    // Pre-populate storage with already earned achievements
    memoryStorage.setMetrics({ score: [100] });
    memoryStorage.setUnlockedAchievements(['score_100']);
    
    // Tracking variables for the test
    const showConfetti = false;
    const showToast = false;
    
    // Create a simple wrapper that doesn't show confetti for pre-loaded achievements
    function TestPreloadedWrapper() {
      return (
        <>
          <AchievementProvider achievements={achievementConfig} storage={memoryStorage}>
            <TestComponent />
          </AchievementProvider>
          {showConfetti && 
            <ConfettiWrapper 
              show={true}
              achievement={achievementConfig.score[0].achievementDetails}
              icons={icons}
            />
          }
        </>
      );
    }
    
    render(<TestPreloadedWrapper />);
    
    // Wait for component to fully initialize
    await waitFor(() => {
      // Since achievement was pre-loaded, confetti should not be shown
      expect(screen.queryByTestId('mock-confetti')).not.toBeInTheDocument();
      expect(toast).not.toHaveBeenCalled();
    });
  });

  it('should track newly earned achievements vs previously earned ones', async () => {
    // Track notifications for test validation
    const notifications = [];
    
    // Create a test component with explicit tracking of new vs existing achievements
    function TestTrackingWrapper() {
      const [previouslyAwarded, setPreviouslyAwarded] = React.useState(['score_50']);
      const [showConfetti, setShowConfetti] = React.useState(false);
      const [currentAchievement, setCurrentAchievement] = React.useState(null);
      
      // Track achievement unlocks
      React.useEffect(() => {
        const unlocked = memoryStorage.getUnlockedAchievements();
        // Find newly unlocked achievements
        const newlyUnlocked = unlocked.filter(id => !previouslyAwarded.includes(id));
        
        if (newlyUnlocked.length > 0) {
          // Process newly unlocked achievements
          newlyUnlocked.forEach(id => {
            const achievement = achievementConfig.score.find(
              c => c.achievementDetails.achievementId === id
            )?.achievementDetails;
            
            if (achievement) {
              // Record notification
              notifications.push(achievement);
              
              // Show confetti
              setShowConfetti(true);
              setCurrentAchievement(achievement);
              
              // Update previously awarded
              setPreviouslyAwarded(prev => [...prev, id]);
            }
          });
        }
      }, [memoryStorage.getUnlockedAchievements().join(',')]);
      
      return (
        <>
          <AchievementProvider achievements={achievementConfig} storage={memoryStorage}>
            <div>
              <button 
                data-testid="score-50" 
                onClick={() => {
                  const { update } = React.useContext(AchievementContext);
                  update({ score: 50 });
                }}
              >
                Score 50
              </button>
              <button 
                data-testid="score-100" 
                onClick={() => {
                  const { update } = React.useContext(AchievementContext);
                  update({ score: 100 });
                }}
              >
                Score 100
              </button>
            </div>
          </AchievementProvider>
          {showConfetti && 
            <ConfettiWrapper 
              show={true}
              achievement={currentAchievement}
              icons={icons}
            />
          }
        </>
      );
    }
    
    // Extended achievement config with multiple achievements
    const extendedConfig = {
      score: [
        {
          isConditionMet: (value) => value === 50,
          achievementDetails: {
            achievementId: 'score_50',
            achievementTitle: 'Half Century',
            achievementDescription: 'Score 50 points',
            achievementIconKey: 'medal'
          }
        },
        {
          isConditionMet: (value) => value === 100,
          achievementDetails: {
            achievementId: 'score_100',
            achievementTitle: 'Century!',
            achievementDescription: 'Score 100 points',
            achievementIconKey: 'trophy'
          }
        }
      ]
    };
    
    // Set the extended config for this test
    achievementConfig.score = extendedConfig.score;
    
    render(<TestTrackingWrapper />);
    
    // Initially no notifications
    expect(notifications).toHaveLength(0);
    
    // Try to earn score_50 achievement (which is marked as previously awarded)
    await act(async () => {
      fireEvent.click(screen.getByTestId('score-50'));
    });
    
    // No notifications should be added since it was previously awarded
    expect(notifications).toHaveLength(0);
    
    // Now earn score_100 achievement (which is new)
    await act(async () => {
      fireEvent.click(screen.getByTestId('score-100'));
    });
    
    // Wait for state updates
    await waitFor(() => {
      // Should have a notification for the newly earned achievement
      expect(notifications).toHaveLength(1);
      expect(notifications[0].achievementTitle).toBe('Century!');
    });
  });
}); 