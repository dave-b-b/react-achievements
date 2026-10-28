import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import * as enginePackage from 'achievements-engine';
import * as root from '../index';
import * as web from '../web';
import * as headless from '../headless';
import type { AchievementConfetti, AchievementClientSnapshot, AchievementDto, SimpleAchievementConfig } from '../index';

// These assignments are checked by the consumer-facing TypeScript test profile.
const dto: AchievementDto = {
  id: 'score_10', title: 'Ten', isUnlocked: false, confetti: { colors: ['red'], duration: 100 },
};
const canonicalDto: enginePackage.AchievementDto<AchievementConfetti> = dto;
const snapshot: AchievementClientSnapshot = {
  achievements: [canonicalDto], unlockedAchievements: [], unlockedIds: [], unlockedCount: 0, totalCount: 1,
};
const canonicalSnapshot: enginePackage.AchievementApiSnapshot<AchievementConfetti> = snapshot;

const Progress = () => {
  const { allAchievements, track } = headless.useSimpleAchievements();
  return <>
    <output data-testid="snapshot">{JSON.stringify(allAchievements)}</output>
    <button onClick={() => track('score', 4)}>Track</button>
  </>;
};

describe('shared engine boundary', () => {
  it('re-exports the same transport and storage from every public React entry', () => {
    for (const entry of [root, web, headless]) {
      expect(entry.RestAchievementClient).toBe(enginePackage.RestAchievementClient);
      expect(entry.createRestAchievementClient).toBe(enginePackage.createRestAchievementClient);
      expect(entry.isAsyncStorage).toBe(enginePackage.isAsyncStorage);
      expect(entry.StorageType).toBe(enginePackage.StorageType);
    }
    expect(canonicalSnapshot.achievements[0].confetti).toEqual({ colors: ['red'], duration: 100 });
  });

  it.each(['provider', 'injected'] as const)('uses canonical progress with a %s engine', async (mode) => {
    const achievements: SimpleAchievementConfig = {
      score: {
        10: { title: 'Ten' },
        20: { title: 'Custom', condition: () => false },
      },
      done: { true: { title: 'Done' } },
    };
    const engine = new enginePackage.AchievementEngine({ achievements });
    await engine.ready();
    const props = mode === 'provider'
      ? { achievements, storage: enginePackage.StorageType.Memory }
      : { engine };
    render(<headless.AchievementProvider {...props}><Progress /></headless.AchievementProvider>);
    await act(async () => { screen.getByText('Track').click(); });
    await waitFor(() => {
      const state = JSON.parse(screen.getByTestId('snapshot').textContent || '[]') as root.AchievementWithStatus[];
      expect(state.find(({ achievementId }) => achievementId === 'score_10')?.progress)
        .toEqual({ current: 4, target: 10, percent: 40 });
      expect(state.find(({ achievementId }) => achievementId === 'score_custom_20')?.progress).toBeUndefined();
      expect(state.find(({ achievementId }) => achievementId === 'done_true')?.progress).toBeUndefined();
    });
    engine.destroy();
  });
});
