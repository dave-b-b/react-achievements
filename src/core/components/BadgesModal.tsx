import React from 'react';
import Modal from 'react-modal';
import { AchievementDetails, StylesProps } from '../types';

interface BadgesModalProps {
    isOpen: boolean;
    onClose: () => void;
    achievements: AchievementDetails[];
    styles?: StylesProps['badgesModal'];
    icons?: Record<string, string>;
}

export const BadgesModal: React.FC<BadgesModalProps> = ({
    isOpen,
    onClose,
    achievements,
    styles = {},
    icons = {}
}) => {
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
                {achievements.map((achievement) => (
                    <div
                        key={achievement.achievementId}
                        style={{ ...defaultAchievementItemStyle, ...styles?.achievementItem }}
                    >
                        {achievement.achievementIconKey && icons[achievement.achievementIconKey] && (
                            <div style={{ ...defaultAchievementIconStyle, ...styles?.achievementIcon }}>
                                {icons[achievement.achievementIconKey]}
                            </div>
                        )}
                        <div>
                            <h3 style={{ ...defaultAchievementTitleStyle, ...styles?.achievementTitle }}>
                                {achievement.achievementTitle}
                            </h3>
                            <p style={{ ...defaultAchievementDescriptionStyle, ...styles?.achievementDescription }}>
                                {achievement.achievementDescription}
                            </p>
                        </div>
                    </div>
                ))}
                {achievements.length === 0 && (
                    <p style={{ textAlign: 'center', color: '#666' }}>
                        No achievements unlocked yet. Keep going!
                    </p>
                )}
            </div>
        </Modal>
    );
}; 