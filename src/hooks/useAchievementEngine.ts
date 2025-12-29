import { useContext } from 'react';
import { AchievementContext } from '../providers/AchievementProvider';
import type { AchievementEngine } from 'achievements-engine';

/**
 * Hook to access the AchievementEngine instance directly
 * Enables event-based tracking with emit() and advanced engine features
 *
 * @example
 * ```tsx
 * const engine = useAchievementEngine();
 *
 * // Event-based tracking
 * engine.emit('levelUp', 5);
 * engine.emit('scoreChanged', 100);
 *
 * // Subscribe to events
 * useEffect(() => {
 *   const unsubscribe = engine.on('achievement:unlocked', (event) => {
 *     console.log('Achievement unlocked:', event.achievementTitle);
 *   });
 *   return unsubscribe;
 * }, []);
 * ```
 *
 * @returns AchievementEngine instance
 * @throws Error if used outside AchievementProvider
 * @since 3.8.0
 */
export const useAchievementEngine = (): AchievementEngine => {
  const context = useContext(AchievementContext);

  if (!context) {
    throw new Error('useAchievementEngine must be used within an AchievementProvider');
  }

  // Engine is always available (initialized synchronously)
  return context.engine;
};
