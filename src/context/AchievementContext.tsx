import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Metrics, AchievementConfig, AchievementData, MetricValue } from '../types';
import { defaultStyles, Styles } from '../defaultStyles';
import AchievementModal from '../components/AchievementModal';
import BadgesModal from '../components/BadgesModal';
import BadgesButton from '../components/BadgesButton';
import ConfettiWrapper from '../components/ConfettiWrapper';

interface AchievementContextProps {
    metrics: Metrics;
    setMetrics: (metrics: Metrics | ((prevMetrics: Metrics) => Metrics)) => void;
    unlockedAchievements: string[];
    checkAchievements: () => void;
    showBadgesModal: () => void;
}

interface AchievementProviderProps {
    children: ReactNode;
    config: AchievementConfig;
    initialState?: Record<string, MetricValue>;
    storageKey?: string;
    badgesButtonPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    styles?: Partial<Styles>;
}

const AchievementContext = createContext<AchievementContextProps | undefined>(undefined);

export const AchievementProvider: React.FC<AchievementProviderProps> = ({
                                                                            children,
                                                                            config,
                                                                            initialState = {},
                                                                            storageKey = 'react-achievements',
                                                                            badgesButtonPosition = 'top-right',
                                                                            styles = {},
                                                                        }) => {
    const mergedStyles = React.useMemo(() => mergeDeep(defaultStyles, styles), [styles]);

    const [metrics, setMetrics] = useState<Metrics>(() => {
        const savedMetrics = localStorage.getItem(`${storageKey}-metrics`);
        return savedMetrics ? JSON.parse(savedMetrics) : initialState;
    });

    const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>(() => {
        const saved = localStorage.getItem(`${storageKey}-unlocked-achievements`);
        return saved ? JSON.parse(saved) : [];
    });

    const [newlyUnlockedAchievements, setNewlyUnlockedAchievements] = useState<string[]>(() => {
        const saved = localStorage.getItem(`${storageKey}-newly-unlocked-achievements`);
        return saved ? JSON.parse(saved) : [];
    });

    const [achievementQueue, setAchievementQueue] = useState<AchievementData[]>([]);
    const [currentAchievement, setCurrentAchievement] = useState<AchievementData | null>(null);
    const [showBadges, setShowBadges] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    const checkAchievements = useCallback(() => {
        const newAchievements: AchievementData[] = [];

        Object.entries(config).forEach(([metricKey, conditions]) => {
            const metricValue = metrics[metricKey];
            conditions.forEach(condition => {
                if (condition.check(metricValue) && !unlockedAchievements.includes(condition.data.id)) {
                    newAchievements.push(condition.data);
                }
            });
        });

        if (newAchievements.length > 0) {
            const newlyUnlockedIds = newAchievements.map(a => a.id);
            setUnlockedAchievements(prev => {
                const updated = [...prev, ...newlyUnlockedIds];
                localStorage.setItem(`${storageKey}-unlocked-achievements`, JSON.stringify(updated));
                return updated;
            });
            setNewlyUnlockedAchievements(prev => {
                const updated = [...prev, ...newlyUnlockedIds];
                localStorage.setItem(`${storageKey}-newly-unlocked-achievements`, JSON.stringify(updated));
                return updated;
            });
            setAchievementQueue(prevQueue => [...prevQueue, ...newAchievements]);
            setShowConfetti(true);
        }
    }, [config, metrics, unlockedAchievements, storageKey]);

    useEffect(() => {
        checkAchievements();
    }, [metrics, checkAchievements]);

    useEffect(() => {
        if (achievementQueue.length > 0 && !currentAchievement) {
            const nextAchievement = achievementQueue[0];
            setCurrentAchievement(nextAchievement);
            setAchievementQueue(prevQueue => prevQueue.slice(1));

            setNewlyUnlockedAchievements(prev => {
                const updated = prev.filter(id => id !== nextAchievement.id);
                localStorage.setItem(`${storageKey}-newly-unlocked-achievements`, JSON.stringify(updated));
                return updated;
            });
        }
    }, [achievementQueue, currentAchievement, storageKey]);

    const showBadgesModal = () => setShowBadges(true);

    const getAchievements = (achievedIds: string[]) => {
        return Object.values(config).flatMap(conditions =>
            conditions.filter(c => achievedIds.includes(c.data.id)).map(c => c.data)
        );
    };

    const contextValue: AchievementContextProps = {
        metrics,
        setMetrics: (newMetrics) => {
            setMetrics(prevMetrics => {
                const updatedMetrics = typeof newMetrics === 'function' ? newMetrics(prevMetrics) : newMetrics;
                localStorage.setItem(`${storageKey}-metrics`, JSON.stringify(updatedMetrics));
                return updatedMetrics;
            });
        },
        unlockedAchievements,
        checkAchievements,
        showBadgesModal
    };

    return (
        <AchievementContext.Provider value={contextValue}>
            {children}
            <AchievementModal
                isOpen={!!currentAchievement}
                achievement={currentAchievement}
                onClose={() => {
                    setCurrentAchievement(null);
                    if (achievementQueue.length === 0 && newlyUnlockedAchievements.length === 0) {
                        setShowConfetti(false);
                    }
                }}
                styles={mergedStyles.achievementModal}
            />
            <BadgesModal
                isOpen={showBadges}
                achievements={getAchievements(unlockedAchievements)}
                onClose={() => setShowBadges(false)}
                styles={mergedStyles.badgesModal}
            />
            <BadgesButton
                onClick={showBadgesModal}
                position={badgesButtonPosition}
                styles={mergedStyles.badgesButton}
            />
            <ConfettiWrapper show={showConfetti || achievementQueue.length > 0} />
        </AchievementContext.Provider>
    );
};

export const useAchievement = () => {
    const context = useContext(AchievementContext);
    if (context === undefined) {
        throw new Error('useAchievement must be used within an AchievementProvider');
    }
    return context;
};

// Helper function to deep merge objects
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
    return (item && typeof item === 'object' && !Array.isArray(item));
}