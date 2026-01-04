---
sidebar_position: 3
---

# Builder API

The Builder API provides a three-tier system for configuring achievements, from simple smart defaults to full custom control.

## Overview

React Achievements offers three levels of **achievement configuration**:

1. **Tier 1: Smart Defaults** - Zero configuration for common patterns
2. **Tier 2: Chainable Customization** - Fluent API for custom achievements
3. **Tier 3: Full Control** - Complete customization for complex logic

> **Note**: The Builder API defines HOW achievements are **configured**, not how
> they're tracked. For tracking patterns, see [Direct Updates](./direct-updates)
> or [Event-Based Tracking](./event-based-tracking).

You can mix and match all three tiers in a single configuration!

---

## Quick Comparison

```tsx
// Tier 1: Smart Defaults
AchievementBuilder.createScoreAchievement(100)

// Tier 2: Chainable Customization
AchievementBuilder.createScoreAchievement(100)
  .withAward({ title: 'Century!', description: 'Score 100 points', icon: '🏆' })

// Tier 3: Full Control
AchievementBuilder.create()
  .withMetric('score')
  .withCondition((metrics) => metrics.score >= 100 && metrics.score % 10 === 0)
  .withAward({ title: 'Perfect Score!', icon: '💯' })
  .build()
```

---

## Tier 1: Smart Defaults

Pre-configured achievements for common patterns with intelligent defaults.

### Score Achievements

```tsx
import { AchievementBuilder } from 'react-achievements';

const achievements = AchievementBuilder.combine([
  AchievementBuilder.createScoreAchievement(100),  // "Score 100 points"
  AchievementBuilder.createScoreAchievement(500),  // "Score 500 points"
  AchievementBuilder.createScoreAchievement(1000)  // "Score 1000 points"
]);
```

**Smart Defaults:**
- Auto-generated title: "Score \{threshold\} points"
- Auto-generated ID: `score_{threshold}`
- Trophy icon: 🏆
- Metric: `score`

### Level Achievements

```tsx
const achievements = AchievementBuilder.combine([
  AchievementBuilder.createLevelAchievement(5),   // "Reach level 5"
  AchievementBuilder.createLevelAchievement(10),  // "Reach level 10"
  AchievementBuilder.createLevelAchievement(25)   // "Reach level 25"
]);
```

**Smart Defaults:**
- Auto-generated title: "Reach level \{threshold\}"
- Auto-generated ID: `level_{threshold}`
- Star icon: ⭐
- Metric: `level`

### Boolean Achievements

```tsx
const achievements = AchievementBuilder.combine([
  AchievementBuilder.createBooleanAchievement('completedTutorial'),
  AchievementBuilder.createBooleanAchievement('firstLogin'),
  AchievementBuilder.createBooleanAchievement('profileCompleted')
]);
```

**Smart Defaults:**
- Auto-generated title from metric name (camelCase → "Completed Tutorial")
- Auto-generated ID: `{metricName}_true`
- Checkmark icon: ✅
- Condition: value === true

---

## Tier 2: Chainable Customization

Customize smart defaults with a fluent, chainable API.

### Customize Award Details

```tsx
AchievementBuilder.createScoreAchievement(100)
  .withAward({
    title: 'Century!',
    description: 'You scored 100 points',
    icon: '🎯'
  })
```

### Chain Multiple Customizations

```tsx
AchievementBuilder.createScoreAchievement(1000)
  .withAward({
    title: 'Grandmaster',
    description: 'An incredible achievement!',
    icon: '👑'
  })
```

### Using Different Metric Names

If you need to track a different metric name than the default (`score`, `level`, etc.), use threshold-based configuration instead:

```tsx
// For custom metric names, use threshold-based config
const achievements = AchievementBuilder.combine([
  {
    totalPoints: {
      100: { title: 'Point Collector', description: 'Score 100 points', icon: '💰' }
    }
  }
]);
```

---

## Tier 3: Full Control

Complete customization for complex achievement logic.

### Basic Custom Achievement

```tsx
AchievementBuilder.create()
  .withMetric('buttonClicks')
  .withCondition((metrics) => typeof metrics.buttonClicks === 'number' && metrics.buttonClicks >= 50)
  .withAward({
    title: 'Speed Demon',
    description: 'Click 50 times quickly',
    icon: '⚡'
  })
  .build()
```

### Multiple Condition Achievement

```tsx
// For multi-metric conditions, you still need to specify a metric name
// (it's used as the config key), but the condition receives the full metrics object
AchievementBuilder.create()
  .withMetric('perfect_game') // Metric name used as config key
  .withCondition((metrics) =>
    metrics.score >= 1000 &&
    metrics.accuracy === 100 &&
    metrics.timeElapsed < 60
  )
  .withAward({
    title: 'Perfect Game',
    description: 'Score 1000+ with 100% accuracy in under 60 seconds',
    icon: '💎'
  })
  .build()
```

**Note**: Even for multi-metric conditions, `.withMetric()` is required (it's used as the config key). The condition function receives the entire metrics object, so you can check any metric.

### Complex Condition Logic

```tsx
AchievementBuilder.create()
  .withMetric('streak_master') // Metric name used as config key
  .withCondition((metrics) => {
    const { currentStreak, highestStreak, totalGames } = metrics;
    return (
      currentStreak >= 10 &&
      highestStreak >= 15 &&
      totalGames >= 100
    );
  })
  .withAward({
    title: 'Streak Master',
    description: 'Maintain a 10-game streak with 100+ total games',
    icon: '🔥'
  })
  .build()
```

---

## Combining All Three Tiers

Mix and match tiers in a single configuration:

```tsx
import { AchievementBuilder } from 'react-achievements';

const gameAchievements = AchievementBuilder.combine([
  // Tier 1: Smart defaults for quick setup
  AchievementBuilder.createScoreAchievement(100),
  AchievementBuilder.createScoreAchievement(500),
  AchievementBuilder.createLevelAchievement(5),
  AchievementBuilder.createBooleanAchievement('completedTutorial'),

  // Tier 2: Customized smart defaults
  AchievementBuilder.createScoreAchievement(1000)
    .withAward({
      title: 'Score Master',
      description: 'Reached 1000 points!',
      icon: '👑'
    }),

  AchievementBuilder.createLevelAchievement(10)
    .withAward({
      title: 'Double Digits',
      description: 'Level 10 unlocked',
      icon: '🔟'
    }),

  // Tier 3: Full custom logic
  AchievementBuilder.create()
    .withMetric('perfect_score') // Metric name required
    .withCondition((metrics) =>
      metrics.score >= 500 &&
      metrics.accuracy === 100
    )
    .withAward({
      title: 'Perfection',
      description: 'Score 500+ with perfect accuracy',
      icon: '💯'
    })
    .build(),

  // Threshold-based configuration can also be mixed in!
  {
    buttonClicks: {
      10: { title: 'Clicker', description: 'Click 10 times', icon: '👆' },
      100: { title: 'Super Clicker', description: 'Click 100 times', icon: '🖱️' }
    }
  }
]);

export default gameAchievements;
```

---

## When to Use Each Tier

### Use Tier 1 When:
- You need standard score/level/boolean achievements
- You want to get started quickly
- Default titles and icons are acceptable
- You're prototyping

### Use Tier 2 When:
- You need custom titles, descriptions, or icons
- You want quick setup with personalization
- Default metric names (`score`, `level`, etc.) work for you

**Note**: For custom metric names, use threshold-based configuration instead of Tier 2.

### Use Tier 3 When:
- Achievement conditions involve multiple metrics
- Complex logic is required (e.g., "X AND Y AND Z")
- You need programmatic condition evaluation
- Built-in patterns don't fit your use case

---

## Builder API Reference

### AchievementBuilder.combine()

Combines multiple achievement configurations into one.

```tsx
const achievements = AchievementBuilder.combine([
  config1,
  config2,
  config3
]);
```

### AchievementBuilder.createScoreAchievement(threshold)

Creates a score-based achievement.

**Parameters:**
- `threshold` (number): The score value to achieve

**Returns:** Chainable builder instance

### AchievementBuilder.createLevelAchievement(threshold)

Creates a level-based achievement.

**Parameters:**
- `threshold` (number): The level to reach

**Returns:** Chainable builder instance

### AchievementBuilder.createBooleanAchievement(metricName)

Creates a boolean (true/false) achievement.

**Parameters:**
- `metricName` (string): The metric name to track

**Returns:** Chainable builder instance

### AchievementBuilder.create()

Creates a fully custom achievement.

**Returns:** Chainable builder instance

### Builder Methods

#### .withMetric(metricName: string)

Sets the metric to track. **Only available on Tier 3** (`AchievementBuilder.create()`).

```tsx
// Tier 3 only
AchievementBuilder.create()
  .withMetric('playerScore')
  .withCondition(...)
  .build()
```

**Note**: For Tier 2 achievements, the metric is fixed (`score` for `createScoreAchievement()`, `level` for `createLevelAchievement()`, etc.). To use custom metric names, use threshold-based configuration.

#### .withCondition(fn: Function)

Sets the condition function.

```tsx
// Single metric
.withCondition((value) => value >= 100)

// Multiple metrics
.withCondition((metrics) => metrics.score >= 100 && metrics.level >= 5)
```

#### .withAward(award: object)

Sets the achievement details.

```tsx
.withAward({
  title: 'Achievement Title',
  description: 'Achievement description',
  icon: '🏆'
})
```

#### .build()

Finalizes the builder (required for Tier 3 only).

```tsx
.build()
```

---

## Best Practices

### 1. Start with Smart Defaults

Begin with Tier 1 and customize only when needed:

```tsx
// ✅ Good: Start simple
AchievementBuilder.createScoreAchievement(100)

// ❌ Overkill: Tier 3 for simple achievements
AchievementBuilder.create()
  .withMetric('score')
  .withCondition((metrics) => metrics.score >= 100)
  .withAward({ title: 'Score 100 points' })
  .build()
```

### 2. Use Tier 2 for Personalization

Add custom titles/icons without jumping to Tier 3:

```tsx
// ✅ Good: Tier 2 for custom titles
AchievementBuilder.createScoreAchievement(100)
  .withAward({ title: 'Century!', icon: '🎯' })

// ❌ Overkill: Tier 3 for simple customization
AchievementBuilder.create()
  .withMetric('score')
  .withCondition((metrics) => metrics.score >= 100)
  .withAward({ title: 'Century!', icon: '🎯' })
  .build()
```

### 3. Reserve Tier 3 for Complex Logic

Only use Tier 3 when you need custom conditions:

```tsx
// ✅ Good: Complex logic requires Tier 3
AchievementBuilder.create()
  .withCondition((metrics) =>
    metrics.wins >= 10 &&
    metrics.winRate > 0.7 &&
    metrics.totalGames >= 50
  )
  .withAward({ title: 'Champion', icon: '🏆' })
  .build()
```

### 4. Use Threshold-Based Config for Custom Metrics

If you need to track metrics with different names than the defaults, use threshold-based configuration:

```tsx
// ✅ Good: Custom metric name using threshold-based config
const achievements = AchievementBuilder.combine([
  {
    lessons: {
      1: { title: 'First Steps', description: 'Complete a lesson', icon: '📖' },
      5: { title: 'On a Roll', description: 'Complete 5 lessons', icon: '📚' }
    }
  }
]);

// ❌ Not possible: Tier 2 doesn't support custom metric names
// AchievementBuilder.createScoreAchievement(100).withMetric('lessons') // Error!
```

### 5. Organize by Complexity

Group achievements by tier for readability:

```tsx
const achievements = AchievementBuilder.combine([
  // --- Tier 1: Quick Setup ---
  AchievementBuilder.createScoreAchievement(100),
  AchievementBuilder.createScoreAchievement(500),

  // --- Tier 2: Customized ---
  AchievementBuilder.createScoreAchievement(1000)
    .withAward({ title: 'Grand Master', icon: '👑' }),

  // --- Tier 3: Complex Logic ---
  AchievementBuilder.create()
    .withMetric('perfect_game') // Metric name required
    .withCondition((m) => m.score >= 500 && m.accuracy === 100)
    .withAward({ title: 'Perfect Game', icon: '💎' })
    .build()
]);
```

---

## Working with Threshold-Based Configuration

The Builder API can coexist with threshold-based object configuration:

### Threshold-Based Configuration

```tsx
const achievements = {
  score: {
    100: { title: 'Century!', description: 'Score 100 points', icon: '🏆' },
    500: { title: 'High Scorer!', description: 'Score 500 points', icon: '⭐' }
  }
};
```

### Builder API Equivalent

```tsx
const achievements = AchievementBuilder.combine([
  AchievementBuilder.createScoreAchievement(100)
    .withAward({ title: 'Century!', description: 'Score 100 points', icon: '🏆' }),
  AchievementBuilder.createScoreAchievement(500)
    .withAward({ title: 'High Scorer!', description: 'Score 500 points', icon: '⭐' })
]);
```

### Mixed Approach (Recommended)

```tsx
const achievements = AchievementBuilder.combine([
  // Threshold-based configuration for simple patterns
  {
    score: {
      100: { title: 'Century!', icon: '🏆' },
      500: { title: 'High Scorer!', icon: '⭐' }
    }
  },

  // Builder API for complex achievements
  AchievementBuilder.create()
    .withMetric('perfect_game') // Metric name required
    .withCondition((m) => m.score >= 1000 && m.accuracy === 100)
    .withAward({ title: 'Perfect Game', icon: '💎' })
    .build()
]);
```

---

## What's Next?

- **[Direct Updates](./direct-updates)** - Learn how to track achievements
- **[Event-Based Tracking](./event-based-tracking)** - Alternative tracking pattern
- **[Advanced Configuration](../advanced/complex-api)** - Low-level POJO configuration
- **[API Reference](../api-reference)** - Complete type definitions
