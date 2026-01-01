import { AchievementBuilder, AwardDetails } from '../index';

describe('Builder re-export from achievements-engine', () => {
  it('should re-export AchievementBuilder correctly', () => {
    expect(AchievementBuilder).toBeDefined();
    expect(AchievementBuilder.createScoreAchievement).toBeDefined();
    expect(AchievementBuilder.createLevelAchievement).toBeDefined();
    expect(AchievementBuilder.createBooleanAchievement).toBeDefined();
    expect(AchievementBuilder.createValueAchievement).toBeDefined();
    expect(AchievementBuilder.create).toBeDefined();
    expect(AchievementBuilder.combine).toBeDefined();
  });

  it('should work with the builder API', () => {
    const config = AchievementBuilder.createScoreAchievement(100).toConfig();
    expect(config.score).toBeDefined();
    expect(config.score![100]).toBeDefined();
    expect(config.score![100].title).toBe('Score 100!');
    expect(config.score![100].description).toBe('Score 100 points');
    expect(config.score![100].icon).toBe('🏆');
  });

  it('should support chainable customization', () => {
    const config = AchievementBuilder.createScoreAchievement(500)
      .withAward({ title: 'High Scorer!', icon: '⭐' })
      .toConfig();

    expect(config.score![500].title).toBe('High Scorer!');
    expect(config.score![500].icon).toBe('⭐');
  });

  it('should support combining multiple achievements', () => {
    const scoreAchievement = AchievementBuilder.createScoreAchievement(100);
    const levelAchievement = AchievementBuilder.createLevelAchievement(5);

    const combined = AchievementBuilder.combine([scoreAchievement, levelAchievement]);

    expect(combined.score).toBeDefined();
    expect(combined.level).toBeDefined();
    expect(combined.score![100]).toBeDefined();
    expect(combined.level![5]).toBeDefined();
  });

  it('should work with complex builder API', () => {
    const config = AchievementBuilder.create()
      .withMetric('testMetric')
      .withCondition((metrics: Record<string, any>) => metrics.testMetric === 'success')
      .withAward({
        title: 'Test Achievement',
        description: 'A test achievement',
        icon: '🎯'
      })
      .build();

    expect(config.testMetric).toBeDefined();
    expect(config.testMetric.custom).toBeDefined();
    expect(config.testMetric.custom?.title).toBe('Test Achievement');
  });
});