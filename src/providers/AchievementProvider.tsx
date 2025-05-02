import React, { useEffect, useCallback, useState, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { initialize, setMetrics, resetAchievements, unlockAchievement, clearNotifications } from '../redux/achievementSlice';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    AchievementDetails,
    AchievementMetricValue,
    AchievementConfiguration,
    AchievementProviderProps,
    AchievementMetrics,
    AchievementState
} from '../types';
import BadgesButton from '../components/BadgesButton';
import BadgesModal from '../components/BadgesModal';
import ConfettiWrapper from '../components/ConfettiWrapper';
import { defaultStyles } from '../defaultStyles';

export interface AchievementContextType {
    updateMetrics: (metrics: AchievementMetrics | ((prev: AchievementMetrics) => AchievementMetrics)) => void;
    unlockedAchievements: string[];
    resetStorage: () => void;
}

export const AchievementContext = React.createContext<AchievementContextType | null>(null);

export const useAchievementContext = () => {
    const context = React.useContext(AchievementContext);
    if (!context) {
        throw new Error('useAchievementContext must be used within an AchievementProvider');
    }
    return context;
};

// Helper function to serialize dates for Redux actions
const serializeMetrics = (metrics: AchievementMetrics): AchievementMetrics => {
    return Object.entries(metrics).reduce((acc, [key, values]) => ({
        ...acc,
        [key]: values.map(value => value instanceof Date ? value.toISOString() : value)
    }), {} as AchievementMetrics);
};

// Helper function to parse potential date strings
const deserializeValue = (value: string | number | boolean): AchievementMetricValue => {
    if (typeof value === 'string') {
        // Try to parse ISO date string
        const date = new Date(value);
        if (!isNaN(date.getTime()) && value === date.toISOString()) {
            return date;
        }
    }
    return value;
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
    const configRef = useRef(config);
    const isMountedRef = useRef(false);
    const metrics = useSelector((state: RootState) => state.achievements.metrics);
    const unlockedAchievementIds = useSelector((state: RootState) => state.achievements.unlockedAchievements);
    const pendingNotifications = useSelector((state: RootState) => state.achievements.pendingNotifications);
    const [showBadges, setShowBadges] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    // Update config ref when it changes
    useEffect(() => {
        configRef.current = config;
    }, [config]);

    const checkAchievements = useCallback(() => {
        Object.entries(configRef.current).forEach(([metricName, conditions]) => {
            const metricValues = metrics[metricName];
            if (!metricValues) return;

            const latestValue = deserializeValue(metricValues[metricValues.length - 1]);
            const state: AchievementState = {
                metrics: Object.entries(metrics).reduce((acc, [key, values]) => ({
                    ...acc,
                    [key]: values.map(deserializeValue)
                }), {}),
                unlockedAchievements: unlockedAchievementIds
            };

            conditions.forEach((condition) => {
                if (
                    condition.isConditionMet(latestValue, state) &&
                    !unlockedAchievementIds.includes(condition.achievementDetails.achievementId)
                ) {
                    dispatch(unlockAchievement(condition.achievementDetails));
                    setShowConfetti(true);
                }
            });
        });
    }, [metrics, unlockedAchievementIds, dispatch]);

    // Handle notifications
    useEffect(() => {
        if (pendingNotifications.length > 0) {
            pendingNotifications.forEach((notification) => {
                toast.success(
                    <div>
                        <h4 style={{ margin: '0 0 8px 0' }}>Achievement Unlocked! 🎉</h4>
                        <strong>{notification.achievementTitle}</strong>
                        <p style={{ margin: '4px 0 0 0' }}>{notification.achievementDescription}</p>
                        {notification.achievementIconKey && icons[notification.achievementIconKey] && (
                            <div style={{ fontSize: '24px', marginTop: '8px' }}>
                                {icons[notification.achievementIconKey]}
                            </div>
                        )}
                    </div>,
                    {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    }
                );
            });
            dispatch(clearNotifications());
        }
    }, [pendingNotifications, dispatch, icons]);

    // Reset confetti after delay
    useEffect(() => {
        if (showConfetti) {
            const timer = setTimeout(() => setShowConfetti(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [showConfetti]);

    // Check for achievements when metrics change
    useEffect(() => {
        checkAchievements();
    }, [metrics, checkAchievements]);

    // Initialize on mount, but don't store config in Redux
    useEffect(() => {
        if (!isMountedRef.current) {
            isMountedRef.current = true;
            dispatch(initialize({
                initialState,
                storageKey,
            }));
        }
    }, [dispatch, initialState, storageKey]);

    // Convert achievement IDs to details using config from ref
    const achievementDetails = useMemo(() => {
        return unlockedAchievementIds
            .map(id => {
                const achievement = Object.values(configRef.current)
                    .flat()
                    .find(condition => condition.achievementDetails.achievementId === id);
                return achievement?.achievementDetails;
            })
            .filter((a): a is AchievementDetails => !!a);
    }, [unlockedAchievementIds]);

    return (
        <AchievementContext.Provider value={{
            updateMetrics: (newMetrics) => {
                if (typeof newMetrics === 'function') {
                    const updatedMetrics = newMetrics(metrics);
                    dispatch(setMetrics(serializeMetrics(updatedMetrics)));
                } else {
                    dispatch(setMetrics(serializeMetrics(newMetrics)));
                }
            },
            unlockedAchievements: unlockedAchievementIds,
            resetStorage: () => {
                if (storageKey) {
                    localStorage.removeItem(storageKey);
                }
                dispatch(resetAchievements());
                dispatch(initialize({ 
                    storageKey,
                    initialState: undefined  // Force empty state
                }));
            },
        }}>
            {children}
            <ToastContainer />
            <ConfettiWrapper show={showConfetti} />
            <BadgesButton
                onClick={() => setShowBadges(true)}
                position={badgesButtonPosition}
                styles={styles.badgesButton || defaultStyles.badgesButton}
                unlockedAchievements={achievementDetails}
            />
            <BadgesModal
                isOpen={showBadges}
                achievements={achievementDetails}
                onClose={() => setShowBadges(false)}
                styles={styles.badgesModal || defaultStyles.badgesModal}
                icons={icons}
            />
        </AchievementContext.Provider>
    );
};

export { AchievementProvider };