import React from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { defaultAchievementIcons } from '../icons/defaultIcons';

interface ConfettiWrapperProps {
    show: boolean;
    achievement?: {
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

    React.useEffect(() => {
        if (show && achievement) {
            let iconToDisplay = '🏆'; // Fallback icon
            
            if (achievement.achievementIconKey) {
                if (achievement.achievementIconKey in mergedIcons) {
                    iconToDisplay = mergedIcons[achievement.achievementIconKey];
                } else if ('default' in mergedIcons) {
                    iconToDisplay = mergedIcons.default;
                }
            }

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
                    progress: undefined
                }
            );
        }
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