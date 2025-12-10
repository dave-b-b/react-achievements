import React from 'react';
import { render, act } from '@testing-library/react';
import { AchievementProvider } from '../providers/AchievementProvider';
import { useAchievements } from '../hooks/useAchievements';
import { AchievementError, StorageQuotaError, isAchievementError } from '../core/errors/AchievementErrors';
import { AchievementStorage, AchievementMetrics, StorageType } from '../core/types';

describe('Error Handling Integration', () => {
  describe('onError Callback', () => {
    it('should call onError callback when storage quota exceeded', () => {
      const onErrorMock = jest.fn();

      // Create a custom storage that throws quota error
      class QuotaExceededStorage implements AchievementStorage {
        getMetrics(): AchievementMetrics {
          return {};
        }

        setMetrics(metrics: AchievementMetrics): void {
          throw new StorageQuotaError(1000);
        }

        getUnlockedAchievements(): string[] {
          return [];
        }

        setUnlockedAchievements(achievements: string[]): void {
          // OK
        }

        clear(): void {
          // OK
        }
      }

      const TestComponent = () => {
        const { update } = useAchievements();

        return (
          <button onClick={() => update({ score: 100 })} data-testid="trigger-error">
            Trigger Error
          </button>
        );
      };

      const achievements = {
        score: {
          100: { title: 'Test', icon: '🏆' }
        }
      };

      const { getByTestId } = render(
        <AchievementProvider
          achievements={achievements}
          storage={new QuotaExceededStorage()}
          onError={onErrorMock}
        >
          <TestComponent />
        </AchievementProvider>
      );

      // Trigger the error
      act(() => {
        getByTestId('trigger-error').click();
      });

      // Verify onError was called
      expect(onErrorMock).toHaveBeenCalled();
      expect(onErrorMock).toHaveBeenCalledWith(expect.any(StorageQuotaError));

      // Verify the error has correct properties
      const calledError = onErrorMock.mock.calls[0][0];
      expect(isAchievementError(calledError)).toBe(true);
      expect(calledError.code).toBe('STORAGE_QUOTA_EXCEEDED');
      expect(calledError.recoverable).toBe(true);
    });

    it('should provide error with remedy information', () => {
      const onErrorMock = jest.fn();

      class FailingStorage implements AchievementStorage {
        getMetrics(): AchievementMetrics {
          return {};
        }

        setMetrics(metrics: AchievementMetrics): void {
          throw new StorageQuotaError(5000);
        }

        getUnlockedAchievements(): string[] {
          return [];
        }

        setUnlockedAchievements(achievements: string[]): void {
          // OK
        }

        clear(): void {
          // OK
        }
      }

      const TestComponent = () => {
        const { update } = useAchievements();

        return (
          <button onClick={() => update({ score: 100 })} data-testid="trigger">
            Update
          </button>
        );
      };

      const achievements = {
        score: {
          100: { title: 'Test', icon: '🏆' }
        }
      };

      const { getByTestId } = render(
        <AchievementProvider
          achievements={achievements}
          storage={new FailingStorage()}
          onError={onErrorMock}
        >
          <TestComponent />
        </AchievementProvider>
      );

      act(() => {
        getByTestId('trigger').click();
      });

      const error = onErrorMock.mock.calls[0][0];
      expect(error.remedy).toBeDefined();
      expect(error.remedy).toContain('storage');
    });

    it('should continue functioning after recoverable error', () => {
      const onErrorMock = jest.fn();
      let callCount = 0;

      // Storage that fails first time, then succeeds
      class FlakyStorage implements AchievementStorage {
        private data: AchievementMetrics = {};

        getMetrics(): AchievementMetrics {
          return this.data;
        }

        setMetrics(metrics: AchievementMetrics): void {
          callCount++;
          if (callCount === 1) {
            throw new StorageQuotaError(1000);
          }
          this.data = metrics;
        }

        getUnlockedAchievements(): string[] {
          return [];
        }

        setUnlockedAchievements(achievements: string[]): void {
          // OK
        }

        clear(): void {
          this.data = {};
        }
      }

      const TestComponent = () => {
        const { update, getState } = useAchievements();

        return (
          <div>
            <button onClick={() => update({ score: 100 })} data-testid="update">
              Update
            </button>
            <div data-testid="state">{JSON.stringify(getState())}</div>
          </div>
        );
      };

      const achievements = {
        score: {
          100: { title: 'Test', icon: '🏆' }
        }
      };

      const { getByTestId } = render(
        <AchievementProvider
          achievements={achievements}
          storage={new FlakyStorage()}
          onError={onErrorMock}
        >
          <TestComponent />
        </AchievementProvider>
      );

      // First update - should trigger error
      act(() => {
        getByTestId('update').click();
      });

      expect(onErrorMock).toHaveBeenCalledTimes(1);

      // Second update - should succeed
      act(() => {
        getByTestId('update').click();
      });

      // Should still only have been called once
      expect(onErrorMock).toHaveBeenCalledTimes(1);
    });

    it('should not call onError if no error occurs', () => {
      const onErrorMock = jest.fn();

      const TestComponent = () => {
        const { update } = useAchievements();

        return (
          <button onClick={() => update({ score: 100 })} data-testid="update">
            Update
          </button>
        );
      };

      const achievements = {
        score: {
          100: { title: 'Test', icon: '🏆' }
        }
      };

      const { getByTestId } = render(
        <AchievementProvider
          achievements={achievements}
          storage={StorageType.Memory}
          onError={onErrorMock}
        >
          <TestComponent />
        </AchievementProvider>
      );

      act(() => {
        getByTestId('update').click();
      });

      expect(onErrorMock).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling Without onError Callback', () => {
    it('should log to console when no onError provided', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      class FailingStorage implements AchievementStorage {
        getMetrics(): AchievementMetrics {
          return {};
        }

        setMetrics(metrics: AchievementMetrics): void {
          throw new StorageQuotaError(1000);
        }

        getUnlockedAchievements(): string[] {
          return [];
        }

        setUnlockedAchievements(achievements: string[]): void {
          // OK
        }

        clear(): void {
          // OK
        }
      }

      const TestComponent = () => {
        const { update } = useAchievements();

        return (
          <button onClick={() => update({ score: 100 })} data-testid="trigger">
            Update
          </button>
        );
      };

      const achievements = {
        score: {
          100: { title: 'Test', icon: '🏆' }
        }
      };

      const { getByTestId } = render(
        <AchievementProvider
          achievements={achievements}
          storage={new FailingStorage()}
        >
          <TestComponent />
        </AchievementProvider>
      );

      act(() => {
        getByTestId('trigger').click();
      });

      // Should have logged the error
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should not crash the app when error occurs', () => {
      class FailingStorage implements AchievementStorage {
        getMetrics(): AchievementMetrics {
          return {};
        }

        setMetrics(metrics: AchievementMetrics): void {
          throw new StorageQuotaError(1000);
        }

        getUnlockedAchievements(): string[] {
          return [];
        }

        setUnlockedAchievements(achievements: string[]): void {
          // OK
        }

        clear(): void {
          // OK
        }
      }

      const TestComponent = () => {
        const { update } = useAchievements();

        return (
          <button onClick={() => update({ score: 100 })} data-testid="trigger">
            Update
          </button>
        );
      };

      const achievements = {
        score: {
          100: { title: 'Test', icon: '🏆' }
        }
      };

      // Should not throw
      expect(() => {
        const { getByTestId } = render(
          <AchievementProvider
            achievements={achievements}
            storage={new FailingStorage()}
          >
            <TestComponent />
          </AchievementProvider>
        );

        act(() => {
          getByTestId('trigger').click();
        });
      }).not.toThrow();
    });
  });

  describe('Error Information for Users', () => {
    it('should provide actionable error information', () => {
      const onErrorMock = jest.fn();

      class QuotaStorage implements AchievementStorage {
        getMetrics(): AchievementMetrics {
          return {};
        }

        setMetrics(metrics: AchievementMetrics): void {
          throw new StorageQuotaError(10000);
        }

        getUnlockedAchievements(): string[] {
          return [];
        }

        setUnlockedAchievements(achievements: string[]): void {
          // OK
        }

        clear(): void {
          // OK
        }
      }

      const TestComponent = () => {
        const { update } = useAchievements();

        return (
          <button onClick={() => update({ score: 100 })} data-testid="trigger">
            Update
          </button>
        );
      };

      const achievements = {
        score: {
          100: { title: 'Test', icon: '🏆' }
        }
      };

      const { getByTestId } = render(
        <AchievementProvider
          achievements={achievements}
          storage={new QuotaStorage()}
          onError={onErrorMock}
        >
          <TestComponent />
        </AchievementProvider>
      );

      act(() => {
        getByTestId('trigger').click();
      });

      const error: AchievementError = onErrorMock.mock.calls[0][0];

      // Should have all necessary information for user display
      expect(error.message).toBeTruthy();
      expect(error.code).toBeTruthy();
      expect(error.remedy).toBeTruthy();
      expect(typeof error.recoverable).toBe('boolean');

      // Error should be user-friendly
      expect(error.message).not.toMatch(/undefined|null/);
      expect(error.remedy).not.toMatch(/undefined|null/);
    });
  });
});
