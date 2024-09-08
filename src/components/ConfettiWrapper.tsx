import React from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

interface ConfettiWrapperProps {
    show: boolean;
}

const ConfettiWrapper: React.FC<ConfettiWrapperProps> = ({ show }) => {
    const { width, height } = useWindowSize();

    if (!show) return null;

    return <Confetti width={width} height={height} recycle={false} />;
};

export default ConfettiWrapper;