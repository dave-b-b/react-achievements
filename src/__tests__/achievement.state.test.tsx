import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { AchievementProvider } from '../providers/AchievementProvider';
import { useAchievements } from '../hooks/useAchievements';
import { AchievementConfiguration } from '../core/types';
import '@testing-library/jest-dom';

// Mock storage implementation
class MockStorage {
  private metrics: Record<string, any> = {};
  private unlocked: string[] = [];

  getMetrics() { 
    return this.metrics; 
  }
  
  setMetrics(metrics: Record<string, any>) { 
    this.metrics = { ...metrics }; 
  }
  
  getUnlockedAchievements() { 
    return [...this.unlocked]; 
  }
  
  setUnlockedAchievements(achievements: string[]) { 
    // Create a new array to avoid reference issues
    this.unlocked = [...achievements];
  }
  
  clear() {
    this.metrics = {};
    this.unlocked = [];
  }
}

describe('Achievement State Management', () => {
  const mockStorage = new MockStorage();
  const achievementConfig: AchievementConfiguration = {
    score: [{
      isConditionMet: (value: any) => {
        return typeof value === 'number' && value >= 100;
      },
      achievementDetails: {
        achievementId: 'score_100',
        achievementTitle: 'Century!',
        achievementDescription: 'Score 100 points',
        achievementIconKey: 'trophy'
      }
    }],
    kills: [{
      isConditionMet: (value: any) => {
        return typeof value === 'number' && value >= 5;
      },
      achievementDetails: {
        achievementId: 'kills_5',
        achievementTitle: 'Hunter',
        achievementDescription: 'Get 5 kills',
        achievementIconKey: 'sword'
      }
    }]
  };

  // Test component that displays and updates state
  const StateDisplay = () => {
    const { update, getState, reset } = useAchievements();
    const state = getState();

    React.useEffect(() => {
      // Update the data-testid attributes with current state
      const stateDisplay = document.querySelector('[data-testid="state-display"]');
      if (stateDisplay) {
        stateDisplay.setAttribute('data-metrics', JSON.stringify(state.metrics));
        stateDisplay.setAttribute('data-unlocked', JSON.stringify(state.unlocked));
      }
    }, [state]);

    return (
      <div>
        <button onClick={() => update({ score: 100, kills: 5 })}>Update State</button>
        <button onClick={reset}>Reset State</button>
        <div data-testid="state-display"></div>
      </div>
    );
  };

  // Wrapper component to access hooks in tests
  const TestWrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <AchievementProvider
        achievements={achievementConfig}
        storage={mockStorage}
      >
        {children}
      </AchievementProvider>
    );
  };

  beforeEach(() => {
    mockStorage.clear();
  });

  // Helper function to directly verify the storage
  const checkUnlockedContains = (achievementId: string) => {
    const unlocked = mockStorage.getUnlockedAchievements();
    return unlocked.includes(achievementId);
  };

  it('should get correct state after updates', async () => {
    render(<StateDisplay />, { wrapper: TestWrapper });

    // Initial state should be empty
    const display = screen.getByTestId('state-display');
    expect(JSON.parse(display.getAttribute('data-metrics') || '{}')).toEqual({});
    expect(JSON.parse(display.getAttribute('data-unlocked') || '[]')).toEqual([]);

    // Update state
    await act(async () => {
      fireEvent.click(screen.getByText('Update State'));
      // Add a delay to allow state updates to propagate
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Check updated state
    expect(JSON.parse(display.getAttribute('data-metrics') || '{}')).toEqual({
      score: [100],
      kills: [5]
    });
    
    // Directly check the storage instead of the display attribute
    expect(checkUnlockedContains('score_100')).toBe(true);
    expect(checkUnlockedContains('kills_5')).toBe(true);
  });

  it('should reset state correctly', async () => {
    render(<StateDisplay />, { wrapper: TestWrapper });

    // First update the state
    await act(async () => {
      fireEvent.click(screen.getByText('Update State'));
      // Add a delay to allow state updates to propagate
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Verify state was updated
    const display = screen.getByTestId('state-display');
    expect(JSON.parse(display.getAttribute('data-metrics') || '{}')).toEqual({
      score: [100],
      kills: [5]
    });
    expect(JSON.parse(display.getAttribute('data-unlocked') || '[]').length).toBeGreaterThan(0);

    // Reset the state
    await act(async () => {
      fireEvent.click(screen.getByText('Reset State'));
      // Add a delay to allow state updates to propagate
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Verify state was reset
    expect(JSON.parse(display.getAttribute('data-metrics') || '{}')).toEqual({});
    expect(JSON.parse(display.getAttribute('data-unlocked') || '[]')).toEqual([]);
    expect(mockStorage.getMetrics()).toEqual({});
    expect(mockStorage.getUnlockedAchievements()).toEqual([]);
  });

  it('should persist state between renders', async () => {
    const { unmount } = render(<StateDisplay />, { wrapper: TestWrapper });

    // Update state
    await act(async () => {
      fireEvent.click(screen.getByText('Update State'));
      // Add a delay to allow state updates to propagate
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Unmount and remount
    unmount();
    render(<StateDisplay />, { wrapper: TestWrapper });
    
    // Add a short delay to ensure state is loaded
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Verify state persisted
    const display = screen.getByTestId('state-display');
    expect(JSON.parse(display.getAttribute('data-metrics') || '{}')).toEqual({
      score: [100],
      kills: [5]
    });
    
    // Directly check the storage instead of the display attribute
    expect(checkUnlockedContains('score_100')).toBe(true);
    expect(checkUnlockedContains('kills_5')).toBe(true);
  });
}); 