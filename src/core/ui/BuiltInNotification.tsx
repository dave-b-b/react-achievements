import React, { useState, useEffect } from 'react';
import { NotificationProps } from './interfaces';
import { getTheme, builtInThemes } from './themes';

/**
 * Built-in notification component
 * Modern, theme-aware achievement notification with smooth animations
 */
export const BuiltInNotification: React.FC<NotificationProps> = ({
  achievement,
  onClose,
  duration = 5000,
  position = 'top-center',
  theme = 'modern',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  //  Get theme configuration
  const themeConfig = getTheme(theme) || builtInThemes.modern;
  const { notification: themeStyles } = themeConfig;

  useEffect(() => {
    // Slide in animation
    const showTimer = setTimeout(() => setIsVisible(true), 10);

    // Auto-dismiss
    const dismissTimer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onClose?.(), 300);
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(dismissTimer);
    };
  }, [duration, onClose]);

  const getPositionStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'fixed',
      zIndex: 9999,
    };

    switch (position) {
      case 'top-center':
        return {
          ...base,
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
        };
      case 'top-left':
        return { ...base, top: 20, left: 20 };
      case 'top-right':
        return { ...base, top: 20, right: 20 };
      case 'bottom-center':
        return {
          ...base,
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
        };
      case 'bottom-left':
        return { ...base, bottom: 20, left: 20 };
      case 'bottom-right':
        return { ...base, bottom: 20, right: 20 };
      default:
        return {
          ...base,
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
        };
    }
  };

  const containerStyles: React.CSSProperties = {
    ...getPositionStyles(),
    background: themeStyles.background,
    borderRadius: themeStyles.borderRadius,
    boxShadow: themeStyles.boxShadow,
    padding: '16px 24px',
    minWidth: '320px',
    maxWidth: '500px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    opacity: isVisible && !isExiting ? 1 : 0,
    transform:
      position.startsWith('top')
        ? `translateY(${isVisible && !isExiting ? '0' : '-20px'}) ${
            position.includes('center') ? 'translateX(-50%)' : ''
          }`
        : `translateY(${isVisible && !isExiting ? '0' : '20px'}) ${
            position.includes('center') ? 'translateX(-50%)' : ''
          }`,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    pointerEvents: isVisible ? 'auto' : 'none',
  };

  const iconStyles: React.CSSProperties = {
    fontSize: '48px',
    lineHeight: 1,
    flexShrink: 0,
  };

  const contentStyles: React.CSSProperties = {
    flex: 1,
    color: themeStyles.textColor,
    minWidth: 0,
  };

  const headerStyles: React.CSSProperties = {
    fontSize: themeStyles.fontSize?.header || '12px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    opacity: 0.8,
    marginBottom: '4px',
    color: themeStyles.accentColor,
    fontWeight: 600,
  };

  const titleStyles: React.CSSProperties = {
    fontSize: themeStyles.fontSize?.title || '18px',
    fontWeight: 'bold',
    marginBottom: '4px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const descriptionStyles: React.CSSProperties = {
    fontSize: themeStyles.fontSize?.description || '14px',
    opacity: 0.9,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  };

  const closeButtonStyles: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: themeStyles.textColor,
    fontSize: '24px',
    cursor: 'pointer',
    opacity: 0.6,
    transition: 'opacity 0.2s',
    padding: '4px',
    flexShrink: 0,
    lineHeight: 1,
  };

  return (
    <div style={containerStyles} data-testid="built-in-notification">
      <div style={iconStyles}>{achievement.icon}</div>
      <div style={contentStyles}>
        <div style={headerStyles}>Achievement Unlocked!</div>
        <div style={titleStyles}>{achievement.title}</div>
        {achievement.description && (
          <div style={descriptionStyles}>{achievement.description}</div>
        )}
      </div>
      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(() => onClose?.(), 300);
        }}
        style={closeButtonStyles}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6')}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
};
