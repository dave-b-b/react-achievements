import { SimpleAchievementConfig } from '../core/types';

/**
 * Helper interface for cleaner achievement definitions
 */
export interface AchievementDefinition {
  title: string;
  description?: string;
  icon?: string;
}

/**
 * Creates a Simple Achievement configuration with helper functions for common patterns.
 * This provides a cleaner, less error-prone way to define achievements.
 */
export class AchievementBuilder {
  private config: SimpleAchievementConfig = {};

  /**
   * Create a new achievement builder instance
   * @returns New AchievementBuilder instance for fluent configuration
   */
  static create(): AchievementBuilder {
    return new AchievementBuilder();
  }

  /**
   * Create score-based achievements quickly
   * @param thresholds - Array of [score, title, icon?] tuples
   * @returns Achievement configuration for score metric
   */
  static score(thresholds: [number, string, string?][]): SimpleAchievementConfig {
    return AchievementBuilder.create()
      .thresholds('score', thresholds.map(([threshold, title, icon]) => [
        threshold, 
        { title, description: `Score ${threshold} points`, icon: icon || '🏆' }
      ]))
      .build();
  }

  /**
   * Create level-based achievements quickly
   * @param thresholds - Array of [level, title, icon?] tuples
   * @returns Achievement configuration for level metric
   */
  static level(thresholds: [number, string, string?][]): SimpleAchievementConfig {
    return AchievementBuilder.create()
      .thresholds('level', thresholds.map(([threshold, title, icon]) => [
        threshold,
        { title, description: `Reach level ${threshold}`, icon: icon || '📈' }
      ]))
      .build();
  }

  /**
   * Create a tutorial completion achievement
   * @param title - Achievement title (defaults to "Tutorial Master")
   * @param icon - Achievement icon (defaults to "📚")
   * @returns Achievement configuration for completedTutorial metric
   */
  static tutorial(title = 'Tutorial Master', icon = '📚'): SimpleAchievementConfig {
    return AchievementBuilder.create()
      .boolean('completedTutorial', { title, description: 'Complete the tutorial', icon })
      .build();
  }

  /**
   * Add threshold-based achievements for numeric metrics
   * @param metric - The metric name (e.g., 'score', 'level', 'points')
   * @param achievements - Array of [threshold, definition] tuples
   */
  thresholds(metric: string, achievements: [number, AchievementDefinition][]): AchievementBuilder {
    if (!this.config[metric]) {
      this.config[metric] = {};
    }
    
    achievements.forEach(([threshold, def]) => {
      this.config[metric][threshold] = {
        title: def.title,
        description: def.description || `Reach ${threshold} ${metric}`,
        icon: def.icon || '🏆'
      };
    });
    
    return this;
  }

  /**
   * Add a single threshold achievement
   * @param metric - The metric name
   * @param threshold - The threshold value
   * @param definition - Achievement details
   */
  threshold(metric: string, threshold: number, definition: AchievementDefinition): AchievementBuilder {
    return this.thresholds(metric, [[threshold, definition]]);
  }

  /**
   * Add a boolean achievement (triggered when metric becomes true)
   * @param metric - The metric name (e.g., 'completedTutorial', 'firstLogin')
   * @param definition - Achievement details
   */
  boolean(metric: string, definition: AchievementDefinition): AchievementBuilder {
    if (!this.config[metric]) {
      this.config[metric] = {};
    }
    
    this.config[metric].true = {
      title: definition.title,
      description: definition.description || `Complete ${metric}`,
      icon: definition.icon || '✅'
    };
    
    return this;
  }

  /**
   * Add value-based achievements for string metrics
   * @param metric - The metric name (e.g., 'characterClass', 'difficulty')
   * @param achievements - Object mapping values to definitions
   */
  values(metric: string, achievements: Record<string, AchievementDefinition>): AchievementBuilder {
    if (!this.config[metric]) {
      this.config[metric] = {};
    }
    
    Object.entries(achievements).forEach(([value, def]) => {
      this.config[metric][value] = {
        title: def.title,
        description: def.description || `Choose ${value} for ${metric}`,
        icon: def.icon || '🎯'
      };
    });
    
    return this;
  }

  /**
   * Add a single value-based achievement
   * @param metric - The metric name
   * @param value - The value to match
   * @param definition - Achievement details
   */
  value(metric: string, value: string, definition: AchievementDefinition): AchievementBuilder {
    return this.values(metric, { [value]: definition });
  }

  /**
   * Add a custom condition achievement for complex logic
   * @param id - Unique identifier for this achievement
   * @param definition - Achievement details with condition function
   * @param condition - Function that determines if achievement is unlocked
   */
  custom(
    id: string, 
    definition: AchievementDefinition, 
    condition: (metrics: Record<string, any>) => boolean
  ): AchievementBuilder {
    if (!this.config[id]) {
      this.config[id] = {};
    }
    
    this.config[id].custom = {
      title: definition.title,
      description: definition.description || `Achieve ${definition.title}`,
      icon: definition.icon || '💎',
      condition
    };
    
    return this;
  }

  /**
   * Get the final achievement configuration
   */
  build(): SimpleAchievementConfig {
    return { ...this.config };
  }
}