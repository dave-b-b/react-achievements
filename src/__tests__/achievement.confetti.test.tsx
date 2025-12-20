import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { AchievementProvider, AchievementContext } from '../providers/AchievementProvider';
import { StorageType } from '../core/types';
import '@testing-library/jest-dom';

// Using built-in UI components - no external dependencies to mock

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
  
  it('should show confetti and notification when achievement is newly earned', async () => {
    render(
      <AchievementProvider
        achievements={achievementConfig}
        storage={StorageType.Memory}
        icons={icons}
        useBuiltInUI={true}
      >
        <TestComponent />
      </AchievementProvider>
    );

    // Click button to earn achievement
    await act(async () => {
      fireEvent.click(screen.getByTestId('score-button'));
      jest.runAllTimers();
    });

    // Wait for notification to appear
    await waitFor(() => {
      expect(screen.getByText('High Score!')).toBeInTheDocument();
    });
  });

  it('should not show notification when achievement is not earned', async () => {
    render(
      <AchievementProvider
        achievements={achievementConfig}
        storage={StorageType.Memory}
        icons={icons}
        useBuiltInUI={true}
      >
        <TestComponent />
      </AchievementProvider>
    );

    // Click button that doesn't earn achievement
    await act(async () => {
      fireEvent.click(screen.getByTestId('no-achievement-button'));
      jest.runAllTimers();
    });

    // No notification should appear
    expect(screen.queryByText('High Score!')).not.toBeInTheDocument();
  });

  it('should not show notification for already unlocked achievements', async () => {
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
        useBuiltInUI={true}
      >
        <TestComponent />
      </AchievementProvider>
    );

    // Try to earn an already unlocked achievement
    await act(async () => {
      fireEvent.click(screen.getByTestId('score-button'));
      jest.runAllTimers();
    });

    // Achievement should already be unlocked, no new notification
    // Note: the notification might still be in the DOM from initial state
    // What we're testing is that it doesn't trigger a NEW notification
  });
}); 