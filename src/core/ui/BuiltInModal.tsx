import React, { useEffect } from 'react';
import { ModalProps } from './interfaces';
import { getTheme, builtInThemes } from './themes';
import { defaultAchievementIcons } from '../icons/defaultIcons';

/**
 * Built-in modal component
 * Modern, theme-aware achievement modal with smooth animations
 */
export const BuiltInModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  achievements,
  icons = {},
  theme = 'modern',
}) => {
  // Merge custom icons with defaults
  const mergedIcons: Record<string, string> = { ...defaultAchievementIcons, ...icons };

  // Get theme configuration
  const themeConfig = getTheme(theme) || builtInThemes.modern;
  const { modal: themeStyles } = themeConfig;

  useEffect(() => {
    if (isOpen) {
      // Lock body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const overlayStyles: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: themeStyles.overlayColor,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    animation: 'fadeIn 0.3s ease-in-out',
  };

  const modalStyles: React.CSSProperties = {
    background: themeStyles.background,
    borderRadius: themeStyles.borderRadius,
    padding: '32px',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '80vh',
    overflow: 'auto',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
    animation: 'scaleIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
  };

  const headerStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  };

  const titleStyles: React.CSSProperties = {
    margin: 0,
    color: themeStyles.textColor,
    fontSize: themeStyles.headerFontSize || '28px',
    fontWeight: 'bold',
  };

  const closeButtonStyles: React.CSSProperties = {
    background: 'none',
    border: 'none',
    fontSize: '32px',
    cursor: 'pointer',
    color: themeStyles.textColor,
    opacity: 0.6,
    transition: 'opacity 0.2s',
    padding: 0,
    lineHeight: 1,
  };

  const isBadgeLayout = (themeStyles as any).achievementLayout === 'badge';

  const listStyles: React.CSSProperties = isBadgeLayout
    ? {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: '16px',
      }
    : {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      };

  const getAchievementItemStyles = (isUnlocked: boolean): React.CSSProperties => {
    const baseStyles = {
      borderRadius: (themeStyles as any).achievementCardBorderRadius || '12px',
      backgroundColor: isUnlocked
        ? `${themeStyles.accentColor}1A` // 10% opacity
        : 'rgba(255, 255, 255, 0.05)',
      border: `2px solid ${
        isUnlocked ? themeStyles.accentColor : 'rgba(255, 255, 255, 0.1)'
      }`,
      opacity: isUnlocked ? 1 : 0.5,
      transition: 'all 0.2s',
    };

    if (isBadgeLayout) {
      // Badge layout: vertical, centered, square-ish
      return {
        ...baseStyles,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '20px 12px',
        aspectRatio: '1 / 1.1', // Slightly taller than wide
        minHeight: '160px',
      };
    } else {
      // Horizontal layout (default)
      return {
        ...baseStyles,
        display: 'flex',
        gap: '16px',
        padding: '16px',
      };
    }
  };

  const getIconContainerStyles = (isUnlocked: boolean): React.CSSProperties => {
    if (isBadgeLayout) {
      return {
        fontSize: '48px',
        lineHeight: 1,
        marginBottom: '8px',
        opacity: isUnlocked ? 1 : 0.3,
      };
    }
    return {
      fontSize: '40px',
      flexShrink: 0,
      lineHeight: 1,
      opacity: isUnlocked ? 1 : 0.3,
    };
  };

  const contentStyles: React.CSSProperties = isBadgeLayout
    ? {
        width: '100%',
      }
    : {
        flex: 1,
        minWidth: 0,
      };

  const achievementTitleStyles: React.CSSProperties = isBadgeLayout
    ? {
        margin: '0 0 4px 0',
        color: themeStyles.textColor,
        fontSize: '14px',
        fontWeight: 'bold',
        lineHeight: '1.3',
      }
    : {
        margin: '0 0 8px 0',
        color: themeStyles.textColor,
        fontSize: '18px',
        fontWeight: 'bold',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      };

  const achievementDescriptionStyles: React.CSSProperties = isBadgeLayout
    ? {
        margin: 0,
        color: themeStyles.textColor,
        opacity: 0.7,
        fontSize: '11px',
        lineHeight: '1.3',
      }
    : {
        margin: 0,
        color: themeStyles.textColor,
        opacity: 0.8,
        fontSize: '14px',
      };

  const getLockIconStyles = (): React.CSSProperties => {
    if (isBadgeLayout) {
      return {
        position: 'absolute',
        top: '8px',
        right: '8px',
        fontSize: '18px',
        opacity: 0.6,
      };
    }
    return {
      fontSize: '24px',
      flexShrink: 0,
      opacity: 0.5,
    };
  };

  return (
    <>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes scaleIn {
            from {
              transform: scale(0.9);
              opacity: 0;
            }
            to {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}
      </style>
      <div
        style={overlayStyles}
        onClick={onClose}
        data-testid="built-in-modal-overlay"
      >
        <div
          style={modalStyles}
          onClick={(e) => e.stopPropagation()}
          data-testid="built-in-modal"
        >
          {/* Header */}
          <div style={headerStyles}>
            <h2 style={titleStyles}>🏆 Achievements</h2>
            <button
              onClick={onClose}
              style={closeButtonStyles}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6')}
              aria-label="Close modal"
            >
              ×
            </button>
          </div>

          {/* Achievement list */}
          <div style={listStyles}>
            {achievements.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: themeStyles.textColor, opacity: 0.6 }}>
                No achievements yet. Start exploring to unlock them!
              </div>
            ) : (
              achievements.map((achievement) => {
                // If achievementIconKey exists but not in mergedIcons, use it directly (might be an emoji)
                // Otherwise, look up in mergedIcons or fall back to default
                const icon =
                  (achievement.achievementIconKey &&
                    mergedIcons[achievement.achievementIconKey]) ||
                  achievement.achievementIconKey ||
                  mergedIcons.default ||
                  '⭐';

                return (
                  <div
                    key={achievement.achievementId}
                    style={{
                      ...getAchievementItemStyles(achievement.isUnlocked),
                      position: isBadgeLayout ? 'relative' : 'static',
                    }}
                  >
                    <div style={getIconContainerStyles(achievement.isUnlocked)}>
                      {icon}
                    </div>
                    <div style={contentStyles}>
                      <h3 style={achievementTitleStyles}>
                        {achievement.achievementTitle}
                      </h3>
                      <p style={achievementDescriptionStyles}>
                        {achievement.achievementDescription}
                      </p>
                    </div>
                    {!achievement.isUnlocked && (
                      <div style={getLockIconStyles()}>🔒</div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
};
