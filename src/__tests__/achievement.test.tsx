import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { AchievementProvider, useAchievements } from '../index';
import '@testing-library/jest-dom';

// Mock the storage implementation for testing
class MockStorage {
  private metrics: Record<string, any> = {};
  private unlocked: string[] = [];

  getMetrics() {
    return this.metrics;
  }

  setMetrics(metrics: Record<string, any>) {
    this.metrics = metrics;
  }

  getUnlockedAchievements() {
    return this.unlocked;
  }

  setUnlockedAchievements(achievements: string[]) {
    this.unlocked = achievements;
  }

  clear() {
    this.metrics = {};
    this.unlocked = [];
  }
}

// Test component that uses the achievement system
const TestComponent = () => {
  const { update, achievements } = useAchievements();

  return (
    <div>
      <button onClick={() => update({ score: 100 })}>Update Score</button>
      <button onClick={() => update({ lastLogin: new Date() })}>Update Last Login</button>
      <div data-testid="unlocked-count">
        Unlocked: {achievements.unlocked.length}
      </div>
    </div>
  );
};

describe('Achievement System', () => {
  const mockStorage = new MockStorage();
  const achievementConfig = {
    score: {
      100: {
        title: 'Century!',
        description: 'Score 100 points',
        icon: 'trophy'
      }
    },
    lastLogin: {
      today: {
        title: 'Daily Login',
        description: 'Logged in today',
        icon: 'calendar',
        isConditionMet: (value: Date) => {
          const today = new Date();
          return value.getDate() === today.getDate() &&
                 value.getMonth() === today.getMonth() &&
                 value.getFullYear() === today.getFullYear();
        }
      }
    }
  };

  it('should initialize with no unlocked achievements', () => {
    render(
      <AchievementProvider
        achievements={achievementConfig}
        storage={mockStorage}
      >
        <TestComponent />
      </AchievementProvider>
    );

    expect(screen.getByTestId('unlocked-count')).toHaveTextContent('Unlocked: 0');
  });

  it('should unlock achievement when condition is met', async () => {
    render(
      <AchievementProvider
        achievements={achievementConfig}
        storage={mockStorage}
      >
        <TestComponent />
      </AchievementProvider>
    );

    // Initial state
    expect(screen.getByTestId('unlocked-count')).toHaveTextContent('Unlocked: 0');

    // Update score to trigger achievement
    await act(async () => {
      fireEvent.click(screen.getByText('Update Score'));
    });

    // Achievement should be unlocked
    expect(screen.getByTestId('unlocked-count')).toHaveTextContent('Unlocked: 1');
  });

  it('should handle Date type metrics', async () => {
    render(
      <AchievementProvider
        achievements={achievementConfig}
        storage={mockStorage}
      >
        <TestComponent />
      </AchievementProvider>
    );

    // Update last login to trigger achievement
    await act(async () => {
      fireEvent.click(screen.getByText('Update Last Login'));
    });

    // Check that the date was stored correctly
    const metrics = mockStorage.getMetrics();
    expect(metrics.lastLogin).toBeDefined();
    expect(metrics.lastLogin[0]).toBeInstanceOf(Date);
  });

  it('should persist achievements in storage', async () => {
    render(
      <AchievementProvider
        achievements={achievementConfig}
        storage={mockStorage}
      >
        <TestComponent />
      </AchievementProvider>
    );

    // Update score to trigger achievement
    await act(async () => {
      fireEvent.click(screen.getByText('Update Score'));
    });

    // Check storage
    expect(mockStorage.getUnlockedAchievements()).toHaveLength(1);
    expect(mockStorage.getMetrics()).toEqual({ score: [100] });
  });

  it('should load persisted achievements on initialization', () => {
    // Set up initial storage state
    mockStorage.setMetrics({ score: [100] });
    mockStorage.setUnlockedAchievements(['score_100']);

    render(
      <AchievementProvider
        achievements={achievementConfig}
        storage={mockStorage}
      >
        <TestComponent />
      </AchievementProvider>
    );

    // Achievement should be loaded from storage
    expect(screen.getByTestId('unlocked-count')).toHaveTextContent('Unlocked: 1');
  });
}); 