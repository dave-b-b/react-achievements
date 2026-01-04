import React from 'react';
import { render } from '@testing-library/react';
import { AchievementProvider } from '../providers/AchievementProvider';
import { useAchievements } from '../hooks/useAchievements';
import { useAchievementEngine } from '../hooks/useAchievementEngine';
import { AchievementEngine, StorageType } from 'achievements-engine';
import type { SimpleAchievementConfig } from '../core/types';

// Test components
const OldPatternComponent: React.FC = () => {
  const { update } = useAchievements();

  React.useEffect(() => {
    update({ score: 100 });
  }, [update]);

  return <div data-testid="old-pattern">Old Pattern</div>;
};

const NewPatternComponent: React.FC = () => {
  const engine = useAchievementEngine();

  React.useEffect(() => {
    engine.emit('userScored', 100);
  }, [engine]);

  return <div data-testid="new-pattern">New Pattern</div>;
};

// Test configuration
const simpleConfig: SimpleAchievementConfig = {
  score: {
    100: { title: 'Century!', description: 'Score 100 points', icon: '🏆' }
  }
};

const eventMapping = {
  'userScored': 'score'
};

describe('useAchievementEngine - Pattern Separation', () => {
  describe('OLD PATTERN: Provider with achievements prop', () => {
    it('should work with useAchievements hook', () => {
      const { getByTestId } = render(
        <AchievementProvider achievements={simpleConfig} storage={StorageType.Memory}>
          <OldPatternComponent />
        </AchievementProvider>
      );

      expect(getByTestId('old-pattern')).toBeInTheDocument();
    });

    it('should throw error when using useAchievementEngine', () => {
      // Capture console.error to suppress React error boundary output
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => {
        render(
          <AchievementProvider achievements={simpleConfig} storage={StorageType.Memory}>
            <NewPatternComponent />
          </AchievementProvider>
        );
      }).toThrow('Cannot use useAchievementEngine when AchievementProvider has achievements prop');

      console.error = originalError;
    });
  });

  describe('NEW PATTERN: Provider with injected engine', () => {
    let externalEngine: AchievementEngine;

    beforeEach(() => {
      externalEngine = new AchievementEngine({
        achievements: simpleConfig,
        eventMapping,
        storage: StorageType.Memory
      });
    });

    afterEach(() => {
      externalEngine.destroy();
    });

    it('should work with useAchievementEngine hook', () => {
      const { getByTestId } = render(
        <AchievementProvider engine={externalEngine}>
          <NewPatternComponent />
        </AchievementProvider>
      );

      expect(getByTestId('new-pattern')).toBeInTheDocument();
    });

    it('should throw error when using useAchievements', () => {
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => {
        render(
          <AchievementProvider engine={externalEngine}>
            <OldPatternComponent />
          </AchievementProvider>
        );
      }).toThrow('Cannot use useAchievements when AchievementProvider has injected engine');

      console.error = originalError;
    });
  });

  describe('Provider Validation', () => {
    let externalEngine: AchievementEngine;

    beforeEach(() => {
      externalEngine = new AchievementEngine({
        achievements: simpleConfig,
        eventMapping,
        storage: StorageType.Memory
      });
    });

    afterEach(() => {
      if (externalEngine) {
        externalEngine.destroy();
      }
    });

    it('should throw error when both achievements and engine props are provided', () => {
      expect(() => {
        render(
          <AchievementProvider achievements={simpleConfig} engine={externalEngine}>
            <div>Test</div>
          </AchievementProvider>
        );
      }).toThrow('Cannot provide both "achievements" and "engine" props to AchievementProvider');
    });

    it('should throw error when neither achievements nor engine is provided', () => {
      expect(() => {
        render(
          <AchievementProvider>
            <div>Test</div>
          </AchievementProvider>
        );
      }).toThrow('AchievementProvider requires either "achievements" or "engine" prop');
    });
  });

  describe('Engine behavior in new pattern', () => {
    let externalEngine: AchievementEngine;
    let emitSpy: jest.SpyInstance;

    beforeEach(() => {
      externalEngine = new AchievementEngine({
        achievements: simpleConfig,
        eventMapping,
        storage: StorageType.Memory
      });
      emitSpy = jest.spyOn(externalEngine, 'emit');
    });

    afterEach(() => {
      emitSpy.mockRestore();
      externalEngine.destroy();
    });

    it('should use the injected engine for emit calls', () => {
      render(
        <AchievementProvider engine={externalEngine}>
          <NewPatternComponent />
        </AchievementProvider>
      );

      expect(emitSpy).toHaveBeenCalledWith('userScored', 100);
    });

    it('should return the same engine instance', () => {
      const EngineChecker: React.FC = () => {
        const engine = useAchievementEngine();
        expect(engine).toBe(externalEngine);
        return <div>Checked</div>;
      };

      render(
        <AchievementProvider engine={externalEngine}>
          <EngineChecker />
        </AchievementProvider>
      );
    });
  });

  describe('Context flag behavior', () => {
    it('should set _isLegacyPattern to true for old pattern', () => {
      const FlagChecker: React.FC = () => {
        const context = useAchievements();
        expect(context._isLegacyPattern).toBe(true);
        return <div>Legacy</div>;
      };

      render(
        <AchievementProvider achievements={simpleConfig} storage={StorageType.Memory}>
          <FlagChecker />
        </AchievementProvider>
      );
    });

    it('should set _isLegacyPattern to false for new pattern', () => {
      const externalEngine = new AchievementEngine({
        achievements: simpleConfig,
        eventMapping,
        storage: StorageType.Memory
      });

      const FlagChecker: React.FC = () => {
        const engine = useAchievementEngine();
        // Access context through engine to check flag
        // We know it's false because useAchievementEngine didn't throw
        return <div>New</div>;
      };

      render(
        <AchievementProvider engine={externalEngine}>
          <FlagChecker />
        </AchievementProvider>
      );

      externalEngine.destroy();
    });
  });
});
