import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Metrics, AchievementConfig, AchievementData } from '../types';
import AchievementModal from '../components/AchievementModal';
import BadgesModal from '../components/BadgesModal';
import BadgesButton from '../components/BadgesButton';
import ConfettiWrapper from '../components/ConfettiWrapper';

interface AchievementContextProps {
    metrics: Metrics;
    setMetrics: (metrics: Metrics) => void;
    achievedAchievements: string[];
    checkAchievements: () => void;
    showBadgesModal: () => void;
}

interface AchievementProviderProps {
    children: ReactNode;
    config: AchievementConfig;
    storageKey?: string;
    badgesButtonPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

const AchievementContext = createContext<AchievementContextProps | undefined>(undefined);

export const AchievementProvider: React.FC<AchievementProviderProps> = ({
                                                                            children,
                                                                            config,
                                                                            storageKey = 'react-achievements',
                                                                            badgesButtonPosition = 'top-right'
                                                                        }) => {
    const [metrics, setMetrics] = useState<Metrics>({});
    const [achievedAchievements, setAchievedAchievements] = useState<string[]>(() => {
        const saved = localStorage.getItem(`${storageKey}-achievements`);
        return saved ? JSON.parse(saved) : [];
    });
    const [newAchievement, setNewAchievement] = useState<AchievementData | null>(null);
    const [showBadges, setShowBadges] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    const checkAchievements = () => {
        const newAchievements: AchievementData[] = [];

        Object.entries(config).forEach(([metricKey, conditions]) => {
            const metricValue = metrics[metricKey];
            conditions.forEach(condition => {
                if (condition.check(metricValue) && !achievedAchievements.includes(condition.data.id)) {
                    newAchievements.push(condition.data);
                }
            });
        });

        if (newAchievements.length > 0) {
            const updatedAchievements = [...achievedAchievements, ...newAchievements.map(a => a.id)];
            setAchievedAchievements(updatedAchievements);
            localStorage.setItem(`${storageKey}-achievements`, JSON.stringify(updatedAchievements));
            setNewAchievement(newAchievements[0]);
            setShowConfetti(true);
        }
    };

    const showBadgesModal = () => {
        setShowBadges(true);
    };

    const contextValue: AchievementContextProps = {
        metrics,
        setMetrics: (newMetrics: Metrics) => {
            setMetrics(newMetrics);
            checkAchievements();
        },
        achievedAchievements,
        checkAchievements,
        showBadgesModal
    };

    return (
        <AchievementContext.Provider value={contextValue}>
            {children}
            <AchievementModal
                show={!!newAchievement}
                achievement={newAchievement}
                onClose={() => {
                    setNewAchievement(null);
                    setShowConfetti(false);
                }}
            />
            <BadgesModal
                show={showBadges}
                achievements={Object.values(config).flatMap(conditions =>
                    conditions.filter(c => achievedAchievements.includes(c.data.id)).map(c => c.data)
                )}
                onClose={() => setShowBadges(false)}
            />
            <BadgesButton onClick={showBadgesModal} position={badgesButtonPosition} />
            <ConfettiWrapper show={showConfetti} />
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