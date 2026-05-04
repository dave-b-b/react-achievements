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

  it('should support bulk score and level achievements with optional awards', () => {
    const scoreAwards: (number | [number, AwardDetails])[] = [
      100,
      [500, { title: 'High Scorer!', icon: '⭐' }],
    ];
    const levelAwards: (number | [number, AwardDetails])[] = [
      5,
      [10, { title: 'Double Digits', icon: '🔟' }],
    ];

    const config = AchievementBuilder.combine([
      AchievementBuilder.createScoreAchievements(scoreAwards),
      AchievementBuilder.createLevelAchievements(levelAwards),
    ]);

    expect(config.score![100].title).toBe('Score 100!');
    expect(config.score![500].title).toBe('High Scorer!');
    expect(config.level![5].title).toBe('Level 5!');
    expect(config.level![10].icon).toBe('🔟');
  });

  it('should support value achievements for string metrics', () => {
    const config = AchievementBuilder.createValueAchievement('characterClass', 'wizard')
      .withAward({ title: 'Arcane Scholar', description: 'Choose wizard', icon: '🧙' })
      .toConfig();

    expect(config.characterClass!.wizard.title).toBe('Arcane Scholar');
    expect(config.characterClass!.wizard.description).toBe('Choose wizard');
    expect(config.characterClass!.wizard.icon).toBe('🧙');
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
