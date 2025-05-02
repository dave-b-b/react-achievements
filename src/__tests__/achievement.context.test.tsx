import React, { createContext, useContext, useState } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { AchievementProvider } from '../providers/AchievementProvider';
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

// Create Game Context
interface GameContextType {
  score: number;
  incrementScore: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [score, setScore] = useState(0);

  const incrementScore = () => setScore(prev => prev + 100);

  return (
    <GameContext.Provider value={{ score, incrementScore }}>
      {children}
    </GameContext.Provider>
  );
};

const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

// Test component using Context
const TestComponent = () => {
  const { score, incrementScore } = useGame();
  const { update, achievements } = useAchievements();

  const handleClick = () => {
    incrementScore();
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

describe('Achievement System with Context', () => {
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
  });

  it('should unlock achievement when score increases through Context', async () => {
    render(
      <GameProvider>
        <AchievementProvider
          achievements={achievementConfig}
          storage={mockStorage}
        >
          <TestComponent />
        </AchievementProvider>
      </GameProvider>
    );

    // Initial state
    expect(screen.getByTestId('score')).toHaveTextContent('Score: 0');
    expect(screen.getByTestId('unlocked-count')).toHaveTextContent('Unlocked: 0');

    // Update score through Context
    await act(async () => {
      fireEvent.click(screen.getByText('Increment Score'));
    });

    // Check updated state
    expect(screen.getByTestId('score')).toHaveTextContent('Score: 100');
    expect(screen.getByTestId('unlocked-count')).toHaveTextContent('Unlocked: 1');
    expect(mockStorage.getUnlockedAchievements()).toHaveLength(1);
    expect(mockStorage.getMetrics()).toEqual({ score: 100 });
  });
}); 