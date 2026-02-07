import React from 'react';
import { StylesProps } from '../types';
import { builtInThemes, getTheme } from '../ui/themes';
import { defaultStyles } from '../styles/defaultStyles';

export interface LevelProgressProps {
    level: number | string;
    currentXP: number;
    nextLevelXP: number;
    label?: string;
    valueLabel?: string;
    showValues?: boolean;
    showPercent?: boolean;
    theme?: string;
    styles?: StylesProps['levelProgress'];
    className?: string;
}

const clamp = (value: number, min: number, max: number): number => {
    return Math.min(Math.max(value, min), max);
};

export const LevelProgress: React.FC<LevelProgressProps> = ({
    level,
    currentXP,
    nextLevelXP,
    label = 'Level',
    valueLabel,
    showValues = true,
    showPercent = true,
    theme = 'modern',
    styles = {},
    className,
}) => {
    const themeConfig = getTheme(theme) || builtInThemes.modern;
    const safeMax = nextLevelXP > 0 ? nextLevelXP : 1;
    const clampedCurrent = clamp(currentXP, 0, safeMax);
    const progress = Math.round((clampedCurrent / safeMax) * 100);
    const computedValueLabel = valueLabel ?? `${clampedCurrent} / ${safeMax} XP`;

    const containerStyles: React.CSSProperties = {
        ...defaultStyles.levelProgress.container,
        background: themeConfig.notification.background,
        color: themeConfig.notification.textColor,
        borderRadius: themeConfig.notification.borderRadius,
        boxShadow: themeConfig.notification.boxShadow,
        ...styles?.container,
    };

    const progressBarStyles: React.CSSProperties = {
        ...defaultStyles.levelProgress.progressBar,
        backgroundColor: themeConfig.notification.accentColor,
        width: `${progress}%`,
        ...styles?.progressBar,
    };

    return (
        <div className={className} style={containerStyles} data-testid="level-progress">
            <div style={{ ...defaultStyles.levelProgress.header, ...styles?.header }}>
                <div style={{ ...defaultStyles.levelProgress.levelLabel, ...styles?.levelLabel }}>
                    {label} {level}
                </div>
                {showValues && (
                    <div style={{ ...defaultStyles.levelProgress.valueText, ...styles?.valueText }}>
                        {computedValueLabel}
                    </div>
                )}
            </div>
            <div
                style={{ ...defaultStyles.levelProgress.progressTrack, ...styles?.progressTrack }}
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={safeMax}
                aria-valuenow={clampedCurrent}
                aria-label="Level progress"
            >
                <div style={progressBarStyles} />
            </div>
            {showPercent && (
                <div style={{ ...defaultStyles.levelProgress.progressText, ...styles?.progressText }}>
                    {progress}%
                </div>
            )}
        </div>
    );
};
