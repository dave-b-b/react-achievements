import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AchievementProvider } from '../../providers/AchievementProvider';
import { useAchievements } from '../../hooks/useAchievements';
import { AchievementWithStatus } from '../../core/types';
import { AchievementEngine } from 'achievements-engine';

const mockConfig = {
  achievements: {
    test: [
      {
        achievementDetails: {
          achievementId: 'test-1',
          achievementTitle: 'Test Achievement',
          achievementDescription: 'Test Description',
        },
        isConditionMet: () => true,
      },
    ],
  },
};

const TestApp = () => {
  const { update } = useAchievements();
  return <button onClick={() => update({ test: 1 })}>Update</button>;
};

describe('AchievementProvider UI Integration', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.clearAllMocks();
    });

    it('should disable notifications when enableNotifications is false', async () => {
        render(
            <AchievementProvider achievements={mockConfig.achievements} ui={{ enableNotifications: false }} useBuiltInUI={true}>
                <TestApp />
            </AchievementProvider>
        );
        
        await act(async () => {
            fireEvent.click(screen.getByText('Update'));
        });

        await act(async () => {
            jest.runAllTimers();
        });

        expect(screen.queryByTestId('built-in-notification')).not.toBeInTheDocument();
    });

    it('should disable confetti when enableConfetti is false', async () => {
        render(
            <AchievementProvider achievements={mockConfig.achievements} ui={{ enableConfetti: false }} useBuiltInUI={true}>
                <TestApp />
            </AchievementProvider>
        );

        await act(async () => {
            fireEvent.click(screen.getByText('Update'));
        });

        await act(async () => {
            jest.runAllTimers();
        });

        expect(screen.queryByTestId('built-in-confetti')).not.toBeInTheDocument();
    });

    it('should apply notification position from ui config', async () => {
        jest.useRealTimers();
        render(
            <AchievementProvider achievements={mockConfig.achievements} ui={{ notificationPosition: 'bottom-left' }} useBuiltInUI={true}>
                <TestApp />
            </AchievementProvider>
        );

        await act(async () => {
            fireEvent.click(screen.getByText('Update'));
        });

        await waitFor(() => {
            const notification = screen.getByTestId('built-in-notification');
            expect(notification).toHaveStyle('bottom: 20px');
            expect(notification).toHaveStyle('left: 20px');
        });
    });

    it('should use custom NotificationComponent when provided', async () => {
        jest.useRealTimers();
        const CustomNotification = ({ achievement }: { achievement: AchievementWithStatus }) => (
            <div data-testid="custom-notification">{achievement.achievementTitle}</div>
        );

        render(
            <AchievementProvider achievements={mockConfig.achievements} ui={{ NotificationComponent: CustomNotification as any }} useBuiltInUI={true}>
                <TestApp />
            </AchievementProvider>
        );

        await act(async () => {
            fireEvent.click(screen.getByText('Update'));
        });

        await waitFor(() => {
            expect(screen.getByTestId('custom-notification')).toBeInTheDocument();
            expect(screen.getByText('Test Achievement')).toBeInTheDocument();
            expect(screen.queryByTestId('built-in-notification')).not.toBeInTheDocument();
        });
    });

    it('should apply theme to UI components', async () => {
        jest.useRealTimers();
        render(
            <AchievementProvider achievements={mockConfig.achievements} ui={{ theme: 'minimal' }} useBuiltInUI={true}>
                <TestApp />
            </AchievementProvider>
        );

        await act(async () => {
            fireEvent.click(screen.getByText('Update'));
        });

        await waitFor(() => {
            const notification = screen.getByTestId('built-in-notification');
            // Minimal theme has a white background with alpha
            expect(notification).toHaveStyle('background: rgba(255, 255, 255, 0.98)');
        });
    });

    it('should use custom ConfettiComponent when provided', async () => {
        jest.useRealTimers();
        const CustomConfetti = ({ show }: { show: boolean }) => (
            show ? <div data-testid="custom-confetti">Custom Confetti</div> : null
        );

        render(
            <AchievementProvider achievements={mockConfig.achievements} ui={{ ConfettiComponent: CustomConfetti as any }} useBuiltInUI={true}>
                <TestApp />
            </AchievementProvider>
        );

        await act(async () => {
            fireEvent.click(screen.getByText('Update'));
        });

        await waitFor(() => {
            expect(screen.getByTestId('custom-confetti')).toBeInTheDocument();
            expect(screen.queryByTestId('built-in-confetti')).not.toBeInTheDocument();
        });
    });

    it('should apply all notification positions correctly', async () => {
        jest.useRealTimers();
        const positions = ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'] as const;
        
        for (const position of positions) {
            const { unmount } = render(
                <AchievementProvider achievements={mockConfig.achievements} ui={{ notificationPosition: position }} useBuiltInUI={true}>
                    <TestApp />
                </AchievementProvider>
            );

            await act(async () => {
                fireEvent.click(screen.getByText('Update'));
            });

            await waitFor(() => {
                const notification = screen.getByTestId('built-in-notification');
                expect(notification).toBeInTheDocument();
            });

            unmount();
        }
    });

    it('should apply modern theme correctly', async () => {
        jest.useRealTimers();
        render(
            <AchievementProvider achievements={mockConfig.achievements} ui={{ theme: 'modern' }} useBuiltInUI={true}>
                <TestApp />
            </AchievementProvider>
        );

        await act(async () => {
            fireEvent.click(screen.getByText('Update'));
        });

        await waitFor(() => {
            const notification = screen.getByTestId('built-in-notification');
            expect(notification).toBeInTheDocument();
            // Modern theme has gradient background
            expect(notification).toHaveStyle('background: linear-gradient(135deg, rgba(30, 30, 50, 0.98) 0%, rgba(50, 50, 70, 0.98) 100%)');
        });
    });

    it('should apply gamified theme correctly', async () => {
        jest.useRealTimers();
        render(
            <AchievementProvider achievements={mockConfig.achievements} ui={{ theme: 'gamified' }} useBuiltInUI={true}>
                <TestApp />
            </AchievementProvider>
        );

        await act(async () => {
            fireEvent.click(screen.getByText('Update'));
        });

        await waitFor(() => {
            const notification = screen.getByTestId('built-in-notification');
            expect(notification).toBeInTheDocument();
            // Gamified theme has dark navy gradient
            expect(notification).toHaveStyle('background: linear-gradient(135deg, rgba(5, 8, 22, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%)');
        });
    });

    it('should show both notification and confetti when both are enabled', async () => {
        jest.useRealTimers();
        render(
            <AchievementProvider achievements={mockConfig.achievements} useBuiltInUI={true}>
                <TestApp />
            </AchievementProvider>
        );

        await act(async () => {
            fireEvent.click(screen.getByText('Update'));
        });

        await waitFor(() => {
            expect(screen.getByTestId('built-in-notification')).toBeInTheDocument();
            expect(screen.getByTestId('built-in-confetti')).toBeInTheDocument();
        });
    });
});

describe('AchievementProvider UI with Event-Based Engine', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.clearAllMocks();
    });

    it('should display notification when using an external engine and emit', async () => {
        jest.useRealTimers();
        const eventMapping = {
            'test': (value: number) => ({ test: value })
        };
        const engine = new AchievementEngine({ 
            achievements: mockConfig.achievements,
            eventMapping 
        });
        render(
            <AchievementProvider engine={engine} useBuiltInUI={true}>
                <div>Test</div>
            </AchievementProvider>
        );

        // Wait for the provider to be ready (useEffect to run and subscribe to events)
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        // Emit the event (wrapped in act to handle state updates)
        await act(async () => {
            engine.emit('test', 1);
        });
        
        // Wait for the notification to appear
        await waitFor(() => {
            expect(screen.getByTestId('built-in-notification')).toBeInTheDocument();
            expect(screen.getByText('Test Achievement')).toBeInTheDocument();
        }, { timeout: 3000 });
    });
});


