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
    expect(mockStorage.getMetrics()).toEqual({ score: [100] });
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

describe('LocalStorage Implementation', () => {
  let localStorage: Storage;
  const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  };

  beforeEach(() => {
    localStorage = window.localStorage;
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
  });

  afterEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: localStorage,
      writable: true,
    });
  });

  it('should handle empty storage', () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    const storage = new LocalStorage('test-key');
    
    expect(storage.getMetrics()).toEqual({});
    expect(storage.getUnlockedAchievements()).toEqual([]);
  });

  it('should handle invalid JSON in storage', () => {
    mockLocalStorage.getItem.mockReturnValue('invalid-json');
    const storage = new LocalStorage('test-key');
    
    expect(storage.getMetrics()).toEqual({});
    expect(storage.getUnlockedAchievements()).toEqual([]);
  });

  it('should handle missing metrics in storage', () => {
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify({}));
    const storage = new LocalStorage('test-key');
    
    expect(storage.getMetrics()).toEqual({});
    expect(storage.getUnlockedAchievements()).toEqual([]);
  });

  it('should handle missing unlocked achievements in storage', () => {
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify({ metrics: {} }));
    const storage = new LocalStorage('test-key');
    
    expect(storage.getMetrics()).toEqual({});
    expect(storage.getUnlockedAchievements()).toEqual([]);
  });

  it('should handle Date serialization and deserialization', () => {
    const storage = new LocalStorage('test-key');
    const testDate = new Date();
    const metrics = { lastLogin: [testDate] };
    
    storage.setMetrics(metrics);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'test-key',
      expect.stringContaining(testDate.toISOString())
    );

    mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
      metrics: { lastLogin: [{ __type: 'Date', value: testDate.toISOString() }] },
      unlockedAchievements: []
    }));

    const retrievedMetrics = storage.getMetrics();
    const retrievedDate = retrievedMetrics.lastLogin[0];
    expect(retrievedDate).toBeInstanceOf(Date);
    expect((retrievedDate as Date).getTime()).toBe(testDate.getTime());
  });

  it('should handle clearing storage', () => {
    const storage = new LocalStorage('test-key');
    storage.clear();
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('test-key');
  });
});

describe('Achievement Components', () => {
  const mockStorage = new MockStorage();
  const mockAchievement = {
    achievementId: 'score_0',
    achievementTitle: 'Century!',
    achievementDescription: 'Score 100 points',
    achievementIconKey: 'trophy'
  };

  const mockUnlockedAchievements = [mockAchievement];

  it('should render BadgesButton with correct styles', () => {
    render(
      <BadgesButton
        onClick={() => {}}
        position="top-right"
        styles={{
          backgroundColor: 'red',
          color: 'white'
        }}
        unlockedAchievements={mockUnlockedAchievements}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveStyle({
      backgroundColor: 'red',
      color: 'white'
    });
  });

  it('should open and close BadgesModal', async () => {
    const onClose = jest.fn();
    const { rerender } = render(
      <BadgesModal
        isOpen={false}
        onClose={onClose}
        achievements={mockUnlockedAchievements}
      />
    );

    // Initially modal should not be visible
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Open modal
    rerender(
      <BadgesModal
        isOpen={true}
        onClose={onClose}
        achievements={mockUnlockedAchievements}
      />
    );

    // Modal should be visible
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Click close button
    fireEvent.click(screen.getByLabelText('Close'));

    // onClose should be called
    expect(onClose).toHaveBeenCalled();
  });

  it('should display unlocked achievements in modal', async () => {
    render(
      <BadgesModal
        isOpen={true}
        onClose={() => {}}
        achievements={mockUnlockedAchievements}
      />
    );

    // Check if achievement is displayed
    expect(screen.getByText('Century!')).toBeInTheDocument();
    expect(screen.getByText('Score 100 points')).toBeInTheDocument();
  });

  it('should display empty state when no achievements', () => {
    render(
      <BadgesModal
        isOpen={true}
        onClose={() => {}}
        achievements={[]}
      />
    );

    expect(screen.getByText(/No achievements unlocked yet/)).toBeInTheDocument();
  });
});

describe('BadgesButton', () => {
  const mockUnlockedAchievements = [
    {
      achievementId: 'score_0',
      achievementTitle: 'Century!',
      achievementDescription: 'Score 100 points',
      achievementIconKey: 'trophy'
    }
  ];

  it('should render with default styles', () => {
    render(
      <BadgesButton
        onClick={() => {}}
        position="top-right"
        unlockedAchievements={mockUnlockedAchievements}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveStyle({
      backgroundColor: '#4CAF50',
      color: 'white',
      borderRadius: '20px'
    });
  });

  it('should handle mouse events', () => {
    render(
      <BadgesButton
        onClick={() => {}}
        position="top-right"
        unlockedAchievements={mockUnlockedAchievements}
      />
    );

    const button = screen.getByRole('button');
    
    // Test mouse enter
    fireEvent.mouseEnter(button);
    expect(button).toHaveStyle({
      transform: 'scale(1.05)'
    });

    // Test mouse leave
    fireEvent.mouseLeave(button);
    expect(button).toHaveStyle({
      transform: 'scale(1)'
    });
  });

  it('should render in different positions', () => {
    const positions: ('top-left' | 'top-right' | 'bottom-left' | 'bottom-right')[] = [
      'top-left',
      'top-right',
      'bottom-left',
      'bottom-right'
    ];

    positions.forEach(position => {
      const { rerender } = render(
        <BadgesButton
          onClick={() => {}}
          position={position}
          unlockedAchievements={mockUnlockedAchievements}
        />
      );

      const button = screen.getByRole('button');

      switch (position) {
        case 'top-left':
          expect(button).toHaveStyle({ top: 0, left: 0 });
          break;
        case 'top-right':
          expect(button).toHaveStyle({ top: 0, right: 0 });
          break;
        case 'bottom-left':
          expect(button).toHaveStyle({ bottom: 0, left: 0 });
          break;
        case 'bottom-right':
          expect(button).toHaveStyle({ bottom: 0, right: 0 });
          break;
      }

      cleanup();
    });
  });

  it('should call onClick handler', () => {
    const handleClick = jest.fn();
    render(
      <BadgesButton
        onClick={handleClick}
        position="top-right"
        unlockedAchievements={mockUnlockedAchievements}
      />
    );

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });
});

describe('ConfettiWrapper', () => {
  it('should not render confetti when show is false', () => {
    const { queryByTestId } = render(
      <ConfettiWrapper show={false} />
    );

    expect(queryByTestId('mock-confetti')).not.toBeInTheDocument();
  });

  it('should render confetti when show is true', () => {
    const { queryByTestId } = render(
      <ConfettiWrapper show={true} />
    );

    expect(queryByTestId('mock-confetti')).toBeInTheDocument();
  });
});

describe('useAchievements Hook', () => {
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

  it('should throw error when used outside of AchievementProvider', () => {
    const TestComponent = () => {
      try {
        useAchievements();
        return null;
      } catch (error) {
        return <div data-testid="error">{error.message}</div>;
      }
    };

    render(<TestComponent />);
    expect(screen.getByTestId('error')).toHaveTextContent('useAchievements must be used within an AchievementProvider');
  });

  it('should provide achievement context', () => {
    const TestComponent = () => {
      const { update, achievements } = useAchievements();
      return (
        <div>
          <button onClick={() => update({ score: 100 })}>Update Score</button>
          <div data-testid="unlocked-count">
            Unlocked: {achievements.unlocked.length}
          </div>
        </div>
      );
    };

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
}); 