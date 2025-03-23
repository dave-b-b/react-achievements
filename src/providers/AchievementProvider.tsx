import React, { useEffect, useCallback, ReactNode } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { initialize, setMetrics, unlockAchievement } from '../redux/achievementSlice';
import { addNotification, clearNotifications } from '../redux/notificationSlice'; // Add clearNotification import
import {
    AchievementMetrics,
    AchievementConfiguration,
    AchievementDetails,
    AchievementMetricValue,
    InitialAchievementMetrics,
    AchievementUnlockCondition,
} from '../types';
import { defaultStyles, Styles } from '../defaultStyles';
import AchievementModal from '../components/AchievementModal';
import BadgesModal from '../components/BadgesModal';
import BadgesButton from '../components/BadgesButton';
import ConfettiWrapper from '../components/ConfettiWrapper';
import { defaultAchievementIcons } from '../assets/defaultIcons';

interface AchievementProviderProps {
    children: ReactNode;
    config: AchievementConfiguration;
    initialState?: InitialAchievementMetrics;
    storageKey?: string;
    badgesButtonPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    styles?: Partial<Styles>;
    icons?: Record<string, string>;
}

export const AchievementProvider: React.FC<AchievementProviderProps> = ({
                                                                            children,
                                                                            config,
                                                                            initialState = {},
                                                                            storageKey = 'react-achievements',
                                                                            badgesButtonPosition = 'top-right',
                                                                            styles = {},
                                                                            icons = {},
                                                                        }) => {
    const dispatch: AppDispatch = useDispatch();
    const metrics = useSelector((state: RootState) => state.achievements.metrics);
    const unlockedAchievements = useSelector((state: RootState) => state.achievements.unlockedAchievements);
    const notifications = useSelector((state: RootState) => state.notifications.notifications);
    const mergedStyles = React.useMemo(() => mergeDeep(defaultStyles, styles), [styles]);

    const [currentAchievement, setCurrentAchievement] = React.useState<AchievementDetails | null>(null);
    const [showBadges, setShowBadges] = React.useState(false);
    const [showConfetti, setShowConfetti] = React.useState(false);

    const mergedIcons = React.useMemo(() => ({ ...defaultAchievementIcons, ...icons }), [icons]);

    useEffect(() => {
        dispatch(initialize({ config, initialState, storageKey }));
    }, [dispatch, config, initialState, storageKey]);

    const checkAchievements = useCallback(() => {
        const newAchievements: AchievementDetails[] = [];

        console.log("checkAchievements - unlockedAchievements:", unlockedAchievements);

        if (!unlockedAchievements) {
            console.error("unlockedAchievements is undefined!");
            return;
        }

        Object.entries(config).forEach(([metricName, conditions]) => {
            const metricValues = metrics[metricName];

            if (!metricValues) return;

            conditions.forEach((condition: AchievementUnlockCondition) => {
                if (
                    metricValues.some((value: AchievementMetricValue) => condition.isConditionMet(value)) &&
                    !unlockedAchievements.includes(condition.achievementDetails.achievementId)
                ) {
                    newAchievements.push(condition.achievementDetails);
                }
            });
        });

        if (newAchievements.length > 0) {
            newAchievements.forEach(achievement => {
                dispatch(unlockAchievement(achievement.achievementId));
                dispatch(addNotification(achievement));
            });
            setShowConfetti(true);
        }
    }, [config, metrics, unlockedAchievements, dispatch]);

    useEffect(() => {
        checkAchievements();
    }, [metrics, checkAchievements]);

    useEffect(() => {
        if (notifications.length > 0 && !currentAchievement) {
            setCurrentAchievement(notifications[0]);
        }
    }, [notifications, currentAchievement]);

    const showBadgesModal = () => setShowBadges(true);

    const getAchievements = (achievedIds: string[]) => {
        return Object.values(config).flatMap(conditions =>
            conditions.filter((c: AchievementUnlockCondition) => achievedIds.includes(c.achievementDetails.achievementId)).map(c => c.achievementDetails)
        );
    };

    return (
        <>
            {children}
            <AchievementModal
                isOpen={!!currentAchievement}
                achievement={currentAchievement}
                onClose={() => {
                    setCurrentAchievement(null);
                    if(currentAchievement){
                        dispatch(clearNotifications());
                    }
                }}
                styles={mergedStyles.achievementModal}
                icons={mergedIcons}
            />
            <BadgesModal
                isOpen={showBadges}
                achievements={getAchievements(unlockedAchievements)}
                onClose={() => setShowBadges(false)}
                styles={mergedStyles.badgesModal}
                icons={mergedIcons}
            />
            <BadgesButton
                onClick={showBadgesModal}
                position={badgesButtonPosition}
                styles={mergedStyles.badgesButton}
                unlockedAchievements={getAchievements(unlockedAchievements)}
            />
            <ConfettiWrapper show={showConfetti || notifications.length > 0} />
        </>
    );
};

function mergeDeep(target: any, source: any) {
    const output = Object.assign({}, target);
    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
            if (isObject(source[key])) {
                if (!(key in target))
                    Object.assign(output, { [key]: source[key] });
                else
                    output[key] = mergeDeep(target[key], source[key]);
            } else {
                Object.assign(output, { [key]: source[key] });
            }
        });
    }
    return output;
}

function isObject(item: any) {
    return item && typeof item === 'object' && !Array.isArray(item);
}