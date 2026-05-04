import React, { useState } from 'react';
import { BadgesButton } from './BadgesButton';
import { BadgesModal } from './BadgesModal';
import { AchievementDetails, AchievementWithStatus, StylesProps } from '../types';

export interface BadgesButtonWithModalProps {
    // Badge Button Props
    unlockedAchievements: AchievementDetails[];
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    placement?: 'fixed' | 'inline';

    // Badge Modal Props
    showAllAchievements?: boolean;
    allAchievements?: AchievementWithStatus[];
    showUnlockConditions?: boolean;

    // Shared Props
    icons?: Record<string, string>;
    theme?: string;

    // Styling Props
    buttonStyles?: React.CSSProperties;
    modalStyles?: StylesProps['badgesModal'];
}

/**
 * @deprecated Use `AchievementsWidget` for new integrations. This v3
 * compatibility wrapper will be removed in 4.2.
 */
export const BadgesButtonWithModal: React.FC<BadgesButtonWithModalProps> = ({
    unlockedAchievements,
    position = 'bottom-right',
    placement = 'fixed',
    showAllAchievements = false,
    allAchievements,
    showUnlockConditions = false,
    icons,
    theme = 'modern',
    buttonStyles,
    modalStyles,
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <BadgesButton
                onClick={() => setIsModalOpen(true)}
                unlockedAchievements={unlockedAchievements}
                position={position}
                placement={placement}
                theme={theme}
                styles={buttonStyles}
            />
            <BadgesModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                achievements={unlockedAchievements}
                showAllAchievements={showAllAchievements}
                allAchievements={allAchievements}
                showUnlockConditions={showUnlockConditions}
                icons={icons}
                styles={modalStyles}
            />
        </>
    );
};
