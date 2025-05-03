import React from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

    React.useEffect(() => {
        if (show && achievement) {
            const iconToDisplay = achievement?.achievementIconKey && icons[achievement.achievementIconKey] 
                ? icons[achievement.achievementIconKey]
                : icons.default || '🏆';

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
    }, [show, achievement, icons]);

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