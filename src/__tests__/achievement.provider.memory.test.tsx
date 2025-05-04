import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { AchievementProvider, AchievementContext } from '../providers/AchievementProvider';
import { StorageType, AchievementConfiguration, AchievementMetricValue, AchievementState, AchievementMetricArrayValue } from '../core/types';
import { MemoryStorage } from '../core/storage/MemoryStorage';
import { toast } from 'react-toastify';
import '@testing-library/jest-dom';

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
  
  const { update, achievements, reset, getState } = context;

  return (
    <div>
      <button onClick={() => update({ score: 100 })}>Update Score</button>
      <button onClick={() => update({ score: [150] })}>Update Array Score</button>
      <button onClick={reset}>Reset</button>
      <button onClick={() => update({ multiValue: [1, 2, 3] })}>Update Multi Value</button>
      <div data-testid="unlocked-count">
        Unlocked: {achievements.unlocked.length}
      </div>
      <div data-testid="state">
        {JSON.stringify(getState())}
      </div>
    </div>
  );
};

describe('AchievementProvider with Memory Storage', () => {
  const achievementConfig: AchievementConfiguration = {
    score: [{
      isConditionMet: (value: AchievementMetricArrayValue, state: AchievementState) => {
        const numValue = Array.isArray(value) ? value[0] : value;
        return typeof numValue === 'number' && numValue >= 100;
      },
      achievementDetails: {
        achievementId: 'score_100',
        achievementTitle: 'Century!',
        achievementDescription: 'Score 100 points',
        achievementIconKey: 'trophy'
      }
    }],
    multiValue: [{
      isConditionMet: (value: AchievementMetricArrayValue, state: AchievementState) => {
        if (!Array.isArray(value)) return false;
        return value.length >= 3 && value.every(v => typeof v === 'number');
      },
      achievementDetails: {
        achievementId: 'multi_value',
        achievementTitle: 'Multiple Values!',
        achievementDescription: 'Have 3 or more numeric values',
        achievementIconKey: 'star'
      }
    }]
  };

  const customIcons = {
    trophy: '🏆',
    star: '⭐'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should unlock achievement and show toast notification', async () => {
    render(
      <AchievementProvider
        achievements={achievementConfig}
        storage={StorageType.Memory}
        icons={customIcons}
      >
        <TestComponent />
      </AchievementProvider>
    );

    // Initial state
    expect(screen.getByTestId('unlocked-count')).toHaveTextContent('Unlocked: 0');

    // Update score
    await act(async () => {
      fireEvent.click(screen.getByText('Update Score'));
    });

    // Wait for state updates
    await waitFor(() => {
      expect(screen.getByTestId('unlocked-count')).toHaveTextContent('Unlocked: 1');
    });

    // Verify toast was called with correct achievement details
    expect(toast.success).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        toastId: 'achievement-score_100'
      })
    );

    // Verify confetti is shown
    expect(screen.getByTestId('mock-confetti')).toBeInTheDocument();
  });

  it('should handle array metrics correctly', async () => {
    render(
      <AchievementProvider
        achievements={achievementConfig}
        storage={StorageType.Memory}
      >
        <TestComponent />
      </AchievementProvider>
    );

    // Update with array value
    await act(async () => {
      fireEvent.click(screen.getByText('Update Array Score'));
    });

    // Wait for state updates
    await waitFor(() => {
      expect(screen.getByTestId('unlocked-count')).toHaveTextContent('Unlocked: 1');
    });

    // Check state format
    const state = JSON.parse(screen.getByTestId('state').textContent || '{}');
    expect(state.metrics.score).toEqual([150]);
  });

  it('should handle reset functionality', async () => {
    render(
      <AchievementProvider
        achievements={achievementConfig}
        storage={StorageType.Memory}
      >
        <TestComponent />
      </AchievementProvider>
    );

    // Unlock achievement
    await act(async () => {
      fireEvent.click(screen.getByText('Update Score'));
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('unlocked-count')).toHaveTextContent('Unlocked: 1');
    });

    // Reset
    await act(async () => {
      fireEvent.click(screen.getByText('Reset'));
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('unlocked-count')).toHaveTextContent('Unlocked: 0');
    });

    // State should be cleared
    const state = JSON.parse(screen.getByTestId('state').textContent || '{}');
    expect(state.metrics).toEqual({});
    expect(state.unlocked).toEqual([]);
  });

  it('should handle multi-value metrics', async () => {
    const storage = new MemoryStorage();
    
    const { container } = render(
      <AchievementProvider
        achievements={achievementConfig}
        storage={storage}
        icons={customIcons}
      >
        <TestComponent />
      </AchievementProvider>
    );

    // Initial state check
    expect(screen.getByTestId('unlocked-count')).toHaveTextContent('Unlocked: 0');

    // Update with multi-value array
    await act(async () => {
      fireEvent.click(screen.getByText('Update Multi Value'));
    });

    // Wait for state updates and verify the achievement is unlocked
    await waitFor(() => {
      const state = JSON.parse(screen.getByTestId('state').textContent || '{}');
      expect(state.metrics.multiValue).toEqual([1, 2, 3]);
    });

    // Verify achievement unlocked
    await waitFor(() => {
      const state = JSON.parse(screen.getByTestId('state').textContent || '{}');
      expect(state.unlocked).toContain('multi_value');
    });

    // Verify toast was called
    expect(toast.success).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        toastId: 'achievement-multi_value'
      })
    );
  });

  it('should not show toast for already unlocked achievements', async () => {
    const storage = new MemoryStorage();
    storage.setUnlockedAchievements(['score_100']);
    
    render(
      <AchievementProvider
        achievements={achievementConfig}
        storage={storage}
      >
        <TestComponent />
      </AchievementProvider>
    );

    // Update score again
    await act(async () => {
      fireEvent.click(screen.getByText('Update Score'));
    });

    // Toast should not be called for already unlocked achievement
    expect(toast.success).not.toHaveBeenCalled();
  });
}); 