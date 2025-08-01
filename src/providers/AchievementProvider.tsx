import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { AchievementConfiguration, AchievementConfigurationType, AchievementStorage, InitialAchievementMetrics, AchievementMetrics, StorageType } from '../core/types';
import { normalizeAchievements } from '../core/utils/configNormalizer';
import { LocalStorage } from '../core/storage/LocalStorage';
import { MemoryStorage } from '../core/storage/MemoryStorage';
import { ConfettiWrapper } from '../core/components/ConfettiWrapper';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface AchievementDetails {
  achievementId?: string;
  achievementTitle?: string;
  achievementDescription?: string;
  achievementIconKey?: string;
}

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
  achievements: AchievementConfigurationType;
  storage?: AchievementStorage | StorageType;
  children: React.ReactNode;
  icons?: Record<string, string>;
}

export const AchievementProvider: React.FC<AchievementProviderProps> = ({
  achievements: achievementsConfig,
  storage = StorageType.Local,
  children,
  icons = {},
}) => {
  // Normalize the configuration to the complex format
  const achievements = normalizeAchievements(achievementsConfig);
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
  const [currentAchievement, setCurrentAchievement] = useState<AchievementDetails | null>(null);

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
    let achievementToShow: AchievementDetails | null = null;

    Object.entries(achievements).forEach(([metricName, metricAchievements]) => {
      metricAchievements.forEach((achievement) => {
        const state = { metrics, unlockedAchievements: achievementState.unlocked };
        const achievementId = achievement.achievementDetails.achievementId;
        
        // For custom conditions, we always check against all metrics
        // For threshold-based conditions, we check against the specific metric
        const currentValue = metrics[metricName];
        const shouldCheckAchievement = currentValue !== undefined || 
          achievement.achievementDetails.achievementId.includes('_custom_');
        
        if (shouldCheckAchievement) {
          const valueToCheck = currentValue;
          
          if (achievement.isConditionMet(valueToCheck, state)) {
            if (!achievementState.unlocked.includes(achievementId) && 
                !newlyUnlockedAchievements.includes(achievementId)) {
              newlyUnlockedAchievements.push(achievementId);
              
              if (!seenAchievementsRef.current.has(achievementId)) {
                achievementToShow = achievement.achievementDetails;
              }
            }
          }
        }
      });
    });
    
    if (newlyUnlockedAchievements.length > 0) {
      const allUnlocked = [...achievementState.unlocked, ...newlyUnlockedAchievements];
      setAchievementState(prev => ({
        ...prev,
        unlocked: allUnlocked,
      }));
      storageImpl.setUnlockedAchievements(allUnlocked);

      if (achievementToShow) {
        const achievement: AchievementDetails = achievementToShow;
        
        // Show toast notification
        let iconToDisplay = '🏆';
        
        if (achievement.achievementIconKey && achievement.achievementIconKey in icons) {
          iconToDisplay = icons[achievement.achievementIconKey];
        }

        const toastId = achievement.achievementId 
          ? `achievement-${achievement.achievementId}` 
          : `achievement-${Date.now()}`;

        toast.success(
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '2em', marginRight: '10px' }}>{iconToDisplay}</span>
            <div>
              <h4 style={{ margin: '0 0 8px 0' }}>Achievement Unlocked! 🎉</h4>
              <div style={{ fontWeight: 'bold' }}>{achievement.achievementTitle}</div>
              <div style={{ color: '#666' }}>{achievement.achievementDescription}</div>
            </div>
          </div>,
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            toastId
          }
        );

        // Update seen achievements
        if (achievement.achievementId) {
          seenAchievementsRef.current.add(achievement.achievementId);
          saveNotifiedAchievements(seenAchievementsRef.current);
        }

        // Show confetti
        setCurrentAchievement(achievement);
        setShowConfetti(true);

        // Hide confetti after 5 seconds
        const timer = setTimeout(() => {
          setShowConfetti(false);
          setCurrentAchievement(null);
        }, 5000);

        return () => clearTimeout(timer);
      }
    }
  }, [metrics, achievementState.unlocked, achievements, icons]);

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
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <ConfettiWrapper show={showConfetti} />
    </AchievementContext.Provider>
  );
}; 