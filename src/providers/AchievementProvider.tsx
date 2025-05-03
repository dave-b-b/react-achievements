import React, { createContext, useContext, useEffect, useState } from 'react';
import { AchievementConfiguration, AchievementStorage, InitialAchievementMetrics, AchievementMetrics, StorageType } from '../core/types';
import { LocalStorage } from '../core/storage/LocalStorage';

export interface AchievementContextType {
  update: (metrics: Record<string, any>) => void;
  achievements: {
    unlocked: string[];
    all: Record<string, any>;
  };
  reset: () => void;
  getState: () => {
    metrics: AchievementMetrics;
    unlocked: string[];
  };
}

export const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

interface AchievementProviderProps {
  achievements: AchievementConfiguration;
  storage?: AchievementStorage | StorageType;
  children: React.ReactNode;
}

export const AchievementProvider: React.FC<AchievementProviderProps> = ({
  achievements,
  storage = StorageType.Local,
  children,
}) => {
  const [achievementState, setAchievementState] = useState<{
    unlocked: string[];
    all: Record<string, any>;
  }>({
    unlocked: [],
    all: achievements,
  });

  const [metrics, setMetrics] = useState<AchievementMetrics>({});

  let storageImpl: AchievementStorage;
  
  if (typeof storage === 'string') {
    if (storage === StorageType.Local) {
      storageImpl = new LocalStorage('achievements');
    } else if (storage === StorageType.Memory) {
      // TODO: Implement memory storage
      storageImpl = new LocalStorage('achievements');
    } else {
      throw new Error(`Unsupported storage type: ${storage}`);
    }
  } else {
    storageImpl = storage;
  }

  useEffect(() => {
    // Load initial state from storage
    const savedUnlocked = storageImpl.getUnlockedAchievements() || [];
    const savedMetrics = storageImpl.getMetrics() || {};
    if (savedUnlocked.length > 0 || Object.keys(savedMetrics).length > 0) {
      setAchievementState(prev => ({
        ...prev,
        unlocked: savedUnlocked,
      }));
      setMetrics(savedMetrics);
    }
  }, []);

  const update = (newMetrics: Record<string, any>) => {
    // Update metrics state
    const updatedMetrics = Object.entries(newMetrics).reduce((acc, [key, value]) => ({
      ...acc,
      [key]: Array.isArray(value) ? value : [value]
    }), { ...metrics });

    setMetrics(updatedMetrics);

    // Check each achievement condition
    Object.entries(newMetrics).forEach(([metricName, value]) => {
      const metricAchievements = achievements[metricName];
      if (metricAchievements) {
        metricAchievements.forEach((achievement) => {
          const state = { metrics: updatedMetrics, unlockedAchievements: achievementState.unlocked };
          if (achievement.isConditionMet(value, state)) {
            const achievementId = achievement.achievementDetails.achievementId;
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
    storageImpl.setMetrics(updatedMetrics);
  };

  const reset = () => {
    // Clear the storage first
    storageImpl.clear();
    
    // Reset the state to initial values
    setAchievementState({
      unlocked: [],
      all: achievements,
    });
    setMetrics({});
  };

  const getState = () => ({
    metrics,
    unlocked: achievementState.unlocked,
  });

  return (
    <AchievementContext.Provider
      value={{
        update,
        achievements: achievementState,
        reset,
        getState,
      }}
    >
      {children}
    </AchievementContext.Provider>
  );
}; 