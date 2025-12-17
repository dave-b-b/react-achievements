import { AchievementBuilder } from '../utils/achievementHelpers';
import { CustomAchievementDetails } from '../core/types';

describe('AchievementBuilder - Three-Tier API', () => {
  
  describe('Tier 1: Simple Static Methods', () => {
    
    describe('createScoreAchievement', () => {
      it('should create single score achievement with smart defaults', () => {
        const achievement = AchievementBuilder.createScoreAchievement(100);
        const config = achievement.toConfig();

        expect(config).toEqual({
          score: {
            100: {
              title: 'Score 100!',
              description: 'Score 100 points',
              icon: '🏆'
            }
          }
        });
      });

      it('should support chainable award customization', () => {
        const achievement = AchievementBuilder.createScoreAchievement(100)
          .withAward({ title: 'Century!', description: 'Amazing!', icon: '🎉' });
        const config = achievement.toConfig();

        expect(config).toEqual({
          score: {
            100: {
              title: 'Century!',
              description: 'Amazing!',
              icon: '🎉'
            }
          }
        });
      });
    });

    describe('createScoreAchievements', () => {
      it('should create multiple score achievements with defaults', () => {
        const config = AchievementBuilder.createScoreAchievements([100, 500]);

        expect(config).toEqual({
          score: {
            100: {
              title: 'Score 100!',
              description: 'Score 100 points',
              icon: '🏆'
            },
            500: {
              title: 'Score 500!',
              description: 'Score 500 points',
              icon: '🏆'
            }
          }
        });
      });

      it('should create mixed achievements (some default, some custom)', () => {
        const config = AchievementBuilder.createScoreAchievements([
          100, // default
          [500, { title: 'High Scorer!', icon: '⭐' }], // custom
          1000 // default
        ]);

        expect(config).toEqual({
          score: {
            100: {
              title: 'Score 100!',
              description: 'Score 100 points',
              icon: '🏆'
            },
            500: {
              title: 'High Scorer!',
              description: 'Score 500 points',
              icon: '⭐'
            },
            1000: {
              title: 'Score 1000!',
              description: 'Score 1000 points',
              icon: '🏆'
            }
          }
        });
      });
    });

    describe('createLevelAchievement', () => {
      it('should create single level achievement with smart defaults', () => {
        const achievement = AchievementBuilder.createLevelAchievement(5);
        const config = achievement.toConfig();

        expect(config).toEqual({
          level: {
            5: {
              title: 'Level 5!',
              description: 'Reach level 5',
              icon: '📈'
            }
          }
        });
      });
    });

    describe('createLevelAchievements', () => {
      it('should create multiple level achievements', () => {
        const config = AchievementBuilder.createLevelAchievements([
          5,
          [10, { title: 'Expert!', icon: '🎯' }]
        ]);

        expect(config).toEqual({
          level: {
            5: {
              title: 'Level 5!',
              description: 'Reach level 5',
              icon: '📈'
            },
            10: {
              title: 'Expert!',
              description: 'Reach level 10',
              icon: '🎯'
            }
          }
        });
      });
    });

    describe('createBooleanAchievement', () => {
      it('should create boolean achievement with smart defaults', () => {
        const achievement = AchievementBuilder.createBooleanAchievement('completedTutorial');
        const config = achievement.toConfig();

        expect(config).toEqual({
          completedTutorial: {
            true: {
              title: 'Completed tutorial!',
              description: 'Complete completed tutorial',
              icon: '✅'
            }
          }
        });
      });

      it('should format camelCase metrics nicely', () => {
        const achievement = AchievementBuilder.createBooleanAchievement('firstLogin');
        const config = achievement.toConfig();

        expect(config).toEqual({
          firstLogin: {
            true: {
              title: 'First login!',
              description: 'Complete first login',
              icon: '✅'
            }
          }
        });
      });
    });

    describe('createValueAchievement', () => {
      it('should create value achievement with smart defaults', () => {
        const achievement = AchievementBuilder.createValueAchievement('characterClass', 'wizard');
        const config = achievement.toConfig();

        expect(config).toEqual({
          characterClass: {
            wizard: {
              title: 'Wizard!',
              description: 'Choose wizard for characterClass',
              icon: '🎯'
            }
          }
        });
      });
    });
  });

  describe('Tier 2: Chainable Customization', () => {
    
    describe('combine', () => {
      it('should combine multiple achievement configurations', () => {
        const scoreAchievement = AchievementBuilder.createScoreAchievement(100);
        const levelAchievement = AchievementBuilder.createLevelAchievement(5)
          .withAward({ title: 'Getting Started!', icon: '🌱' });

        const combined = AchievementBuilder.combine([scoreAchievement, levelAchievement]);

        expect(combined).toEqual({
          score: {
            100: {
              title: 'Score 100!',
              description: 'Score 100 points',
              icon: '🏆'
            }
          },
          level: {
            5: {
              title: 'Getting Started!',
              description: 'Reach level 5',
              icon: '🌱'
            }
          }
        });
      });

      it('should combine SimpleAchievementConfig objects', () => {
        const scoreConfig = AchievementBuilder.createScoreAchievements([100, 500]);
        const levelConfig = AchievementBuilder.createLevelAchievements([5, 10]);

        const combined = AchievementBuilder.combine([scoreConfig, levelConfig]);

        expect(combined.score).toBeDefined();
        expect(combined.level).toBeDefined();
        expect(combined.score![100]).toEqual({
          title: 'Score 100!',
          description: 'Score 100 points',
          icon: '🏆'
        });
        expect(combined.level![5]).toEqual({
          title: 'Level 5!',
          description: 'Reach level 5',
          icon: '📈'
        });
      });
    });
  });

  describe('Tier 3: Complex Builder', () => {
    
    describe('ComplexAchievementBuilder', () => {
      it('should create complex achievement with full control', () => {
        const config = AchievementBuilder.create()
          .withId('weekly_login')
          .withMetric('lastLoginDate')
          .withCondition((value, _state) => {
            if (value instanceof Date) {
              return value.getTime() > Date.now() - (7 * 24 * 60 * 60 * 1000);
            }
            return false;
          })
          .withAward({
            title: 'Weekly Warrior',
            description: 'Logged in within the last week',
            icon: '📅'
          })
          .build();

        expect(config).toEqual({
          weekly_login: {
            custom: {
              title: 'Weekly Warrior',
              description: 'Logged in within the last week',
              icon: '📅',
              condition: expect.any(Function)
            }
          }
        });

        // Test the condition function (note: it now receives metrics object)
        const condition = (config.weekly_login.custom as CustomAchievementDetails).condition;
        expect(condition).toBeDefined();
        
        // Test with Date within 7 days
        const recentDate = new Date(Date.now() - (3 * 24 * 60 * 60 * 1000)); // 3 days ago
        expect(condition({ lastLoginDate: recentDate })).toBe(true);
        
        // Test with old Date
        const oldDate = new Date(Date.now() - (10 * 24 * 60 * 60 * 1000)); // 10 days ago
        expect(condition({ lastLoginDate: oldDate })).toBe(false);
        
        // Test with null
        expect(condition({ lastLoginDate: null })).toBe(false);
      });

      it('should throw error if required fields are missing', () => {
        expect(() => {
          AchievementBuilder.create().build();
        }).toThrow('Complex achievement requires id, metric, and condition');
      });

      it('should use default values when award details are not provided', () => {
        const config = AchievementBuilder.create()
          .withId('test_achievement')
          .withMetric('testMetric')
          .withCondition(() => true)
          .build();

        expect(config).toEqual({
          test_achievement: {
            custom: {
              title: 'test_achievement',
              description: 'Achieve test_achievement',
              icon: '💎',
              condition: expect.any(Function)
            }
          }
        });
      });
    });
  });
});