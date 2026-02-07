import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LevelProgress } from '../core/components/LevelProgress';

const getProgressBar = (container: HTMLElement): HTMLElement => {
  const progressTrack = container.querySelector('[role="progressbar"]');
  if (!progressTrack || !progressTrack.firstElementChild) {
    throw new Error('Progress bar element not found');
  }
  return progressTrack.firstElementChild as HTMLElement;
};

describe('LevelProgress', () => {
  it('renders label, values, and percent by default', () => {
    const { container } = render(
      <LevelProgress level={3} currentXP={120} nextLevelXP={200} />
    );

    expect(screen.getByText('Level 3')).toBeInTheDocument();
    expect(screen.getByText('120 / 200 XP')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();

    const progressTrack = container.querySelector('[role="progressbar"]');
    expect(progressTrack).toHaveAttribute('aria-valuemin', '0');
    expect(progressTrack).toHaveAttribute('aria-valuemax', '200');
    expect(progressTrack).toHaveAttribute('aria-valuenow', '120');

    const progressBar = getProgressBar(container);
    expect(progressBar).toHaveStyle({ width: '60%' });
  });

  it('uses valueLabel when provided', () => {
    render(
      <LevelProgress
        level={1}
        currentXP={10}
        nextLevelXP={50}
        valueLabel="10 / 50"
      />
    );

    expect(screen.getByText('10 / 50')).toBeInTheDocument();
  });

  it('can hide values and percent', () => {
    render(
      <LevelProgress
        level="Master"
        currentXP={40}
        nextLevelXP={100}
        showValues={false}
        showPercent={false}
      />
    );

    expect(screen.getByText('Level Master')).toBeInTheDocument();
    expect(screen.queryByText(/XP/)).not.toBeInTheDocument();
    expect(screen.queryByText('%')).not.toBeInTheDocument();
  });

  it('clamps values and handles invalid max', () => {
    const { container } = render(
      <LevelProgress level={1} currentXP={10} nextLevelXP={0} />
    );

    const progressTrack = container.querySelector('[role="progressbar"]');
    expect(progressTrack).toHaveAttribute('aria-valuemax', '1');
    expect(progressTrack).toHaveAttribute('aria-valuenow', '1');

    expect(screen.getByText('1 / 1 XP')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('applies theme accent color to the progress bar', () => {
    const { container } = render(
      <LevelProgress level={2} currentXP={25} nextLevelXP={100} theme="gamified" />
    );

    const progressBar = getProgressBar(container);
    expect(progressBar).toHaveStyle({ backgroundColor: '#f97316' });
  });
});
