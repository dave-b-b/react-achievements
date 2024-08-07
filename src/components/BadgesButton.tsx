import React from 'react';

interface BadgesButtonProps {
    onClick: () => void;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

const BadgesButton: React.FC<BadgesButtonProps> = ({ onClick, position }) => {
    const buttonStyle: React.CSSProperties = {
        position: 'fixed',
        [position.split('-')[0]]: '20px',
        [position.split('-')[1]]: '20px',
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        zIndex: 998,
    };

    return (
        <button style={buttonStyle} onClick={onClick}>
            View Achievements
        </button>
    );
};

export default React.memo(BadgesButton);