import React, { useEffect } from 'react';
import { BuiltInConfetti } from '../ui/BuiltInConfetti';
import { warnDeprecation } from '../utils/deprecation';

export interface ConfettiWrapperProps {
  show: boolean;
}

/**
 * @deprecated Use the provider `ui.ConfettiComponent` option or the built-in
 * confetti default. This v3 compatibility wrapper will be removed in the next major release.
 */
export const ConfettiWrapper: React.FC<ConfettiWrapperProps> = ({ show }) => {
  useEffect(() => {
    warnDeprecation(
      '`ConfettiWrapper` is deprecated. Use the provider `ui.ConfettiComponent` option or built-in confetti defaults instead. `ConfettiWrapper` will be removed in the next major release.'
    );
  }, []);

  return <BuiltInConfetti show={show} particleCount={200} />;
};
