import React from 'react';
import { Provider } from 'react-redux';
import { AchievementProvider } from '../../../src';
import type { SimpleAchievementConfig } from '../../../src';
import { store } from './store';
import { createMockAchievementClient } from '../../mocks/achievementClient';

// Example achievement configuration
const achievementConfig: SimpleAchievementConfig = {
  score: {
    100: {
      title: 'Century!',
      description: 'Score 100 points',
      icon: 'trophy'
    }
  },
  login: {
    true: {
      title: 'First Login',
      description: 'You logged in for the first time',
      icon: 'login'
    }
  }
};

// Custom icons
const icons = {
  trophy: '🏆',
  login: '🔑',
  default: '🎖️'
};

/**
 * Example implementation of AchievementsProvider in a Redux app.
 * This component wraps your application and provides the achievements context.
 */
export const ReduxAchievementsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Provider store={store}>
      <ReduxAchievementsWrapper>{children}</ReduxAchievementsWrapper>
    </Provider>
  );
};

/**
 * Internal wrapper component that connects Redux state to the AchievementsProvider
 */
const ReduxAchievementsWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const client = React.useMemo(
    () => createMockAchievementClient({ achievements: achievementConfig }),
    []
  );

  return (
    <AchievementProvider
      client={client}
      icons={icons}
    >
      {children}
    </AchievementProvider>
  );
}; 
