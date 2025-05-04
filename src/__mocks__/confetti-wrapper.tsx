import React from 'react';

export const ConfettiWrapper: React.FC<{ show: boolean }> = ({ show }) => {
  return show ? <div data-testid="mock-confetti" /> : null;
};

export default ConfettiWrapper; 