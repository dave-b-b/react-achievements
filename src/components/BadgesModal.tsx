import React from 'react';
import { AchievementData } from '../types';
import { Styles } from '../defaultStyles';

interface BadgesModalProps {
    isOpen: boolean;
    achievements: AchievementData[];
    onClose: () => void;
    styles: Styles['badgesModal'];
}

const BadgesModal: React.FC<BadgesModalProps> = ({ isOpen, achievements, onClose, styles }) => {
    if (!isOpen) return null;

    return (
        <div style={styles.overlay}>
            <div style={styles.content}>
                <h2 style={styles.title}>Your Achievements</h2>
                <div style={styles.badgeContainer}>
                    {achievements.map((achievement) => (
                        <div key={achievement.id} style={styles.badge}>
                            <img src={achievement.icon} alt={achievement.title} style={styles.badgeIcon} />
                            <span style={styles.badgeTitle}>{achievement.title}</span>
                        </div>
                    ))}
                </div>
                <button onClick={onClose} style={styles.button}>Close</button>
            </div>
        </div>
    );
};

export default React.memo(BadgesModal);