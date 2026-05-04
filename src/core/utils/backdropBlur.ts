import type { CSSProperties } from 'react';
import type { AchievementUIBackdropBlur } from '../types';

const isNumericString = (value: string): boolean => /^-?\d+(\.\d+)?$/.test(value);

export const getBackdropBlurFilter = (
  backdropBlur?: AchievementUIBackdropBlur
): string | undefined => {
  if (backdropBlur === undefined) {
    return undefined;
  }

  if (typeof backdropBlur === 'number') {
    if (backdropBlur <= 0) {
      return undefined;
    }

    return `blur(${backdropBlur}px)`;
  }

  const trimmedBlur = backdropBlur.trim();

  if (
    !trimmedBlur ||
    trimmedBlur === '0' ||
    trimmedBlur === '0px' ||
    trimmedBlur === 'none'
  ) {
    return undefined;
  }

  const blurValue = isNumericString(trimmedBlur) ? `${trimmedBlur}px` : trimmedBlur;
  return blurValue.startsWith('blur(') ? blurValue : `blur(${blurValue})`;
};

export const getBackdropBlurStyles = (
  backdropBlur?: AchievementUIBackdropBlur
): CSSProperties => {
  const backdropFilter = getBackdropBlurFilter(backdropBlur);

  if (!backdropFilter) {
    return {};
  }

  return {
    backdropFilter,
    WebkitBackdropFilter: backdropFilter,
  };
};
