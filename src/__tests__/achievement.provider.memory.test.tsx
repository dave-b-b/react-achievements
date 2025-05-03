import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AchievementProvider } from '../providers/AchievementProvider';
import { StorageType } from '../core/types';

const TestComponent = () => {
  const { update, achievements } = React.useContext(AchievementProvider.context);

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
    const { rerender } = render(
      <AchievementProvider
        achievements={achievementConfig}
        storage={StorageType.Memory}
      >
        <TestComponent />
      </AchievementProvider>
    );

    // Update score
    fireEvent.click(screen.getByText('Update Score'));
    expect(screen.getByTestId('unlocked-count')).toHaveTextContent('Unlocked: 1');

    // Re-render with new provider instance
    rerender(
      <AchievementProvider
        achievements={achievementConfig}
        storage={StorageType.Memory}
      >
        <TestComponent />
      </AchievementProvider>
    );

    // State should be reset
    expect(screen.getByTestId('unlocked-count')).toHaveTextContent('Unlocked: 0');
  });
}); 