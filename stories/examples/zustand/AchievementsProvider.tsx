import React from 'react';
import { AchievementProvider } from '../../../src';
import type { SimpleAchievementConfig } from '../../../src';
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
 * Example implementation of AchievementsProvider in a Zustand app.
 * The v5 provider uses an AchievementClient; the app store can still own any
 * surrounding UI state.
 */
export const ZustandAchievementsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
