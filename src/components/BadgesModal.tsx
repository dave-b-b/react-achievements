import React from 'react';
import { AchievementData } from '../types';

interface BadgesModalProps {
    show: boolean;
    achievements: AchievementData[];
    onClose: () => void;
}

const BadgesModal: React.FC<BadgesModalProps> = ({ show, achievements, onClose }) => {
    if (!show) return null;

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
        maxWidth: '80%',
        maxHeight: '80%',
        overflow: 'auto',
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
            <div style={modalStyle} role="dialog" aria-modal="true" aria-labelledby="badges-title">
                <h2 id="badges-title">Your Achievements</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {achievements.map(achievement => (
                        <div key={achievement.id} style={{ margin: '10px', textAlign: 'center' }}>
                            <img src={achievement.icon} alt={achievement.title} style={{ width: '50px', height: '50px' }} />
                            <h4>{achievement.title}</h4>
                        </div>
                    ))}
                </div>
                <button onClick={onClose} style={{ marginTop: '20px' }}>Close</button>
            </div>
        </>
    );
};

export default React.memo(BadgesModal);