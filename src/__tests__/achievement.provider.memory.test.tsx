import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AchievementProvider, AchievementContext } from '../providers/AchievementProvider';
import { StorageType } from '../core/types';
import { MemoryStorage } from '../core/storage/MemoryStorage';

const TestComponent = () => {
  const context = React.useContext(AchievementContext);
  
  if (!context) {
    throw new Error('TestComponent must be used within an AchievementProvider');
  }
  
  const { update, achievements } = context;

  return (
    <div>
      <button onClick={() => update({ score: 100 })}>Update Score</button>
      <div data-testid="unlocked-count">
        Unlocked: {achievements.unlocked.length}
      </div>
    </div>
  );
};

describe('AchievementProvider with Memory Storage', () => {
  const achievementConfig = {
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

  it('should unlock achievement when using memory storage', () => {
    render(
      <AchievementProvider
        achievements={achievementConfig}
        storage={StorageType.Memory}
      >
        <TestComponent />
      </AchievementProvider>
    );

    // Initial state
    expect(screen.getByTestId('unlocked-count')).toHaveTextContent('Unlocked: 0');

    // Update score
    fireEvent.click(screen.getByText('Update Score'));

    // Check updated state
    expect(screen.getByTestId('unlocked-count')).toHaveTextContent('Unlocked: 1');
  });

  it('should not persist achievements between renders', () => {
    // Create a new memory storage for each test
    const storage1 = new MemoryStorage();
    
    // First render
    const { unmount } = render(
      <AchievementProvider
        achievements={achievementConfig}
        storage={storage1}
      >
        <TestComponent />
      </AchievementProvider>
    );

    // Update score
    fireEvent.click(screen.getByText('Update Score'));
    expect(screen.getByTestId('unlocked-count')).toHaveTextContent('Unlocked: 1');
    
    // Completely unmount
    unmount();
    
    // Create a fresh storage instance
    const storage2 = new MemoryStorage();
    
    // Mount again with new instance
    render(
      <AchievementProvider
        achievements={achievementConfig}
        storage={storage2}
      >
        <TestComponent />
      </AchievementProvider>
    );

    // State should be reset (new memory storage instance)
    expect(screen.getByTestId('unlocked-count')).toHaveTextContent('Unlocked: 0');
  });
}); 