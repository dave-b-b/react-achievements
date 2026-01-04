import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BuiltInNotification } from '../../../core/ui/BuiltInNotification';
import { AchievementWithStatus } from '../../../core/types';
import { NotificationPosition } from '../../../core/ui/interfaces';

// Mock achievement data
const mockAchievement: AchievementWithStatus = {
  achievementId: 'test-1',
  achievementTitle: 'Test Achievement',
  achievementDescription: 'This is a test achievement.',
  achievementIconKey: 'test-icon',
  isUnlocked: true,
};

describe('BuiltInNotification', () => {
  // Set timers for testing auto-dismiss
  jest.useFakeTimers();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with achievement data', async () => {
    render(<BuiltInNotification achievement={mockAchievement} />);
    await act(async () => {
      jest.runAllTimers();
    });
    expect(screen.getByText('Achievement Unlocked!')).toBeInTheDocument();
    expect(screen.getByText('Test Achievement')).toBeInTheDocument();
    expect(screen.getByText('This is a test achievement.')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const handleClose = jest.fn();
    render(
      <BuiltInNotification achievement={mockAchievement} onClose={handleClose} duration={999999} />,
    );
    
    // Fast-forward initial animation
    await act(async () => {
      jest.advanceTimersByTime(10);
    });

    fireEvent.click(screen.getByLabelText('Close notification'));
    
    // Fast-forward exit animation
    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('auto-dismisses after the specified duration', async () => {
    const handleClose = jest.fn();
    render(
      <BuiltInNotification
        achievement={mockAchievement}
        onClose={handleClose}
        duration={3000}
      />,
    );

    await act(async () => {
      // Advance timers to trigger auto-dismiss
      jest.advanceTimersByTime(3000 + 300); // duration + exit animation
    });

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  describe('Icon Resolution', () => {
    it('uses icon from icons mapping if key is found', async () => {
      const icons = { 'test-icon': '🚀' };
      render(
        <BuiltInNotification achievement={mockAchievement} icons={icons} />,
      );
      await act(async () => {
        jest.runAllTimers();
      });
      expect(screen.getByText('🚀')).toBeInTheDocument();
    });

    it('uses achievementIconKey as direct emoji if not in mapping', async () => {
      const achievementWithEmoji: AchievementWithStatus = {
        ...mockAchievement,
        achievementIconKey: 'डायरेक्ट-इमोजी',
      };
      render(<BuiltInNotification achievement={achievementWithEmoji} />);
      await act(async () => {
        jest.runAllTimers();
      });
      expect(screen.getByText('डायरेक्ट-इमोजी')).toBeInTheDocument();
    });

    it('falls back to default icon if no key or mapping exists', async () => {
      const achievementWithoutIcon: AchievementWithStatus = {
        ...mockAchievement,
        achievementIconKey: undefined,
      };
      // Default icon is '⭐'
      render(<BuiltInNotification achievement={achievementWithoutIcon} />);
      await act(async () => {
        jest.runAllTimers();
      });
      expect(screen.getByText('⭐')).toBeInTheDocument();
    });

    it('prioritizes mapping over direct emoji', async () => {
      const icons = { '🔑': '🚀' };
      const achievementWithEmojiKey: AchievementWithStatus = {
        ...mockAchievement,
        achievementIconKey: '🔑',
      };
      render(
        <BuiltInNotification
          achievement={achievementWithEmojiKey}
          icons={icons}
        />,
      );
      await act(async () => {
        jest.runAllTimers();
      });
      expect(screen.getByText('🚀')).toBeInTheDocument();
      expect(screen.queryByText('🔑')).not.toBeInTheDocument();
    });
  });

  describe('Positioning', () => {
    const positions: NotificationPosition[] = [
      'top-left',
      'top-center',
      'top-right',
      'bottom-left',
      'bottom-center',
      'bottom-right',
    ];

    positions.forEach((position) => {
      it(`applies correct styles for position: ${position}`, async () => {
        render(
          <BuiltInNotification
            achievement={mockAchievement}
            position={position}
          />,
        );
        
        await act(async () => {
          // Wait for the animation to make it visible
          jest.advanceTimersByTime(10);
        });

        const notification = screen.getByTestId('built-in-notification');
        expect(notification).toHaveStyle(`position: fixed`);

        if (position.includes('top')) {
          expect(notification).toHaveStyle(`top: 20px`);
        } else {
          expect(notification).toHaveStyle(`bottom: 20px`);
        }

        if (position.includes('left')) {
          expect(notification).toHaveStyle(`left: 20px`);
        } else if (position.includes('right')) {
          expect(notification).toHaveStyle(`right: 20px`);
        } else {
          expect(notification).toHaveStyle(`left: 50%`);
          if (position.startsWith('top')) {
            expect(notification).toHaveStyle(`transform: translateY(0) translateX(-50%)`);
          } else {
            expect(notification).toHaveStyle(`transform: translateY(0) translateX(-50%)`);
          }
        }
      });
    });
  });

  it('handles achievements with no description', async () => {
    const achievementWithoutDesc: AchievementWithStatus = {
      ...mockAchievement,
      achievementDescription: '',
    };
    render(<BuiltInNotification achievement={achievementWithoutDesc} />);
    await act(async () => {
      jest.runAllTimers();
    });
    expect(screen.getByText('Test Achievement')).toBeInTheDocument();
    expect(
      screen.queryByText('This is a test achievement.'),
    ).not.toBeInTheDocument();
  });
});
