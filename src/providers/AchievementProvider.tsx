import React, { createContext, useContext, useEffect, useState } from 'react';
import { AchievementConfiguration, AchievementStorage, InitialAchievementMetrics } from '../core/types';
import { LocalStorage } from '../core/storage/LocalStorage';

interface AchievementContextType {
  update: (metrics: Record<string, any>) => void;
  achievements: {
    unlocked: string[];
    all: Record<string, any>;
  };
  reset: () => void;
}

export const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

interface AchievementProviderProps {
  achievements: AchievementConfiguration;
  storage?: AchievementStorage | 'local' | 'memory';
  children: React.ReactNode;
}

export const AchievementProvider: React.FC<AchievementProviderProps> = ({
  achievements,
  storage = 'local',
  children,
}) => {
  const [achievementState, setAchievementState] = useState<{
    unlocked: string[];
    all: Record<string, any>;
  }>({
    unlocked: [],
    all: achievements,
  });

  const storageImpl = typeof storage === 'string'
    ? storage === 'local'
      ? new LocalStorage('achievements')
      : new LocalStorage('achievements') // TODO: Implement memory storage
    : storage;

  useEffect(() => {
    // Load initial state from storage
    const savedUnlocked = storageImpl.getUnlockedAchievements() || [];
    if (savedUnlocked.length > 0) {
      setAchievementState(prev => ({
        ...prev,
        unlocked: savedUnlocked,
      }));
    }
  }, []);

  const update = (metrics: Record<string, any>) => {
    // Check each achievement condition
    Object.entries(metrics).forEach(([metricName, value]) => {
      const metricAchievements = achievements[metricName];
      if (metricAchievements) {
        Object.entries(metricAchievements).forEach(([threshold, details]) => {
          const thresholdValue = parseInt(threshold, 10);
          if (value >= thresholdValue) {
            const achievementId = `${metricName}_${threshold}`;
            if (!achievementState.unlocked.includes(achievementId)) {
              const newUnlocked = [...achievementState.unlocked, achievementId];
              setAchievementState(prev => ({
                ...prev,
                unlocked: newUnlocked,
              }));
              storageImpl.setUnlockedAchievements(newUnlocked);
            }
          }
        });
      }
    });
    storageImpl.setMetrics(metrics);
  };

  const reset = () => {
    setAchievementState({
      unlocked: [],
      all: achievements,
    });
    storageImpl.clear();
  };

  return (
    <AchievementContext.Provider
      value={{
        update,
        achievements: achievementState,
        reset,
      }}
    >
      {children}
    </AchievementContext.Provider>
  );
}; 