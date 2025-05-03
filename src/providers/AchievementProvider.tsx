import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { AchievementConfiguration, AchievementStorage, InitialAchievementMetrics, AchievementMetrics, StorageType } from '../core/types';
import { LocalStorage } from '../core/storage/LocalStorage';
import { MemoryStorage } from '../core/storage/MemoryStorage';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
  // Use ref to track already seen achievements to prevent duplicate notifications
  const seenAchievementsRef = useRef<Set<string>>(new Set());
  // Track if initial data has loaded from storage
  const initialLoadRef = useRef<boolean>(false);
  // Keep a ref to storage instance to avoid recreating it
  const storageRef = useRef<AchievementStorage | null>(null);
  // Flag to track metrics updates triggered by the update function
  const metricsUpdatedRef = useRef<boolean>(false);

  // Initialize storage once
  if (!storageRef.current) {
    if (typeof storage === 'string') {
      if (storage === StorageType.Local) {
        storageRef.current = new LocalStorage('achievements');
      } else if (storage === StorageType.Memory) {
        storageRef.current = new MemoryStorage();
      } else {
        throw new Error(`Unsupported storage type: ${storage}`);
      }
    } else {
      storageRef.current = storage;
    }
  }

  // Ensure we have a valid storage implementation
  const storageImpl = storageRef.current;

  // Helper to get the notification record key
  const getNotifiedAchievementsKey = () => {
    return 'notifiedAchievements';
  };

  // Load notified achievements from storage
  const loadNotifiedAchievements = () => {
    try {
      // For Local Storage implementation, we need a special approach
      if (storageImpl instanceof LocalStorage) {
        const data = localStorage.getItem(`achievements_${getNotifiedAchievementsKey()}`);
        if (data) {
          const notifiedAchievements = JSON.parse(data) as string[];
          return new Set(notifiedAchievements);
        }
      } else {
        // For other storage implementations, use getItem if available
        const data = (storageImpl as any).getItem?.(getNotifiedAchievementsKey());
        if (data) {
          return new Set(JSON.parse(data) as string[]);
        }
      }
    } catch (e) {
      console.error('Error loading notified achievements', e);
    }
    return new Set<string>();
  };

  // Save notified achievements to storage
  const saveNotifiedAchievements = (achievements: Set<string>) => {
    try {
      const achievementsArray = Array.from(achievements);
      
      // For Local Storage implementation, we need a special approach
      if (storageImpl instanceof LocalStorage) {
        localStorage.setItem(
          `achievements_${getNotifiedAchievementsKey()}`, 
          JSON.stringify(achievementsArray)
        );
      } else {
        // For other storage implementations, use setItem if available
        (storageImpl as any).setItem?.(
          getNotifiedAchievementsKey(), 
          JSON.stringify(achievementsArray)
        );
      }
    } catch (e) {
      console.error('Error saving notified achievements', e);
    }
  };

  useEffect(() => {
    // Load initial state from storage only once
    if (!initialLoadRef.current) {
      const savedUnlocked = storageImpl.getUnlockedAchievements() || [];
      const savedMetrics = storageImpl.getMetrics() || {};
      
      // Load already notified achievements from storage
      seenAchievementsRef.current = loadNotifiedAchievements();

      if (savedUnlocked.length > 0 || Object.keys(savedMetrics).length > 0) {
        setAchievementState(prev => ({
          ...prev,
          unlocked: savedUnlocked,
        }));
        setMetrics(savedMetrics);
        
        // Make sure all unlocked achievements are marked as seen
        savedUnlocked.forEach(id => {
          seenAchievementsRef.current.add(id);
        });
        
        // Save the updated seen achievements back to storage
        saveNotifiedAchievements(seenAchievementsRef.current);
      }
      
      initialLoadRef.current = true;
    }
  }, []);

  // Effect that checks for achievements whenever metrics change
  useEffect(() => {
    // Skip if metrics is empty (initial render) or if this wasn't triggered by the update function
    if (Object.keys(metrics).length === 0 || !metricsUpdatedRef.current) return;
    
    // Reset the flag
    metricsUpdatedRef.current = false;
    
    // Track all achievements that should be unlocked in this update
    let newlyUnlockedAchievements: string[] = [];

    // Check each achievement criteria for ALL metrics
    Object.entries(achievements).forEach(([metricName, metricAchievements]) => {
      const currentValue = metrics[metricName];
      
      // Only check conditions if we have a value for this metric
      if (currentValue !== undefined) {
        metricAchievements.forEach((achievement) => {
          const state = { metrics, unlockedAchievements: achievementState.unlocked };
          // Use the first element if it's an array, otherwise use the value directly
          const valueToCheck = Array.isArray(currentValue) ? currentValue[0] : currentValue;
          const achievementId = achievement.achievementDetails.achievementId;
          
          if (achievement.isConditionMet(valueToCheck, state)) {
            if (!achievementState.unlocked.includes(achievementId) && 
                !newlyUnlockedAchievements.includes(achievementId)) {
              newlyUnlockedAchievements.push(achievementId);
              
              // Only show notification if we haven't seen this achievement before
              if (!seenAchievementsRef.current.has(achievementId)) {
                // Create a unique toast ID to prevent duplicates
                const toastId = `achievement-${achievementId}`;
                
                // Find the full achievement details to display in toast
                const achievementDetails = achievement.achievementDetails;
                
                // Show the toast notification
                toast(
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{achievementDetails.achievementTitle}</div>
                    <div>{achievementDetails.achievementDescription}</div>
                  </div>,
                  {
                    toastId,
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true
                  }
                );
                
                // Mark this achievement as seen when it's unlocked
                seenAchievementsRef.current.add(achievementId);
                
                // Save the updated seen achievements to storage
                saveNotifiedAchievements(seenAchievementsRef.current);
              }
            }
          }
        });
      }
    }, [metrics, achievementState.unlocked, achievements]);
    
    // Apply all unlocked achievements at once if we have any new ones
    if (newlyUnlockedAchievements.length > 0) {
      const allUnlocked = [...achievementState.unlocked, ...newlyUnlockedAchievements];
      setAchievementState(prev => ({
        ...prev,
        unlocked: allUnlocked,
      }));
      storageImpl.setUnlockedAchievements(allUnlocked);
    }
  }, [metrics, achievementState.unlocked, achievements]);

  const update = (newMetrics: Record<string, any>) => {
    // Update metrics state keeping original values but also support array format for testing
    const updatedMetrics = { ...metrics };
    
    // Process new metrics
    Object.entries(newMetrics).forEach(([key, value]) => {
      updatedMetrics[key] = value;
    });

    // Set the flag that this metrics update came from the update function
    metricsUpdatedRef.current = true;
    
    // Update the metrics state - will trigger useEffect to check achievements
    setMetrics(updatedMetrics);
    
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
    
    // Also clear the notified achievements in storage
    if (storageImpl instanceof LocalStorage) {
      localStorage.removeItem(`achievements_${getNotifiedAchievementsKey()}`);
    } else {
      (storageImpl as any).removeItem?.(getNotifiedAchievementsKey());
    }
    
    // Reset the state to initial values
    setAchievementState({
      unlocked: [],
      all: achievements,
    });
    setMetrics({});
    
    // Also clear the set of seen achievements
    seenAchievementsRef.current.clear();
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