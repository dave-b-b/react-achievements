import React from 'react';
import { AchievementData } from '../types';
import { Styles } from '../defaultStyles';

interface AchievementModalProps {
    isOpen: boolean;
    achievement: AchievementData | null;
    onClose: () => void;
    styles: Styles['achievementModal'];
}

const AchievementModal: React.FC<AchievementModalProps> = ({ isOpen, achievement, onClose, styles }) => {
    if (!isOpen || !achievement) return null;

    return (
        <div style={styles.overlay}>
            <div style={styles.content}>
                <h2 style={styles.title}>Achievement Unlocked!</h2>
                <img src={achievement.icon} alt={achievement.title} style={styles.icon} />
                <h3 style={styles.title}>{achievement.title}</h3>
                <p style={styles.description}>{achievement.description}</p>
                <button onClick={onClose} style={styles.button}>Okay</button>
            </div>
        </div>
    );
};

export default React.memo(AchievementModal);