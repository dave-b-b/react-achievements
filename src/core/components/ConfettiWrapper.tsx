import React, { useRef, useEffect } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { defaultAchievementIcons } from '../icons/defaultIcons';

interface ConfettiWrapperProps {
    show: boolean;
    achievement?: {
        achievementId?: string;
        achievementTitle?: string;
        achievementDescription?: string;
        achievementIconKey?: string;
    };
    icons?: Record<string, string>;
    notifiedAchievements?: Set<string>;
    onAchievementNotified?: (achievementId: string) => void;
}

export const ConfettiWrapper: React.FC<ConfettiWrapperProps> = ({ 
    show, 
    achievement, 
    icons = {}, 
    notifiedAchievements = new Set(),
    onAchievementNotified
}) => {
    const { width, height } = useWindowSize();
    // Merge custom icons with default icons, with custom icons taking precedence
    const mergedIcons: Record<string, string> = { ...defaultAchievementIcons, ...icons };
    // Track the last shown achievement ID to prevent duplicates
    const lastShownAchievementId = useRef<string | undefined>(undefined);

    useEffect(() => {
        // Only proceed if we're showing and have an achievement
        if (!show || !achievement) return;

        // Skip if this is the same achievement we just showed
        if (achievement.achievementId === lastShownAchievementId.current) return;

        // Update the last shown achievement
        lastShownAchievementId.current = achievement.achievementId;

        let iconToDisplay = '🏆'; // Fallback icon
        
        if (achievement.achievementIconKey) {
            if (achievement.achievementIconKey in mergedIcons) {
                iconToDisplay = mergedIcons[achievement.achievementIconKey];
            } else if ('default' in mergedIcons) {
                iconToDisplay = mergedIcons.default;
            }
        }

        // Generate a unique ID for this toast
        const toastId = achievement.achievementId 
            ? `achievement-${achievement.achievementId}` 
            : `achievement-${Date.now()}`; // Use timestamp as fallback

        // Show the toast notification
        toast.success(
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '2em', marginRight: '10px' }}>{iconToDisplay}</span>
                <div>
                    <h4 style={{ margin: '0 0 8px 0' }}>Achievement Unlocked! 🎉</h4>
                    <div style={{ fontWeight: 'bold' }}>{achievement.achievementTitle}</div>
                    <div>{achievement.achievementDescription}</div>
                </div>
            </div>,
            {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                toastId
            }
        );
        
        // Call the notification callback if provided
        if (achievement.achievementId && onAchievementNotified) {
            onAchievementNotified(achievement.achievementId);
        }
    }, [show, achievement, mergedIcons, onAchievementNotified]);

    if (!show) return null;

    return (
        <>
            <ToastContainer 
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
            <Confetti
                width={width}
                height={height}
                numberOfPieces={200}
                recycle={false}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    zIndex: 1001,
                    pointerEvents: 'none',
                }}
            />
        </>
    );
}; 