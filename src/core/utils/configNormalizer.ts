import { 
    AchievementConfiguration, 
    SimpleAchievementConfig, 
    AchievementConfigurationType,
    SimpleAchievementDetails,
    CustomAchievementDetails,
    AchievementCondition
} from '../types';

// Type guard to check if config is simple format
export function isSimpleConfig(config: AchievementConfigurationType): config is SimpleAchievementConfig {
    if (!config || typeof config !== 'object') return false;
    
    const firstKey = Object.keys(config)[0];
    if (!firstKey) return true; // Empty config is considered simple
    
    const firstValue = config[firstKey];
    
    // Check if it's the current complex format (array of AchievementCondition)
    if (Array.isArray(firstValue)) return false;
    
    // Check if it's the simple format (object with string keys)
    return typeof firstValue === 'object' && !Array.isArray(firstValue);
}

// Generate a unique ID for achievements
function generateId(): string {
    return Math.random().toString(36).substr(2, 9);
}

// Check if achievement details has a custom condition
function hasCustomCondition(details: SimpleAchievementDetails | CustomAchievementDetails): details is CustomAchievementDetails {
    return 'condition' in details && typeof details.condition === 'function';
}

// Convert simple config to complex config format
export function normalizeAchievements(config: AchievementConfigurationType): AchievementConfiguration {
    if (!isSimpleConfig(config)) {
        // Already in complex format, return as-is
        return config as AchievementConfiguration;
    }
    
    const normalized: AchievementConfiguration = {};
    
    Object.entries(config).forEach(([metric, achievements]) => {
        normalized[metric] = Object.entries(achievements).map(([key, achievement]) => {
            if (hasCustomCondition(achievement)) {
                // Custom condition function
                return {
                    isConditionMet: (value, state) => {
                        // Convert internal metrics format (arrays) to simple format for custom conditions
                        const simpleMetrics: Record<string, any> = {};
                        Object.entries(state.metrics).forEach(([key, val]) => {
                            simpleMetrics[key] = Array.isArray(val) ? val[0] : val;
                        });
                        return achievement.condition(simpleMetrics);
                    },
                    achievementDetails: {
                        achievementId: `${metric}_custom_${generateId()}`,
                        achievementTitle: achievement.title,
                        achievementDescription: achievement.description || '',
                        achievementIconKey: achievement.icon || 'default'
                    }
                };
            } else {
                // Threshold-based achievement
                const threshold = parseFloat(key);
                const isValidThreshold = !isNaN(threshold);
                
                let conditionMet: (value: any) => boolean;
                
                if (isValidThreshold) {
                    // Numeric threshold
                    conditionMet = (value) => {
                        const numValue = Array.isArray(value) ? value[0] : value;
                        return typeof numValue === 'number' && numValue >= threshold;
                    };
                } else {
                    // String or boolean threshold
                    conditionMet = (value) => {
                        const actualValue = Array.isArray(value) ? value[0] : value;
                        
                        // Handle boolean thresholds
                        if (key === 'true') return actualValue === true;
                        if (key === 'false') return actualValue === false;
                        
                        // Handle string thresholds
                        return actualValue === key;
                    };
                }
                
                return {
                    isConditionMet: conditionMet,
                    achievementDetails: {
                        achievementId: `${metric}_${key}`,
                        achievementTitle: achievement.title,
                        achievementDescription: achievement.description || (isValidThreshold ? `Reach ${threshold} ${metric}` : `Achieve ${key} for ${metric}`),
                        achievementIconKey: achievement.icon || 'default'
                    }
                } as AchievementCondition;
            }
        });
    });
    
    return normalized;
}