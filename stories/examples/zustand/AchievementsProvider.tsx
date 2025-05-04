import React from 'react';
import { AchievementProvider, AchievementConfiguration, AchievementMetricArrayValue, AchievementState, StorageType, AchievementDetails, AchievementStorage } from '../../../src';
import { useAchievementsStore } from './store';

// Example achievement configuration
const achievementConfig: AchievementConfiguration = {
  score: [{
    isConditionMet: (value: AchievementMetricArrayValue, state: AchievementState) => {
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
    isConditionMet: (value: AchievementMetricArrayValue, state: AchievementState) => {
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

// Custom storage implementation that syncs with Zustand
class ZustandStorage implements AchievementStorage {
  constructor(private store: {
    unlockedAchievements: AchievementDetails[];
    progress: Record<string, number>;
    unlockAchievement: (achievement: AchievementDetails) => void;
    updateProgress: (achievementId: string, value: number) => void;
    reset: () => void;
  }) {}

  getUnlockedAchievements(): string[] {
    return this.store.unlockedAchievements.map(a => a.achievementId);
  }

  setUnlockedAchievements(achievements: string[]): void {
    achievements.forEach(id => {
      // Find the full achievement details from the configuration
      Object.entries(achievementConfig).forEach(([, categoryAchievements]) => {
        categoryAchievements.forEach(a => {
          if (a.achievementDetails.achievementId === id) {
            this.store.unlockAchievement(a.achievementDetails);
          }
        });
      });
    });
  }

  getMetrics(): Record<string, any> {
    return this.store.progress;
  }

  setMetrics(metrics: Record<string, any>): void {
    Object.entries(metrics).forEach(([id, value]) => {
      const numValue = Array.isArray(value) ? value[0] : value;
      if (typeof numValue === 'number' || typeof numValue === 'boolean') {
        this.store.updateProgress(id, typeof numValue === 'boolean' ? (numValue ? 1 : 0) : numValue);
      }
    });
  }

  clear(): void {
    this.store.reset();
  }
}

/**
 * Example implementation of AchievementsProvider using Zustand as the state management solution.
 */
export const ZustandAchievementsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const store = useAchievementsStore();
  const storage = React.useMemo(() => new ZustandStorage(store), [store]);

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