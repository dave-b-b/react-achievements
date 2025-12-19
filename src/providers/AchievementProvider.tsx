import React, { createContext, useEffect, useState, useRef } from 'react';
import { AchievementConfigurationType, AchievementStorage, AsyncAchievementStorage, isAsyncStorage, AchievementMetrics, StorageType, AchievementWithStatus, UIConfig } from '../core/types';
import { normalizeAchievements } from '../core/utils/configNormalizer';
import { LocalStorage } from '../core/storage/LocalStorage';
import { MemoryStorage } from '../core/storage/MemoryStorage';
import { AsyncStorageAdapter } from '../core/storage/AsyncStorageAdapter';
import { IndexedDBStorage } from '../core/storage/IndexedDBStorage';
import { RestApiStorage, RestApiStorageConfig } from '../core/storage/RestApiStorage';
import { exportAchievementData, createConfigHash } from '../core/utils/dataExport';
import { importAchievementData, ImportOptions, ImportResult } from '../core/utils/dataImport';
import { AchievementError, ConfigurationError } from '../core/errors/AchievementErrors';

// New UI system (v3.6.0)
import { BuiltInNotification } from '../core/ui/BuiltInNotification';
import { BuiltInConfetti } from '../core/ui/BuiltInConfetti';
import { detectLegacyLibraries, LegacyLibraries } from '../core/ui/legacyDetector';
import { createLegacyToastNotification, createLegacyConfettiWrapper } from '../core/ui/LegacyWrappers';
import type { NotificationComponent, ConfettiComponent } from '../core/types';

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
  exportData: () => string;
  importData: (jsonString: string, options?: ImportOptions) => ImportResult;
  getAllAchievements: () => AchievementWithStatus[];
}

export const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

interface AchievementProviderProps {
  achievements: AchievementConfigurationType;
  storage?: AchievementStorage | AsyncAchievementStorage | StorageType;
  children: React.ReactNode;
  icons?: Record<string, string>;
  onError?: (error: AchievementError) => void;
  restApiConfig?: RestApiStorageConfig;

  /**
   * UI configuration for notifications, modal, and confetti
   * NEW in v3.6.0
   */
  ui?: UIConfig;

  /**
   * Force use of built-in UI components (opt-in for v3.x)
   * Set to true to skip legacy library detection and use built-in UI
   * In v4.0.0, this will become the default behavior
   * NEW in v3.6.0
   * @default false
   */
  useBuiltInUI?: boolean;
}

export const AchievementProvider: React.FC<AchievementProviderProps> = ({
  achievements: achievementsConfig,
  storage = StorageType.Local,
  children,
  icons = {},
  onError,
  restApiConfig,
  ui = {},
  useBuiltInUI = false,
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
  const [_currentAchievement, setCurrentAchievement] = useState<AchievementDetails | null>(null);

  // NEW: UI component resolution state (v3.6.0)
  const [legacyLibraries, setLegacyLibraries] = useState<LegacyLibraries | null>(null);
  const [uiReady, setUiReady] = useState(useBuiltInUI); // Ready immediately if forcing built-in
  const [currentNotification, setCurrentNotification] = useState<{
    achievement: { id: string; title: string; description: string; icon: string };
  } | null>(null);

  if (!storageRef.current) {
    if (typeof storage === 'string') {
      // StorageType enum
      switch (storage) {
        case StorageType.Local:
          storageRef.current = new LocalStorage('achievements');
          break;
        case StorageType.Memory:
          storageRef.current = new MemoryStorage();
          break;
        case StorageType.IndexedDB: {
          // Wrap async storage with adapter
          const indexedDB = new IndexedDBStorage('react-achievements');
          storageRef.current = new AsyncStorageAdapter(indexedDB, { onError });
          break;
        }
        case StorageType.RestAPI: {
          if (!restApiConfig) {
            throw new ConfigurationError('restApiConfig is required when using StorageType.RestAPI');
          }
          // Wrap async storage with adapter
          const restApi = new RestApiStorage(restApiConfig);
          storageRef.current = new AsyncStorageAdapter(restApi, { onError });
          break;
        }
        default:
          throw new ConfigurationError(`Unsupported storage type: ${storage}`);
      }
    } else {
      // Custom storage instance
      // Check if it's async storage and wrap with adapter
      if (isAsyncStorage(storage)) {
        storageRef.current = new AsyncStorageAdapter(storage, { onError });
      } else {
        storageRef.current = storage;
      }
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

  // NEW: Detect legacy UI libraries on mount (v3.6.0)
  useEffect(() => {
    if (useBuiltInUI) {
      // User explicitly wants built-in UI, skip detection
      setUiReady(true);
      return;
    }

    // Attempt to detect legacy libraries
    detectLegacyLibraries().then((libs) => {
      setLegacyLibraries(libs);
      setUiReady(true);
    });
  }, [useBuiltInUI]);

  // NEW: Resolve UI components based on detection and config (v3.6.0)
  const NotificationComponent: NotificationComponent =
    ui.NotificationComponent ||
    (useBuiltInUI ? BuiltInNotification :
     legacyLibraries && Object.keys(legacyLibraries).length > 0 && legacyLibraries.toast
       ? createLegacyToastNotification(legacyLibraries)
       : BuiltInNotification);

  const ConfettiComponentResolved: ConfettiComponent =
    ui.ConfettiComponent ||
    (useBuiltInUI ? BuiltInConfetti :
     legacyLibraries && Object.keys(legacyLibraries).length > 0 && legacyLibraries.Confetti
       ? createLegacyConfettiWrapper(legacyLibraries)
       : BuiltInConfetti);

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
    
    const newlyUnlockedAchievements: string[] = [];
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

      if (achievementToShow && (ui.enableNotifications !== false)) {
        const achievement: AchievementDetails = achievementToShow;

        // Get icon to display
        let iconToDisplay = '🏆';
        if (achievement.achievementIconKey && achievement.achievementIconKey in icons) {
          iconToDisplay = icons[achievement.achievementIconKey];
        }

        // NEW: Use resolved notification component (v3.6.0)
        setCurrentNotification({
          achievement: {
            id: achievement.achievementId || `achievement-${Date.now()}`,
            title: achievement.achievementTitle || 'Achievement Unlocked!',
            description: achievement.achievementDescription || '',
            icon: iconToDisplay,
          },
        });

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

  const getAllAchievements = (): AchievementWithStatus[] => {
    const result: AchievementWithStatus[] = [];

    // Iterate through all normalized achievements
    Object.entries(achievements).forEach(([_metricName, metricAchievements]) => {
      metricAchievements.forEach((achievement) => {
        const { achievementDetails } = achievement;
        const isUnlocked = achievementState.unlocked.includes(achievementDetails.achievementId);

        result.push({
          achievementId: achievementDetails.achievementId,
          achievementTitle: achievementDetails.achievementTitle,
          achievementDescription: achievementDetails.achievementDescription,
          achievementIconKey: achievementDetails.achievementIconKey,
          isUnlocked,
        });
      });
    });

    return result;
  };

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

    try {
      storageImpl.setMetrics(storageMetrics);
    } catch (error) {
      if (error instanceof AchievementError) {
        if (onError) {
          onError(error);
        } else {
          console.error('Achievement storage error:', error.message, error.remedy);
        }
      } else {
        console.error('Unexpected error saving metrics:', error);
      }
    }
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

  const exportData = (): string => {
    const state = getState();
    const configHash = createConfigHash(achievementsConfig);
    return exportAchievementData(state.metrics, state.unlocked, configHash);
  };

  const importData = (jsonString: string, options?: ImportOptions): ImportResult => {
    const state = getState();
    const configHash = createConfigHash(achievementsConfig);

    const result = importAchievementData(
      jsonString,
      state.metrics,
      state.unlocked,
      { ...options, expectedConfigHash: configHash }
    );

    if (result.success && 'mergedMetrics' in result && 'mergedUnlocked' in result) {
      // Apply the imported data
      const mergedResult = result as ImportResult & {
        mergedMetrics: AchievementMetrics;
        mergedUnlocked: string[]
      };

      // Update metrics state
      const metricsFromArrayFormat = Object.entries(mergedResult.mergedMetrics).reduce(
        (acc, [key, value]) => ({
          ...acc,
          [key]: Array.isArray(value) ? value[0] : value
        }),
        {}
      );
      setMetrics(metricsFromArrayFormat);

      // Update unlocked achievements state
      setAchievementState(prev => ({
        ...prev,
        unlocked: mergedResult.mergedUnlocked,
      }));

      // Persist to storage
      storageImpl.setMetrics(mergedResult.mergedMetrics);
      storageImpl.setUnlockedAchievements(mergedResult.mergedUnlocked);

      // Update seen achievements to prevent duplicate notifications
      mergedResult.mergedUnlocked.forEach(id => {
        seenAchievementsRef.current.add(id);
      });
      saveNotifiedAchievements(seenAchievementsRef.current);
    }

    return result;
  };

  return (
    <AchievementContext.Provider
      value={{
        update,
        achievements: achievementState,
        reset,
        getState,
        exportData,
        importData,
        getAllAchievements,
      }}
    >
      {children}

      {/* NEW: Notification component (v3.6.0) */}
      {uiReady && currentNotification && ui.enableNotifications !== false && (
        <NotificationComponent
          achievement={currentNotification.achievement}
          onClose={() => setCurrentNotification(null)}
          duration={5000}
          position={ui.notificationPosition || 'top-center'}
          theme={ui.theme || 'modern'}
        />
      )}

      {/* NEW: Confetti component (v3.6.0) */}
      {uiReady && ui.enableConfetti !== false && (
        <ConfettiComponentResolved
          show={showConfetti}
          duration={5000}
        />
      )}
    </AchievementContext.Provider>
  );
}; 