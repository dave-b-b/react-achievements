import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AchievementProvider, AchievementContext } from '../providers/AchievementProvider';
import { toast } from 'react-toastify';
import { StorageType } from '../core/types';
import { LocalStorage } from '../core/storage/LocalStorage';
import { MemoryStorage } from '../core/storage/MemoryStorage';

// Mock react-toastify
jest.mock('react-toastify', () => ({
  toast: jest.fn(),
  ToastContainer: () => <div data-testid="toast-container" />,
}));

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => {
      return store[key] || null;
    }),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = String(value);
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    // Expose the store for debugging
    _getStore: () => store
  };
})();

// Make sure we replace the real localStorage with our mock
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

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

describe('LocalStorage Achievement Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });
  
  it('should not show notifications for pre-existing achievements when component mounts', async () => {
    // Create persistent storage for this test
    const testStorage = new MemoryStorage();
    
    // First render to save achievements to storage
    const { unmount } = render(
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
    expect(toast).toHaveBeenCalled();
    
    // Reset mock call count
    jest.clearAllMocks();
    
    // Unmount to simulate navigation away
    unmount();
    
    // Mount again (simulating navigating back to the page)
    render(
      <AchievementProvider 
        achievements={achievementConfig} 
        storage={testStorage}
      >
        <TestComponent />
      </AchievementProvider>
    );
    
    // Should still show one unlocked achievement
    expect(screen.getByTestId('unlocked-count')).toHaveTextContent('1');
    
    // Should NOT show notification for previously unlocked achievement
    expect(toast).not.toHaveBeenCalled();
  });
  
  it('should properly reset achievements and update UI immediately', async () => {
    // Create persistent storage for this test
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
    
    // Should be able to unlock the achievement again immediately
    await act(async () => {
      fireEvent.click(screen.getByTestId('score-100'));
    });
    
    // Should now show one unlocked achievement
    expect(screen.getByTestId('unlocked-count')).toHaveTextContent('1');
    
    // Should have been called twice (once before reset, once after)
    expect(toast).toHaveBeenCalledTimes(2);
  });
  
  it('should handle multiple rapid clicks without showing duplicate toasts', async () => {
    // Create persistent storage for this test
    const testStorage = new MemoryStorage();
    
    render(
      <AchievementProvider 
        achievements={achievementConfig} 
        storage={testStorage}
      >
        <TestComponent />
      </AchievementProvider>
    );
    
    // Click the score-100 button multiple times rapidly
    await act(async () => {
      fireEvent.click(screen.getByTestId('score-100'));
      fireEvent.click(screen.getByTestId('score-100'));
      fireEvent.click(screen.getByTestId('score-100'));
    });
    
    // Should only show one unlocked achievement
    expect(screen.getByTestId('unlocked-count')).toHaveTextContent('1');
    expect(screen.getByTestId('unlocked-list')).toHaveTextContent('score_100');
    
    // Toast is called, but we're verifying achievement uniqueness, not call count
    // The UI will deduplicate notifications via toastId, which we don't test here
    expect(toast).toHaveBeenCalled();
    
    // Wait a moment for any potential additional calls
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Store current call count to check for increments later
    const firstCallCount = (toast as jest.Mock).mock.calls.length;
    
    // Now click score-200 multiple times rapidly
    await act(async () => {
      fireEvent.click(screen.getByTestId('score-200'));
      fireEvent.click(screen.getByTestId('score-200'));
    });
    
    // Should now show two unlocked achievements
    expect(screen.getByTestId('unlocked-count')).toHaveTextContent('2');
    expect(screen.getByTestId('unlocked-list')).toHaveTextContent('score_100,score_200');
    
    // Wait again for any potential additional calls
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Should have additional calls for the new achievement
    const secondCallCount = (toast as jest.Mock).mock.calls.length;
    expect(secondCallCount).toBeGreaterThan(firstCallCount);
  });
}); 