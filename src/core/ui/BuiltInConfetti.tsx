import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { ConfettiProps } from './interfaces';

const DEFAULT_COLORS = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
const DEFAULT_DURATION_MS = 5000;
const DEFAULT_PARTICLE_COUNT = 80;
const DEFAULT_SHAPES: NonNullable<ConfettiProps['shapes']> = ['square', 'circle'];
const DEFAULT_SPREAD = 70;
const DEFAULT_START_VELOCITY = 45;
const DEFAULT_GRAVITY = 1;
const DEFAULT_SCALAR = 1;
const DEFAULT_Z_INDEX = 10001;

const getSafeParticleCount = (count: number): number => Math.max(0, Math.floor(count));

/**
 * Built-in confetti component
 * Canvas-based confetti animation powered by canvas-confetti.
 */
export const BuiltInConfetti: React.FC<ConfettiProps> = ({
  show,
  duration = DEFAULT_DURATION_MS,
  particleCount = DEFAULT_PARTICLE_COUNT,
  colors = DEFAULT_COLORS,
  shapes = DEFAULT_SHAPES,
  spread = DEFAULT_SPREAD,
  startVelocity = DEFAULT_START_VELOCITY,
  gravity = DEFAULT_GRAVITY,
  scalar = DEFAULT_SCALAR,
  zIndex = DEFAULT_Z_INDEX,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!show) {
      setIsVisible(false);
      confetti.reset();
      return;
    }

    setIsVisible(true);

    const totalParticles = getSafeParticleCount(particleCount);
    const resolvedColors = colors.length > 0 ? colors : DEFAULT_COLORS;
    const resolvedShapes = shapes.length > 0 ? shapes : DEFAULT_SHAPES;
    const baseOptions = {
      colors: resolvedColors,
      shapes: resolvedShapes,
      spread,
      startVelocity,
      gravity,
      scalar,
      zIndex,
      disableForReducedMotion: true,
    };

    if (totalParticles > 0) {
      const centerParticles = Math.ceil(totalParticles * 0.5);
      const leftParticles = Math.floor((totalParticles - centerParticles) / 2);
      const rightParticles = totalParticles - centerParticles - leftParticles;

      confetti({
        ...baseOptions,
        particleCount: centerParticles,
        origin: { x: 0.5, y: 0.58 },
      });

      confetti({
        ...baseOptions,
        particleCount: leftParticles,
        angle: 60,
        spread: Math.max(45, spread * 0.8),
        origin: { x: 0, y: 0.72 },
      });

      confetti({
        ...baseOptions,
        particleCount: rightParticles,
        angle: 120,
        spread: Math.max(45, spread * 0.8),
        origin: { x: 1, y: 0.72 },
      });
    }

    const timer = setTimeout(() => {
      setIsVisible(false);
      confetti.reset();
    }, duration);

    return () => {
      clearTimeout(timer);
      confetti.reset();
    };
  }, [
    show,
    duration,
    particleCount,
    colors,
    shapes,
    spread,
    startVelocity,
    gravity,
    scalar,
    zIndex,
  ]);

  if (!isVisible) return null;

  return <div data-testid="built-in-confetti" style={{ display: 'none' }} />;
};
