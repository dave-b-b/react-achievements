import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AchievementProvider, AchievementContext } from '../providers/AchievementProvider';
import { toast } from 'react-toastify';
import { StorageType } from '../core/types';
import { MemoryStorage } from '../core/storage/MemoryStorage';

// Mock react-toastify
jest.mock('react-toastify', () => ({
  toast: jest.fn(),
  ToastContainer: () => <div data-testid="toast-container" />,
}));

// Simple achievement configuration for testing
const achievementConfig = {
  score: [{
    isConditionMet: (value: number) => value >= 100,
    achievementDetails: {
      achievementId: 'score_100',
      achievementTitle: 'Century',
      achievementDescription: 'Score 100 points',
      achievementIconKey: 'trophy'
    }
  }, {
    isConditionMet: (value: number) => value >= 200,
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
    return <div>No context</div>;
  }
  
  const { update, achievements, reset } = context;
  
  return (
    <div>
      <div data-testid="unlocked-count">{achievements.unlocked.length}</div>
      <div data-testid="unlocked-list">{achievements.unlocked.join(',')}</div>
      <button data-testid="score-100" onClick={() => update({ score: 100 })}>Score 100</button>
      <button data-testid="score-200" onClick={() => update({ score: 200 })}>Score 200</button>
      <button data-testid="reset" onClick={reset}>Reset</button>
    </div>
  );
};

describe('Achievement Notifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should not show duplicate notifications for the same achievement', async () => {
    // Create persistent storage
    const testStorage = new MemoryStorage();
    
    render(
      <AchievementProvider 
        achievements={achievementConfig} 
        storage={testStorage}
      >
        <TestComponent />
      </AchievementProvider>
    );
    
    // Unlock an achievement
    await act(async () => {
      fireEvent.click(screen.getByTestId('score-100'));
    });
    
    // Should show one unlocked achievement
    expect(screen.getByTestId('unlocked-count')).toHaveTextContent('1');
    expect(screen.getByTestId('unlocked-list')).toHaveTextContent('score_100');
    
    // Verify toast was called once
    expect(toast).toHaveBeenCalledTimes(1);
    
    // Click the same button again, should not trigger another notification
    await act(async () => {
      fireEvent.click(screen.getByTestId('score-100'));
    });
    
    // Should still show one unlocked achievement
    expect(screen.getByTestId('unlocked-count')).toHaveTextContent('1');
    
    // Should still only have called toast once (no duplicate notification)
    expect(toast).toHaveBeenCalledTimes(1);
  });
  
  it('should properly handle multiple achievements in sequence', async () => {
    // Create persistent storage
    const testStorage = new MemoryStorage();
    
    render(
      <AchievementProvider 
        achievements={achievementConfig} 
        storage={testStorage}
      >
        <TestComponent />
      </AchievementProvider>
    );
    
    // Unlock an achievement
    await act(async () => {
      fireEvent.click(screen.getByTestId('score-100'));
    });
    
    // Should show one unlocked achievement
    expect(screen.getByTestId('unlocked-count')).toHaveTextContent('1');
    expect(screen.getByTestId('unlocked-list')).toHaveTextContent('score_100');
    expect(toast).toHaveBeenCalledTimes(1);
    
    // Unlock a new achievement
    await act(async () => {
      fireEvent.click(screen.getByTestId('score-200'));
    });
    
    // Should now show two unlocked achievements
    expect(screen.getByTestId('unlocked-count')).toHaveTextContent('2');
    expect(screen.getByTestId('unlocked-list')).toHaveTextContent('score_100,score_200');
    
    // Should have shown one more notification (total 2)
    expect(toast).toHaveBeenCalledTimes(2);
  });
  
  it('should properly reset achievements', async () => {
    // Create persistent storage
    const testStorage = new MemoryStorage();
    
    render(
      <AchievementProvider 
        achievements={achievementConfig} 
        storage={testStorage}
      >
        <TestComponent />
      </AchievementProvider>
    );
    
    // Unlock an achievement
    await act(async () => {
      fireEvent.click(screen.getByTestId('score-100'));
    });
    
    // Should show one unlocked achievement
    expect(screen.getByTestId('unlocked-count')).toHaveTextContent('1');
    
    // Reset achievements
    await act(async () => {
      fireEvent.click(screen.getByTestId('reset'));
    });
    
    // Should immediately show zero unlocked achievements after reset
    expect(screen.getByTestId('unlocked-count')).toHaveTextContent('0');
    expect(screen.getByTestId('unlocked-list')).toHaveTextContent('');
    
    // Unlock the achievement again after reset
    await act(async () => {
      fireEvent.click(screen.getByTestId('score-100'));
    });
    
    // Should show notification again after reset and new achievement
    expect(toast).toHaveBeenCalledTimes(2);
    expect(screen.getByTestId('unlocked-count')).toHaveTextContent('1');
  });
  
  it('should handle achievements from initial state', async () => {
    // Create persistent storage with pre-existing achievement
    const testStorage = new MemoryStorage();
    testStorage.setUnlockedAchievements(['score_100']);
    
    // First render with pre-existing achievement
    render(
      <AchievementProvider 
        achievements={achievementConfig} 
        storage={testStorage}
      >
        <TestComponent />
      </AchievementProvider>
    );
    
    // Should show one unlocked achievement but not trigger notification
    expect(screen.getByTestId('unlocked-count')).toHaveTextContent('1');
    expect(screen.getByTestId('unlocked-list')).toHaveTextContent('score_100');
    expect(toast).not.toHaveBeenCalled();
    
    // Unlock a new achievement
    await act(async () => {
      fireEvent.click(screen.getByTestId('score-200'));
    });
    
    // Should now show two unlocked achievements
    expect(screen.getByTestId('unlocked-count')).toHaveTextContent('2');
    expect(screen.getByTestId('unlocked-list')).toHaveTextContent('score_100,score_200');
    
    // Should only show notification for the new achievement
    expect(toast).toHaveBeenCalledTimes(1);
  });
}); 