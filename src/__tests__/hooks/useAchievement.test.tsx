import React from 'react';
import { render, act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import achievementsReducer from '../../redux/achievementSlice';
import notificationReducer from '../../redux/notificationSlice';
import { AchievementProvider } from '../../providers/AchievementProvider';
import { useAchievement } from '../../hooks/useAchievement';
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

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const store = createTestStore();
  return (
    <Provider store={store}>
      <AchievementProvider 
        config={mockAchievementConfig}
        initialState={mockInitialState}
        storageKey="test-achievements"
      >
        {children}
      </AchievementProvider>
    </Provider>
  );
};

describe('useAchievement', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('should return achievement metrics and functions', async () => {
    const { result } = renderHook(() => useAchievement(), {
      wrapper: TestWrapper
    });

    expect(result.current.metrics).toBeDefined();
    expect(result.current.unlockedAchievements).toBeDefined();
    expect(result.current.updateMetrics).toBeDefined();
    expect(result.current.resetStorage).toBeDefined();
  });

  it('should update metrics when updateMetrics is called', async () => {
    const { result } = renderHook(() => useAchievement(), {
      wrapper: TestWrapper
    });

    await act(async () => {
      result.current.updateMetrics({ score: [100] });
    });

    expect(result.current.metrics.score).toBeTruthy();
  });

  it('should reset storage when resetStorage is called', async () => {
    const { result } = renderHook(() => useAchievement(), {
      wrapper: TestWrapper
    });

    await act(async () => {
      result.current.updateMetrics({ score: [100] });
      result.current.resetStorage();
    });

    expect(result.current.metrics).toEqual({});
    expect(result.current.unlockedAchievements).toEqual([]);
    expect(localStorage.getItem('test-achievements')).toBeFalsy();
  });
});