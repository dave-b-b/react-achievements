import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { AchievementProvider } from '../providers/AchievementProvider';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import { useAchievements } from '../hooks/useAchievements';
import { AchievementConfiguration } from '../core/types';
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

// Create Redux slice
const gameSlice = createSlice({
  name: 'game',
  initialState: {
    score: 0
  },
  reducers: {
    incrementScore: (state) => {
      state.score += 100;
    }
  }
});

// Create store
const store = configureStore({
  reducer: {
    game: gameSlice.reducer
  }
});

type RootState = ReturnType<typeof store.getState>;

// Test component using Redux
const TestComponent = () => {
  const dispatch = useDispatch();
  const score = useSelector((state: RootState) => state.game.score);
  const { update, achievements } = useAchievements();

  const handleClick = () => {
    dispatch(gameSlice.actions.incrementScore());
    update({ score: score + 100 }); // Need to add 100 because score hasn't updated yet
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

describe('Achievement System with Redux', () => {
  const mockStorage = new MockStorage();
  const achievementConfig: AchievementConfiguration = {
    score: [{
      isConditionMet: (value: number) => value >= 100,
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
    store.dispatch(gameSlice.actions.incrementScore.match, { score: 0 });
  });

  it('should unlock achievement when score increases through Redux', async () => {
    render(
      <Provider store={store}>
        <AchievementProvider
          achievements={achievementConfig}
          storage={mockStorage}
        >
          <TestComponent />
        </AchievementProvider>
      </Provider>
    );

    // Initial state
    expect(screen.getByTestId('score')).toHaveTextContent('Score: 0');
    expect(screen.getByTestId('unlocked-count')).toHaveTextContent('Unlocked: 0');

    // Update score through Redux
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