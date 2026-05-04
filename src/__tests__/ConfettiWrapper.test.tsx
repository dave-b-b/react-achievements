import React from 'react';
import { render, screen } from '@testing-library/react';
import { ConfettiWrapper } from '../index';
import '@testing-library/jest-dom';

describe('ConfettiWrapper Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render confetti when show is false', () => {
    render(<ConfettiWrapper show={false} />);
    expect(screen.queryByTestId('built-in-confetti')).not.toBeInTheDocument();
  });

  it('should render confetti when show is true', () => {
    render(<ConfettiWrapper show={true} />);
    expect(screen.getByTestId('built-in-confetti')).toBeInTheDocument();
  });

  it('should handle show prop changes', () => {
    const { rerender } = render(<ConfettiWrapper show={false} />);
    expect(screen.queryByTestId('built-in-confetti')).not.toBeInTheDocument();

    rerender(<ConfettiWrapper show={true} />);
    expect(screen.getByTestId('built-in-confetti')).toBeInTheDocument();

    rerender(<ConfettiWrapper show={false} />);
    expect(screen.queryByTestId('built-in-confetti')).not.toBeInTheDocument();
  });
}); 
