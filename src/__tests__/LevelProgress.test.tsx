import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
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

  it('updates the displayed progress when live state changes', () => {
    const LiveProgressDemo = () => {
      const [currentXP, setCurrentXP] = React.useState(120);

      return (
        <>
          <LevelProgress level={3} currentXP={currentXP} nextLevelXP={200} />
          <button onClick={() => setCurrentXP(160)}>Set 160 XP</button>
          <button onClick={() => setCurrentXP(250)}>Overfill XP</button>
        </>
      );
    };

    const { container } = render(<LiveProgressDemo />);

    fireEvent.click(screen.getByText('Set 160 XP'));

    expect(screen.getByText('160 / 200 XP')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();

    let progressTrack = container.querySelector('[role="progressbar"]');
    expect(progressTrack).toHaveAttribute('aria-valuenow', '160');
    expect(getProgressBar(container)).toHaveStyle({ width: '80%' });

    fireEvent.click(screen.getByText('Overfill XP'));

    expect(screen.getByText('200 / 200 XP')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();

    progressTrack = container.querySelector('[role="progressbar"]');
    expect(progressTrack).toHaveAttribute('aria-valuenow', '200');
    expect(getProgressBar(container)).toHaveStyle({ width: '100%' });
  });
});
