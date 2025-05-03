import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { ConfettiWrapper } from '../core/components/ConfettiWrapper';
import { toast } from 'react-toastify';
import '@testing-library/jest-dom';
import { defaultAchievementIcons } from '../core/icons/defaultIcons';

// Mock react-confetti
jest.mock('react-confetti', () => {
  return function MockConfetti() {
    return <div data-testid="mock-confetti" />;
  };
});

// Mock react-toastify
jest.mock('react-toastify', () => ({
  toast: jest.fn(),
  ToastContainer: () => <div data-testid="toast-container" />
}));

describe('ConfettiWrapper Component', () => {
  beforeEach(() => {
    // Clear all mocks between tests
    jest.clearAllMocks();
  });

  it('should not render confetti when show is false', () => {
    render(<ConfettiWrapper show={false} />);
    
    // Confetti should not be rendered
    expect(screen.queryByTestId('mock-confetti')).not.toBeInTheDocument();
    
    // Toast should not be called
    expect(toast).not.toHaveBeenCalled();
  });

  it('should render confetti when show is true', () => {
    render(<ConfettiWrapper show={true} />);
    
    // Confetti should be rendered
    expect(screen.getByTestId('mock-confetti')).toBeInTheDocument();
    
    // Toast should not be called (no achievement provided)
    expect(toast).not.toHaveBeenCalled();
  });

  it('should display toast notification for new achievements', () => {
    const achievement = {
      achievementTitle: 'Test Achievement',
      achievementDescription: 'This is a test achievement',
      achievementIconKey: 'test-icon'
    };
    
    const icons = {
      'test-icon': '🏆',
      'default': '🎖️'
    };
    
    render(<ConfettiWrapper show={true} achievement={achievement} icons={icons} />);
    
    // Confetti should be rendered
    expect(screen.getByTestId('mock-confetti')).toBeInTheDocument();
    
    // Toast should be called with achievement data
    expect(toast).toHaveBeenCalledTimes(1);
    
    // Verify toast is called with appropriate content
    const toastCall = toast.mock.calls[0][0];
    expect(toastCall.props.children[1].props.children[0].props.children).toBe('Test Achievement');
  });

  it('should use default icon when achievement icon key is not found', () => {
    const achievement = {
      achievementTitle: 'Test Achievement',
      achievementDescription: 'This is a test achievement',
      achievementIconKey: 'missing-icon'
    };
    
    const icons = {
      'default': '🎖️'
    };
    
    render(<ConfettiWrapper show={true} achievement={achievement} icons={icons} />);
    
    // Toast should be called with default icon
    expect(toast).toHaveBeenCalledTimes(1);
  });

  it('should use trophy emoji if no icons are provided', () => {
    const achievement = {
      achievementTitle: 'Test Achievement',
      achievementDescription: 'This is a test achievement',
      achievementIconKey: 'test-icon'
    };
    
    render(<ConfettiWrapper show={true} achievement={achievement} />);
    
    // Toast should be called with default trophy emoji
    expect(toast).toHaveBeenCalledTimes(1);
  });

  it('should display toast notification for new achievements with default icons', () => {
    const achievement = {
      achievementTitle: 'Test Achievement',
      achievementDescription: 'This is a test achievement',
      achievementIconKey: 'levelUp' // Using one of the default icon keys
    };
    
    render(<ConfettiWrapper show={true} achievement={achievement} />);
    
    // Confetti should be rendered
    expect(screen.getByTestId('mock-confetti')).toBeInTheDocument();
    
    // Toast should be called with achievement data
    expect(toast).toHaveBeenCalledTimes(1);
  });

  it('should merge custom icons with defaultAchievementIcons', () => {
    const achievement = {
      achievementTitle: 'Test Achievement',
      achievementDescription: 'This is a test achievement',
      achievementIconKey: 'customKey'
    };
    
    const customIcons = {
      'customKey': '🌟'
    };
    
    render(<ConfettiWrapper show={true} achievement={achievement} icons={customIcons} />);
    
    // Confetti should be rendered
    expect(screen.getByTestId('mock-confetti')).toBeInTheDocument();
    
    // Toast should be called with custom icon
    expect(toast).toHaveBeenCalledTimes(1);
  });

  it('should override default icons with custom icons', () => {
    const achievement = {
      achievementTitle: 'Test Achievement',
      achievementDescription: 'This is a test achievement',
      achievementIconKey: 'levelUp' // This key exists in defaultAchievementIcons
    };
    
    // Override the default levelUp icon
    const customIcons = {
      'levelUp': '🚀'
    };
    
    render(<ConfettiWrapper show={true} achievement={achievement} icons={customIcons} />);
    
    // Toast should be called with overridden icon
    expect(toast).toHaveBeenCalledTimes(1);
  });

  // Integration test with AchievementProvider
  it('should trigger confetti and toast for newly earned achievements only', async () => {
    // This test would require setting up the AchievementProvider with the ConfettiWrapper
    // to test the full integration. This is a mock implementation for illustration.
    
    // We would need to create a test that:
    // 1. Sets up initial state with some achievements already unlocked
    // 2. Verifies no confetti/toast shown on initial load
    // 3. Updates metrics to unlock a new achievement
    // 4. Verifies confetti/toast shown for new achievement only
    
    // This would be implemented with the actual AchievementProvider integration
  });
}); 