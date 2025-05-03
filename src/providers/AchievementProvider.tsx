import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { AchievementConfiguration, AchievementStorage, InitialAchievementMetrics, AchievementMetrics, StorageType } from '../core/types';
import { LocalStorage } from '../core/storage/LocalStorage';
import { MemoryStorage } from '../core/storage/MemoryStorage';
import { ConfettiWrapper } from '../core/components/ConfettiWrapper';

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
  icons?: Record<string, string>;
}

export const AchievementProvider: React.FC<AchievementProviderProps> = ({
  achievements,
  storage = StorageType.Local,
  children,
  icons = {},
}) => {
  const [achievementState, setAchievementState] = useState<{
    unlocked: string[];
    all: Record<string, any>;
  }>({
    unlocked: [],
    all: achievements,
  });

  const [metrics, setMetrics] = useState<AchievementMetrics>({});
  const seenAchievementsRef = useRef<Set<string>>(new Set());
  const initialLoadRef = useRef<boolean>(false);
  const storageRef = useRef<AchievementStorage | null>(null);
  const metricsUpdatedRef = useRef<boolean>(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<{
    achievementId?: string;
    achievementTitle?: string;
    achievementDescription?: string;
    achievementIconKey?: string;
  } | null>(null);

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

  const storageImpl = storageRef.current;

  const getNotifiedAchievementsKey = () => {
    return 'notifiedAchievements';
  };

  const loadNotifiedAchievements = () => {
    try {
      if (storageImpl instanceof LocalStorage) {
        const data = localStorage.getItem(`achievements_${getNotifiedAchievementsKey()}`);
        if (data) {
          const notifiedAchievements = JSON.parse(data) as string[];
          return new Set(notifiedAchievements);
        }
      } else {
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

  const saveNotifiedAchievements = (achievements: Set<string>) => {
    try {
      const achievementsArray = Array.from(achievements);
      
      if (storageImpl instanceof LocalStorage) {
        localStorage.setItem(
          `achievements_${getNotifiedAchievementsKey()}`, 
          JSON.stringify(achievementsArray)
        );
      } else {
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
    if (!initialLoadRef.current) {
      const savedUnlocked = storageImpl.getUnlockedAchievements() || [];
      const savedMetrics = storageImpl.getMetrics() || {};
      
      seenAchievementsRef.current = loadNotifiedAchievements();

      if (savedUnlocked.length > 0 || Object.keys(savedMetrics).length > 0) {
        setAchievementState(prev => ({
          ...prev,
          unlocked: savedUnlocked,
        }));
        setMetrics(savedMetrics);
        
        savedUnlocked.forEach(id => {
          seenAchievementsRef.current.add(id);
        });
        
        saveNotifiedAchievements(seenAchievementsRef.current);
      }
      
      initialLoadRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (Object.keys(metrics).length === 0 || !metricsUpdatedRef.current) return;
    
    metricsUpdatedRef.current = false;
    
    let newlyUnlockedAchievements: string[] = [];
    let achievementToShow: {
      achievementId?: string;
      achievementTitle?: string;
      achievementDescription?: string;
      achievementIconKey?: string;
    } | null = null;

    Object.entries(achievements).forEach(([metricName, metricAchievements]) => {
      const currentValue = metrics[metricName];
      
      if (currentValue !== undefined) {
        metricAchievements.forEach((achievement) => {
          const state = { metrics, unlockedAchievements: achievementState.unlocked };
          const valueToCheck = Array.isArray(currentValue) ? currentValue[0] : currentValue;
          const achievementId = achievement.achievementDetails.achievementId;
          
          if (achievement.isConditionMet(valueToCheck, state)) {
            if (!achievementState.unlocked.includes(achievementId) && 
                !newlyUnlockedAchievements.includes(achievementId)) {
              newlyUnlockedAchievements.push(achievementId);
              
              if (!seenAchievementsRef.current.has(achievementId)) {
                achievementToShow = achievement.achievementDetails;
              }
            }
          }
        });
      }
    });
    
    if (newlyUnlockedAchievements.length > 0) {
      const allUnlocked = [...achievementState.unlocked, ...newlyUnlockedAchievements];
      setAchievementState(prev => ({
        ...prev,
        unlocked: allUnlocked,
      }));
      storageImpl.setUnlockedAchievements(allUnlocked);

      if (achievementToShow) {
        setShowConfetti(false);
        setCurrentAchievement(null);
        
        setTimeout(() => {
          setCurrentAchievement(achievementToShow);
          setShowConfetti(true);
        }, 100);
      }
    }
  }, [metrics, achievementState.unlocked, achievements]);

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => {
        setShowConfetti(false);
        setCurrentAchievement(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  const update = (newMetrics: Record<string, any>) => {
    metricsUpdatedRef.current = true;

    const updatedMetrics = { ...metrics };
    
    Object.entries(newMetrics).forEach(([key, value]) => {
      updatedMetrics[key] = value;
    });
    
    setMetrics(updatedMetrics);
    
    const storageMetrics = Object.entries(updatedMetrics).reduce((acc, [key, value]) => ({
      ...acc,
      [key]: Array.isArray(value) ? value : [value]
    }), {});
    
    storageImpl.setMetrics(storageMetrics);
  };

  const reset = () => {
    storageImpl.clear();
    
    if (storageImpl instanceof LocalStorage) {
      localStorage.removeItem(`achievements_${getNotifiedAchievementsKey()}`);
    } else {
      (storageImpl as any).removeItem?.(getNotifiedAchievementsKey());
    }
    
    setAchievementState({
      unlocked: [],
      all: achievements,
    });
    setMetrics({});
    
    seenAchievementsRef.current.clear();
    
    setShowConfetti(false);
    setCurrentAchievement(null);
  };

  const getState = () => {
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
      <ConfettiWrapper 
        show={showConfetti}
        achievement={currentAchievement || undefined}
        icons={icons}
        notifiedAchievements={seenAchievementsRef.current}
        onAchievementNotified={(achievementId) => {
          seenAchievementsRef.current.add(achievementId);
          saveNotifiedAchievements(seenAchievementsRef.current);
        }}
      />
    </AchievementContext.Provider>
  );
}; 