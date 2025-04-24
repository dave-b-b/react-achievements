import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { initialize, setMetrics, unlockAchievement, resetAchievements, markAchievementAsAwarded } from '../redux/achievementSlice';
import { addNotification, clearNotifications } from '../redux/notificationSlice';
import {
    AchievementDetails,
    AchievementMetricValue,
    SerializedAchievementUnlockCondition,
    SerializedAchievementConfiguration,
    AchievementProviderProps,
    AchievementMetrics,
    AchievementConfiguration,
    AchievementUnlockCondition,
} from '../types';
import AchievementModal from '../components/AchievementModal';
import BadgesButton from '../components/BadgesButton';
import BadgesModal from '../components/BadgesModal';
import ConfettiWrapper from '../components/ConfettiWrapper';
import { defaultStyles } from '../defaultStyles';

export interface AchievementContextType {
    updateMetrics: (newMetrics: AchievementMetrics | ((prevMetrics: AchievementMetrics) => AchievementMetrics)) => void;
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

const AchievementProvider: React.FC<AchievementProviderProps> = ({
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
    const unlockedAchievementIds = useSelector((state: RootState) => state.achievements.unlockedAchievements);
    const previouslyAwardedAchievements = useSelector((state: RootState) => state.achievements.previouslyAwardedAchievements);
    const notifications = useSelector((state: RootState) => state.notifications.notifications);
    const [currentAchievement, setCurrentAchievement] = useState<AchievementDetails | null>(null);
    const [showBadges, setShowBadges] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    const serializeConfig = (config: AchievementConfiguration): SerializedAchievementConfiguration => {
        const serializedConfig: SerializedAchievementConfiguration = {};
        Object.entries(config).forEach(([metricName, conditions]) => {
            serializedConfig[metricName] = (conditions as AchievementUnlockCondition<AchievementMetricValue>[]).map((condition: AchievementUnlockCondition<AchievementMetricValue>) => {
                // Analyze the isConditionMet function to determine type and value
                const funcString = condition.isConditionMet.toString();
                let conditionType: 'number' | 'string' | 'boolean' | 'date';
                let conditionValue: any;

                if (funcString.includes('typeof value === "number"') || funcString.includes('typeof value === \'number\'')) {
                    conditionType = 'number';
                    const matches = funcString.match(/value\s*>=?\s*(\d+)/);
                    conditionValue = matches ? parseInt(matches[1]) : 0;
                } else if (funcString.includes('typeof value === "string"') || funcString.includes('typeof value === \'string\'')) {
                    conditionType = 'string';
                    const matches = funcString.match(/value\s*===?\s*['"](.+)['"]/);
                    conditionValue = matches ? matches[1] : '';
                } else if (funcString.includes('typeof value === "boolean"') || funcString.includes('typeof value === \'boolean\'')) {
                    conditionType = 'boolean';
                    conditionValue = funcString.includes('=== true');
                } else if (funcString.includes('instanceof Date')) {
                    conditionType = 'date';
                    const matches = funcString.match(/new Date\(['"](.+)['"]\)/);
                    conditionValue = matches ? matches[1] : new Date().toISOString();
                } else {
                    // Default to number type if we can't determine the type
                    conditionType = 'number';
                    conditionValue = 1;
                }

                return {
                    achievementDetails: condition.achievementDetails,
                    conditionType,
                    conditionValue,
                };
            });
        });
        return serializedConfig;
    };

    const serializedConfig = useMemo(() => serializeConfig(config), [config]);

    const checkAchievements = useCallback(() => {
        const newAchievements: AchievementDetails[] = [];
        Object.entries(serializedConfig).forEach(([metricName, conditions]) => {
            const metricValues = metrics[metricName];
            if (!metricValues) return;
            conditions.forEach((condition) => {
                const isConditionMet = (value: AchievementMetricValue) => {
                    switch (condition.conditionType) {
                        case 'number':
                            return typeof value === 'number' && value >= condition.conditionValue;
                        case 'string':
                            return typeof value === 'string' && value === condition.conditionValue;
                        case 'boolean':
                            return typeof value === 'boolean' && value === condition.conditionValue;
                        case 'date':
                            return value instanceof Date && 
                                value.getTime() >= new Date(condition.conditionValue).getTime();
                        default:
                            return false;
                    }
                };
                if (
                    metricValues.some((value: AchievementMetricValue) => isConditionMet(value)) &&
                    !unlockedAchievementIds.includes(condition.achievementDetails.achievementId) &&
                    !previouslyAwardedAchievements.includes(condition.achievementDetails.achievementId)
                ) {
                    newAchievements.push(condition.achievementDetails);
                }
            });
        });
        if (newAchievements.length > 0) {
            newAchievements.forEach((achievement) => {
                dispatch(unlockAchievement(achievement.achievementId));
                dispatch(markAchievementAsAwarded(achievement.achievementId));
                dispatch(addNotification(achievement));
            });
            setShowConfetti(true);
        }
    }, [serializedConfig, metrics, unlockedAchievementIds, previouslyAwardedAchievements, dispatch]);

    useEffect(() => {
        checkAchievements();
    }, [metrics, checkAchievements]);

    useEffect(() => {
        if (notifications.length > 0 && !currentAchievement) {
            setCurrentAchievement(notifications[0]);
        }
    }, [notifications, currentAchievement]);

    const showBadgesModal = () => setShowBadges(true);

    useEffect(() => {
        dispatch(initialize({
            config: serializedConfig,
            initialState,
            storageKey,
        }));
    }, [dispatch, serializedConfig, initialState, storageKey]);

    return (
        <AchievementContext.Provider
            value={{
                updateMetrics: (newMetrics) => {
                    if (typeof newMetrics === 'function') {
                        const currentMetrics = metrics;
                        const updatedMetrics = newMetrics(currentMetrics);
                        dispatch(setMetrics(updatedMetrics));
                    } else {
                        dispatch(setMetrics(newMetrics));
                    }
                },
                unlockedAchievements: unlockedAchievementIds,
                resetStorage: () => {
                    localStorage.removeItem(storageKey);
                    dispatch(resetAchievements());
                },
            }}
        >
            {children}
            <ConfettiWrapper show={showConfetti} />
            <AchievementModal
                isOpen={!!currentAchievement}
                achievement={currentAchievement}
                onClose={() => {
                    setCurrentAchievement(null);
                    dispatch(clearNotifications());
                    setShowConfetti(false);
                }}
                styles={styles.achievementModal || defaultStyles.achievementModal}
                icons={icons}
            />
            <BadgesButton
                onClick={showBadgesModal}
                position={badgesButtonPosition}
                styles={styles.badgesButton || defaultStyles.badgesButton}
                unlockedAchievements={[...unlockedAchievementIds, ...previouslyAwardedAchievements]
                    .filter((id, index, self) => self.indexOf(id) === index) // Remove duplicates
                    .map(id => {
                        const achievement = Object.values(serializedConfig)
                            .flat()
                            .find(condition => condition.achievementDetails.achievementId === id);
                        return achievement?.achievementDetails;
                    }).filter((a): a is AchievementDetails => !!a)}
            />
            <BadgesModal
                isOpen={showBadges}
                achievements={[...unlockedAchievementIds, ...previouslyAwardedAchievements]
                    .filter((id, index, self) => self.indexOf(id) === index) // Remove duplicates
                    .map(id => {
                        const achievement = Object.values(serializedConfig)
                            .flat()
                            .find(condition => condition.achievementDetails.achievementId === id);
                        return achievement?.achievementDetails;
                    }).filter((a): a is AchievementDetails => !!a)}
                onClose={() => setShowBadges(false)}
                styles={styles.badgesModal || defaultStyles.badgesModal}
                icons={icons}
            />
        </AchievementContext.Provider>
    );
};

export { AchievementProvider };