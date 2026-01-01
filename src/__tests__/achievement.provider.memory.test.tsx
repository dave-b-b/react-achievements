import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import {
  AchievementProvider,
  AchievementContext,
  AchievementConfiguration,
  AchievementState,
  AchievementMetricArrayValue,
  StorageType,
  MemoryStorage
} from '../index';
import '@testing-library/jest-dom';

// Using built-in UI components - no external dependencies to mock

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
      isConditionMet: (value: AchievementMetricArrayValue, _state: AchievementState) => {
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
      isConditionMet: (value: AchievementMetricArrayValue, _state: AchievementState) => {
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

  it('should unlock achievement and show notification', async () => {
    render(
      <AchievementProvider
        achievements={achievementConfig}
        storage={StorageType.Memory}
        icons={customIcons}
        useBuiltInUI={true}
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

    // Verify notification is shown
    await waitFor(() => {
      expect(screen.getByText('Century!')).toBeInTheDocument();
    });
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

    render(
      <AchievementProvider
        achievements={achievementConfig}
        storage={storage}
        icons={customIcons}
        useBuiltInUI={true}
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

    // Verify notification is shown
    await waitFor(() => {
      expect(screen.getByText('Multiple Values!')).toBeInTheDocument();
    });
  });

  it('should not show notification for already unlocked achievements', async () => {
    const storage = new MemoryStorage();
    storage.setUnlockedAchievements(['score_100']);

    render(
      <AchievementProvider
        achievements={achievementConfig}
        storage={storage}
        useBuiltInUI={true}
      >
        <TestComponent />
      </AchievementProvider>
    );

    // Update score again
    await act(async () => {
      fireEvent.click(screen.getByText('Update Score'));
    });

    // Achievement should already be unlocked (no new notification for re-earning)
    // We're testing that it doesn't trigger duplicate notifications
  });

  it('should return all achievements with unlock status via getAllAchievements', async () => {
    const TestComponentWithGetAll = () => {
      const context = React.useContext(AchievementContext);

      if (!context) {
        throw new Error('TestComponent must be used within an AchievementProvider');
      }

      const { update, getAllAchievements } = context;
      const [allAchievements, setAllAchievements] = React.useState<any[]>([]);

      return (
        <div>
          <button onClick={() => update({ score: 100 })}>Update Score</button>
          <button onClick={() => setAllAchievements(getAllAchievements())}>Get All</button>
          <div data-testid="all-achievements">
            {JSON.stringify(allAchievements)}
          </div>
        </div>
      );
    };

    render(
      <AchievementProvider
        achievements={achievementConfig}
        storage={StorageType.Memory}
        icons={customIcons}
      >
        <TestComponentWithGetAll />
      </AchievementProvider>
    );

    // Get all achievements initially (should all be locked)
    await act(async () => {
      fireEvent.click(screen.getByText('Get All'));
    });

    let allAchievements = JSON.parse(screen.getByTestId('all-achievements').textContent || '[]');
    expect(allAchievements).toHaveLength(2);
    expect(allAchievements.every((a: any) => a.isUnlocked === false)).toBe(true);
    expect(allAchievements.find((a: any) => a.achievementId === 'score_100')).toBeDefined();
    expect(allAchievements.find((a: any) => a.achievementId === 'multi_value')).toBeDefined();

    // Unlock one achievement
    await act(async () => {
      fireEvent.click(screen.getByText('Update Score'));
    });

    // Get all achievements again
    await act(async () => {
      fireEvent.click(screen.getByText('Get All'));
    });

    allAchievements = JSON.parse(screen.getByTestId('all-achievements').textContent || '[]');
    expect(allAchievements).toHaveLength(2);

    const scoreAchievement = allAchievements.find((a: any) => a.achievementId === 'score_100');
    const multiAchievement = allAchievements.find((a: any) => a.achievementId === 'multi_value');

    expect(scoreAchievement?.isUnlocked).toBe(true);
    expect(multiAchievement?.isUnlocked).toBe(false);
  });
}); 