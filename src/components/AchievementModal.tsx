import React from 'react';
import { AchievementData } from '../types';

interface AchievementModalProps {
    show: boolean;
    achievement: AchievementData | null;
    onClose: () => void;
}

const AchievementModal: React.FC<AchievementModalProps> = ({ show, achievement, onClose }) => {
    if (!show || !achievement) return null;

    const modalStyle: React.CSSProperties = {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        zIndex: 1000,
    };

    const overlayStyle: React.CSSProperties = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 999,
    };

    return (
        <>
            <div style={overlayStyle} onClick={onClose} />
            <div style={modalStyle} role="dialog" aria-modal="true" aria-labelledby="achievement-title">
                <h2 id="achievement-title">Achievement Unlocked!</h2>
                <img src={achievement.icon} alt={achievement.title} style={{ width: '50px', height: '50px' }} />
                <h3>{achievement.title}</h3>
                <p>{achievement.description}</p>
                <button onClick={onClose}>Okay</button>
            </div>
        </>
    );
};

export default React.memo(AchievementModal);