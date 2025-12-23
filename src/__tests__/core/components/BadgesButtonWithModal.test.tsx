import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BadgesButtonWithModal } from '../../../core/components/BadgesButtonWithModal';
import { AchievementDetails, AchievementWithStatus } from '../../../core/types';

// Mock react-modal to avoid portal-related issues in tests
jest.mock('react-modal', () => {
    const React = require('react');
    return {
        __esModule: true,
        default: ({ isOpen, children, onRequestClose }: any) => (
            isOpen ? (
                <div data-testid="modal">
                    <button onClick={onRequestClose} data-testid="modal-close">Close</button>
                    {children}
                </div>
            ) : null
        ),
    };
});

describe('BadgesButtonWithModal', () => {
    const mockUnlockedAchievements: AchievementDetails[] = [
        {
            achievementId: 'score_100',
            achievementTitle: 'Century!',
            achievementDescription: 'Score 100 points',
            achievementIconKey: 'trophy'
        },
        {
            achievementId: 'level_5',
            achievementTitle: 'Leveling Up',
            achievementDescription: 'Reach level 5',
            achievementIconKey: 'chart'
        }
    ];

    const mockAllAchievements: AchievementWithStatus[] = [
        ...mockUnlockedAchievements.map(a => ({ ...a, isUnlocked: true })),
        {
            achievementId: 'score_500',
            achievementTitle: 'High Scorer!',
            achievementDescription: 'Score 500 points',
            achievementIconKey: 'star',
            isUnlocked: false
        }
    ];

    it('should render the button', () => {
        render(
            <BadgesButtonWithModal unlockedAchievements={mockUnlockedAchievements} />
        );

        const button = screen.getByTestId('badges-button');
        expect(button).toBeInTheDocument();
        expect(button).toHaveTextContent('Achievements (2)');
    });

    it('should display correct count of unlocked achievements', () => {
        render(
            <BadgesButtonWithModal unlockedAchievements={mockUnlockedAchievements} />
        );

        const button = screen.getByTestId('badges-button');
        expect(button).toHaveTextContent('2');
    });

    it('should open modal when button is clicked', async () => {
        render(
            <BadgesButtonWithModal unlockedAchievements={mockUnlockedAchievements} />
        );

        const button = screen.getByTestId('badges-button');

        // Modal should not be visible initially
        expect(screen.queryByTestId('modal')).not.toBeInTheDocument();

        // Click button to open modal
        fireEvent.click(button);

        // Modal should now be visible
        await waitFor(() => {
            expect(screen.getByTestId('modal')).toBeInTheDocument();
        });
    });

    it('should close modal when close button is clicked', async () => {
        render(
            <BadgesButtonWithModal unlockedAchievements={mockUnlockedAchievements} />
        );

        const button = screen.getByTestId('badges-button');

        // Open modal
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByTestId('modal')).toBeInTheDocument();
        });

        // Close modal
        const closeButton = screen.getByTestId('modal-close');
        fireEvent.click(closeButton);

        await waitFor(() => {
            expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
        });
    });

    it('should pass position prop to button', () => {
        render(
            <BadgesButtonWithModal
                unlockedAchievements={mockUnlockedAchievements}
                position="top-left"
            />
        );

        const button = screen.getByTestId('badges-button');
        // Check that the button exists (position styling is applied via inline styles)
        expect(button).toBeInTheDocument();
    });

    it('should pass placement prop to button', () => {
        render(
            <BadgesButtonWithModal
                unlockedAchievements={mockUnlockedAchievements}
                placement="inline"
            />
        );

        const button = screen.getByTestId('badges-button');
        expect(button).toHaveAttribute('data-placement', 'inline');
    });

    it('should pass theme prop to button', () => {
        render(
            <BadgesButtonWithModal
                unlockedAchievements={mockUnlockedAchievements}
                theme="gamified"
            />
        );

        const button = screen.getByTestId('badges-button');
        // Button should render with the theme applied
        expect(button).toBeInTheDocument();
    });

    it('should pass showAllAchievements and allAchievements to modal', async () => {
        render(
            <BadgesButtonWithModal
                unlockedAchievements={mockUnlockedAchievements}
                showAllAchievements={true}
                allAchievements={mockAllAchievements}
            />
        );

        const button = screen.getByTestId('badges-button');
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByTestId('modal')).toBeInTheDocument();
        });

        // Modal should display all achievements (both locked and unlocked)
        // The actual rendering is handled by BadgesModal, so we just verify modal is open
        expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    it('should pass showUnlockConditions to modal', async () => {
        render(
            <BadgesButtonWithModal
                unlockedAchievements={mockUnlockedAchievements}
                showAllAchievements={true}
                allAchievements={mockAllAchievements}
                showUnlockConditions={true}
            />
        );

        const button = screen.getByTestId('badges-button');
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByTestId('modal')).toBeInTheDocument();
        });

        expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    it('should manage modal state internally', async () => {
        render(
            <BadgesButtonWithModal unlockedAchievements={mockUnlockedAchievements} />
        );

        const button = screen.getByTestId('badges-button');

        // Initially closed
        expect(screen.queryByTestId('modal')).not.toBeInTheDocument();

        // Open
        fireEvent.click(button);
        await waitFor(() => {
            expect(screen.getByTestId('modal')).toBeInTheDocument();
        });

        // Close
        fireEvent.click(screen.getByTestId('modal-close'));
        await waitFor(() => {
            expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
        });

        // Re-open
        fireEvent.click(button);
        await waitFor(() => {
            expect(screen.getByTestId('modal')).toBeInTheDocument();
        });
    });

    it('should render with empty achievements list', () => {
        render(
            <BadgesButtonWithModal unlockedAchievements={[]} />
        );

        const button = screen.getByTestId('badges-button');
        expect(button).toHaveTextContent('Achievements (0)');
    });

    it('should pass custom icons to modal', async () => {
        const customIcons = {
            trophy: '🥇',
            star: '✨'
        };

        render(
            <BadgesButtonWithModal
                unlockedAchievements={mockUnlockedAchievements}
                icons={customIcons}
            />
        );

        const button = screen.getByTestId('badges-button');
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByTestId('modal')).toBeInTheDocument();
        });

        expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    it('should apply custom button styles', () => {
        const customStyles = {
            backgroundColor: 'red',
            fontSize: '20px'
        };

        render(
            <BadgesButtonWithModal
                unlockedAchievements={mockUnlockedAchievements}
                buttonStyles={customStyles}
            />
        );

        const button = screen.getByTestId('badges-button');
        expect(button).toHaveStyle({ backgroundColor: 'red', fontSize: '20px' });
    });
});
