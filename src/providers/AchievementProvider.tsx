import React, { createContext, useContext, useEffect, useState } from 'react';
import { AchievementConfiguration, AchievementStorage, InitialAchievementMetrics, AchievementMetrics, StorageType } from '../core/types';
import { LocalStorage } from '../core/storage/LocalStorage';
import { MemoryStorage } from '../core/storage/MemoryStorage';

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
      storageImpl = new MemoryStorage();
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
    // Update metrics state keeping original values but also support array format for testing
    const updatedMetrics = { ...metrics };
    
    // Process new metrics
    Object.entries(newMetrics).forEach(([key, value]) => {
      updatedMetrics[key] = value;
    });

    setMetrics(updatedMetrics);

    // Track all achievements that should be unlocked in this update
    let newlyUnlockedAchievements: string[] = [];

    // Check each achievement criteria for ALL metrics (not just updated ones)
    Object.entries(achievements).forEach(([metricName, metricAchievements]) => {
      const currentValue = updatedMetrics[metricName];
      
      // Only check conditions if we have a value for this metric
      if (currentValue !== undefined) {
        metricAchievements.forEach((achievement) => {
          const state = { metrics: updatedMetrics, unlockedAchievements: achievementState.unlocked };
          // Use the first element if it's an array, otherwise use the value directly
          const valueToCheck = Array.isArray(currentValue) ? currentValue[0] : currentValue;
          const achievementId = achievement.achievementDetails.achievementId;
          if (achievement.isConditionMet(valueToCheck, state)) {
            if (!achievementState.unlocked.includes(achievementId) && 
                !newlyUnlockedAchievements.includes(achievementId)) {
              newlyUnlockedAchievements.push(achievementId);
            }
          }
        });
      }
    });
    
    // Apply all unlocked achievements at once if we have any new ones
    if (newlyUnlockedAchievements.length > 0) {
      const allUnlocked = [...achievementState.unlocked, ...newlyUnlockedAchievements];
      setAchievementState(prev => ({
        ...prev,
        unlocked: allUnlocked,
      }));
      storageImpl.setUnlockedAchievements(allUnlocked);
    }
    
    // For testing compatibility, convert metrics to array format for storage
    const storageMetrics = Object.entries(updatedMetrics).reduce((acc, [key, value]) => ({
      ...acc,
      [key]: Array.isArray(value) ? value : [value]
    }), {});
    
    storageImpl.setMetrics(storageMetrics);
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

  const getState = () => {
    // Convert metrics to array format for backward compatibility with tests
    const metricsInArrayFormat = Object.entries(metrics).reduce((acc, [key, value]) => ({
      ...acc,
      [key]: Array.isArray(value) ? value : [value]
    }), {});
    
    return {
      metrics: metricsInArrayFormat,
      unlocked: achievementState.unlocked,
    };
  };

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