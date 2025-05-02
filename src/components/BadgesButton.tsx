import React, { useState } from 'react';
import { Styles } from '../defaultStyles';
import { AchievementDetails } from '../types';

interface BadgesButtonProps {
    onClick: () => void;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    styles: Styles['badgesButton'];
    unlockedAchievements: AchievementDetails[];
    icon?: React.ReactNode;
    drawer?: boolean;
    customStyles?: React.CSSProperties;
}

const BadgesButton: React.FC<BadgesButtonProps> = ({
    onClick,
    position,
    styles,
    unlockedAchievements,
    icon,
    drawer = false,
    customStyles,
}) => {
    const [isHovered, setIsHovered] = useState(false);

    const positionStyle = position
        ? {
            [position.split('-')[0]]: '20px',
            [position.split('-')[1]]: '20px',
        }
        : {};

    const buttonStyles = {
        ...styles,
        ...positionStyle,
        ...customStyles,
        transform: isHovered ? 'scale(1.1)' : 'scale(1)',
    };

    const achievementsText = 'View Achievements';
    const buttonContent = icon ? icon : achievementsText;

    return (
        <button
            onClick={onClick}
            style={buttonStyles}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {buttonContent}
        </button>
    );
};

export default React.memo(BadgesButton);