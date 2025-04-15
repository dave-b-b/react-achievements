import React from 'react';
import { Styles } from '../defaultStyles';
import { AchievementDetails } from '../types';

interface BadgesButtonProps {
    onClick: () => void;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    styles: Styles['badgesButton'];
    unlockedAchievements: AchievementDetails[];
    icon?: React.ReactNode; // Allow custom icons
    drawer?: boolean; // Indicate if it triggers a drawer
    customStyles?: React.CSSProperties; // Allow custom styles
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
    const positionStyle = position
        ? {
            [position.split('-')[0]]: '20px',
            [position.split('-')[1]]: '20px',
        }
        : {};

    const handleButtonClick = () => {
        onClick();
    };

    const achievementsText = 'View Achievements';

    const buttonContent = icon ? icon : achievementsText;

    return (
        <button
            onClick={handleButtonClick}
            style={{ ...styles, ...positionStyle, ...customStyles }}
        >
            {buttonContent}
        </button>
    );
};

export default React.memo(BadgesButton);