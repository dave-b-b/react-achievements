import React, { createContext, useCallback, useEffect, useState } from 'react';
import { AchievementEngine, AchievementError } from 'achievements-engine';
import type {
  AchievementConfigurationType,
  AchievementStorage,
  AsyncAchievementStorage,
  StorageType,
  AchievementWithStatus,
  EventMapping,
  ImportOptions,
  ImportResult,
  RestApiStorageConfig,
} from 'achievements-engine';
import { warnDeprecation } from '../core/utils/deprecation';

export interface AchievementContextType {
  update: (metrics: Record<string, any>) => void;
  achievements: {
    unlocked: string[];
    all: Record<string, AchievementWithStatus>;
  };
  reset: () => void;
  getState: () => {
    metrics: Record<string, any>;
    unlocked: string[];
  };
  exportData: () => string;
  importData: (jsonString: string, options?: ImportOptions) => ImportResult;
  getAllAchievements: () => AchievementWithStatus[];
  engine: AchievementEngine;
  icons: Record<string, string>;
  /**
   * @deprecated Use provider props or the presence of an injected engine directly.
   * This compatibility flag will be removed in 4.2.
   */
  _isLegacyPattern: boolean;
}

export const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

export interface AchievementProviderProps {
  achievements?: AchievementConfigurationType;
  storage?: AchievementStorage | AsyncAchievementStorage | StorageType;
  restApiConfig?: RestApiStorageConfig;
  eventMapping?: EventMapping;
  engine?: AchievementEngine;
  children: React.ReactNode;
  icons?: Record<string, string>;
  onError?: (error: AchievementError) => void;
  /**
   * @deprecated Built-in UI is the default in the web provider. This prop is a
   * no-op and will be removed in 4.2.
   */
  useBuiltInUI?: boolean;
}

const getAllAchievementRecord = (
  engine: AchievementEngine
): Record<string, AchievementWithStatus> => {
  return Object.fromEntries(
    engine.getAllAchievements().map((achievement) => [
      achievement.achievementId,
      achievement,
    ])
  );
};

export const AchievementProvider: React.FC<AchievementProviderProps> = ({
  achievements: achievementsConfig,
  storage = 'local',
  children,
  onError,
  useBuiltInUI,
  restApiConfig,
  engine: externalEngine,
  eventMapping,
  icons = {},
}) => {
  if (useBuiltInUI !== undefined) {
    warnDeprecation(
      '`useBuiltInUI` is deprecated and is now a no-op because built-in UI is the default. It will be removed in 4.2.'
    );
  }

  if (achievementsConfig && externalEngine) {
    throw new Error(
      'Cannot provide both "achievements" and "engine" props to AchievementProvider.\n\n' +
        'Choose one pattern:\n' +
        '1. Direct metric tracking: <AchievementProvider achievements={config}>\n' +
        '2. Event-based tracking: <AchievementProvider engine={myEngine}>'
    );
  }

  const isProviderCreatedEngine = Boolean(achievementsConfig);

  const [engine] = useState<AchievementEngine>(() => {
    if (externalEngine) {
      return externalEngine;
    }

    if (!achievementsConfig) {
      throw new Error(
        'AchievementProvider requires either "achievements" or "engine" prop.\n\n' +
          '1. Direct metric tracking: <AchievementProvider achievements={config}>\n' +
          '2. Event-based tracking: <AchievementProvider engine={myEngine}>'
      );
    }

    return new AchievementEngine({
      achievements: achievementsConfig,
      storage: storage as any,
      restApiConfig,
      onError: onError as ((error: Error) => void) | undefined,
      eventMapping,
    });
  });

  const [achievementState, setAchievementState] = useState<{
    unlocked: string[];
    all: Record<string, AchievementWithStatus>;
  }>(() => ({
    unlocked: [...engine.getUnlocked()],
    all: getAllAchievementRecord(engine),
  }));

  const syncAchievementState = useCallback(() => {
    setAchievementState({
      unlocked: [...engine.getUnlocked()],
      all: getAllAchievementRecord(engine),
    });
  }, [engine]);

  useEffect(() => {
    return () => {
      if (!externalEngine) {
        engine.destroy();
      }
    };
  }, [engine, externalEngine]);

  useEffect(() => {
    const unsubscribeUnlocked = engine.on('achievement:unlocked', syncAchievementState);
    const unsubscribeStateChanged = engine.on('state:changed', syncAchievementState);

    return () => {
      unsubscribeUnlocked();
      unsubscribeStateChanged();
    };
  }, [engine, syncAchievementState]);

  const update = (newMetrics: Record<string, any>) => {
    engine.update(newMetrics);
  };

  const reset = () => {
    engine.reset();
    syncAchievementState();
  };

  const getState = () => {
    const metrics = engine.getMetrics();
    const unlocked = engine.getUnlocked();
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
    syncAchievementState();
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
        engine,
        icons,
        _isLegacyPattern: isProviderCreatedEngine,
      }}
    >
      {children}
    </AchievementContext.Provider>
  );
};
