import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AchievementProvider } from '../../providers/WebAchievementProvider';
import { useAchievements } from '../../hooks/useAchievements';
import { useSimpleAchievements } from '../../hooks/useSimpleAchievements';
import { AchievementWithStatus, ConfettiProps } from '../../core/types';
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

const SimpleScoreApp = () => {
  const { track } = useSimpleAchievements();
  return <button onClick={() => track('score', 100)}>Score 100</button>;
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

    it('should pass theme and custom confetti config to ConfettiComponent', async () => {
        jest.useRealTimers();
        const CustomConfetti = ({
            show,
            colors,
            duration,
            particleCount,
            shapes,
            spread,
            startVelocity,
        }: ConfettiProps) => (
            show ? (
                <div
                    data-testid="custom-confetti"
                    data-colors={colors?.join(',')}
                    data-duration={duration}
                    data-particle-count={particleCount}
                    data-shapes={shapes?.join(',')}
                    data-spread={spread}
                    data-start-velocity={startVelocity}
                >
                    Custom Confetti
                </div>
            ) : null
        );

        render(
            <AchievementProvider
                achievements={mockConfig.achievements}
                ui={{
                    theme: 'minimal',
                    ConfettiComponent: CustomConfetti,
                    confetti: {
                        duration: 3000,
                        particleCount: 90,
                        shapes: ['star'],
                        spread: 85,
                        startVelocity: 55,
                    },
                }}
                useBuiltInUI={true}
            >
                <TestApp />
            </AchievementProvider>
        );

        await act(async () => {
            fireEvent.click(screen.getByText('Update'));
        });

        await waitFor(() => {
            const confetti = screen.getByTestId('custom-confetti');
            expect(confetti).toHaveAttribute('data-colors', '#4CAF50,#2196F3');
            expect(confetti).toHaveAttribute('data-duration', '3000');
            expect(confetti).toHaveAttribute('data-particle-count', '90');
            expect(confetti).toHaveAttribute('data-shapes', 'star');
            expect(confetti).toHaveAttribute('data-spread', '85');
            expect(confetti).toHaveAttribute('data-start-velocity', '55');
        });
    });

    it('should keep 4.3-style simple configs working without reward confetti', async () => {
        jest.useRealTimers();
        render(
            <AchievementProvider
                achievements={{
                    score: {
                        100: {
                            title: 'Century',
                            description: 'Score 100 points',
                            icon: 'trophy',
                        },
                    },
                }}
                useBuiltInUI={true}
            >
                <SimpleScoreApp />
            </AchievementProvider>
        );

        await act(async () => {
            fireEvent.click(screen.getByText('Score 100'));
        });

        await waitFor(() => {
            expect(screen.getByText('Century')).toBeInTheDocument();
            expect(screen.getByTestId('built-in-confetti')).toBeInTheDocument();
        });
    });

    it('should use simple reward confetti overrides over global config', async () => {
        jest.useRealTimers();
        const CustomConfetti = ({
            show,
            colors,
            duration,
            particleCount,
            scalar,
            spread,
        }: ConfettiProps) => (
            show ? (
                <div
                    data-testid="custom-confetti"
                    data-colors={colors?.join(',')}
                    data-duration={duration}
                    data-particle-count={particleCount}
                    data-scalar={scalar}
                    data-spread={spread}
                >
                    Custom Confetti
                </div>
            ) : null
        );

        render(
            <AchievementProvider
                achievements={{
                    score: {
                        100: {
                            title: 'Century',
                            confetti: {
                                colors: ['#111111', '#222222'],
                                duration: 7000,
                                particleCount: 180,
                                scalar: 1.4,
                            },
                        },
                    },
                }}
                ui={{
                    ConfettiComponent: CustomConfetti,
                    confetti: {
                        colors: ['#eeeeee'],
                        particleCount: 90,
                        spread: 65,
                    },
                }}
                useBuiltInUI={true}
            >
                <SimpleScoreApp />
            </AchievementProvider>
        );

        await act(async () => {
            fireEvent.click(screen.getByText('Score 100'));
        });

        await waitFor(() => {
            const confetti = screen.getByTestId('custom-confetti');
            expect(confetti).toHaveAttribute('data-colors', '#111111,#222222');
            expect(confetti).toHaveAttribute('data-duration', '7000');
            expect(confetti).toHaveAttribute('data-particle-count', '180');
            expect(confetti).toHaveAttribute('data-scalar', '1.4');
            expect(confetti).toHaveAttribute('data-spread', '65');
        });
    });

    it('should keep simple custom-condition reward confetti stable across provider rerenders', async () => {
        jest.useRealTimers();
        const CustomConfetti = ({ show, particleCount }: ConfettiProps) => (
            show ? (
                <div data-testid="custom-confetti" data-particle-count={particleCount}>
                    Custom Confetti
                </div>
            ) : null
        );
        const RerenderingProviderApp = () => {
            const [renderCount, setRenderCount] = React.useState(0);
            const achievements = {
                score: {
                    boss: {
                        title: 'Boss Finale',
                        condition: (metrics: Record<string, unknown>) =>
                            typeof metrics.score === 'number' && metrics.score >= 100,
                        confetti: {
                            particleCount: 210,
                        },
                    },
                },
            };

            return (
                <AchievementProvider
                    achievements={achievements}
                    ui={{ ConfettiComponent: CustomConfetti }}
                    useBuiltInUI={true}
                >
                    <span data-testid="render-count">{renderCount}</span>
                    <button onClick={() => setRenderCount((count) => count + 1)}>
                        Provider Rerender
                    </button>
                    <SimpleScoreApp />
                </AchievementProvider>
            );
        };

        render(<RerenderingProviderApp />);

        await act(async () => {
            fireEvent.click(screen.getByText('Provider Rerender'));
        });

        expect(screen.getByTestId('render-count')).toHaveTextContent('1');

        await act(async () => {
            fireEvent.click(screen.getByText('Score 100'));
        });

        await waitFor(() => {
            const confetti = screen.getByTestId('custom-confetti');
            expect(confetti).toHaveAttribute('data-particle-count', '210');
        });
    });

    it('should use complex reward confetti overrides over global config', async () => {
        jest.useRealTimers();
        const CustomConfetti = ({ show, particleCount, spread }: ConfettiProps) => (
            show ? (
                <div
                    data-testid="custom-confetti"
                    data-particle-count={particleCount}
                    data-spread={spread}
                >
                    Custom Confetti
                </div>
            ) : null
        );

        render(
            <AchievementProvider
                achievements={{
                    test: [
                        {
                            achievementDetails: {
                                achievementId: 'boss-finale',
                                achievementTitle: 'Boss Finale',
                                achievementDescription: 'Clear the boss fight',
                                confetti: {
                                    particleCount: 240,
                                },
                            },
                            isConditionMet: () => true,
                        },
                    ],
                }}
                ui={{
                    ConfettiComponent: CustomConfetti,
                    confetti: {
                        particleCount: 90,
                        spread: 75,
                    },
                }}
                useBuiltInUI={true}
            >
                <TestApp />
            </AchievementProvider>
        );

        await act(async () => {
            fireEvent.click(screen.getByText('Update'));
        });

        await waitFor(() => {
            const confetti = screen.getByTestId('custom-confetti');
            expect(confetti).toHaveAttribute('data-particle-count', '240');
            expect(confetti).toHaveAttribute('data-spread', '75');
        });
    });

    it('should skip confetti when a reward sets confetti to false', async () => {
        jest.useRealTimers();
        const CustomConfetti = ({ show }: ConfettiProps) => (
            show ? <div data-testid="custom-confetti">Custom Confetti</div> : null
        );

        render(
            <AchievementProvider
                achievements={{
                    test: [
                        {
                            achievementDetails: {
                                achievementId: 'quiet-unlock',
                                achievementTitle: 'Quiet Unlock',
                                achievementDescription: 'No celebration',
                                confetti: false,
                            },
                            isConditionMet: () => true,
                        },
                    ],
                }}
                ui={{ ConfettiComponent: CustomConfetti }}
                useBuiltInUI={true}
            >
                <TestApp />
            </AchievementProvider>
        );

        await act(async () => {
            fireEvent.click(screen.getByText('Update'));
        });

        await waitFor(() => {
            expect(screen.getByText('Quiet Unlock')).toBeInTheDocument();
        });
        expect(screen.queryByTestId('custom-confetti')).not.toBeInTheDocument();
    });

    it('should let global confetti disable override reward confetti', async () => {
        jest.useRealTimers();
        const CustomConfetti = ({ show }: ConfettiProps) => (
            show ? <div data-testid="custom-confetti">Custom Confetti</div> : null
        );

        render(
            <AchievementProvider
                achievements={{
                    score: {
                        100: {
                            title: 'Century',
                            confetti: {
                                particleCount: 180,
                            },
                        },
                    },
                }}
                ui={{
                    ConfettiComponent: CustomConfetti,
                    enableConfetti: false,
                }}
                useBuiltInUI={true}
            >
                <SimpleScoreApp />
            </AchievementProvider>
        );

        await act(async () => {
            fireEvent.click(screen.getByText('Score 100'));
        });

        await waitFor(() => {
            expect(screen.getByText('Century')).toBeInTheDocument();
        });
        expect(screen.queryByTestId('custom-confetti')).not.toBeInTheDocument();
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
