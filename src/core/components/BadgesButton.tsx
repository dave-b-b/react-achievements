import React from 'react';
import { AchievementDetails } from '../types';

interface BadgesButtonProps {
    onClick: () => void;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    styles?: React.CSSProperties;
    unlockedAchievements: AchievementDetails[];
}

const getPositionStyles = (position: BadgesButtonProps['position']): React.CSSProperties => {
    const base: React.CSSProperties = {
        position: 'fixed',
        margin: '20px',
        zIndex: 1000,
    };

    switch (position) {
        case 'top-left':
            return { ...base, top: 0, left: 0 };
        case 'top-right':
            return { ...base, top: 0, right: 0 };
        case 'bottom-left':
            return { ...base, bottom: 0, left: 0 };
        case 'bottom-right':
            return { ...base, bottom: 0, right: 0 };
    }
};

export const BadgesButton: React.FC<BadgesButtonProps> = ({
    onClick,
    position,
    styles = {},
    unlockedAchievements
}) => {
    const baseStyles: React.CSSProperties = {
        backgroundColor: '#4CAF50',
        color: 'white',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '20px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '16px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        transition: 'transform 0.2s ease-in-out',
        ...getPositionStyles(position),
        ...styles,
    };

    return (
        <button
            onClick={onClick}
            style={baseStyles}
            onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.transform = 'scale(1)';
            }}
        >
            🏆 Achievements ({unlockedAchievements.length})
        </button>
    );
}; 