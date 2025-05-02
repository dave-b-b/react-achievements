import React from 'react';
import { render } from '@testing-library/react';
import ConfettiWrapper from '../../components/ConfettiWrapper';
import { useWindowSize } from 'react-use';

// Mock react-confetti
jest.mock('react-confetti', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="confetti" />),
}));

// Mock useWindowSize hook
jest.mock('react-use', () => ({
  useWindowSize: jest.fn(),
}));

describe('ConfettiWrapper', () => {
  const mockWidth = 1024;
  const mockHeight = 768;

  beforeEach(() => {
    (useWindowSize as jest.Mock).mockReturnValue({
      width: mockWidth,
      height: mockHeight,
    });
  });

  it('renders nothing when show is false', () => {
    const { container } = render(<ConfettiWrapper show={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders Confetti when show is true', () => {
    const { container } = render(<ConfettiWrapper show={true} />);
    expect(container).not.toBeEmptyDOMElement();
  });

  it('passes window dimensions to Confetti', () => {
    const Confetti = require('react-confetti').default;
    render(<ConfettiWrapper show={true} />);
    
    expect(Confetti).toHaveBeenCalledWith(
      expect.objectContaining({
        width: mockWidth,
        height: mockHeight,
        recycle: false,
      }),
      expect.any(Object)
    );
  });

  it('updates confetti dimensions when window resizes', () => {
    const newWidth = 800;
    const newHeight = 600;
    
    const { rerender } = render(<ConfettiWrapper show={true} />);
    
    (useWindowSize as jest.Mock).mockReturnValue({
      width: newWidth,
      height: newHeight,
    });
    
    rerender(<ConfettiWrapper show={true} />);
    
    const Confetti = require('react-confetti').default;
    expect(Confetti).toHaveBeenLastCalledWith(
      expect.objectContaining({
        width: newWidth,
        height: newHeight,
      }),
      expect.any(Object)
    );
  });
});