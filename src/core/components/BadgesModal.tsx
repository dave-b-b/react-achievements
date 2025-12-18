import React from 'react';
import Modal from 'react-modal';
import { AchievementDetails, AchievementWithStatus, StylesProps } from '../types';
import { defaultAchievementIcons } from '../icons/defaultIcons';
import { defaultStyles } from '../styles/defaultStyles';

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

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            style={{
                overlay: { ...defaultStyles.badgesModal.overlay, ...styles?.overlay },
                content: { ...defaultStyles.badgesModal.content, ...styles?.content }
            }}
            contentLabel="Achievements"
        >
            <div style={{ ...defaultStyles.badgesModal.header, ...styles?.header }}>
                <h2 style={{ margin: 0 }}>🏆 Achievements</h2>
                <button
                    onClick={onClose}
                    style={{ ...defaultStyles.badgesModal.closeButton, ...styles?.closeButton }}
                    aria-label="Close"
                >
                    ×
                </button>
            </div>
            <div style={{ ...defaultStyles.badgesModal.achievementList, ...styles?.achievementList }}>
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
                                                ? { ...defaultStyles.badgesModal.lockedAchievementItem, ...styles?.lockedAchievementItem }
                                                : defaultStyles.badgesModal.achievementItem
                                            ),
                                            ...styles?.achievementItem,
                                            position: 'relative',
                                        }}
                                    >
                                        {achievement.achievementIconKey && (
                                            <div style={{
                                                ...defaultStyles.badgesModal.achievementIcon,
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
                                                ...defaultStyles.badgesModal.achievementTitle,
                                                ...styles?.achievementTitle,
                                                color: isLocked ? '#999' : undefined,
                                            }}>
                                                {achievement.achievementTitle}
                                            </h3>
                                            <p style={{
                                                ...defaultStyles.badgesModal.achievementDescription,
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
                                            <div style={{ ...defaultStyles.badgesModal.lockIcon, ...styles?.lockIcon }}>
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