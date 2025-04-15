import React from 'react';
import { AchievementDetails, AchievementIconRecord } from '../types';
import { Styles } from '../defaultStyles';
import { defaultAchievementIcons } from '../assets/defaultIcons';

interface AchievementModalProps {
    isOpen: boolean;
    achievement: AchievementDetails | null;
    onClose: () => void;
    styles: Styles['achievementModal'];
    icons?: Record<string, string>;
}

const AchievementModal: React.FC<AchievementModalProps> = ({ isOpen, achievement, onClose, styles, icons = {} }) => {
    if (!isOpen || !achievement) return null;

    const mergedIcons: AchievementIconRecord = { ...defaultAchievementIcons, ...icons };
    const iconToDisplay = achievement?.achievementIconKey ? (mergedIcons[achievement.achievementIconKey] || mergedIcons.default) : mergedIcons.default;

    return (
        <div style={{
            ...styles.overlay,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'fixed', // Ensure it covers the screen
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)', // Optional semi-transparent background
        }}>
            <div style={{
                ...styles.content,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center', // Center content horizontally
                justifyContent: 'center', // Center content vertically
                padding: '20px',
                borderRadius: '8px',
                backgroundColor: 'white', // Or your modal background color
            }}>
                <h2 style={styles.title}>Achievement Unlocked!</h2>
                {iconToDisplay.startsWith('http') || iconToDisplay.startsWith('data:image') ? (
                    <img src={iconToDisplay} alt={achievement.achievementTitle} style={styles.icon} />
                ) : (
                    <p style={{ fontSize: '3em' }}>{iconToDisplay}</p>
                )}
                <h3 style={styles.title}>{achievement.achievementTitle}</h3>
                <p style={styles.description}>{achievement.achievementDescription}</p>
                <button onClick={onClose} style={styles.button}>Okay</button>
            </div>
        </div>
    );
};

export default React.memo(AchievementModal);