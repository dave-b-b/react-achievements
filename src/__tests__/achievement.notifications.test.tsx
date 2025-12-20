import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AchievementProvider, AchievementContext } from '../providers/AchievementProvider';
import { StorageType, AchievementConfiguration } from '../core/types';

// Using built-in UI components - no external dependencies to mock

// Simple achievement configuration for testing
const achievementConfig: AchievementConfiguration = {
  score: [{
    isConditionMet: (value: any) => (value as number) >= 100,
    achievementDetails: {
      achievementId: 'score_100',
      achievementTitle: 'High Score!',
      achievementDescription: 'Score 100 points',
      achievementIconKey: 'trophy'
    }
  }, {
    isConditionMet: (value: any) => (value as number) >= 200,
    achievementDetails: {
      achievementId: 'score_200',
      achievementTitle: 'Double Century',
      achievementDescription: 'Score 200 points',
      achievementIconKey: 'star'
    }
  }]
};

// Test component that uses the achievement context
const TestComponent = () => {
  const context = React.useContext(AchievementContext);
  
  if (!context) {
    throw new Error('TestComponent must be used within an AchievementProvider');
  }
  
  const { update, achievements, reset } = context;
  
  return (
    <div>
      <button data-testid="score-button" onClick={() => update({ score: 100 })}>
        Score 100
      </button>
      <button data-testid="score-50" onClick={() => update({ score: 50 })}>
        Score 50
      </button>
      <button data-testid="reset" onClick={reset}>
        Reset
      </button>
      <div data-testid="unlocked-count">
        {achievements.unlocked.length}
      </div>
      <div data-testid="unlocked-list">
        {achievements.unlocked.join(',')}
      </div>
    </div>
  );
};

describe('Achievement Notifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });
  
  it('should not show duplicate notifications for the same achievement', async () => {
    render(
      <AchievementProvider
        achievements={achievementConfig}
        storage={StorageType.Memory}
        useBuiltInUI={true}
      >
        <TestComponent />
      </AchievementProvider>
    );

    // Earn achievement
    await act(async () => {
      fireEvent.click(screen.getByTestId('score-button'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('unlocked-count')).toHaveTextContent('1');
    });

    // Verify notification is shown (built-in UI component)
    await waitFor(() => {
      expect(screen.getByText('High Score!')).toBeInTheDocument();
    });

    // Click the same button again, should not trigger another notification
    await act(async () => {
      fireEvent.click(screen.getByTestId('score-button'));
    });

    // Achievement count should stay at 1 (no duplicate unlock)
    expect(screen.getByTestId('unlocked-count')).toHaveTextContent('1');
  });
  
  it('should properly handle multiple achievements in sequence', async () => {
    render(
      <AchievementProvider
        achievements={achievementConfig}
        storage={StorageType.Memory}
        useBuiltInUI={true}
      >
        <TestComponent />
      </AchievementProvider>
    );

    // Earn first achievement
    await act(async () => {
      fireEvent.click(screen.getByTestId('score-button'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('unlocked-count')).toHaveTextContent('1');
      expect(screen.getByTestId('unlocked-list')).toHaveTextContent('score_100');
    });

    // Verify notification is displayed
    await waitFor(() => {
      expect(screen.getByText('High Score!')).toBeInTheDocument();
    });
  });
  
  it('should properly reset achievements', async () => {
    render(
      <AchievementProvider
        achievements={achievementConfig}
        storage={StorageType.Memory}
        useBuiltInUI={true}
      >
        <TestComponent />
      </AchievementProvider>
    );

    // Earn achievement
    await act(async () => {
      fireEvent.click(screen.getByTestId('score-button'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('unlocked-count')).toHaveTextContent('1');
    });

    // Reset achievements
    await act(async () => {
      fireEvent.click(screen.getByTestId('reset'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('unlocked-count')).toHaveTextContent('0');
    });

    // Earn achievement again
    await act(async () => {
      fireEvent.click(screen.getByTestId('score-button'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('unlocked-count')).toHaveTextContent('1');
    });

    // Verify notification is shown after reset and re-earning
    await waitFor(() => {
      expect(screen.getByText('High Score!')).toBeInTheDocument();
    });
  });
  
  it('should handle achievements from initial state', async () => {
    const storage = {
      getUnlockedAchievements: jest.fn().mockReturnValue(['score_50']),
      setUnlockedAchievements: jest.fn(),
      getMetrics: jest.fn().mockReturnValue({}),
      setMetrics: jest.fn(),
      clear: jest.fn(),
      getItem: jest.fn().mockReturnValue(JSON.stringify(['score_50'])),
      setItem: jest.fn()
    };

    render(
      <AchievementProvider
        achievements={achievementConfig}
        storage={storage}
        useBuiltInUI={true}
      >
        <TestComponent />
      </AchievementProvider>
    );

    // Earn a new achievement
    await act(async () => {
      fireEvent.click(screen.getByTestId('score-button'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('unlocked-count')).toHaveTextContent('2');
    });

    // Verify notification is shown for the new achievement
    await waitFor(() => {
      expect(screen.getByText('High Score!')).toBeInTheDocument();
    });
  });
}); 