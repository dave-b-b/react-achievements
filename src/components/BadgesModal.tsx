import React from 'react';
import {AchievementDetails, AchievementIconRecord} from '../types';
import { Styles } from '../defaultStyles';
import { defaultAchievementIcons } from '../assets/defaultIcons';

interface BadgesModalProps {
    isOpen: boolean;
    achievements: AchievementDetails[];
    onClose: () => void;
    styles: Styles['badgesModal'];
    icons?: Record<string, string>;
}

const BadgesModal: React.FC<BadgesModalProps> = ({ isOpen, achievements, onClose, styles, icons = {} }) => {
    if (!isOpen) return null;

    return (
        <div 
            style={styles.overlay as React.CSSProperties} 
            onClick={onClose}
            data-testid="modal-overlay"
        >
            <div 
                style={styles.content}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
                onClick={e => e.stopPropagation()}
            >
                <h2 id="modal-title" style={styles.title}>Your Achievements</h2>
                <div style={styles.badgeContainer}>
                    {achievements.length > 0 ? (
                        achievements.map((achievement) => {
                            const mergedIcons: AchievementIconRecord = { ...defaultAchievementIcons, ...icons };
                            let iconToDisplay: string | undefined = mergedIcons.default;
                            if (achievement.achievementIconKey && mergedIcons[achievement.achievementIconKey]) {
                                iconToDisplay = mergedIcons[achievement.achievementIconKey];
                            }
                            return (
                                <div key={achievement.achievementId} style={styles.badge}>
                                    {iconToDisplay.startsWith('http') || iconToDisplay.startsWith('data:image') ? (
                                        <img src={iconToDisplay} alt={achievement.achievementTitle} style={styles.badgeIcon} />
                                    ) : (
                                        <p style={{ fontSize: '2em' }}>{iconToDisplay}</p>
                                    )}
                                    <span style={styles.badgeTitle}>{achievement.achievementTitle}</span>
                                    <span style={styles.badgeDescription}>{achievement.achievementDescription}</span>
                                </div>
                            );
                        })
                    ) : (
                        <p style={styles.emptyState}>No achievements yet. Keep exploring!</p>
                    )}
                </div>
                <button onClick={onClose} style={styles.button}>Close</button>
            </div>
        </div>
    );
};

export default React.memo(BadgesModal);