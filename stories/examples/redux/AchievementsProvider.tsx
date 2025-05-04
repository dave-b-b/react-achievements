import React from 'react';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { AchievementProvider, AchievementDetails, AchievementConfiguration, AchievementState, AchievementMetricArrayValue, AchievementStorage } from '../../../src';
import { store, RootState, unlockAchievement, updateProgress, resetAchievements } from './store';

// Example achievement configuration
const achievementConfig: AchievementConfiguration = {
  score: [{
    isConditionMet: (value: AchievementMetricArrayValue, state: AchievementState): boolean => {
      const numValue = Array.isArray(value) ? value[0] : value;
      return typeof numValue === 'number' && numValue >= 100;
    },
    achievementDetails: {
      achievementId: 'score_100',
      achievementTitle: 'Century!',
      achievementDescription: 'Score 100 points',
      achievementIconKey: 'trophy'
    }
  }],
  login: [{
    isConditionMet: (value: AchievementMetricArrayValue, state: AchievementState): boolean => {
      const boolValue = Array.isArray(value) ? value[0] : value;
      return typeof boolValue === 'boolean' && boolValue === true;
    },
    achievementDetails: {
      achievementId: 'first_login',
      achievementTitle: 'First Login',
      achievementDescription: 'You logged in for the first time',
      achievementIconKey: 'login'
    }
  }]
};

// Custom icons
const icons = {
  trophy: '🏆',
  login: '🔑',
  default: '🎖️'
};

// Custom storage implementation that syncs with Redux
class ReduxStorage implements AchievementStorage {
  constructor(
    private dispatch: ReturnType<typeof useDispatch>,
    private getState: () => RootState
  ) {}

  getUnlockedAchievements(): string[] {
    return this.getState().achievements.unlockedAchievements.map(a => a.achievementId);
  }

  getUnlockedAchievementDetails(): AchievementDetails[] {
    return this.getState().achievements.unlockedAchievements;
  }

  setUnlockedAchievements(achievements: string[]): void {
    achievements.forEach(id => {
      // Find the full achievement details from the configuration
      Object.entries(achievementConfig).forEach(([, categoryAchievements]) => {
        categoryAchievements.forEach(a => {
          if (a.achievementDetails.achievementId === id) {
            this.dispatch(unlockAchievement(a.achievementDetails));
          }
        });
      });
    });
  }

  getMetrics(): Record<string, any> {
    return this.getState().achievements.progress;
  }

  setMetrics(metrics: Record<string, any>): void {
    Object.entries(metrics).forEach(([id, value]) => {
      const numValue = Array.isArray(value) ? value[0] : value;
      if (typeof numValue === 'number' || typeof numValue === 'boolean') {
        this.dispatch(updateProgress({ 
          id, 
          progress: typeof numValue === 'boolean' ? (numValue ? 1 : 0) : numValue 
        }));
      }
    });
  }

  clear(): void {
    this.dispatch(resetAchievements());
  }
}

/**
 * Example implementation of AchievementsProvider using Redux as the state management solution.
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
  const dispatch = useDispatch();
  // Subscribe to Redux state changes to force storage updates
  useSelector((state: RootState) => ({
    achievements: state.achievements.unlockedAchievements,
    progress: state.achievements.progress
  }));
  
  const storage = React.useMemo(() => new ReduxStorage(
    dispatch,
    store.getState
  ), [dispatch]);

  return (
    <AchievementProvider
      achievements={achievementConfig}
      storage={storage}
      icons={icons}
    >
      {children}
    </AchievementProvider>
  );
}; 