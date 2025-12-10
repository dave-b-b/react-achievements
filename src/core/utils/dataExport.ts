import { AchievementMetrics } from '../types';

/**
 * Structure of exported achievement data
 */
export interface ExportedData {
  version: string;
  timestamp: number;
  metrics: AchievementMetrics;
  unlockedAchievements: string[];
  configHash?: string;
}

/**
 * Exports achievement data to a JSON string
 *
 * @param metrics - Current achievement metrics
 * @param unlocked - Array of unlocked achievement IDs
 * @param configHash - Optional hash of achievement configuration for validation
 * @returns JSON string containing all achievement data
 *
 * @example
 * ```typescript
 * const json = exportAchievementData(metrics, ['score_100', 'level_5']);
 * // Save json to file or send to server
 * ```
 */
export function exportAchievementData(
  metrics: AchievementMetrics,
  unlocked: string[],
  configHash?: string
): string {
  const data: ExportedData = {
    version: '3.3.0',
    timestamp: Date.now(),
    metrics,
    unlockedAchievements: unlocked,
    ...(configHash && { configHash })
  };

  return JSON.stringify(data, null, 2);
}

/**
 * Creates a simple hash of the achievement configuration
 * Used to validate that imported data matches the current configuration
 *
 * @param config - Achievement configuration object
 * @returns Simple hash string
 */
export function createConfigHash(config: any): string {
  // Simple hash based on stringified config
  // In production, you might want to use a more robust hashing algorithm
  const str = JSON.stringify(config);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
}
