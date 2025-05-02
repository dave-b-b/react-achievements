import React from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

interface ConfettiWrapperProps {
    show: boolean;
}

export const ConfettiWrapper: React.FC<ConfettiWrapperProps> = ({ show }) => {
    const { width, height } = useWindowSize();

    if (!show) return null;

    return (
        <Confetti
            width={width}
            height={height}
            numberOfPieces={200}
            recycle={false}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: 1001,
                pointerEvents: 'none',
            }}
        />
    );
}; 