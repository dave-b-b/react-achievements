import React from 'react';
import { render, screen } from '@testing-library/react';
import { ConfettiWrapper } from '../core/components/ConfettiWrapper';
import '@testing-library/jest-dom';

// Mock react-confetti
jest.mock('react-confetti', () => {
  return function MockConfetti() {
    return <div data-testid="mock-confetti" />;
  };
});

describe('ConfettiWrapper Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render confetti when show is false', () => {
    render(<ConfettiWrapper show={false} />);
    expect(screen.queryByTestId('mock-confetti')).not.toBeInTheDocument();
  });

  it('should render confetti when show is true', () => {
    render(<ConfettiWrapper show={true} />);
    expect(screen.getByTestId('mock-confetti')).toBeInTheDocument();
  });

  it('should handle show prop changes', () => {
    const { rerender } = render(<ConfettiWrapper show={false} />);
    expect(screen.queryByTestId('mock-confetti')).not.toBeInTheDocument();

    rerender(<ConfettiWrapper show={true} />);
    expect(screen.getByTestId('mock-confetti')).toBeInTheDocument();

    rerender(<ConfettiWrapper show={false} />);
    expect(screen.queryByTestId('mock-confetti')).not.toBeInTheDocument();
  });
}); 