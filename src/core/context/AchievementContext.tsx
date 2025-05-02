import React, { createContext, useContext, useEffect, useCallback, useState, useMemo, useRef } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { 
    AchievementContextValue, 
    AchievementProviderProps, 
    AchievementMetrics,
    AchievementDetails,
    AchievementState,
    AchievementMetricValue
} from '../types';
import { LocalStorage } from '../storage/LocalStorage';
import { BadgesButton } from '../components/BadgesButton';
import { BadgesModal } from '../components/BadgesModal';
import { ConfettiWrapper } from '../components/ConfettiWrapper';
import { defaultStyles } from '../styles/defaultStyles';

const AchievementContext = createContext<AchievementContextValue | null>(null);

export const useAchievementContext = () => {
    const context = useContext(AchievementContext);
    if (!context) {
        throw new Error('useAchievementContext must be used within an AchievementProvider');
    }
    return context;
};

const deserializeValue = (value: AchievementMetricValue): AchievementMetricValue => {
    if (typeof value === 'string' && value.toLowerCase() === 'true') return true;
    if (typeof value === 'string' && value.toLowerCase() === 'false') return false;
    if (typeof value === 'string' && !isNaN(Number(value))) return Number(value);
    return value;
};

export const AchievementProvider: React.FC<AchievementProviderProps> = ({
    children,
    config,
    initialState = {},
    storageKey = 'react-achievements',
    badgesButtonPosition = 'top-right',
    styles = {},
    icons = {},
    storage,
    onAchievementUnlocked
}) => {
    const configRef = useRef(config);
    const achievementStorage = storage || new LocalStorage(storageKey);
    const [metrics, setMetrics] = useState<AchievementMetrics>(achievementStorage.getMetrics());
    const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>(achievementStorage.getUnlockedAchievements());
    const [showBadges, setShowBadges] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [pendingNotifications, setPendingNotifications] = useState<AchievementDetails[]>([]);

    // Update config ref when it changes
    useEffect(() => {
        configRef.current = config;
    }, [config]);

    // Initialize storage with initial state
    useEffect(() => {
        const storedMetrics = achievementStorage.getMetrics();
        if (Object.keys(storedMetrics).length === 0 && Object.keys(initialState).length > 0) {
            const initialMetrics: AchievementMetrics = {};
            Object.entries(initialState).forEach(([key, value]) => {
                if (key !== 'previouslyAwardedAchievements') {
                    initialMetrics[key] = [value];
                }
            });
            achievementStorage.setMetrics(initialMetrics);
            setMetrics(initialMetrics);

            if (initialState.previouslyAwardedAchievements) {
                achievementStorage.setUnlockedAchievements(initialState.previouslyAwardedAchievements);
                setUnlockedAchievements(initialState.previouslyAwardedAchievements);
            }
        }
    }, []);

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
                unlockedAchievements
            };

            conditions.forEach((condition) => {
                if (
                    condition.isConditionMet(latestValue, state) &&
                    !unlockedAchievements.includes(condition.achievementDetails.achievementId)
                ) {
                    const newUnlockedAchievements = [...unlockedAchievements, condition.achievementDetails.achievementId];
                    setUnlockedAchievements(newUnlockedAchievements);
                    achievementStorage.setUnlockedAchievements(newUnlockedAchievements);
                    setPendingNotifications(prev => [...prev, condition.achievementDetails]);
                    setShowConfetti(true);
                    if (onAchievementUnlocked) {
                        onAchievementUnlocked(condition.achievementDetails);
                    }
                }
            });
        });
    }, [metrics, unlockedAchievements, onAchievementUnlocked]);

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
            setPendingNotifications([]);
        }
    }, [pendingNotifications, icons]);

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

    const updateMetrics = useCallback((newMetrics: AchievementMetrics | ((prev: AchievementMetrics) => AchievementMetrics)) => {
        setMetrics(prev => {
            const updated = typeof newMetrics === 'function' ? newMetrics(prev) : newMetrics;
            achievementStorage.setMetrics(updated);
            return updated;
        });
    }, [achievementStorage]);

    const resetStorage = useCallback(() => {
        achievementStorage.clear();
        setMetrics({});
        setUnlockedAchievements([]);
    }, [achievementStorage]);

    // Convert achievement IDs to details using config from ref
    const achievementDetails = useMemo(() => {
        return unlockedAchievements
            .map(id => {
                const achievement = Object.values(configRef.current)
                    .flat()
                    .find(condition => condition.achievementDetails.achievementId === id);
                return achievement?.achievementDetails;
            })
            .filter((a): a is AchievementDetails => !!a);
    }, [unlockedAchievements]);

    return (
        <AchievementContext.Provider value={{
            updateMetrics,
            unlockedAchievements,
            resetStorage,
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