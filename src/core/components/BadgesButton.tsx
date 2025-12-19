import React from 'react';
import { AchievementDetails } from '../types';
import { getTheme, builtInThemes } from '../ui/themes';

export interface BadgesButtonProps {
    onClick: () => void;
    /**
     * Position for fixed placement mode
     * Only used when placement='fixed'
     */
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    /**
     * Placement mode
     * - 'fixed': Traditional floating button with fixed positioning
     * - 'inline': Regular component that can be placed in drawers, nav bars, etc.
     * @default 'fixed'
     */
    placement?: 'fixed' | 'inline';
    styles?: React.CSSProperties;
    unlockedAchievements: AchievementDetails[];
    /**
     * Theme name for styling (matches notification/modal theme)
     * @default 'modern'
     */
    theme?: string;
}

const getPositionStyles = (
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
): React.CSSProperties => {
    const base: React.CSSProperties = {
        position: 'fixed',
        margin: '20px',
        zIndex: 1000,
    };

    switch (position) {
        case 'top-left':
            return { ...base, top: 0, left: 0 };
        case 'top-right':
            return { ...base, top: 0, right: 0 };
        case 'bottom-left':
            return { ...base, bottom: 0, left: 0 };
        case 'bottom-right':
            return { ...base, bottom: 0, right: 0 };
    }
};

export const BadgesButton: React.FC<BadgesButtonProps> = ({
    onClick,
    position = 'bottom-right',
    placement = 'fixed',
    styles = {},
    unlockedAchievements,
    theme = 'modern',
}) => {
    // Get theme configuration for consistent styling
    const themeConfig = getTheme(theme) || builtInThemes.modern;
    const accentColor = themeConfig.notification.accentColor;

    // Different styling for fixed vs inline placement
    const baseStyles: React.CSSProperties = placement === 'inline'
        ? {
            // Inline mode: looks like a navigation item
            backgroundColor: 'transparent',
            color: themeConfig.notification.textColor,
            padding: '12px 16px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            fontSize: '15px',
            width: '100%',
            textAlign: 'left',
            transition: 'background-color 0.2s ease-in-out',
            ...styles,
        }
        : {
            // Fixed mode: floating button
            backgroundColor: accentColor,
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '16px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            transition: 'transform 0.2s ease-in-out',
            ...getPositionStyles(position),
            ...styles,
        };

    return (
        <button
            onClick={onClick}
            style={baseStyles}
            onMouseEnter={(e) => {
                if (placement === 'inline') {
                    // Inline mode: subtle background color change
                    (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                } else {
                    // Fixed mode: scale transformation
                    (e.target as HTMLButtonElement).style.transform = 'scale(1.05)';
                }
            }}
            onMouseLeave={(e) => {
                if (placement === 'inline') {
                    (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
                } else {
                    (e.target as HTMLButtonElement).style.transform = 'scale(1)';
                }
            }}
            data-placement={placement}
            data-testid="badges-button"
        >
            🏆 Achievements ({unlockedAchievements.length})
        </button>
    );
}; 