---
sidebar_position: 1
---

# Direct Metric Updates

The direct update pattern uses React hooks to update achievement metrics directly in your components. This is one of two tracking approaches in React Achievements - straightforward and perfect for React-only applications.

## Overview

With direct updates, you call methods like `track()`, `increment()`, or `update()` to explicitly update metrics whenever achievements should be checked. The library evaluates achievement conditions automatically and unlocks achievements when metrics meet the thresholds.

This pattern is React-specific and tightly integrated with React hooks, making it ideal for simple applications or quick prototypes.

## Setup

To use direct updates, pass your achievement configuration directly to the `AchievementProvider`:

```tsx
import { AchievementProvider } from 'react-achievements';

const achievements = {
  score: {
    100: { title: 'Century!', description: 'Score 100 points', icon: '🏆' },
    500: { title: 'High Scorer!', icon: '⭐' },
  }
};

function App() {
  return (
    <AchievementProvider achievements={achievements} useBuiltInUI={true}>
      <YourApp />
    </AchievementProvider>
  );
}
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

### Using useSimpleAchievements Hook

The `useSimpleAchievements` hook is the recommended way to track achievements with the direct update pattern. It provides convenient methods for updating metrics:

```tsx
import { useSimpleAchievements } from 'react-achievements';

function Game() {
  const { track, increment, trackMultiple, unlocked, unlockedCount } = useSimpleAchievements();

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

  return (
    <div>
      <p>Achievements Unlocked: {unlockedCount}</p>
      {/* Your game UI */}
    </div>
  );
}
```

**API Reference:**

- `track(metric: string, value: any)` - Update a single metric
- `increment(metric: string, amount?: number)` - Increment a numeric metric (default: 1)
- `trackMultiple(metrics: Record<string, any>)` - Update multiple metrics at once
- `unlocked` - Array of unlocked achievement IDs
- `unlockedCount` - Number of unlocked achievements
- `reset()` - Clear all achievement data
- `exportData()` - Export achievement data as JSON string
- `importData(jsonString, options)` - Import achievement data

### Using useAchievements Hook (Advanced)

For more control, use the `useAchievements` hook which provides access to all features:

```tsx
import { useAchievements } from 'react-achievements';

function Game() {
  const {
    update,
    achievements,
    reset,
    getState,
    exportData,
    importData,
    getAllAchievements
  } = useAchievements();

  const handleUpdate = () => {
    update({ score: 500, level: 10 });
  };

  const currentState = getState();
  // { metrics: { score: 500, level: 10 }, unlocked: ['score_500', 'level_10'] }

  return (
    <div>
      <p>Unlocked: {achievements.unlocked.length}</p>
      {/* Your UI */}
    </div>
  );
}
```

**API Reference:**

- `update(metrics: Record<string, any>)` - Update one or more metrics
- `achievements` - Object with `unlocked` and `all` arrays
- `reset()` - Clear all achievement data
- `getState()` - Get current metrics and unlocked achievements
- `exportData()` - Export as JSON string
- `importData(jsonString, options)` - Import from JSON string
- `getAllAchievements()` - Get all achievements with lock status

## React Integration Patterns

### Tracking User Actions

Track achievements when users interact with your UI:

```tsx
function GameButton() {
  const { track, increment } = useSimpleAchievements();

  return (
    <div>
      <button onClick={() => track('buttonClicked', true)}>
        Click Me
      </button>

      <button onClick={() => increment('totalClicks')}>
        Increment Counter
      </button>

      <button onClick={() => track('score', 1000)}>
        Set Score to 1000
      </button>
    </div>
  );
}
```

### Tracking Side Effects

Use React hooks to track achievements based on application state:

```tsx
import { useEffect } from 'react';
import { useSimpleAchievements } from 'react-achievements';

function GameComponent({ gameState }) {
  const { track, trackMultiple } = useSimpleAchievements();

  // Track when game completes
  useEffect(() => {
    if (gameState.isComplete) {
      trackMultiple({
        gamesCompleted: gameState.totalGamesCompleted,
        completedOnHard: gameState.difficulty === 'hard',
        perfectScore: gameState.score === gameState.maxScore
      });
    }
  }, [gameState.isComplete]);

  // Track level changes
  useEffect(() => {
    track('level', gameState.currentLevel);
  }, [gameState.currentLevel]);

  return <div>{/* Your UI */}</div>;
}
```

### Tracking State Changes

Derive achievement updates from your application state:

```tsx
import { useSimpleAchievements } from 'react-achievements';

function PlayerStats({ player }) {
  const { track } = useSimpleAchievements();

  // Track whenever relevant state changes
  useEffect(() => {
    track('playerLevel', player.level);
  }, [player.level]);

  useEffect(() => {
    track('gold', player.gold);
  }, [player.gold]);

  return (
    <div>
      <p>Level: {player.level}</p>
      <p>Gold: {player.gold}</p>
    </div>
  );
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

## When to Use Direct Updates

### Best For

- **React-only applications** - When your entire app is built with React
- **Simple tracking needs** - Straightforward metric updates without complex event flows
- **Quick prototypes** - Getting started fast without additional setup
- **Small to medium apps** - Where tracking logic is colocated with UI

### Advantages

- **Minimal setup code** - Just pass `achievements` to the provider
- **Direct integration** - Update metrics right where user actions happen
- **Simple mental model** - "Call `track()` when something happens"
- **Type-safe with TypeScript** - Full type inference for metrics

### Trade-offs

- **Tightly coupled to React** - Can't reuse tracking logic outside React components
- **Less semantic** - `track('score', 100)` doesn't convey business meaning like `emit('userScored', { points: 100 })` does
- **Testing complexity** - Harder to test tracking logic separately from components
- **No framework portability** - Can't share the same achievement engine with non-React code

## Comparison with Event-Based Tracking

Direct updates and event-based tracking are two different approaches to the same goal. Neither is deprecated - choose based on your needs:

| Aspect | Direct Updates | Event-Based Tracking |
|--------|---------------|---------------------|
| **Setup** | Pass `achievements` to provider | Create `AchievementEngine`, pass to provider |
| **Usage** | `track('score', 100)` | `engine.emit('userScored', { points: 100 })` |
| **Best For** | React-only apps | Multi-framework or large apps |
| **Semantics** | Direct metrics | Business events |
| **Testing** | Test with components | Test events separately |
| **Portability** | React-specific | Framework-agnostic |

**Want to try event-based?** See the [Event-Based Tracking Guide](./event-based-tracking)

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

- **[Event-Based Tracking](./event-based-tracking)** - Alternative tracking pattern using semantic events
- **[Builder API](./builder-api)** - Advanced achievement configuration patterns
- **[Common Patterns](../recipes/common-patterns)** - Ready-to-use achievement patterns
- **[Theming Guide](./theming)** - Customize the UI appearance
