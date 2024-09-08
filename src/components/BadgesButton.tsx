import React from 'react';
import { Styles } from '../defaultStyles';

interface BadgesButtonProps {
    onClick: () => void;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    styles: Styles['badgesButton'];
}

const BadgesButton: React.FC<BadgesButtonProps> = ({ onClick, position, styles }) => {
    const positionStyle = {
        [position.split('-')[0]]: '20px',
        [position.split('-')[1]]: '20px',
    };

    return (
        <button onClick={onClick} style={{ ...styles, ...positionStyle }}>
            View Achievements
        </button>
    );
};

export default React.memo(BadgesButton);