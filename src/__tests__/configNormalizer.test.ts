import { normalizeAchievements, isSimpleConfig } from '../core/utils/configNormalizer';
import { SimpleAchievementConfig, AchievementConfiguration } from '../core/types';

describe('configNormalizer', () => {
  describe('isSimpleConfig', () => {
    it('should identify simple config format', () => {
      const simpleConfig: SimpleAchievementConfig = {
        score: {
          100: { title: 'Century!', description: 'Score 100 points', icon: '🏆' }
        }
      };
      
      expect(isSimpleConfig(simpleConfig)).toBe(true);
    });

    it('should identify complex config format', () => {
      const complexConfig: AchievementConfiguration = {
        score: [{
          isConditionMet: (value) => value >= 100,
          achievementDetails: {
            achievementId: 'score_100',
            achievementTitle: 'Century!',
            achievementDescription: 'Score 100 points',
            achievementIconKey: 'trophy'
          }
        }]
      };
      
      expect(isSimpleConfig(complexConfig)).toBe(false);
    });

    it('should handle empty config', () => {
      expect(isSimpleConfig({})).toBe(true); // Empty object is considered simple
    });
  });

  describe('normalizeAchievements', () => {
    it('should convert simple numeric threshold config to complex format', () => {
      const simpleConfig: SimpleAchievementConfig = {
        score: {
          100: { title: 'Century!', description: 'Score 100 points', icon: 'trophy' },
          500: { title: 'High Scorer!', icon: 'star' }
        }
      };

      const normalized = normalizeAchievements(simpleConfig);
      
      expect(normalized.score).toHaveLength(2);
      
      // Test first achievement
      const firstAchievement = normalized.score[0];
      expect(firstAchievement.achievementDetails.achievementTitle).toBe('Century!');
      expect(firstAchievement.achievementDetails.achievementDescription).toBe('Score 100 points');
      expect(firstAchievement.achievementDetails.achievementIconKey).toBe('trophy');
      expect(firstAchievement.achievementDetails.achievementId).toBe('score_100');
      expect(firstAchievement.isConditionMet(100)).toBe(true);
      expect(firstAchievement.isConditionMet(99)).toBe(false);

      // Test second achievement (no description provided)
      const secondAchievement = normalized.score[1];
      expect(secondAchievement.achievementDetails.achievementTitle).toBe('High Scorer!');
      expect(secondAchievement.achievementDetails.achievementDescription).toBe('Reach 500 score');
      expect(secondAchievement.achievementDetails.achievementIconKey).toBe('star');
      expect(secondAchievement.isConditionMet(500)).toBe(true);
      expect(secondAchievement.isConditionMet(499)).toBe(false);
    });

    it('should convert simple boolean threshold config to complex format', () => {
      const simpleConfig: SimpleAchievementConfig = {
        completedTutorial: {
          true: { title: 'Tutorial Master', description: 'Complete the tutorial', icon: 'book' }
        }
      };

      const normalized = normalizeAchievements(simpleConfig);
      
      expect(normalized.completedTutorial).toHaveLength(1);
      
      const achievement = normalized.completedTutorial[0];
      expect(achievement.achievementDetails.achievementTitle).toBe('Tutorial Master');
      expect(achievement.achievementDetails.achievementId).toBe('completedTutorial_true');
      expect(achievement.isConditionMet(true)).toBe(true);
      expect(achievement.isConditionMet(false)).toBe(false);
    });

    it('should convert simple string threshold config to complex format', () => {
      const simpleConfig: SimpleAchievementConfig = {
        characterClass: {
          wizard: { title: 'Arcane Scholar', description: 'Choose the wizard class', icon: 'wand' }
        }
      };

      const normalized = normalizeAchievements(simpleConfig);
      
      expect(normalized.characterClass).toHaveLength(1);
      
      const achievement = normalized.characterClass[0];
      expect(achievement.achievementDetails.achievementTitle).toBe('Arcane Scholar');
      expect(achievement.achievementDetails.achievementId).toBe('characterClass_wizard');
      expect(achievement.isConditionMet('wizard')).toBe(true);
      expect(achievement.isConditionMet('warrior')).toBe(false);
    });

    it('should convert custom condition config to complex format', () => {
      const simpleConfig: SimpleAchievementConfig = {
        combo: {
          custom: {
            title: 'Perfect Combo',
            description: 'Score 1000+ with perfect accuracy',
            icon: 'diamond',
            condition: (metrics) => metrics.score >= 1000 && metrics.accuracy === 100
          }
        }
      };

      const normalized = normalizeAchievements(simpleConfig);
      
      expect(normalized.combo).toHaveLength(1);
      
      const achievement = normalized.combo[0];
      expect(achievement.achievementDetails.achievementTitle).toBe('Perfect Combo');
      expect(achievement.achievementDetails.achievementDescription).toBe('Score 1000+ with perfect accuracy');
      expect(achievement.achievementDetails.achievementIconKey).toBe('diamond');
      expect(achievement.achievementDetails.achievementId).toMatch(/combo_custom_/);
      
      // Test custom condition
      expect(achievement.isConditionMet(null, { metrics: { score: 1000, accuracy: 100 }, unlockedAchievements: [] })).toBe(true);
      expect(achievement.isConditionMet(null, { metrics: { score: 999, accuracy: 100 }, unlockedAchievements: [] })).toBe(false);
      expect(achievement.isConditionMet(null, { metrics: { score: 1000, accuracy: 99 }, unlockedAchievements: [] })).toBe(false);
    });

    it('should handle mixed simple and complex format by passing through complex format unchanged', () => {
      const complexConfig: AchievementConfiguration = {
        score: [{
          isConditionMet: (value) => value >= 100,
          achievementDetails: {
            achievementId: 'score_100',
            achievementTitle: 'Century!',
            achievementDescription: 'Score 100 points',
            achievementIconKey: 'trophy'
          }
        }]
      };

      const normalized = normalizeAchievements(complexConfig);
      
      // Should be unchanged
      expect(normalized).toEqual(complexConfig);
    });

    it('should handle array values in condition checking', () => {
      const simpleConfig: SimpleAchievementConfig = {
        score: {
          100: { title: 'Century!', icon: 'trophy' }
        }
      };

      const normalized = normalizeAchievements(simpleConfig);
      const achievement = normalized.score[0];
      
      // Test with array values (how the system internally stores metrics)
      expect(achievement.isConditionMet([100])).toBe(true);
      expect(achievement.isConditionMet([99])).toBe(false);
      expect(achievement.isConditionMet(100)).toBe(true);
      expect(achievement.isConditionMet(99)).toBe(false);
    });

    it('should provide default values for missing fields', () => {
      const simpleConfig: SimpleAchievementConfig = {
        score: {
          100: { title: 'Century!' } // Missing description and icon
        }
      };

      const normalized = normalizeAchievements(simpleConfig);
      const achievement = normalized.score[0];
      
      expect(achievement.achievementDetails.achievementDescription).toBe('Reach 100 score');
      expect(achievement.achievementDetails.achievementIconKey).toBe('default');
    });
  });
});