import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import confetti from 'canvas-confetti';
import { BuiltInConfetti } from '../../../core/ui/BuiltInConfetti';

jest.mock('canvas-confetti', () => {
  const mockConfetti = jest.fn();
  return {
    __esModule: true,
    default: Object.assign(mockConfetti, {
      reset: jest.fn(),
    }),
  };
});

const confettiMock = confetti as unknown as jest.Mock & { reset: jest.Mock };

describe('BuiltInConfetti', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    confettiMock.mockClear();
    confettiMock.reset.mockClear();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('does not render when show is false', () => {
    render(<BuiltInConfetti show={false} />);
    expect(screen.queryByTestId('built-in-confetti')).not.toBeInTheDocument();
    expect(confettiMock).not.toHaveBeenCalled();
  });

  it('renders and fires canvas confetti when show is true', () => {
    render(<BuiltInConfetti show={true} />);
    expect(screen.getByTestId('built-in-confetti')).toBeInTheDocument();
    expect(confettiMock).toHaveBeenCalledTimes(3);
  });

  it('uses 80 particles by default', () => {
    render(<BuiltInConfetti show={true} />);

    const totalParticles = confettiMock.mock.calls.reduce((total, [options]) => {
      return total + (options?.particleCount || 0);
    }, 0);

    expect(totalParticles).toBe(80);
  });

  it('uses particleCount across the burst calls', () => {
    const particleCount = 25;
    render(<BuiltInConfetti show={true} particleCount={particleCount} />);

    const totalParticles = confettiMock.mock.calls.reduce((total, [options]) => {
      return total + (options?.particleCount || 0);
    }, 0);

    expect(totalParticles).toBe(particleCount);
  });

  it('disappears after the specified duration', () => {
    const duration = 2000;
    render(<BuiltInConfetti show={true} duration={duration} />);
    
    expect(screen.getByTestId('built-in-confetti')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(duration);
    });

    expect(screen.queryByTestId('built-in-confetti')).not.toBeInTheDocument();
    expect(confettiMock.reset).toHaveBeenCalled();
  });

  it('handles multiple show/hide cycles', () => {
    const { rerender } = render(<BuiltInConfetti show={false} />);
    expect(screen.queryByTestId('built-in-confetti')).not.toBeInTheDocument();

    rerender(<BuiltInConfetti show={true} />);
    expect(screen.getByTestId('built-in-confetti')).toBeInTheDocument();
    expect(confettiMock).toHaveBeenCalledTimes(3);

    rerender(<BuiltInConfetti show={false} />);
    expect(screen.queryByTestId('built-in-confetti')).not.toBeInTheDocument();
    expect(confettiMock.reset).toHaveBeenCalled();
  });

  it('passes custom colors to canvas confetti', () => {
    const colors = ['#ff0000', '#00ff00', '#0000ff'];
    render(<BuiltInConfetti show={true} colors={colors} particleCount={30} />);

    confettiMock.mock.calls.forEach(([options]) => {
      expect(options?.colors).toEqual(colors);
    });
  });

  it('passes custom visual options to canvas confetti', () => {
    render(
      <BuiltInConfetti
        show={true}
        shapes={['star']}
        spread={90}
        startVelocity={55}
        gravity={0.8}
        scalar={1.2}
        zIndex={20000}
      />
    );

    confettiMock.mock.calls.forEach(([options]) => {
      expect(options).toEqual(
        expect.objectContaining({
          shapes: ['star'],
          startVelocity: 55,
          gravity: 0.8,
          scalar: 1.2,
          zIndex: 20000,
          disableForReducedMotion: true,
        })
      );
    });

    expect(confettiMock.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        spread: 90,
      })
    );
  });
});
