import React, { useRef } from 'react';
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
}

export const ConfettiWrapper: React.FC<ConfettiWrapperProps> = ({ show, achievement, icons = {} }) => {
    const { width, height } = useWindowSize();
    // Merge custom icons with default icons, with custom icons taking precedence
    const mergedIcons: Record<string, string> = { ...defaultAchievementIcons, ...icons };
    // Track if we've already shown this achievement to avoid duplicates
    const shownRef = useRef(false);

    React.useEffect(() => {
        if (show && achievement && !shownRef.current) {
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
                : `achievement-${achievement.achievementTitle}`;
            
            // Mark as shown so we don't show it multiple times
            shownRef.current = true;

            toast(
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontSize: '2em', marginRight: '10px' }}>{iconToDisplay}</span>
                    <div>
                        <div style={{ fontWeight: 'bold' }}>{achievement.achievementTitle}</div>
                        <div>{achievement.achievementDescription}</div>
                    </div>
                </div>,
                {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    toastId // Use the unique ID to prevent duplicates
                }
            );
        }
        
        // Reset the shown ref when the achievement changes
        return () => {
            shownRef.current = false;
        };
    }, [show, achievement, mergedIcons]);

    if (!show) return null;

    return (
        <>
            <ToastContainer />
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