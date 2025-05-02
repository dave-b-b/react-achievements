import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import achievementsReducer from '../../redux/achievementSlice';
import notificationReducer from '../../redux/notificationSlice';
import { AchievementProvider } from '../../providers/AchievementProvider';
import { mockAchievementConfig, mockInitialState } from '../../test-utils/mocks';

// Mock react-confetti to avoid canvas issues
jest.mock('react-confetti', () => ({
  __esModule: true,
  default: () => null
}));

const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      achievements: achievementsReducer,
      notifications: notificationReducer
    },
    preloadedState: {
      achievements: {
        metrics: {},
        unlockedAchievements: [],
        pendingNotifications: [],
        storageKey: null,
        ...preloadedState
      },
      notifications: {
        notifications: []
      }
    }
  });
};

const TestComponent = ({ onUpdate }: { onUpdate?: () => void }) => {
  const handleClick = () => {
    window.dispatchEvent(
      new CustomEvent('updateMetrics', { 
        detail: { score: [100] } 
      })
    );
    onUpdate?.();
  };

  return (
    <button data-testid="update-button" onClick={handleClick}>
      Update Score
    </button>
  );
};

describe('AchievementProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('should render children', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <AchievementProvider config={mockAchievementConfig}>
          <div data-testid="child">Test Child</div>
        </AchievementProvider>
      </Provider>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('should initialize with provided state', async () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <AchievementProvider 
          config={mockAchievementConfig}
          initialState={mockInitialState}
          storageKey="test-achievements"
        >
          <div>Test Child</div>
        </AchievementProvider>
      </Provider>
    );

    await waitFor(() => {
      const state = store.getState();
      expect(state.achievements.metrics).toBeTruthy();
    });
  });

  it('should handle achievement reset', async () => {
    const store = createTestStore();
    const user = userEvent.setup();
    
    render(
      <Provider store={store}>
        <AchievementProvider 
          config={mockAchievementConfig} 
          initialState={mockInitialState}
          storageKey="test-achievements"
        >
          <button data-testid="reset-button" onClick={() => {
            window.dispatchEvent(new CustomEvent('resetAchievements'));
          }}>
            Reset
          </button>
        </AchievementProvider>
      </Provider>
    );

    await act(async () => {
      await user.click(screen.getByTestId('reset-button'));
    });

    const stored = JSON.parse(localStorage.getItem('test-achievements') || '{}');
    expect(stored.metrics).toEqual({
      level: [1],
      previouslyAwardedAchievements: [],
      score: [0]
    });
    expect(stored.unlockedAchievements).toEqual(['level_1']);
  });

  it('should update metrics and check achievements', async () => {
    const store = createTestStore();
    const mockUpdate = jest.fn();

    render(
      <Provider store={store}>
        <AchievementProvider 
          config={mockAchievementConfig} 
          initialState={mockInitialState}
          storageKey="test-achievements"
        >
          <TestComponent onUpdate={mockUpdate} />
        </AchievementProvider>
      </Provider>
    );

    const user = userEvent.setup();
    await act(async () => {
      await user.click(screen.getByTestId('update-button'));
    });

    await waitFor(() => {
      const state = store.getState();
      expect(state.achievements.metrics.score).toBeTruthy();
    });
  });
});