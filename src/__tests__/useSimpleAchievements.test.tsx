import React from 'react';
import { render, act, screen } from '@testing-library/react';
import { AchievementProvider } from '../providers/AchievementProvider';
import { useSimpleAchievements } from '../hooks/useSimpleAchievements';
import { SimpleAchievementConfig, StorageType } from '../core/types';

// Test component that uses the simple achievements hook
const TestComponent: React.FC = () => {
  const { track, trackMultiple, unlocked, unlockedCount, reset } = useSimpleAchievements();

  return (
    <div>
      <div data-testid="unlocked-count">{unlockedCount}</div>
      <div data-testid="unlocked-list">{unlocked.join(',')}</div>
      <button onClick={() => track('score', 100)} data-testid="track-score">
        Track Score
      </button>
      <button onClick={() => track('level', 5)} data-testid="track-level">
        Track Level
      </button>
      <button onClick={() => trackMultiple({ score: 500, level: 10 })} data-testid="track-multiple">
        Track Multiple
      </button>
      <button onClick={() => track('completedTutorial', true)} data-testid="track-tutorial">
        Track Tutorial
      </button>
      <button onClick={() => reset()} data-testid="reset">
        Reset
      </button>
    </div>
  );
};

const simpleConfig: SimpleAchievementConfig = {
  score: {
    100: { title: 'Century!', description: 'Score 100 points', icon: '🏆' },
    500: { title: 'High Scorer!', description: 'Score 500 points', icon: '⭐' }
  },
  level: {
    5: { title: 'Leveling Up', description: 'Reach level 5', icon: '📈' },
    10: { title: 'Double Digits', description: 'Reach level 10', icon: '🔟' }
  },
  completedTutorial: {
    true: { title: 'Tutorial Master', description: 'Complete the tutorial', icon: '📚' }
  }
};

describe('useSimpleAchievements', () => {
  const renderWithProvider = (config = simpleConfig) => {
    return render(
      <AchievementProvider achievements={config} storage={StorageType.Memory}>
        <TestComponent />
      </AchievementProvider>
    );
  };

  it('should start with no unlocked achievements', () => {
    renderWithProvider();
    
    expect(screen.getByTestId('unlocked-count')).toHaveTextContent('0');
    expect(screen.getByTestId('unlocked-list')).toHaveTextContent('');
  });

  it('should unlock achievement when tracking a metric that meets threshold', async () => {
    renderWithProvider();
    
    await act(async () => {
      screen.getByTestId('track-score').click();
    });

    // Wait for achievement to be unlocked
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    expect(screen.getByTestId('unlocked-count')).toHaveTextContent('1');
    expect(screen.getByTestId('unlocked-list')).toHaveTextContent('score_100');
  });

  it('should unlock multiple achievements when tracking higher values', async () => {
    renderWithProvider();
    
    await act(async () => {
      screen.getByTestId('track-multiple').click(); // Tracks score: 500, level: 10
    });

    // Wait for achievements to be unlocked
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    expect(screen.getByTestId('unlocked-count')).toHaveTextContent('4');
    const unlockedList = screen.getByTestId('unlocked-list').textContent;
    expect(unlockedList).toContain('score_100');
    expect(unlockedList).toContain('score_500');
    expect(unlockedList).toContain('level_5');
    expect(unlockedList).toContain('level_10');
  });

  it('should handle boolean achievements', async () => {
    renderWithProvider();
    
    await act(async () => {
      screen.getByTestId('track-tutorial').click();
    });

    // Wait for achievement to be unlocked
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    expect(screen.getByTestId('unlocked-count')).toHaveTextContent('1');
    expect(screen.getByTestId('unlocked-list')).toHaveTextContent('completedTutorial_true');
  });

  it('should reset all achievements', async () => {
    renderWithProvider();
    
    // First unlock some achievements
    await act(async () => {
      screen.getByTestId('track-score').click();
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    expect(screen.getByTestId('unlocked-count')).toHaveTextContent('1');

    // Then reset
    await act(async () => {
      screen.getByTestId('reset').click();
    });

    expect(screen.getByTestId('unlocked-count')).toHaveTextContent('0');
    expect(screen.getByTestId('unlocked-list')).toHaveTextContent('');
  });

  it('should work with custom condition achievements', async () => {
    const customConfig: SimpleAchievementConfig = {
      combo: {
        custom: {
          title: 'Perfect Combo',
          description: 'Score 1000+ with perfect accuracy',
          icon: '💎',
          condition: (metrics) => metrics.score >= 1000 && metrics.accuracy === 100
        }
      }
    };

    render(
      <AchievementProvider achievements={customConfig} storage={StorageType.Memory}>
        <TestComponentForCustom />
      </AchievementProvider>
    );

    // Track metrics that don't meet the condition
    await act(async () => {
      screen.getByTestId('track-partial').click(); // score: 999, accuracy: 100
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100)); // Increase wait time
    });

    expect(screen.getByTestId('unlocked-count')).toHaveTextContent('0');

    // Track metrics that meet the condition
    await act(async () => {
      screen.getByTestId('track-perfect').click(); // score: 1000, accuracy: 100
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100)); // Increase wait time
    });

    expect(screen.getByTestId('unlocked-count')).toHaveTextContent('1');
  });
});

// Helper component for custom condition testing
const TestComponentForCustom: React.FC = () => {
  const { trackMultiple, unlocked, unlockedCount } = useSimpleAchievements();

  return (
    <div>
      <div data-testid="unlocked-count">{unlockedCount}</div>
      <div data-testid="unlocked-list">{unlocked.join(',')}</div>
      <button 
        onClick={() => trackMultiple({ score: 999, accuracy: 100 })} 
        data-testid="track-partial"
      >
        Track Partial
      </button>
      <button 
        onClick={() => trackMultiple({ score: 1000, accuracy: 100 })} 
        data-testid="track-perfect"
      >
        Track Perfect
      </button>
    </div>
  );
};