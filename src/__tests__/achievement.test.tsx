import React from 'react';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import { AchievementProvider, useAchievements } from '../index';
import { LocalStorage } from '../core/storage/LocalStorage';
import { BadgesButton } from '../core/components/BadgesButton';
import { BadgesModal } from '../core/components/BadgesModal';
import Modal from 'react-modal';
import '@testing-library/jest-dom';
import { ConfettiWrapper } from '../core/components/ConfettiWrapper';
import { AchievementConfiguration, AchievementMetricValue } from '../core/types';

// Mock react-confetti
jest.mock('react-confetti', () => {
  return function MockConfetti() {
    return <div data-testid="mock-confetti" />;
  };
});

// Set up Modal for testing
beforeAll(() => {
  Modal.setAppElement(document.createElement('div'));
});

// Mock the storage implementation for testing
class MockStorage {
  private metrics: Record<string, any[]> = {};
  private unlocked: string[] = [];

  getMetrics() {
    return this.metrics;
  }

  setMetrics(metrics: Record<string, any>) {
    // Convert single values to arrays to match the expected format
    const normalizedMetrics: Record<string, any[]> = {};
    for (const [key, value] of Object.entries(metrics)) {
      normalizedMetrics[key] = Array.isArray(value) ? value : [value];
    }
    this.metrics = normalizedMetrics;
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
  const achievementConfig: AchievementConfiguration = {
    score: [{
      isConditionMet: (value) => value === 100,
      achievementDetails: {
        achievementId: 'score_0',
        achievementTitle: 'Century!',
        achievementDescription: 'Score 100 points',
        achievementIconKey: 'trophy'
      }
    }],
    lastLogin: [{
      isConditionMet: (value, state) => {
        if (!(value instanceof Date)) return false;
        const today = new Date();
        return value.getDate() === today.getDate() &&
               value.getMonth() === today.getMonth() &&
               value.getFullYear() === today.getFullYear();
      },
      achievementDetails: {
        achievementId: 'lastLogin_0',
        achievementTitle: 'Daily Login',
        achievementDescription: 'Logged in today',
        achievementIconKey: 'calendar'
      }
    }]
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
    const unlockedAchievements = mockStorage.getUnlockedAchievements();
    expect(unlockedAchievements).toContain('score_0');
    
    const metrics = mockStorage.getMetrics();
    expect(metrics).toHaveProperty('score');
    expect(metrics.score).toEqual([100]);
  });

  it('should load persisted achievements on initialization', () => {
    // Set up initial storage state
    mockStorage.setMetrics({ score: [100] });
    mockStorage.setUnlockedAchievements(['score_0']);

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