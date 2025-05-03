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
import { defaultAchievementIcons } from '../icons/defaultIcons';

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
    
    // Track which achievements have already been notified to the user
    // This helps prevent duplicate notifications
    const [notifiedAchievements, setNotifiedAchievements] = useState<Set<string>>(new Set());
    
    // Track if we've loaded initially from storage
    const initialLoadRef = useRef(false);

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
                
                // Mark these as already notified since they were pre-existing
                setNotifiedAchievements(new Set(initialState.previouslyAwardedAchievements));
            }
        } else if (Object.keys(storedMetrics).length > 0 || unlockedAchievements.length > 0) {
            // If we have stored data, mark all existing achievements as notified
            // This prevents showing notifications for already unlocked achievements
            setNotifiedAchievements(new Set(unlockedAchievements));
        }
        
        // Mark that we've completed the initial load
        initialLoadRef.current = true;
    }, []);

    const checkAchievements = useCallback(() => {
        if (!initialLoadRef.current) return; // Skip checking until initial load is complete
        
        let newlyUnlockedAchievements: AchievementDetails[] = [];

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
                const achievementId = condition.achievementDetails.achievementId;
                
                if (
                    condition.isConditionMet(latestValue, state) &&
                    !unlockedAchievements.includes(achievementId)
                ) {
                    newlyUnlockedAchievements.push(condition.achievementDetails);
                }
            });
        });
        
        // If we found new achievements
        if (newlyUnlockedAchievements.length > 0) {
            // Get all achievement IDs
            const newAchievementIds = newlyUnlockedAchievements.map(a => a.achievementId);
            
            // Update unlocked achievements in state and storage
            const updatedUnlockedAchievements = [...unlockedAchievements, ...newAchievementIds];
            setUnlockedAchievements(updatedUnlockedAchievements);
            achievementStorage.setUnlockedAchievements(updatedUnlockedAchievements);
            
            // Filter out any achievements that have already been notified
            const filteredNotifications = newlyUnlockedAchievements.filter(
                a => !notifiedAchievements.has(a.achievementId)
            );
            
            // If we have new notifications to show
            if (filteredNotifications.length > 0) {
                setPendingNotifications(prev => [...prev, ...filteredNotifications]);
                setShowConfetti(true);
                
                // Update our notified achievements tracker
                const updatedNotified = new Set(notifiedAchievements);
                filteredNotifications.forEach(a => updatedNotified.add(a.achievementId));
                setNotifiedAchievements(updatedNotified);
                
                // Call onAchievementUnlocked for all new achievements
                if (onAchievementUnlocked) {
                    filteredNotifications.forEach(achievement => {
                        onAchievementUnlocked(achievement);
                    });
                }
            }
        }
    }, [metrics, unlockedAchievements, notifiedAchievements, onAchievementUnlocked]);

    // Merge custom icons with default icons, with custom icons taking precedence
    const mergedIcons: Record<string, string> = useMemo(() => {
        return { ...defaultAchievementIcons, ...icons };
    }, [icons]);

    // Handle notifications
    useEffect(() => {
        if (pendingNotifications.length > 0) {
            // Only take the first notification to display
            const notification = pendingNotifications[0]; 
            let iconToDisplay = null;
            
            if (notification.achievementIconKey) {
                if (notification.achievementIconKey in mergedIcons) {
                    iconToDisplay = mergedIcons[notification.achievementIconKey];
                } else if ('default' in mergedIcons) {
                    iconToDisplay = mergedIcons.default;
                }
            }
            
            toast.success(
                <div>
                    <h4 style={{ margin: '0 0 8px 0' }}>Achievement Unlocked! 🎉</h4>
                    <strong>{notification.achievementTitle}</strong>
                    <p style={{ margin: '4px 0 0 0' }}>{notification.achievementDescription}</p>
                    {iconToDisplay && (
                        <div style={{ fontSize: '24px', marginTop: '8px' }}>
                            {iconToDisplay}
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
                    toastId: `achievement-${notification.achievementId}`, // Prevent duplicate toasts
                }
            );
            
            // Remove this notification from pending
            setPendingNotifications(prev => prev.slice(1));
        }
    }, [pendingNotifications, mergedIcons]);

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
        setNotifiedAchievements(new Set());
        setPendingNotifications([]);
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
            <ConfettiWrapper 
                show={showConfetti} 
                achievement={pendingNotifications[0]} 
                icons={mergedIcons} 
            />
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
                icons={mergedIcons}
            />
        </AchievementContext.Provider>
    );
}; 