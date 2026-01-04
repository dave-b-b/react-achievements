import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BuiltInConfetti } from '../../../core/ui/BuiltInConfetti';
import * as useWindowSize from '../../../core/hooks/useWindowSize';

// Mock the useWindowSize hook
jest.mock('../../../core/hooks/useWindowSize', () => ({
  useWindowSize: jest.fn(),
}));

const useWindowSizeMock = useWindowSize.useWindowSize as jest.Mock;

describe('BuiltInConfetti', () => {
  beforeEach(() => {
    // Provide a default mock implementation for useWindowSize
    useWindowSizeMock.mockReturnValue({ width: 1024, height: 768 });
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('does not render when show is false', () => {
    render(<BuiltInConfetti show={false} />);
    expect(screen.queryByTestId('built-in-confetti')).not.toBeInTheDocument();
  });

  it('renders when show is true', () => {
    render(<BuiltInConfetti show={true} />);
    expect(screen.getByTestId('built-in-confetti')).toBeInTheDocument();
  });

  it('renders the correct number of particles', () => {
    const particleCount = 25;
    render(<BuiltInConfetti show={true} particleCount={particleCount} />);
    const particles = screen.getAllByTestId('confetti-particle');
    expect(particles).toHaveLength(particleCount);
  });

  it('disappears after the specified duration', () => {
    const duration = 2000;
    const { rerender } = render(<BuiltInConfetti show={true} duration={duration} />);
    
    expect(screen.getByTestId('built-in-confetti')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(duration);
    });

    rerender(<BuiltInConfetti show={true} duration={duration} />);
    expect(screen.queryByTestId('built-in-confetti')).not.toBeInTheDocument();
  });

  it('handles multiple show/hide cycles', () => {
    const { rerender } = render(<BuiltInConfetti show={false} />);
    expect(screen.queryByTestId('built-in-confetti')).not.toBeInTheDocument();

    rerender(<BuiltInConfetti show={true} />);
    expect(screen.getByTestId('built-in-confetti')).toBeInTheDocument();

    rerender(<BuiltInConfetti show={false} />);
    expect(screen.queryByTestId('built-in-confetti')).not.toBeInTheDocument();
  });

  it('uses custom colors for particles', () => {
    const colors = ['#ff0000', '#00ff00', '#0000ff'];
    // JSDOM converts hex colors to rgb, so we need to compare against rgb values
    const expectedRgbColors = ['rgb(255, 0, 0)', 'rgb(0, 255, 0)', 'rgb(0, 0, 255)'];
    render(<BuiltInConfetti show={true} colors={colors} particleCount={30} />);
    const particles = screen.getAllByTestId('confetti-particle');
    particles.forEach(particle => {
      const backgroundColor = particle.style.backgroundColor;
      expect(expectedRgbColors).toContain(backgroundColor);
    });
  });
});
