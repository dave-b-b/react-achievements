import React from 'react';
import { render } from '@testing-library/react';
import { AchievementProvider } from '../providers/AchievementProvider';
import { useAchievements } from '../hooks/useAchievements';
import { useAchievementEngine } from '../hooks/useAchievementEngine';
import { AchievementEngine, StorageType } from 'achievements-engine';
import type { SimpleAchievementConfig } from '../core/types';

const simpleConfig: SimpleAchievementConfig = {
  score: {
    100: { title: 'Century!', description: 'Score 100 points', icon: '🏆' },
  },
};

const eventMapping = {
  userScored: 'score',
};

describe('useAchievementEngine', () => {
  it('returns the provider-created engine when using achievements prop', () => {
    const EngineComponent: React.FC = () => {
      const engine = useAchievementEngine();

      React.useEffect(() => {
        engine.update({ score: 100 });
      }, [engine]);

      return <div data-testid="engine-component">Engine</div>;
    };

    const { getByTestId } = render(
      <AchievementProvider achievements={simpleConfig} storage={StorageType.Memory}>
        <EngineComponent />
      </AchievementProvider>
    );

    expect(getByTestId('engine-component')).toBeInTheDocument();
  });

  it('returns the injected engine when using engine prop', () => {
    const externalEngine = new AchievementEngine({
      achievements: simpleConfig,
      eventMapping,
      storage: StorageType.Memory,
    });

    const EngineChecker: React.FC = () => {
      const engine = useAchievementEngine();
      expect(engine).toBe(externalEngine);
      return <div data-testid="checked">Checked</div>;
    };

    render(
      <AchievementProvider engine={externalEngine}>
        <EngineChecker />
      </AchievementProvider>
    );

    externalEngine.destroy();
  });

  it('allows useAchievements with an injected engine', () => {
    const externalEngine = new AchievementEngine({
      achievements: simpleConfig,
      eventMapping,
      storage: StorageType.Memory,
    });

    const Component: React.FC = () => {
      const { update } = useAchievements();

      React.useEffect(() => {
        update({ score: 100 });
      }, [update]);

      return <div data-testid="context-component">Context</div>;
    };

    const { getByTestId } = render(
      <AchievementProvider engine={externalEngine}>
        <Component />
      </AchievementProvider>
    );

    expect(getByTestId('context-component')).toBeInTheDocument();
    externalEngine.destroy();
  });

  it('throws when both achievements and engine props are provided', () => {
    const externalEngine = new AchievementEngine({
      achievements: simpleConfig,
      eventMapping,
      storage: StorageType.Memory,
    });

    expect(() => {
      render(
        <AchievementProvider achievements={simpleConfig} engine={externalEngine}>
          <div>Test</div>
        </AchievementProvider>
      );
    }).toThrow('Cannot provide both "achievements" and "engine" props to AchievementProvider');

    externalEngine.destroy();
  });

  it('throws when neither achievements nor engine is provided', () => {
    expect(() => {
      render(
        <AchievementProvider>
          <div>Test</div>
        </AchievementProvider>
      );
    }).toThrow('AchievementProvider requires either "achievements" or "engine" prop');
  });
});
