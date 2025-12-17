import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { create } from 'zustand';
import {
  AchievementProvider,
  useAchievements,
  AchievementConfiguration,
  AchievementMetricArrayValue,
  AchievementState
} from '../index';
import '@testing-library/jest-dom';

// Mock storage implementation
class MockStorage {
  private metrics: Record<string, any> = {};
  private unlocked: string[] = [];

  getMetrics() { return this.metrics; }
  setMetrics(metrics: Record<string, any>) { this.metrics = metrics; }
  getUnlockedAchievements() { return this.unlocked; }
  setUnlockedAchievements(achievements: string[]) { this.unlocked = achievements; }
  clear() {
    this.metrics = {};
    this.unlocked = [];
  }
}

// Create Zustand store
interface GameStore {
  score: number;
  incrementScore: () => void;
}

const useStore = create<GameStore>((set) => ({
  score: 0,
  incrementScore: () => set((_state) => ({ score: _state.score + 100 })),
}));

// Test component using Zustand
const TestComponent = () => {
  const { score, incrementScore } = useStore();
  const { update, achievements } = useAchievements();

  const handleClick = () => {
    incrementScore();
    update({ score: score + 100 });
  };

  return (
    <div>
      <button onClick={handleClick}>Increment Score</button>
      <div data-testid="score">Score: {score}</div>
      <div data-testid="unlocked-count">
        Unlocked: {achievements.unlocked.length}
      </div>
    </div>
  );
};

describe('Achievement System with Zustand', () => {
  const mockStorage = new MockStorage();
  const achievementConfig: AchievementConfiguration = {
    score: [{
      isConditionMet: (value: AchievementMetricArrayValue, _state: AchievementState) => typeof value === 'number' && value >= 100,
      achievementDetails: {
        achievementId: 'score_100',
        achievementTitle: 'Century!',
        achievementDescription: 'Score 100 points',
        achievementIconKey: 'trophy'
      }
    }]
  };

  beforeEach(() => {
    mockStorage.clear();
    useStore.setState({ score: 0 });
  });

  it('should unlock achievement when score increases through Zustand state', async () => {
    render(
      <AchievementProvider
        achievements={achievementConfig}
        storage={mockStorage}
      >
        <TestComponent />
      </AchievementProvider>
    );

    // Initial state
    expect(screen.getByTestId('score')).toHaveTextContent('Score: 0');
    expect(screen.getByTestId('unlocked-count')).toHaveTextContent('Unlocked: 0');

    // Update score through Zustand
    await act(async () => {
      fireEvent.click(screen.getByText('Increment Score'));
    });

    // Check updated state
    expect(screen.getByTestId('score')).toHaveTextContent('Score: 100');
    expect(screen.getByTestId('unlocked-count')).toHaveTextContent('Unlocked: 1');
    expect(mockStorage.getUnlockedAchievements()).toHaveLength(1);
    expect(mockStorage.getMetrics()).toEqual({ score: [100] });
  });
}); 