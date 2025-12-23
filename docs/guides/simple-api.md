---
sidebar_position: 1
---

# Simple API Guide

The Simple API is the recommended way to configure achievements in React Achievements. It reduces configuration code by up to 95% compared to the Complex API.

## Overview

The Simple API uses an intuitive object structure where you define metrics, thresholds, and awards:

```tsx
const achievements = {
  metricName: {
    threshold: { title, description, icon },
    // ... more thresholds
  }
};
```

## Basic Patterns

### Score-Based Achievements

Track numeric values that increase over time:

```tsx
const achievements = {
  score: {
    100: { title: 'Century!', description: 'Score 100 points', icon: '🏆' },
    500: { title: 'High Scorer!', description: 'Score 500 points', icon: '⭐' },
    1000: { title: 'Legend!', description: 'Score 1000 points', icon: '💎' },
  },
};

// Usage
const { track } = useSimpleAchievements();
track('score', 150); // Unlocks "Century!" achievement
```

### Boolean Achievements

Track completion or state changes:

```tsx
const achievements = {
  completedTutorial: {
    true: { title: 'Tutorial Master', description: 'Complete the tutorial', icon: '📚' }
  },
  firstWin: {
    true: { title: 'First Victory!', description: 'Win your first game', icon: '🎯' }
  },
};

// Usage
track('completedTutorial', true); // Unlocks achievement
```

### String-Based Achievements

Track specific values or states:

```tsx
const achievements = {
  difficulty: {
    easy: { title: 'Easy Mode', description: 'Complete on easy', icon: '😌' },
    medium: { title: 'Medium Mode', description: 'Complete on medium', icon: '🤔' },
    hard: { title: 'Hard Mode', description: 'Complete on hard', icon: '💪' },
  },
};

// Usage
track('difficulty', 'hard'); // Unlocks "Hard Mode"
```

### Custom Condition Achievements

For complex logic involving multiple metrics:

```tsx
const achievements = {
  perfectGame: {
    custom: {
      title: 'Perfect Game',
      description: 'Score 1000+ with 100% accuracy',
      icon: '🎯',
      condition: (metrics) => metrics.score >= 1000 && metrics.accuracy === 100
    }
  },
  speedRunner: {
    custom: {
      title: 'Speed Runner',
      description: 'Complete in under 5 minutes',
      icon: '⚡',
      condition: (metrics) => metrics.timeElapsed < 300 && metrics.completed === true
    }
  },
};

// Usage - track all relevant metrics
track('score', 1200);
track('accuracy', 100);
// Both metrics checked, unlocks if condition met
```

## Tracking Progress

Use the `useSimpleAchievements` hook to update metrics:

```tsx
import { useSimpleAchievements } from 'react-achievements';

function Game() {
  const { track, increment, trackMultiple } = useSimpleAchievements();

  // Track single metric
  const handleScore = (points: number) => {
    track('score', points);
  };

  // Increment metric
  const handleClick = () => {
    increment('clicks'); // Increments by 1
    increment('clicks', 5); // Increments by 5
  };

  // Track multiple metrics at once
  const handleGameEnd = (gameData) => {
    trackMultiple({
      score: gameData.finalScore,
      accuracy: gameData.accuracy,
      timeElapsed: gameData.timeElapsed,
      completed: true
    });
  };
}
```

## Complete Example

Here's a full working example combining multiple achievement types:

```tsx title="achievements.ts"
export const gameAchievements = {
  // Score milestones
  score: {
    100: { title: 'Beginner', description: 'Score 100 points', icon: '🥉' },
    500: { title: 'Intermediate', description: 'Score 500 points', icon: '🥈' },
    1000: { title: 'Expert', description: 'Score 1000 points', icon: '🥇' },
  },

  // Completion tracking
  completedTutorial: {
    true: { title: 'Tutorial Complete', description: 'Finished the tutorial', icon: '📚' }
  },

  // Difficulty levels
  difficulty: {
    hard: { title: 'Hardened Warrior', description: 'Beat hard mode', icon: '💪' }
  },

  // Click counter
  clicks: {
    10: { title: 'Clicker', description: 'Click 10 times', icon: '👆' },
    100: { title: 'Super Clicker', description: 'Click 100 times', icon: '👆👆' },
  },

  // Complex achievements
  perfectRun: {
    custom: {
      title: 'Perfectionist',
      description: 'Score 1000+ with 100% accuracy',
      icon: '💎',
      condition: (metrics) => metrics.score >= 1000 && metrics.accuracy === 100
    }
  },

  speedDemon: {
    custom: {
      title: 'Speed Demon',
      description: 'Complete in under 60 seconds',
      icon: '⚡',
      condition: (metrics) => {
        return metrics.completed === true && metrics.timeElapsed < 60;
      }
    }
  },
};
```

```tsx title="App.tsx"
import { AchievementProvider } from 'react-achievements';
import { gameAchievements } from './achievements';
import Game from './Game';

function App() {
  return (
    <AchievementProvider
      achievements={gameAchievements}
      useBuiltInUI={true}
    >
      <Game />
    </AchievementProvider>
  );
}
```

```tsx title="Game.tsx"
import { useSimpleAchievements } from 'react-achievements';
import { useState } from 'react';

function Game() {
  const { track, increment, trackMultiple } = useSimpleAchievements();
  const [score, setScore] = useState(0);
  const [startTime] = useState(Date.now());

  const handleScorePoints = (points: number) => {
    const newScore = score + points;
    setScore(newScore);
    track('score', newScore);
  };

  const handleGameComplete = () => {
    const timeElapsed = (Date.now() - startTime) / 1000; // seconds
    trackMultiple({
      completed: true,
      timeElapsed,
      accuracy: 100 // Your accuracy calculation
    });
  };

  return (
    <div>
      <h1>Score: {score}</h1>
      <button onClick={() => handleScorePoints(100)}>+100 Points</button>
      <button onClick={() => increment('clicks')}>Click Me!</button>
      <button onClick={handleGameComplete}>Complete Game</button>
    </div>
  );
}
```

## Best Practices

### 1. Use Descriptive Metric Names

```tsx
// ✅ Good - clear and specific
const achievements = {
  questsCompleted: { 10: { title: 'Quest Master' } },
  bossesDefeated: { 5: { title: 'Boss Slayer' } },
};

// ❌ Bad - vague names
const achievements = {
  count: { 10: { title: 'Achievement' } },
  num: { 5: { title: 'Another' } },
};
```

### 2. Provide Meaningful Descriptions

```tsx
// ✅ Good - tells users what to do
{
  title: 'Speed Runner',
  description: 'Complete the game in under 5 minutes',
  icon: '⚡'
}

// ❌ Bad - unhelpful
{
  title: 'Fast',
  description: 'Be fast',
  icon: '⚡'
}
```

### 3. Choose Appropriate Icons

Use emojis that clearly represent the achievement:

```tsx
const achievements = {
  score: {
    100: { icon: '🏆' },   // Trophy for achievement
    500: { icon: '⭐' },    // Star for higher tier
    1000: { icon: '💎' },  // Diamond for top tier
  },
};
```

### 4. Group Related Achievements

```tsx
const achievements = {
  // Combat achievements
  enemiesDefeated: { /* ... */ },
  bossesDefeated: { /* ... */ },

  // Collection achievements
  itemsCollected: { /* ... */ },
  treasuresFound: { /* ... */ },

  // Progression achievements
  levelsCompleted: { /* ... */ },
  questsCompleted: { /* ... */ },
};
```

## Next Steps

- **[Tracking Methods](/docs/api/hooks/useSimpleAchievements)** - Complete API reference
- **[Storage Options](/docs/guides/storage-options)** - Choose the right storage backend
- **[Common Patterns](/docs/recipes/common-patterns)** - Ready-to-use achievement patterns
- **[Migration from Complex API](/docs/guides/migration)** - Migrate existing code
