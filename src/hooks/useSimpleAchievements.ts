import { useAchievements } from './useAchievements';

/**
 * A simplified hook for achievement tracking.
 * Provides an easier API for common use cases while maintaining access to advanced features.
 */
export const useSimpleAchievements = () => {
  const { update, achievements, reset, getState } = useAchievements();
  
  return {
    /**
     * Track a metric value for achievements
     * @param metric - The metric name (e.g., 'score', 'level')
     * @param value - The metric value
     */
    track: (metric: string, value: any) => update({ [metric]: value }),
    
    /**
     * Track multiple metrics at once
     * @param metrics - Object with metric names as keys and values
     */
    trackMultiple: (metrics: Record<string, any>) => update(metrics),
    
    /**
     * Array of unlocked achievement IDs
     */
    unlocked: achievements.unlocked,
    
    /**
     * All available achievements
     */
    all: achievements.all,
    
    /**
     * Number of unlocked achievements
     */
    unlockedCount: achievements.unlocked.length,
    
    /**
     * Reset all achievement progress
     */
    reset,
    
    /**
     * Get current state (advanced usage)
     */
    getState,
  };
};