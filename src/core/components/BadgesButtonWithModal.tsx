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
 * BadgesButtonWithModal - A convenience component that combines BadgesButton and BadgesModal
 *
 * This component manages the modal state internally, providing a simplified API
 * for the common use case of displaying achievements.
 *
 * For advanced use cases requiring custom state management or multiple triggers,
 * use BadgesButton and BadgesModal separately.
 *
 * @example
 * ```tsx
 * // Simple usage
 * <BadgesButtonWithModal
 *   unlockedAchievements={achievements.unlocked}
 * />
 *
 * // Show all achievements (locked + unlocked)
 * <BadgesButtonWithModal
 *   unlockedAchievements={achievements.unlocked}
 *   showAllAchievements={true}
 *   allAchievements={getAllAchievements()}
 *   showUnlockConditions={true}
 * />
 *
 * // Customize position and theme
 * <BadgesButtonWithModal
 *   unlockedAchievements={achievements.unlocked}
 *   position="top-right"
 *   theme="gamified"
 * />
 *
 * // Inline mode for navigation
 * <BadgesButtonWithModal
 *   unlockedAchievements={achievements.unlocked}
 *   placement="inline"
 * />
 * ```
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
