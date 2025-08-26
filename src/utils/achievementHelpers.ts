import { SimpleAchievementConfig, AchievementMetricValue, AchievementState } from '../core/types';

/**
 * Helper interface for cleaner achievement award definitions
 */
export interface AwardDetails {
  title?: string;
  description?: string;
  icon?: string;
}

/**
 * Base class for chainable achievement configuration (Tier 2)
 */
abstract class Achievement {
  protected metric: string;
  protected award: AwardDetails;

  constructor(metric: string, defaultAward: AwardDetails) {
    this.metric = metric;
    this.award = defaultAward;
  }

  /**
   * Customize the award details for this achievement
   * @param award - Custom award details
   * @returns This achievement for chaining
   */
  withAward(award: AwardDetails): Achievement {
    this.award = { ...this.award, ...award };
    return this;
  }

  /**
   * Convert this achievement to a SimpleAchievementConfig
   */
  abstract toConfig(): SimpleAchievementConfig;
}

/**
 * Threshold-based achievement (score, level, etc.)
 */
class ThresholdAchievement extends Achievement {
  private threshold: number;

  constructor(metric: string, threshold: number, defaultAward: AwardDetails) {
    super(metric, defaultAward);
    this.threshold = threshold;
  }

  toConfig(): SimpleAchievementConfig {
    return {
      [this.metric]: {
        [this.threshold]: {
          title: this.award.title!,
          description: this.award.description!,
          icon: this.award.icon!
        }
      }
    };
  }
}

/**
 * Boolean achievement (tutorial completion, first login, etc.)
 */
class BooleanAchievement extends Achievement {
  toConfig(): SimpleAchievementConfig {
    return {
      [this.metric]: {
        true: {
          title: this.award.title!,
          description: this.award.description!,
          icon: this.award.icon!
        }
      }
    };
  }
}

/**
 * Value-based achievement (character class, difficulty, etc.)
 */
class ValueAchievement extends Achievement {
  private value: string;

  constructor(metric: string, value: string, defaultAward: AwardDetails) {
    super(metric, defaultAward);
    this.value = value;
  }

  toConfig(): SimpleAchievementConfig {
    return {
      [this.metric]: {
        [this.value]: {
          title: this.award.title!,
          description: this.award.description!,
          icon: this.award.icon!
        }
      }
    };
  }
}

/**
 * Complex achievement builder for power users (Tier 3)
 */
class ComplexAchievementBuilder {
  private id: string = '';
  private metric: string = '';
  private condition: ((value: AchievementMetricValue, state: AchievementState) => boolean) | null = null;
  private award: AwardDetails = {};

  /**
   * Set the unique identifier for this achievement
   */
  withId(id: string): ComplexAchievementBuilder {
    this.id = id;
    return this;
  }

  /**
   * Set the metric this achievement tracks
   */
  withMetric(metric: string): ComplexAchievementBuilder {
    this.metric = metric;
    return this;
  }

  /**
   * Set the condition function that determines if achievement is unlocked
   */
  withCondition(fn: (value: AchievementMetricValue, state: AchievementState) => boolean): ComplexAchievementBuilder {
    this.condition = fn;
    return this;
  }

  /**
   * Set the award details for this achievement
   */
  withAward(award: AwardDetails): ComplexAchievementBuilder {
    this.award = { ...this.award, ...award };
    return this;
  }

  /**
   * Build the final achievement configuration
   */
  build(): SimpleAchievementConfig {
    if (!this.id || !this.metric || !this.condition) {
      throw new Error('Complex achievement requires id, metric, and condition');
    }

    // Convert our two-parameter condition function to the single-parameter format
    // expected by the existing CustomAchievementDetails type
    const compatibleCondition = (metrics: Record<string, any>) => {
      const state: AchievementState = {
        metrics: {} as any, // We don't have access to the full metrics structure here
        unlockedAchievements: []
      };
      return this.condition!(metrics[this.metric], state);
    };

    return {
      [this.id]: {
        custom: {
          title: this.award.title || this.id,
          description: this.award.description || `Achieve ${this.award.title || this.id}`,
          icon: this.award.icon || '💎',
          condition: compatibleCondition
        }
      }
    };
  }
}

/**
 * Main AchievementBuilder with three-tier API
 * Tier 1: Simple static methods with smart defaults
 * Tier 2: Chainable customization 
 * Tier 3: Full builder for complex logic
 */
export class AchievementBuilder {
  
  // TIER 1: Simple Static Methods (90% of use cases)
  
  /**
   * Create a single score achievement with smart defaults
   * @param threshold - Score threshold to achieve
   * @returns Chainable ThresholdAchievement
   */
  static createScoreAchievement(threshold: number): ThresholdAchievement {
    return new ThresholdAchievement('score', threshold, {
      title: `Score ${threshold}!`,
      description: `Score ${threshold} points`,
      icon: '🏆'
    });
  }

  /**
   * Create multiple score achievements
   * @param thresholds - Array of thresholds or [threshold, award] tuples
   * @returns Complete SimpleAchievementConfig
   */
  static createScoreAchievements(thresholds: (number | [number, AwardDetails])[]): SimpleAchievementConfig {
    const config: SimpleAchievementConfig = { score: {} };
    
    thresholds.forEach(item => {
      if (typeof item === 'number') {
        // Use default award
        config.score![item] = {
          title: `Score ${item}!`,
          description: `Score ${item} points`,
          icon: '🏆'
        };
      } else {
        // Custom award
        const [threshold, award] = item;
        config.score![threshold] = {
          title: award.title || `Score ${threshold}!`,
          description: award.description || `Score ${threshold} points`,
          icon: award.icon || '🏆'
        };
      }
    });
    
    return config;
  }

  /**
   * Create a single level achievement with smart defaults
   * @param level - Level threshold to achieve
   * @returns Chainable ThresholdAchievement
   */
  static createLevelAchievement(level: number): ThresholdAchievement {
    return new ThresholdAchievement('level', level, {
      title: `Level ${level}!`,
      description: `Reach level ${level}`,
      icon: '📈'
    });
  }

  /**
   * Create multiple level achievements
   * @param levels - Array of levels or [level, award] tuples
   * @returns Complete SimpleAchievementConfig
   */
  static createLevelAchievements(levels: (number | [number, AwardDetails])[]): SimpleAchievementConfig {
    const config: SimpleAchievementConfig = { level: {} };
    
    levels.forEach(item => {
      if (typeof item === 'number') {
        // Use default award
        config.level![item] = {
          title: `Level ${item}!`,
          description: `Reach level ${item}`,
          icon: '📈'
        };
      } else {
        // Custom award
        const [level, award] = item;
        config.level![level] = {
          title: award.title || `Level ${level}!`,
          description: award.description || `Reach level ${level}`,
          icon: award.icon || '📈'
        };
      }
    });
    
    return config;
  }

  /**
   * Create a boolean achievement with smart defaults
   * @param metric - The metric name (e.g., 'completedTutorial')
   * @returns Chainable BooleanAchievement
   */
  static createBooleanAchievement(metric: string): BooleanAchievement {
    // Convert camelCase to Title Case
    const formattedMetric = metric.replace(/([A-Z])/g, ' $1').toLowerCase();
    const titleCase = formattedMetric.charAt(0).toUpperCase() + formattedMetric.slice(1);
    return new BooleanAchievement(metric, {
      title: `${titleCase}!`,
      description: `Complete ${formattedMetric}`,
      icon: '✅'
    });
  }

  /**
   * Create a value-based achievement with smart defaults
   * @param metric - The metric name (e.g., 'characterClass')
   * @param value - The value to match (e.g., 'wizard')
   * @returns Chainable ValueAchievement
   */
  static createValueAchievement(metric: string, value: string): ValueAchievement {
    const formattedValue = value.charAt(0).toUpperCase() + value.slice(1);
    return new ValueAchievement(metric, value, {
      title: `${formattedValue}!`,
      description: `Choose ${formattedValue.toLowerCase()} for ${metric}`,
      icon: '🎯'
    });
  }

  // TIER 3: Full Builder for Complex Logic
  
  /**
   * Create a complex achievement builder for power users
   * @returns ComplexAchievementBuilder for full control
   */
  static create(): ComplexAchievementBuilder {
    return new ComplexAchievementBuilder();
  }

  // UTILITY METHODS
  
  /**
   * Combine multiple achievement configurations
   * @param achievements - Array of SimpleAchievementConfig objects or Achievement instances
   * @returns Combined SimpleAchievementConfig
   */
  static combine(achievements: (SimpleAchievementConfig | Achievement)[]): SimpleAchievementConfig {
    const combined: SimpleAchievementConfig = {};
    
    achievements.forEach(achievement => {
      const config = achievement instanceof Achievement ? achievement.toConfig() : achievement;
      Object.keys(config).forEach(key => {
        if (!combined[key]) {
          combined[key] = {};
        }
        Object.assign(combined[key], config[key]);
      });
    });
    
    return combined;
  }
}