import React from 'react';
import {AchievementDetails, AchievementIconRecord} from '../types';
import { Styles } from '../defaultStyles';
import { defaultAchievementIcons } from '../assets/defaultIcons'; // Import default icons

interface BadgesModalProps {
    isOpen: boolean;
    achievements: AchievementDetails[];
    onClose: () => void;
    styles: Styles['badgesModal'];
    icons?: Record<string, string>; // Optional user-specified icons
}

const BadgesModal: React.FC<BadgesModalProps> = ({ isOpen, achievements, onClose, styles, icons = {} }) => {
    if (!isOpen) return null;

    return (
        <div style={styles.overlay as React.CSSProperties}>
            <div style={styles.content}>
                <h2 style={styles.title}>Your Achievements</h2>
                <div style={styles.badgeContainer}>
                    {achievements.map((achievement) => {
                        const mergedIcons: AchievementIconRecord = { ...defaultAchievementIcons, ...icons };
                        let iconToDisplay: string | undefined = mergedIcons.default;
                        if (achievement.achievementIconKey && mergedIcons[achievement.achievementIconKey]) {
                            iconToDisplay = mergedIcons[achievement.achievementIconKey];
                        }
                        return (
                            <div key={achievement.achievementId} style={styles.badge}>
                                {/* Render icon based on type (Unicode or image path) */}
                                {iconToDisplay.startsWith('http') || iconToDisplay.startsWith('data:image') ? (
                                    <img src={iconToDisplay} alt={achievement.achievementTitle} style={styles.badgeIcon} />
                                ) : (
                                    <p style={{ fontSize: '2em' }}>{iconToDisplay}</p> // Render Unicode as large text
                                )}
                                <span style={styles.badgeTitle}>{achievement.achievementTitle}</span>
                            </div>
                        );
                    })}
                </div>
                <button onClick={onClose} style={styles.button}>Close</button>
            </div>
        </div>
    );
};

export default React.memo(BadgesModal);