import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AchievementProvider } from '../../../providers/WebAchievementProvider';
import { AchievementsWidget } from '../../../core/components/AchievementsWidget';
import { AchievementsList } from '../../../core/components/AchievementsList';
import { AchievementsModal } from '../../../core/components/AchievementsModal';
import { useSimpleAchievements } from '../../../hooks/useSimpleAchievements';
import { ModalProps, SimpleAchievementConfig, StorageType } from '../../../core/types';

const achievements: SimpleAchievementConfig = {
  score: {
    100: { title: 'Century!', description: 'Score 100 points', icon: '🏆' },
  },
  tutorialComplete: {
    true: { title: 'Tutorial Complete', description: 'Finish tutorial', icon: '📚' },
  },
};

const Tracker = () => {
  const { track } = useSimpleAchievements();

  return (
    <button type="button" onClick={() => track('score', 100)}>
      Score
    </button>
  );
};

describe('AchievementsWidget', () => {
  it('renders a context-aware button and shows all achievements by default', () => {
    render(
      <AchievementProvider
        achievements={achievements}
        storage={StorageType.Memory}
        ui={{ enableNotifications: false, enableConfetti: false }}
      >
        <AchievementsWidget />
      </AchievementProvider>
    );

    const button = screen.getByTestId('achievements-widget-button');
    expect(button).toHaveTextContent('Achievements');
    expect(button).toHaveTextContent('0');

    fireEvent.click(button);

    expect(screen.getByTestId('achievements-modal-overlay')).toHaveStyle({
      position: 'fixed',
      top: '0px',
      right: '0px',
      bottom: '0px',
      left: '0px',
    });
    expect(screen.getByTestId('achievements-modal')).toBeInTheDocument();
    expect(screen.getByText('Century!')).toBeInTheDocument();
    expect(screen.getByText('Tutorial Complete')).toBeInTheDocument();
  });

  it('updates the count when an achievement is unlocked', async () => {
    render(
      <AchievementProvider
        achievements={achievements}
        storage={StorageType.Memory}
        ui={{ enableNotifications: false, enableConfetti: false }}
      >
        <Tracker />
        <AchievementsWidget />
      </AchievementProvider>
    );

    fireEvent.click(screen.getByText('Score'));

    await waitFor(() => {
      expect(screen.getByTestId('achievements-widget-button')).toHaveTextContent(
        'Achievements'
      );
      expect(screen.getByTestId('achievements-widget-button')).toHaveTextContent('1');
      expect(screen.getByTestId('achievements-widget-button')).toHaveAttribute(
        'aria-label',
        'Achievements: 1 of 2 achievements unlocked'
      );
    });
  });

  it('supports inline placement for drawers and navigation areas', () => {
    render(
      <AchievementProvider
        achievements={achievements}
        storage={StorageType.Memory}
        ui={{ enableNotifications: false, enableConfetti: false }}
      >
        <AchievementsWidget placement="inline" />
      </AchievementProvider>
    );

    expect(screen.getByTestId('achievements-widget-button')).toHaveAttribute(
      'data-placement',
      'inline'
    );
  });

  it('supports a custom trigger for matching app drawer styles', () => {
    render(
      <AchievementProvider
        achievements={achievements}
        storage={StorageType.Memory}
        ui={{ enableNotifications: false, enableConfetti: false }}
      >
        <AchievementsWidget
          renderTrigger={({ buttonProps, unlockedCount }) => (
            <button {...buttonProps} className="drawer-row">
              Badges
              <span>{unlockedCount}</span>
            </button>
          )}
        />
      </AchievementProvider>
    );

    const trigger = screen.getByTestId('achievements-widget-button');
    expect(trigger).toHaveClass('drawer-row');

    fireEvent.click(trigger);

    expect(screen.getByTestId('achievements-modal')).toBeInTheDocument();
  });

  it('allows the modal to read achievements from provider context', () => {
    render(
      <AchievementProvider
        achievements={achievements}
        storage={StorageType.Memory}
        ui={{ enableNotifications: false, enableConfetti: false }}
      >
        <AchievementsModal isOpen onClose={() => undefined} />
      </AchievementProvider>
    );

    expect(screen.getByTestId('achievements-modal')).toBeInTheDocument();
    expect(screen.getByText('Century!')).toBeInTheDocument();
    expect(screen.getByText('Tutorial Complete')).toBeInTheDocument();
  });

  it('uses a provider-level custom modal component when configured', () => {
    const CustomModal = ({ isOpen, achievements, icons = {}, theme }: ModalProps) =>
      isOpen ? (
        <div data-testid="custom-achievements-modal">
          {theme}:{icons.special}:{achievements.length}
        </div>
      ) : null;

    render(
      <AchievementProvider
        achievements={achievements}
        storage={StorageType.Memory}
        icons={{ special: '✨' }}
        ui={{
          enableNotifications: false,
          enableConfetti: false,
          theme: 'minimal',
          ModalComponent: CustomModal,
        }}
      >
        <AchievementsModal isOpen onClose={() => undefined} />
      </AchievementProvider>
    );

    expect(screen.getByTestId('custom-achievements-modal')).toHaveTextContent(
      'minimal:✨:2'
    );
  });

  it('passes a widget theme override to provider-level custom modals', () => {
    const CustomModal = ({ isOpen, achievements, theme }: ModalProps) =>
      isOpen ? (
        <div data-testid="custom-achievements-modal">
          {theme}:{achievements.length}
        </div>
      ) : null;

    render(
      <AchievementProvider
        achievements={achievements}
        storage={StorageType.Memory}
        ui={{
          enableNotifications: false,
          enableConfetti: false,
          theme: 'minimal',
          ModalComponent: CustomModal,
        }}
      >
        <AchievementsWidget theme="gamified" />
      </AchievementProvider>
    );

    fireEvent.click(screen.getByTestId('achievements-widget-button'));

    expect(screen.getByTestId('custom-achievements-modal')).toHaveTextContent(
      'gamified:2'
    );
  });
});

describe('AchievementsList', () => {
  it('can render directly from provider state', () => {
    render(
      <AchievementProvider
        achievements={achievements}
        storage={StorageType.Memory}
        ui={{ enableNotifications: false, enableConfetti: false }}
      >
        <AchievementsList />
      </AchievementProvider>
    );

    expect(screen.getByText('Century!')).toBeInTheDocument();
    expect(screen.getByText('Tutorial Complete')).toBeInTheDocument();
  });

  it('uses provider-level custom icons in inline lists and modals', () => {
    render(
      <AchievementProvider
        achievements={{
          login: {
            true: {
              title: 'First Login',
              description: 'Log in once',
              icon: 'login',
            },
          },
        }}
        storage={StorageType.Memory}
        icons={{ login: '🔑' }}
        ui={{ enableNotifications: false, enableConfetti: false }}
      >
        <AchievementsList />
        <AchievementsModal isOpen onClose={() => undefined} />
      </AchievementProvider>
    );

    expect(screen.getAllByText('🔑')).toHaveLength(2);
    expect(screen.queryByText('login')).not.toBeInTheDocument();
  });

  it('supports custom achievement item rendering', () => {
    render(
      <AchievementProvider
        achievements={achievements}
        storage={StorageType.Memory}
        ui={{ enableNotifications: false, enableConfetti: false }}
      >
        <AchievementsList
          renderAchievement={({ achievement, icon, isLocked }) => (
            <article data-testid="custom-achievement-row">
              {icon} {achievement.achievementTitle} {isLocked ? 'locked' : 'unlocked'}
            </article>
          )}
        />
      </AchievementProvider>
    );

    expect(screen.getAllByTestId('custom-achievement-row')).toHaveLength(2);
    expect(screen.getByText(/Century! locked/)).toBeInTheDocument();
  });

  it('can hide locked achievements', () => {
    render(
      <AchievementProvider
        achievements={achievements}
        storage={StorageType.Memory}
        ui={{ enableNotifications: false, enableConfetti: false }}
      >
        <Tracker />
        <AchievementsList showLocked={false} />
      </AchievementProvider>
    );

    expect(screen.queryByText('Century!')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Score'));

    expect(screen.getByText('Century!')).toBeInTheDocument();
    expect(screen.queryByText('Tutorial Complete')).not.toBeInTheDocument();
  });
});
