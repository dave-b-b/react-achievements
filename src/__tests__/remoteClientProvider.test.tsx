import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AchievementProvider } from '../providers/WebAchievementProvider';
import { AchievementsWidget } from '../core/components/AchievementsWidget';
import { useSimpleAchievements } from '../hooks/useSimpleAchievements';
import type {
  AchievementClient,
  AchievementClientMutationResult,
  AchievementClientSnapshot,
} from '../client/types';

const lockedSnapshot: AchievementClientSnapshot = {
  achievements: [
    {
      id: 'score_100',
      title: 'Century',
      description: 'Score 100 points',
      icon: 'trophy',
      isUnlocked: false,
    },
  ],
  unlockedIds: [],
  unlockedAchievements: [],
  unlockedCount: 0,
  totalCount: 1,
  metrics: {},
};

const unlockedSnapshot: AchievementClientSnapshot = {
  achievements: [
    {
      id: 'score_100',
      title: 'Century',
      description: 'Score 100 points',
      icon: 'trophy',
      isUnlocked: true,
      unlockedAt: '2026-01-01T00:00:00.000Z',
    },
  ],
  unlockedIds: ['score_100'],
  unlockedAchievements: [
    {
      id: 'score_100',
      title: 'Century',
      description: 'Score 100 points',
      icon: 'trophy',
      isUnlocked: true,
      unlockedAt: '2026-01-01T00:00:00.000Z',
    },
  ],
  unlockedCount: 1,
  totalCount: 1,
  metrics: { score: 100 },
};

const mutationResult: AchievementClientMutationResult = {
  snapshot: unlockedSnapshot,
  newlyUnlocked: unlockedSnapshot.unlockedAchievements,
};

const RemoteControls = () => {
  const { track, unlockedCount, totalCount, isLoading, error } = useSimpleAchievements();

  return (
    <>
      <button onClick={() => {
        Promise.resolve(track('score', 100)).catch(() => undefined);
      }}>
        Score 100
      </button>
      <span data-testid="remote-count">
        {isLoading ? 'loading' : `${unlockedCount}/${totalCount}`}
      </span>
      {error && <span data-testid="remote-error">{error.message}</span>}
    </>
  );
};

describe('remote AchievementProvider client mode', () => {
  it('loads a server snapshot and tracks through the AchievementClient contract', async () => {
    const client: AchievementClient = {
      getSnapshot: jest.fn().mockResolvedValue(lockedSnapshot),
      track: jest.fn().mockResolvedValue(mutationResult),
      increment: jest.fn().mockResolvedValue(mutationResult),
      event: jest.fn().mockResolvedValue(mutationResult),
      reset: jest.fn().mockResolvedValue(lockedSnapshot),
    };

    render(
      <AchievementProvider client={client} ui={{ enableConfetti: false }}>
        <RemoteControls />
        <AchievementsWidget />
      </AchievementProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('remote-count')).toHaveTextContent('0/1');
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Score 100'));
    });

    await waitFor(() => {
      expect(client.track).toHaveBeenCalledWith('score', 100);
      expect(screen.getByTestId('remote-count')).toHaveTextContent('1/1');
      expect(screen.getByText('Century')).toBeInTheDocument();
    });
  });

  it('surfaces remote mutation failures through hook error state', async () => {
    const client: AchievementClient = {
      getSnapshot: jest.fn().mockResolvedValue(lockedSnapshot),
      track: jest.fn().mockRejectedValue(new Error('Server unavailable')),
      increment: jest.fn().mockResolvedValue(mutationResult),
      event: jest.fn().mockResolvedValue(mutationResult),
      reset: jest.fn().mockResolvedValue(lockedSnapshot),
    };

    render(
      <AchievementProvider client={client} ui={{ enableConfetti: false }}>
        <RemoteControls />
      </AchievementProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('remote-count')).toHaveTextContent('0/1');
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Score 100'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('remote-error')).toHaveTextContent('Server unavailable');
      expect(screen.getByTestId('remote-count')).toHaveTextContent('0/1');
    });
  });
});
