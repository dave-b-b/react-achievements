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
     * Increment a numeric metric by a specified amount
     * @param metric - The metric name (e.g., 'buttonClicks', 'score')
     * @param amount - The amount to increment by (defaults to 1)
     */
    increment: (metric: string, amount: number = 1) => {
      const currentState = getState();
      const currentMetricArray = currentState.metrics[metric] || [0];
      const currentValue = Array.isArray(currentMetricArray) ? currentMetricArray[0] : currentMetricArray;
      const newValue = (typeof currentValue === 'number' ? currentValue : 0) + amount;
      update({ [metric]: newValue });
    },
    
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