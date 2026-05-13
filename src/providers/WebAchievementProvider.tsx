import React, { createContext, useEffect, useMemo, useRef, useState } from 'react';
import type { AchievementUnlockedEvent, AchievementWithStatus } from 'achievements-engine';
import {
  AchievementProvider as HeadlessAchievementProvider,
  AchievementProviderProps as HeadlessAchievementProviderProps,
} from './AchievementProvider';
import { useAchievementEngine } from '../hooks/useAchievementEngine';
import { BuiltInNotification } from '../core/ui/BuiltInNotification';
import { BuiltInConfetti } from '../core/ui/BuiltInConfetti';
import type { ConfettiComponent, NotificationComponent, UIConfig } from '../core/types';
import { warnDeprecation } from '../core/utils/deprecation';

const NOTIFICATION_DURATION_MS = 5000;

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
}> = ({ icons, ui }) => {
  const engine = useAchievementEngine();
  const seenAchievementsRef = useRef<Set<string>>(new Set(engine.getUnlocked()));
  const confettiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [notifications, setNotifications] = useState<AchievementWithStatus[]>([]);

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

        if (ui.enableConfetti !== false) {
          if (confettiTimerRef.current) {
            clearTimeout(confettiTimerRef.current);
          }

          setShowConfetti(true);
          confettiTimerRef.current = setTimeout(() => {
            setShowConfetti(false);
            confettiTimerRef.current = null;
          }, NOTIFICATION_DURATION_MS);
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
            duration={NOTIFICATION_DURATION_MS}
            position={ui.notificationPosition || 'top-center'}
            theme={ui.theme || 'modern'}
            icons={icons}
            stackIndex={index}
          />
        ))}

      {ui.enableConfetti !== false && (
        <ConfettiComponentResolved show={showConfetti} duration={NOTIFICATION_DURATION_MS} />
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

  const uiContextValue = useMemo(() => ({ icons, ui }), [icons, ui]);

  return (
    <AchievementUIContext.Provider value={uiContextValue}>
      <HeadlessAchievementProvider {...providerProps} icons={icons}>
        {children}
        <AchievementEffects icons={icons} ui={ui} />
      </HeadlessAchievementProvider>
    </AchievementUIContext.Provider>
  );
};
