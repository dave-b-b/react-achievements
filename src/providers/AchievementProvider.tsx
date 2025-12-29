import React, { createContext, useEffect, useState, useRef } from 'react';
import { AchievementEngine } from 'achievements-engine';
import type {
  AchievementConfigurationType,
  AchievementStorage,
  AsyncAchievementStorage,
  StorageType,
  AchievementWithStatus,
  AchievementUnlockedEvent,
  EventMapping,
  ImportOptions,
  ImportResult
} from 'achievements-engine';
import { UIConfig } from '../core/types';
import { RestApiStorageConfig } from '../core/storage/RestApiStorage';
import { AchievementError } from '../core/errors/AchievementErrors';

import { BuiltInNotification } from '../core/ui/BuiltInNotification';
import { BuiltInConfetti } from '../core/ui/BuiltInConfetti';
import { detectLegacyLibraries, LegacyLibraries } from '../core/ui/legacyDetector';
import { createLegacyToastNotification, createLegacyConfettiWrapper } from '../core/ui/LegacyWrappers';
import type { NotificationComponent, ConfettiComponent } from '../core/types';

export interface AchievementContextType {
  update: (metrics: Record<string, any>) => void;
  achievements: {
    unlocked: string[];
    all: Record<string, any>;
  };
  reset: () => void;
  getState: () => {
    metrics: Record<string, any>;
    unlocked: string[];
  };
  exportData: () => string;
  importData: (jsonString: string, options?: ImportOptions) => ImportResult;
  getAllAchievements: () => AchievementWithStatus[];
  engine: AchievementEngine; // Always defined - initialized synchronously
}

export const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

interface AchievementProviderProps {
  // Mode 1: Auto-create engine (backward compatible)
  achievements?: AchievementConfigurationType;
  storage?: AchievementStorage | AsyncAchievementStorage | StorageType;
  restApiConfig?: RestApiStorageConfig;
  eventMapping?: EventMapping; // NEW: Event mapping support

  // Mode 2: External engine (NEW in v3.8.0)
  engine?: AchievementEngine;

  // Common props
  children: React.ReactNode;
  icons?: Record<string, string>;
  onError?: (error: AchievementError) => void;

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
  storage = 'local',
  children,
  icons = {},
  onError,
  restApiConfig,
  ui = {},
  useBuiltInUI = false,
  engine: externalEngine,
  eventMapping,
}) => {
  // Engine instance (either external or auto-created)
  // Initialize synchronously BEFORE first render to avoid timing issues
  const [engine] = useState<AchievementEngine>(() => {
    if (externalEngine) {
      // Mode 2: Use external engine
      return externalEngine;
    }

    // Mode 1: Auto-create engine
    if (!achievementsConfig) {
      throw new Error('Either "achievements" or "engine" prop must be provided');
    }

    return new AchievementEngine({
      achievements: achievementsConfig,
      storage: storage as any, // Type cast needed for compatibility
      restApiConfig,
      onError: onError as ((error: Error) => void) | undefined,
      eventMapping,
    });
  });

  // React state synced from engine
  // Initialize with current engine state (engine is available immediately)
  const [achievementState, setAchievementState] = useState<{
    unlocked: string[];
    all: Record<string, any>;
  }>(() => {
    const unlocked = engine.getUnlocked();
    return {
      unlocked: [...unlocked],
      all: {}, // Will be populated by getAllAchievements
    };
  });

  // Track which achievements have been seen to avoid duplicate notifications
  const seenAchievementsRef = useRef<Set<string>>(new Set(engine.getUnlocked()));
  const [showConfetti, setShowConfetti] = useState(false);

  // NEW: UI component resolution state (v3.6.0)
  const [legacyLibraries, setLegacyLibraries] = useState<LegacyLibraries | null>(null);
  const [uiReady, setUiReady] = useState(useBuiltInUI);
  const [currentNotification, setCurrentNotification] = useState<{
    achievement: { id: string; title: string; description: string; icon: string };
  } | null>(null);

  // Cleanup: Destroy engine on unmount (only if we auto-created it)
  useEffect(() => {
    return () => {
      // Only destroy if we auto-created the engine
      if (!externalEngine) {
        engine.destroy();
      }
    };
  }, [engine, externalEngine]);

  // Subscribe to engine events
  useEffect(() => {
    // Engine is always available (initialized synchronously)
    // Handle achievement unlocked
    const unsubscribeUnlocked = engine.on('achievement:unlocked', (event: AchievementUnlockedEvent) => {
      // Update unlocked list
      setAchievementState(prev => ({
        ...prev,
        unlocked: [...engine.getUnlocked()],
      }));

      // Show notification if not seen before
      if (!seenAchievementsRef.current.has(event.achievementId)) {
        seenAchievementsRef.current.add(event.achievementId);

        if (ui.enableNotifications !== false) {
          // Get icon to display
          let iconToDisplay = '🏆';
          if (event.achievementIconKey && event.achievementIconKey in icons) {
            iconToDisplay = icons[event.achievementIconKey];
          }

          setCurrentNotification({
            achievement: {
              id: event.achievementId,
              title: event.achievementTitle,
              description: event.achievementDescription,
              icon: iconToDisplay,
            },
          });

          // Show confetti
          setShowConfetti(true);

          // Hide confetti after 5 seconds
          setTimeout(() => {
            setShowConfetti(false);
          }, 5000);
        }
      }
    });

    // Handle state changes (for syncing unlocked list)
    const unsubscribeStateChanged = engine.on('state:changed', () => {
      setAchievementState(prev => ({
        ...prev,
        unlocked: [...engine.getUnlocked()],
      }));
    });

    return () => {
      unsubscribeUnlocked();
      unsubscribeStateChanged();
    };
  }, [engine, icons, ui.enableNotifications]);

  // Detect legacy UI libraries on mount
  useEffect(() => {
    if (useBuiltInUI) {
      setUiReady(true);
      return;
    }

    detectLegacyLibraries().then((libs) => {
      setLegacyLibraries(libs);
      setUiReady(true);
    });
  }, [useBuiltInUI]);

  // Resolve UI components based on detection and config
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

  // Context methods - delegate to engine
  const update = (newMetrics: Record<string, any>) => {
    engine.update(newMetrics);
  };

  const reset = () => {
    engine.reset();
    seenAchievementsRef.current.clear();
    setShowConfetti(false);
    setCurrentNotification(null);
  };

  const getState = () => {
    const metrics = engine.getMetrics();
    const unlocked = engine.getUnlocked();

    // Convert metrics to array format for backward compatibility
    const metricsInArrayFormat: Record<string, any> = {};
    Object.entries(metrics).forEach(([key, value]) => {
      metricsInArrayFormat[key] = Array.isArray(value) ? value : [value];
    });

    return {
      metrics: metricsInArrayFormat,
      unlocked: [...unlocked],
    };
  };

  const exportData = (): string => {
    return engine.export();
  };

  const importData = (jsonString: string, options?: ImportOptions): ImportResult => {
    const result = engine.import(jsonString, options);

    // Update seen achievements to prevent duplicate notifications
    if (result?.success && 'mergedUnlocked' in result) {
      result.mergedUnlocked?.forEach((id: string) => {
        seenAchievementsRef.current.add(id);
      });
    }

    return result;
  };

  const getAllAchievements = (): AchievementWithStatus[] => {
    return engine.getAllAchievements();
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
        engine, // Always defined - no undefined fallback needed
      }}
    >
      {children}

      {/* Notification component (v3.6.0) */}
      {uiReady && currentNotification && ui.enableNotifications !== false && (
        <NotificationComponent
          achievement={currentNotification.achievement}
          onClose={() => setCurrentNotification(null)}
          duration={5000}
          position={ui.notificationPosition || 'top-center'}
          theme={ui.theme || 'modern'}
        />
      )}

      {/* Confetti component (v3.6.0) */}
      {uiReady && ui.enableConfetti !== false && (
        <ConfettiComponentResolved
          show={showConfetti}
          duration={5000}
        />
      )}
    </AchievementContext.Provider>
  );
};