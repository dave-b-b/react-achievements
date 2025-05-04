import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { AchievementProvider, AchievementContext } from '../providers/AchievementProvider';
import { StorageType } from '../core/types';
import { toast } from 'react-toastify';
import '@testing-library/jest-dom';

// Mock react-confetti
jest.mock('react-confetti');

// Mock react-toastify
jest.mock('react-toastify');

// Mock ConfettiWrapper
jest.mock('../core/components/ConfettiWrapper', () => ({
  ConfettiWrapper: jest.fn(({ show }) => (show ? <div data-testid="mock-confetti" /> : null)),
}));

const TestComponent = () => {
  const context = React.useContext(AchievementContext);
  
  if (!context) {
    throw new Error('TestComponent must be used within an AchievementProvider');
  }
  
  const { update } = context;

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
  const achievementConfig = {
    score: [{
      isConditionMet: (value: any) => value >= 100,
      achievementDetails: {
        achievementId: 'score_100',
        achievementTitle: 'High Score!',
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
    jest.clearAllMocks();
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });
  
  it('should show confetti and toast when achievement is newly earned', async () => {
    render(
      <AchievementProvider
        achievements={achievementConfig}
        storage={StorageType.Memory}
        icons={icons}
      >
        <TestComponent />
      </AchievementProvider>
    );

    // Click button to earn achievement
    await act(async () => {
      fireEvent.click(screen.getByTestId('score-button'));
      jest.runAllTimers();
    });

    // Wait for confetti and toast to appear
    await waitFor(() => {
      expect(screen.getByTestId('mock-confetti')).toBeInTheDocument();
    });

    // Verify toast was called
    expect(toast.success).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        toastId: 'achievement-score_100'
      })
    );
  });

  it('should not show confetti or toast when achievement is not earned', async () => {
    render(
      <AchievementProvider
        achievements={achievementConfig}
        storage={StorageType.Memory}
        icons={icons}
      >
        <TestComponent />
      </AchievementProvider>
    );

    // Click button that doesn't earn achievement
    await act(async () => {
      fireEvent.click(screen.getByTestId('no-achievement-button'));
      jest.runAllTimers();
    });

    // No confetti or toast should appear
    expect(screen.queryByTestId('mock-confetti')).not.toBeInTheDocument();
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('should not show confetti or toast for already unlocked achievements', async () => {
    // Create storage with pre-unlocked achievement
    const storage = {
      getUnlockedAchievements: jest.fn().mockReturnValue(['score_100']),
      setUnlockedAchievements: jest.fn(),
      getMetrics: jest.fn().mockReturnValue({}),
      setMetrics: jest.fn(),
      clear: jest.fn(),
      getItem: jest.fn().mockReturnValue(JSON.stringify(['score_100'])),
      setItem: jest.fn()
    };

    render(
      <AchievementProvider
        achievements={achievementConfig}
        storage={storage}
        icons={icons}
      >
        <TestComponent />
      </AchievementProvider>
    );

    // Try to earn an already unlocked achievement
    await act(async () => {
      fireEvent.click(screen.getByTestId('score-button'));
      jest.runAllTimers();
    });

    // No confetti or toast for already unlocked achievement
    expect(screen.queryByTestId('mock-confetti')).not.toBeInTheDocument();
    expect(toast.success).not.toHaveBeenCalled();
  });
}); 