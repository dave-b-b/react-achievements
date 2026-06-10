import React, { createContext, useCallback, useEffect, useState } from 'react';
import { AchievementEngine, AchievementError } from 'achievements-engine';
import type {
  AchievementStorage,
  AsyncAchievementStorage,
  StorageType,
  EventMapping,
  ImportOptions,
  ImportResult,
  StateChangedEvent,
  RestApiStorageConfig,
  AchievementUpdateResult,
  AchievementConfigurationType as EngineAchievementConfigurationType,
} from 'achievements-engine';
import type { AchievementConfigurationType, AchievementWithStatus } from '../core/types';
import type {
  AchievementClient,
  AchievementClientMutationResult,
  AchievementClientSnapshot,
  AchievementDto,
} from '../client/types';
import { warnDeprecation } from '../core/utils/deprecation';

export interface AchievementSnapshot {
  metrics: Record<string, any>;
  unlockedIds: string[];
  unlockedAchievements: AchievementWithStatus[];
  allAchievements: AchievementWithStatus[];
  unlockedCount: number;
  totalCount: number;
}

export interface AchievementContextType {
  update: (
    metrics: Record<string, any>
  ) => void | AchievementUpdateResult | Promise<AchievementClientMutationResult | void>;
  increment: (
    metric: string,
    amount?: number
  ) => AchievementUpdateResult | Promise<AchievementClientMutationResult | void> | void;
  event: (
    name: string,
    payload?: unknown
  ) => Promise<AchievementClientMutationResult | void> | void;
  refresh: () => Promise<AchievementSnapshot>;
  achievements: {
    unlocked: string[];
    all: Record<string, AchievementWithStatus>;
  };
  snapshot: AchievementSnapshot;
  reset: () => void | Promise<void>;
  getState: () => {
    metrics: Record<string, any>;
    unlocked: string[];
  };
  exportData: () => string;
  importData: (jsonString: string, options?: ImportOptions) => ImportResult;
  getAllAchievements: () => AchievementWithStatus[];
  engine?: AchievementEngine;
  client?: AchievementClient;
  icons: Record<string, string>;
  recentlyUnlocked: AchievementWithStatus[];
  isLoading: boolean;
  error: Error | null;
  /**
   * @deprecated Use provider props or the presence of an injected engine directly.
   * This compatibility flag will be removed in 5.0.
   */
  _isLegacyPattern: boolean;
}

export const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

export interface AchievementProviderProps {
  client?: AchievementClient;
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
   * no-op and will be removed in 5.0.
   */
  useBuiltInUI?: boolean;
}

const getAllAchievementRecord = (
  achievements: AchievementWithStatus[]
): Record<string, AchievementWithStatus> => {
  return Object.fromEntries(
    achievements.map((achievement) => [achievement.achievementId, achievement])
  );
};

const emptySnapshot = (): AchievementSnapshot => ({
  metrics: {},
  unlockedIds: [],
  unlockedAchievements: [],
  allAchievements: [],
  unlockedCount: 0,
  totalCount: 0,
});

const normalizeAchievementDto = (achievement: AchievementDto): AchievementWithStatus => {
  const source = achievement as AchievementDto & Partial<AchievementWithStatus>;
  const achievementId = source.id || source.achievementId || '';
  const achievementTitle = source.title || source.achievementTitle || achievementId;
  const achievementDescription = source.description || source.achievementDescription || '';
  const achievementIconKey = source.iconKey || source.icon || source.achievementIconKey;

  return {
    achievementId,
    achievementTitle,
    achievementDescription,
    achievementIconKey,
    confetti: source.confetti,
    isUnlocked: Boolean(source.isUnlocked),
    unlockedAt: source.unlockedAt,
    progress: source.progress,
    metadata: source.metadata,
  };
};

const normalizeClientSnapshot = (snapshot: AchievementClientSnapshot): AchievementSnapshot => {
  const allAchievements = (snapshot.achievements || []).map(normalizeAchievementDto);
  const unlockedIds = snapshot.unlockedIds ||
    allAchievements
      .filter((achievement) => achievement.isUnlocked)
      .map((achievement) => achievement.achievementId);
  const unlockedIdSet = new Set(unlockedIds);
  const unlockedAchievements = snapshot.unlockedAchievements?.length
    ? snapshot.unlockedAchievements.map(normalizeAchievementDto)
    : allAchievements.filter((achievement) => unlockedIdSet.has(achievement.achievementId));

  return {
    metrics: { ...(snapshot.metrics || {}) },
    unlockedIds,
    unlockedAchievements,
    allAchievements,
    unlockedCount: snapshot.unlockedCount ?? unlockedAchievements.length,
    totalCount: snapshot.totalCount ?? allAchievements.length,
  };
};

export const AchievementProvider: React.FC<AchievementProviderProps> = ({
  client,
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
      '`useBuiltInUI` is deprecated and is now a no-op because built-in UI is the default. It will be removed in 5.0.'
    );
  }

  if (client && (achievementsConfig || externalEngine)) {
    throw new Error(
      'Cannot provide "client" with "achievements" or "engine" props to AchievementProvider.\n\n' +
        'Use one pattern:\n' +
        '1. Server-backed display: <AchievementProvider client={achievementClient}>\n' +
        '2. Legacy in-browser engine: <AchievementProvider achievements={config}>'
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

  const isProviderCreatedEngine = Boolean(achievementsConfig) && !client;

  const [engine] = useState<AchievementEngine | undefined>(() => {
    if (client) {
      return undefined;
    }

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
      achievements: achievementsConfig as EngineAchievementConfigurationType,
      storage: storage as any,
      restApiConfig,
      onError: onError as ((error: Error) => void) | undefined,
      eventMapping,
    });
  });

  const [achievementSnapshot, setAchievementSnapshot] = useState<AchievementSnapshot>(() =>
    engine ? engine.getSnapshot() : emptySnapshot()
  );
  const [recentlyUnlocked, setRecentlyUnlocked] = useState<AchievementWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(client));
  const [error, setError] = useState<Error | null>(null);

  const syncAchievementState = useCallback((snapshot?: AchievementSnapshot) => {
    if (snapshot) {
      setAchievementSnapshot(snapshot);
      return;
    }

    if (engine) {
      setAchievementSnapshot(engine.getSnapshot());
    }
  }, [engine]);

  const applyClientMutationResult = useCallback((result: AchievementClientMutationResult) => {
    setRecentlyUnlocked((result.newlyUnlocked || []).map(normalizeAchievementDto));
    const normalizedSnapshot = normalizeClientSnapshot(result.snapshot);
    setAchievementSnapshot(normalizedSnapshot);
    return result;
  }, []);

  const refresh = useCallback(async (): Promise<AchievementSnapshot> => {
    if (!client) {
      const snapshot = engine ? engine.getSnapshot() : emptySnapshot();
      setAchievementSnapshot(snapshot);
      return snapshot;
    }

    setIsLoading(true);
    setError(null);

    try {
      const snapshot = normalizeClientSnapshot(await client.getSnapshot());
      setAchievementSnapshot(snapshot);
      return snapshot;
    } catch (unknownError) {
      const nextError = unknownError instanceof Error
        ? unknownError
        : new Error('Failed to load achievements');
      setError(nextError);
      throw nextError;
    } finally {
      setIsLoading(false);
    }
  }, [client, engine]);

  useEffect(() => {
    return () => {
      if (engine && !externalEngine) {
        engine.destroy();
      }
    };
  }, [engine, externalEngine]);

  useEffect(() => {
    if (!engine) {
      return;
    }

    let isMounted = true;
    const unsubscribeStateChanged = engine.on('state:changed', (event: StateChangedEvent) => {
      syncAchievementState(event);
    });

    engine.ready().then(() => {
      if (isMounted) {
        syncAchievementState();
      }
    });

    return () => {
      isMounted = false;
      unsubscribeStateChanged();
    };
  }, [engine, syncAchievementState]);

  useEffect(() => {
    if (!client) {
      return;
    }

    let isMounted = true;

    refresh().catch(() => {
      if (isMounted) {
        // error state is set in refresh()
      }
    });

    return () => {
      isMounted = false;
    };
  }, [client, refresh]);

  const update = (newMetrics: Record<string, any>) => {
    if (client) {
      const mutation = client.trackMany
        ? client.trackMany(newMetrics)
        : Promise.all(
            Object.entries(newMetrics).map(([metric, value]) => client.track(metric, value))
          ).then((results) => results[results.length - 1]);

      return mutation.then((result) => {
        if (result) {
          applyClientMutationResult(result);
        }
        return result;
      });
    }

    return engine?.update(newMetrics);
  };

  const increment = (metric: string, amount: number = 1) => {
    if (client) {
      return client.increment(metric, amount).then(applyClientMutationResult);
    }

    return engine?.increment(metric, amount);
  };

  const event = (name: string, payload?: unknown) => {
    if (client) {
      return client.event(name, payload).then(applyClientMutationResult);
    }

    engine?.emit(name, payload);
  };

  const reset = () => {
    if (client?.reset) {
      return client.reset().then((snapshot) => {
        setRecentlyUnlocked([]);
        setAchievementSnapshot(normalizeClientSnapshot(snapshot));
      });
    }

    if (client) {
      return refresh().then(() => undefined);
    }

    engine?.reset();
  };

  const getState = () => {
    const snapshot = engine ? engine.getSnapshot() : achievementSnapshot;

    return {
      metrics: snapshot.metrics,
      unlocked: snapshot.unlockedIds,
    };
  };

  const exportData = (): string => {
    return engine ? engine.export() : JSON.stringify(achievementSnapshot);
  };

  const importData = (jsonString: string, options?: ImportOptions): ImportResult => {
    if (!engine) {
      return {
        success: false,
        errors: ['importData is not supported by remote achievement clients. Import on the server instead.'],
      };
    }

    const result = engine.import(jsonString, options);
    syncAchievementState();
    return result;
  };

  const getAllAchievements = (): AchievementWithStatus[] => {
    return engine ? engine.getSnapshot().allAchievements : achievementSnapshot.allAchievements;
  };

  const achievements = {
    unlocked: achievementSnapshot.unlockedIds,
    all: getAllAchievementRecord(achievementSnapshot.allAchievements),
  };

  return (
    <AchievementContext.Provider
      value={{
        update,
        increment,
        event,
        refresh,
        achievements,
        snapshot: achievementSnapshot,
        reset,
        getState,
        exportData,
        importData,
        getAllAchievements,
        engine,
        client,
        icons,
        recentlyUnlocked,
        isLoading,
        error,
        _isLegacyPattern: isProviderCreatedEngine,
      }}
    >
      {children}
    </AchievementContext.Provider>
  );
};
