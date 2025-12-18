import React from 'react';
import Modal from 'react-modal';
import { AchievementDetails, AchievementWithStatus, StylesProps } from '../types';
import { defaultAchievementIcons } from '../icons/defaultIcons';

interface BadgesModalProps {
    isOpen: boolean;
    onClose: () => void;
    achievements: AchievementDetails[];
    styles?: StylesProps['badgesModal'];
    icons?: Record<string, string>;
    showAllAchievements?: boolean;
    showUnlockConditions?: boolean;
    allAchievements?: AchievementWithStatus[];
}

export const BadgesModal: React.FC<BadgesModalProps> = ({
    isOpen,
    onClose,
    achievements,
    styles = {},
    icons = {},
    showAllAchievements = false,
    showUnlockConditions = false,
    allAchievements,
}) => {
    // Merge custom icons with default icons, with custom icons taking precedence
    const mergedIcons: Record<string, string> = { ...defaultAchievementIcons, ...icons };

    const defaultOverlayStyle: React.CSSProperties = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    };

    const defaultContentStyle: React.CSSProperties = {
        position: 'relative',
        background: '#fff',
        borderRadius: '8px',
        padding: '20px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto',
    };

    const defaultHeaderStyle: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
    };

    const defaultCloseButtonStyle: React.CSSProperties = {
        background: 'none',
        border: 'none',
        fontSize: '24px',
        cursor: 'pointer',
        padding: '0',
    };

    const defaultAchievementListStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    };

    const defaultAchievementItemStyle: React.CSSProperties = {
        display: 'flex',
        gap: '16px',
        padding: '16px',
        borderRadius: '8px',
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
    };

    const defaultAchievementTitleStyle: React.CSSProperties = {
        margin: '0',
        fontSize: '18px',
        fontWeight: 'bold',
    };

    const defaultAchievementDescriptionStyle: React.CSSProperties = {
        margin: '4px 0 0 0',
        color: '#666',
    };

    const defaultAchievementIconStyle: React.CSSProperties = {
        fontSize: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    };

    const defaultLockedAchievementItemStyle: React.CSSProperties = {
        ...defaultAchievementItemStyle,
        opacity: 0.5,
        backgroundColor: '#e0e0e0',
    };

    const defaultLockIconStyle: React.CSSProperties = {
        fontSize: '24px',
        position: 'absolute',
        top: '50%',
        right: '16px',
        transform: 'translateY(-50%)',
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            style={{
                overlay: { ...defaultOverlayStyle, ...styles?.overlay },
                content: { ...defaultContentStyle, ...styles?.content }
            }}
            contentLabel="Achievements"
        >
            <div style={{ ...defaultHeaderStyle, ...styles?.header }}>
                <h2 style={{ margin: 0 }}>🏆 Achievements</h2>
                <button
                    onClick={onClose}
                    style={{ ...defaultCloseButtonStyle, ...styles?.closeButton }}
                    aria-label="Close"
                >
                    ×
                </button>
            </div>
            <div style={{ ...defaultAchievementListStyle, ...styles?.achievementList }}>
                {(() => {
                    // Determine which achievements to display
                    const achievementsToDisplay = showAllAchievements && allAchievements
                        ? allAchievements
                        : achievements.map(a => ({ ...a, isUnlocked: true }));

                    return (
                        <>
                            {achievementsToDisplay.map((achievement) => {
                                const isLocked = !achievement.isUnlocked;

                                return (
                                    <div
                                        key={achievement.achievementId}
                                        style={{
                                            ...(isLocked
                                                ? { ...defaultLockedAchievementItemStyle, ...styles?.lockedAchievementItem }
                                                : defaultAchievementItemStyle
                                            ),
                                            ...styles?.achievementItem,
                                            position: 'relative',
                                        }}
                                    >
                                        {achievement.achievementIconKey && (
                                            <div style={{
                                                ...defaultAchievementIconStyle,
                                                ...styles?.achievementIcon,
                                                opacity: isLocked ? 0.4 : 1,
                                            }}>
                                                {achievement.achievementIconKey in mergedIcons
                                                    ? mergedIcons[achievement.achievementIconKey]
                                                    : mergedIcons.default || '⭐'}
                                            </div>
                                        )}
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{
                                                ...defaultAchievementTitleStyle,
                                                ...styles?.achievementTitle,
                                                color: isLocked ? '#999' : undefined,
                                            }}>
                                                {achievement.achievementTitle}
                                            </h3>
                                            <p style={{
                                                ...defaultAchievementDescriptionStyle,
                                                ...styles?.achievementDescription,
                                                color: isLocked ? '#aaa' : '#666',
                                            }}>
                                                {achievement.achievementDescription}
                                                {showUnlockConditions && isLocked && achievement.achievementDescription && (
                                                    <span style={{
                                                        display: 'block',
                                                        fontSize: '12px',
                                                        marginTop: '4px',
                                                        fontStyle: 'italic',
                                                        color: '#888'
                                                    }}>
                                                        🔓 {achievement.achievementDescription}
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                        {isLocked && (
                                            <div style={{ ...defaultLockIconStyle, ...styles?.lockIcon }}>
                                                🔒
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            {achievementsToDisplay.length === 0 && (
                                <p style={{ textAlign: 'center', color: '#666' }}>
                                    No achievements configured.
                                </p>
                            )}
                        </>
                    );
                })()}
            </div>
        </Modal>
    );
}; 