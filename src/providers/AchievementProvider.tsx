import React, { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { initialize, setMetrics, unlockAchievement, resetAchievements } from '../redux/achievementSlice';
import { addNotification, clearNotifications } from '../redux/notificationSlice';
import {
    AchievementDetails,
    AchievementMetricValue,
    AchievementUnlockCondition,
    AchievementProviderProps,
    AchievementMetrics as AchievementMetricsType,
} from '../types';
import { defaultStyles, Styles } from '../defaultStyles';
import AchievementModal from '../components/AchievementModal';
import BadgesModal from '../components/BadgesModal';
import BadgesButton from '../components/BadgesButton';
import ConfettiWrapper from '../components/ConfettiWrapper';
import { defaultAchievementIcons } from '../assets/defaultIcons';

export interface AchievementContextType {
    updateMetrics: (newMetrics: AchievementMetricsType | ((prevMetrics: AchievementMetricsType) => AchievementMetricsType)) => void;
    unlockedAchievements: string[];
    resetStorage: () => void;
}

export const AchievementContext = React.createContext<AchievementContextType | undefined>(undefined);

export const useAchievementContext = () => {
    const context = React.useContext(AchievementContext);
    if (!context) {
        throw new Error('useAchievementContext must be used within an AchievementProvider');
    }
    return context;
};

export const AchievementProvider: React.FC<AchievementProviderProps> = ({
                                                                            children,
                                                                            config,
                                                                            initialState = {},
                                                                            storageKey = 'react-achievements',
                                                                            badgesButtonPosition = 'top-right',
                                                                            styles = {},
                                                                            icons = {},
                                                                        }: AchievementProviderProps) => {
    const dispatch: AppDispatch = useDispatch();
    const metrics = useSelector((state: RootState) => state.achievements.metrics);
    const unlockedAchievementIds = useSelector((state: RootState) => state.achievements.unlockedAchievements);
    const notifications = useSelector((state: RootState) => state.notifications.notifications);
    const mergedStyles = React.useMemo(() => mergeDeep(defaultStyles, styles), [styles]);

    const [currentAchievement, setCurrentAchievement] = React.useState<AchievementDetails | null>(null);
    const [showBadges, setShowBadges] = React.useState(false);
    const [showConfetti, setShowConfetti] = React.useState(false);

    const mergedIcons = React.useMemo(() => ({ ...defaultAchievementIcons, ...icons }), [icons]);

    const updateMetrics = useCallback(
        (newMetrics: AchievementMetricsType | ((prevMetrics: AchievementMetricsType) => AchievementMetricsType)) => {
            dispatch(setMetrics(typeof newMetrics === 'function' ? newMetrics(metrics) : newMetrics));
        },
        [dispatch, metrics]
    );

    const resetStorage = useCallback(() => {
        localStorage.removeItem(storageKey);
        dispatch(resetAchievements()); // Dispatch action to reset Redux state
    }, [dispatch, storageKey]);

    useEffect(() => {
        dispatch(initialize({ config, initialState, storageKey }));
    }, [dispatch, config, initialState, storageKey]);

    const checkAchievements = useCallback(() => {
        const newAchievements: AchievementDetails[] = [];

        if (!unlockedAchievementIds) {
            console.error('unlockedAchievements is undefined!');
            return;
        }

        Object.entries(config).forEach(([metricName, conditions]) => {
            const metricValues = metrics[metricName];

            if (!metricValues) {
                return;
            }

            conditions.forEach((condition) => {
                if (
                    metricValues.some((value: AchievementMetricValue) => condition.isConditionMet(value)) &&
                    !unlockedAchievementIds.includes(condition.achievementDetails.achievementId)
                ) {
                    newAchievements.push(condition.achievementDetails);
                }
            });
        });

        if (newAchievements.length > 0) {
            newAchievements.forEach((achievement) => {
                dispatch(unlockAchievement(achievement.achievementId));
                dispatch(addNotification(achievement));
            });
            setShowConfetti(true);
        }
    }, [config, metrics, unlockedAchievementIds, dispatch]);

    useEffect(() => {
        checkAchievements();
    }, [metrics, checkAchievements]);

    useEffect(() => {
        if (notifications.length > 0 && !currentAchievement) {
            setCurrentAchievement(notifications[0]);
        }
    }, [notifications, currentAchievement]);

    const showBadgesModal = () => setShowBadges(true);

    const getAchievements = useCallback(
        (achievedIds: string[]) => {
            return Object.values(config).flatMap((conditions) =>
                conditions
                    .filter((c) => achievedIds.includes(c.achievementDetails.achievementId))
                    .map((c) => c.achievementDetails)
            );
        },
        [config]
    );

    const unlockedAchievementsDetails = getAchievements(unlockedAchievementIds);

    return (
        <AchievementContext.Provider value={{ updateMetrics, unlockedAchievements: unlockedAchievementIds, resetStorage }}>
            {children}
            <AchievementModal
                isOpen={!!currentAchievement}
                achievement={currentAchievement}
                onClose={() => {
                    setCurrentAchievement(null);
                    if (currentAchievement) {
                        dispatch(clearNotifications());
                    }
                }}
                styles={mergedStyles.achievementModal}
                icons={mergedIcons}
            />
            <BadgesModal
                isOpen={showBadges}
                achievements={unlockedAchievementsDetails}
                onClose={() => setShowBadges(false)}
                styles={mergedStyles.badgesModal}
                icons={mergedIcons}
            />
            <BadgesButton
                onClick={showBadgesModal}
                position={badgesButtonPosition}
                styles={mergedStyles.badgesButton}
                unlockedAchievements={unlockedAchievementsDetails}
            />
            <ConfettiWrapper show={showConfetti || notifications.length > 0} />
        </AchievementContext.Provider>
    );
};

function isObject(item: any) {
    return item && typeof item === 'object' && !Array.isArray(item);
}

export function mergeDeep(target: any, source: any) {
    const output = { ...target };
    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach((key) => {
            if (isObject(source[key])) {
                if (!(key in target)) {
                    output[key] = source[key];
                } else {
                    output[key] = mergeDeep(target[key], source[key]);
                }
            } else {
                output[key] = source[key];
            }
        });
    }
    return output;
}
