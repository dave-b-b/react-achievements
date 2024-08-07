import React from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { ConfettiProps } from 'react-confetti';

interface ConfettiWrapperProps {
    show: boolean;
    confettiProps?: Partial<ConfettiProps>;
}

const ConfettiWrapper: React.FC<ConfettiWrapperProps> = ({ show, confettiProps }) => {
    const { width, height } = useWindowSize();

    if (!show) return null;

    return (
        <Confetti
            width={width}
            height={height}
            {...confettiProps}
        />
    );
};

export default ConfettiWrapper;