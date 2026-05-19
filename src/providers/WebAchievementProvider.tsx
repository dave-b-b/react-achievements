import React, { createContext, useEffect, useMemo, useRef, useState } from 'react';
import { isSimpleConfig, normalizeAchievements } from 'achievements-engine';
import type {
  AchievementConfigurationType as EngineAchievementConfigurationType,
  AchievementUnlockedEvent,
} from 'achievements-engine';
import {
  AchievementProvider as HeadlessAchievementProvider,
  AchievementProviderProps as HeadlessAchievementProviderProps,
} from './AchievementProvider';
import { useAchievementEngine } from '../hooks/useAchievementEngine';
import { BuiltInNotification } from '../core/ui/BuiltInNotification';
import { BuiltInConfetti } from '../core/ui/BuiltInConfetti';
import { builtInThemes, getTheme } from '../core/ui/themes';
import type {
  AchievementConfiguration,
  AchievementConfetti,
  AchievementWithStatus,
  ConfettiComponent,
  ConfettiOptions,
  NotificationComponent,
  SimpleAchievementConfig,
  UIConfig,
} from '../core/types';
import { warnDeprecation } from '../core/utils/deprecation';

const DEFAULT_NOTIFICATION_DURATION_MS = 5000;
const CONFETTI_DURATION_MS = 5000;

type AchievementConfettiMap = Map<string, AchievementConfetti>;

const hasConfiguredConfetti = (
  confetti: AchievementConfetti | undefined
): confetti is AchievementConfetti => {
  return confetti === false || (typeof confetti === 'object' && confetti !== null);
};

const collectComplexConfetti = (
  achievements: AchievementConfiguration,
  confettiByAchievementId: AchievementConfettiMap
) => {
  Object.values(achievements).forEach((metricAchievements) => {
    metricAchievements.forEach(({ achievementDetails }) => {
      const confetti = achievementDetails.confetti;

      if (hasConfiguredConfetti(confetti)) {
        confettiByAchievementId.set(achievementDetails.achievementId, confetti);
      }
    });
  });
};

const simpleConfigHasRewardConfetti = (achievements: SimpleAchievementConfig): boolean => {
  return Object.values(achievements).some((metricAchievements) =>
    Object.values(metricAchievements).some((achievement) =>
      hasConfiguredConfetti(achievement.confetti)
    )
  );
};

const prepareAchievementsForConfetti = (
  achievements: HeadlessAchievementProviderProps['achievements']
): {
  achievements: HeadlessAchievementProviderProps['achievements'];
  confettiByAchievementId: AchievementConfettiMap;
} => {
  const confettiByAchievementId: AchievementConfettiMap = new Map();

  if (!achievements) {
    return { achievements, confettiByAchievementId };
  }

  if (!isSimpleConfig(achievements as EngineAchievementConfigurationType)) {
    collectComplexConfetti(achievements as AchievementConfiguration, confettiByAchievementId);
    return { achievements, confettiByAchievementId };
  }

  const simpleAchievements = achievements as SimpleAchievementConfig;

  if (!simpleConfigHasRewardConfetti(simpleAchievements)) {
    return { achievements, confettiByAchievementId };
  }

  const normalizedAchievements = normalizeAchievements(
    simpleAchievements as EngineAchievementConfigurationType
  ) as AchievementConfiguration;

  Object.entries(simpleAchievements).forEach(([metric, metricAchievements]) => {
    const normalizedMetricAchievements = normalizedAchievements[metric] || [];

    Object.values(metricAchievements).forEach((achievement, index) => {
      const confetti = achievement.confetti;
      const normalizedAchievement = normalizedMetricAchievements[index];

      if (normalizedAchievement && hasConfiguredConfetti(confetti)) {
        normalizedAchievement.achievementDetails.confetti = confetti;
        confettiByAchievementId.set(
          normalizedAchievement.achievementDetails.achievementId,
          confetti
        );
      }
    });
  });

  return { achievements: normalizedAchievements, confettiByAchievementId };
};

export interface WebAchievementProviderProps extends HeadlessAchievementProviderProps {
  icons?: Record<string, string>;
  ui?: UIConfig;
  /**
   * @deprecated Built-in UI is the default in v4. This prop is a no-op and will
   * be removed in 5.0.
   */
  useBuiltInUI?: boolean;
}

export interface AchievementUIContextValue {
  icons: Record<string, string>;
  ui: UIConfig;
}

export const AchievementUIContext = createContext<AchievementUIContextValue>({
  icons: {},
  ui: {},
});

const AchievementEffects: React.FC<{
  icons: Record<string, string>;
  ui: UIConfig;
  achievementConfetti: AchievementConfettiMap;
}> = ({ icons, ui, achievementConfetti }) => {
  const engine = useAchievementEngine();
  const seenAchievementsRef = useRef<Set<string>>(new Set(engine.getUnlocked()));
  const confettiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const achievementConfettiRef = useRef(achievementConfetti);
  const [showConfetti, setShowConfetti] = useState(false);
  const [activeConfettiConfig, setActiveConfettiConfig] = useState<ConfettiOptions | null>(null);
  const [notifications, setNotifications] = useState<AchievementWithStatus[]>([]);
  const notificationDuration = ui.notificationDuration ?? DEFAULT_NOTIFICATION_DURATION_MS;
  const themeName = ui.theme || 'modern';
  const themeConfig = useMemo(() => getTheme(themeName) || builtInThemes.modern, [themeName]);
  const globalConfettiConfig = useMemo<ConfettiOptions>(
    () => ({
      ...themeConfig.confetti,
      ...ui.confetti,
    }),
    [themeConfig, ui.confetti]
  );
  const globalConfettiConfigRef = useRef(globalConfettiConfig);
  const renderedConfettiConfig =
    showConfetti && activeConfettiConfig ? activeConfettiConfig : globalConfettiConfig;
  const renderedConfettiDuration = renderedConfettiConfig.duration ?? CONFETTI_DURATION_MS;

  useEffect(() => {
    achievementConfettiRef.current = achievementConfetti;
  }, [achievementConfetti]);

  useEffect(() => {
    globalConfettiConfigRef.current = globalConfettiConfig;
  }, [globalConfettiConfig]);

  useEffect(() => {
    if (ui.enableConfetti === false) {
      if (confettiTimerRef.current) {
        clearTimeout(confettiTimerRef.current);
        confettiTimerRef.current = null;
      }

      setShowConfetti(false);
      setActiveConfettiConfig(null);
    }
  }, [ui.enableConfetti]);

  useEffect(() => {
    const unsubscribeUnlocked = engine.on(
      'achievement:unlocked',
      (event: AchievementUnlockedEvent) => {
        if (seenAchievementsRef.current.has(event.achievementId)) {
          return;
        }

        seenAchievementsRef.current.add(event.achievementId);

        const unlockedAchievement: AchievementWithStatus = {
          achievementId: event.achievementId,
          achievementTitle: event.achievementTitle,
          achievementDescription: event.achievementDescription,
          achievementIconKey: event.achievementIconKey,
          isUnlocked: true,
        };

        if (ui.enableNotifications !== false) {
          setNotifications((currentNotifications) => {
            if (
              currentNotifications.some(
                (notification) =>
                  notification.achievementId === unlockedAchievement.achievementId
              )
            ) {
              return currentNotifications;
            }

            return [...currentNotifications, unlockedAchievement];
          });
        }

        const rewardConfetti = achievementConfettiRef.current.get(event.achievementId);

        if (ui.enableConfetti !== false && rewardConfetti !== false) {
          if (confettiTimerRef.current) {
            clearTimeout(confettiTimerRef.current);
          }

          const resolvedConfettiConfig: ConfettiOptions = {
            ...globalConfettiConfigRef.current,
            ...(rewardConfetti || {}),
          };
          const resolvedConfettiDuration =
            resolvedConfettiConfig.duration ?? CONFETTI_DURATION_MS;

          setActiveConfettiConfig(resolvedConfettiConfig);
          setShowConfetti(true);
          confettiTimerRef.current = setTimeout(() => {
            setShowConfetti(false);
            confettiTimerRef.current = null;
          }, resolvedConfettiDuration);
        }
      }
    );

    const unsubscribeStateChanged = engine.on('state:changed', () => {
      const unlocked = new Set(engine.getUnlocked());
      seenAchievementsRef.current.forEach((achievementId) => {
        if (!unlocked.has(achievementId)) {
          seenAchievementsRef.current.delete(achievementId);
        }
      });
    });

    return () => {
      unsubscribeUnlocked();
      unsubscribeStateChanged();

      if (confettiTimerRef.current) {
        clearTimeout(confettiTimerRef.current);
      }
    };
  }, [engine, ui.enableConfetti, ui.enableNotifications]);

  const NotificationComponent: NotificationComponent =
    ui.NotificationComponent || BuiltInNotification;
  const ConfettiComponentResolved: ConfettiComponent =
    ui.ConfettiComponent || BuiltInConfetti;

  return (
    <>
      {ui.enableNotifications !== false &&
        notifications.map((notification, index) => (
          <NotificationComponent
            key={notification.achievementId}
            achievement={notification}
            onClose={() =>
              setNotifications((currentNotifications) =>
                currentNotifications.filter(
                  (currentNotification) =>
                    currentNotification.achievementId !== notification.achievementId
                )
              )
            }
            duration={notificationDuration}
            position={ui.notificationPosition || 'top-center'}
            theme={ui.theme || 'modern'}
            icons={icons}
            stackIndex={index}
          />
        ))}

      {ui.enableConfetti !== false && (
        <ConfettiComponentResolved
          show={showConfetti}
          {...renderedConfettiConfig}
          duration={renderedConfettiDuration}
        />
      )}
    </>
  );
};

export const AchievementProvider: React.FC<WebAchievementProviderProps> = ({
  children,
  icons = {},
  ui = {},
  useBuiltInUI,
  ...providerProps
}) => {
  if (useBuiltInUI !== undefined) {
    warnDeprecation(
      '`useBuiltInUI` is deprecated and is now a no-op because built-in UI is the default. It will be removed in 5.0.'
    );
  }

  const [{ achievements: preparedAchievements, confettiByAchievementId }] = useState(() =>
    prepareAchievementsForConfetti(providerProps.achievements)
  );
  const uiContextValue = useMemo(() => ({ icons, ui }), [icons, ui]);

  return (
    <AchievementUIContext.Provider value={uiContextValue}>
      <HeadlessAchievementProvider
        {...providerProps}
        achievements={preparedAchievements}
        icons={icons}
      >
        {children}
        <AchievementEffects
          achievementConfetti={confettiByAchievementId}
          icons={icons}
          ui={ui}
        />
      </HeadlessAchievementProvider>
    </AchievementUIContext.Provider>
  );
};
