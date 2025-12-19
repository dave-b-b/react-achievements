import React, { useEffect, useState } from 'react';
import { ConfettiProps } from './interfaces';
import { useWindowSize } from '../hooks/useWindowSize';

/**
 * Built-in confetti component
 * Lightweight CSS-based confetti animation
 */
export const BuiltInConfetti: React.FC<ConfettiProps> = ({
  show,
  duration = 5000,
  particleCount = 50,
  colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const { width, height } = useWindowSize();

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => setIsVisible(false), duration);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [show, duration]);

  if (!isVisible) return null;

  const containerStyles: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 10001,
    overflow: 'hidden',
  };

  // Generate particles
  const particles = Array.from({ length: particleCount }, (_, i) => {
    const color = colors[Math.floor(Math.random() * colors.length)];
    const startX = Math.random() * width;
    const rotation = Math.random() * 360;
    const fallDuration = 3 + Math.random() * 2; // 3-5 seconds
    const delay = Math.random() * 0.5; // 0-0.5s delay
    const shape = Math.random() > 0.5 ? 'circle' : 'square';

    const particleStyles: React.CSSProperties = {
      position: 'absolute',
      top: '-20px',
      left: `${startX}px`,
      width: '10px',
      height: '10px',
      backgroundColor: color,
      borderRadius: shape === 'circle' ? '50%' : '0',
      transform: `rotate(${rotation}deg)`,
      animation: `confettiFall ${fallDuration}s linear ${delay}s forwards`,
      opacity: 0.9,
    };

    return <div key={i} style={particleStyles} data-testid="confetti-particle" />;
  });

  return (
    <>
      <style>
        {`
          @keyframes confettiFall {
            0% {
              transform: translateY(0) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(${height + 50}px) rotate(720deg);
              opacity: 0;
            }
          }
        `}
      </style>
      <div style={containerStyles} data-testid="built-in-confetti">
        {particles}
      </div>
    </>
  );
};
