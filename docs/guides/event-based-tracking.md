---
sidebar_position: 2
---

# Event-Based Tracking

Event-based tracking uses semantic events to update achievements. Instead of updating metrics directly, you emit events that represent business actions (like "userScored" or "levelUp"), which are automatically mapped to metric updates.

This pattern is framework-agnostic and provides better separation of concerns - ideal for larger applications or multi-framework projects.

## Overview

With event-based tracking, you create an `AchievementEngine` instance outside of React and configure event mappings. Your application code emits semantic events, and the engine automatically updates the appropriate metrics based on your mapping configuration.

The engine is framework-agnostic - the same instance can be used in React, Vue, Angular, or vanilla JavaScript.

## Setup

### Creating the Engine

First, create an `AchievementEngine` instance outside of your React components:

```tsx
import { AchievementEngine } from 'react-achievements';

const achievements = {
  score: {
    100: { title: 'Century!', description: 'Score 100 points', icon: '🏆' },
    500: { title: 'High Scorer!', icon: '⭐' },
  },
  level: {
    5: { title: 'Leveling Up', icon: '📈' },
    10: { title: 'Double Digits', icon: '🔟' }
  }
};

const eventMapping = {
  'userScored': (data) => ({ score: data.points }),
  'userLeveledUp': (data) => ({ level: data.level }),
  'tutorialCompleted': () => ({ completedTutorial: true })
};

const engine = new AchievementEngine({
  achievements,
  eventMapping,
  storage: 'local' // 'local', 'memory', 'indexedDB', or custom
});
```

### Provider Integration

Pass the engine to `AchievementProvider`:

```tsx
import { AchievementProvider } from 'react-achievements';

function App() {
  return (
    <AchievementProvider engine={engine} useBuiltInUI={true}>
      <YourApp />
    </AchievementProvider>
  );
}
```

### Using the Hook

Access the engine in your components with `useAchievementEngine()`:

```tsx
import { useAchievementEngine } from 'react-achievements';

function Game() {
  const engine = useAchievementEngine();

  const handleAction = () => {
    // Emit semantic events
    engine.emit('userScored', { points: 100 });
  };

  return <button onClick={handleAction}>Score Points</button>;
}
```

## Event Mapping

Event mapping is the core concept that makes event-based tracking powerful. It defines how your semantic events translate into metric updates.

### Direct String Mapping

The simplest form maps an event name directly to a metric name:

```tsx
const eventMapping = {
  'enemy:defeated': 'enemiesDefeated',
  'item:collected': 'itemsCollected'
};

// Usage
engine.emit('enemy:defeated', 10); // Sets enemiesDefeated to 10
engine.emit('item:collected', 5);  // Sets itemsCollected to 5
```

### MetricUpdater Functions

For more complex logic, use functions to transform event data into metric updates:

```tsx
import type { MetricUpdater } from 'react-achievements';

const eventMapping = {
  // Increment level, reset experience
  'player:levelup': (eventData, currentMetrics) => {
    const currentLevel = currentMetrics.level || 0;
    return {
      level: currentLevel + 1,
      experience: 0 // Reset experience on level up
    };
  },

  // Add experience points
  'player:gain_exp': (eventData, currentMetrics) => {
    const currentExp = currentMetrics.experience || 0;
    return {
      experience: currentExp + eventData.amount
    };
  }
};

// Usage
engine.emit('player:levelup');
engine.emit('player:gain_exp', { amount: 50 });
```

**MetricUpdater Function Signature:**
```typescript
type MetricUpdater = (
  eventData: any,
  currentMetrics: Record<string, any>
) => Record<string, any>;
```

### Multi-Metric Events

A single event can update multiple metrics:

```tsx
const eventMapping = {
  'boss:defeated': (data, currentMetrics) => ({
    score: (currentMetrics.score || 0) + data.scoreGained,
    level: (currentMetrics.level || 1) + 1,
    bossesDefeated: (currentMetrics.bossesDefeated || 0) + 1,
    lastBossName: data.bossName
  })
};

// Usage - one event updates four metrics
engine.emit('boss:defeated', {
  scoreGained: 250,
  bossName: 'Dragon King'
});
```

## Emitting Events

### Basic Event Emission

Emit events using `engine.emit(eventName, data)`:

```tsx
function GameComponent() {
  const engine = useAchievementEngine();

  const handleUserScored = () => {
    engine.emit('userScored', { points: 100 });
  };

  const handleLevelUp = () => {
    engine.emit('userLeveledUp', { level: 5 });
  };

  const handleSimpleEvent = () => {
    engine.emit('tutorialCompleted');
  };

  return (
    <div>
      <button onClick={handleUserScored}>Score 100</button>
      <button onClick={handleLevelUp}>Level Up</button>
      <button onClick={handleSimpleEvent}>Complete Tutorial</button>
    </div>
  );
}
```

### Event Data Patterns

Events can carry simple values or complex objects:

```tsx
// Simple value
engine.emit('buttonClicked', true);

// Object with multiple properties
engine.emit('userScored', {
  points: 100,
  multiplier: 2,
  timestamp: Date.now()
});

// No data (boolean achievements)
engine.emit('tutorialCompleted');

// Array data
engine.emit('itemsCollected', ['sword', 'shield', 'potion']);
```

### TypeScript Type Safety

Define event types for type-safe event emission:

```typescript
interface GameEvents {
  'userScored': { points: number; multiplier?: number };
  'userLeveledUp': { level: number };
  'boss:defeated': { scoreGained: number; bossName: string };
  'tutorialCompleted': void;
}

// Type-safe event mapping
const eventMapping: Record<keyof GameEvents, MetricUpdater | string> = {
  'userScored': (data) => ({ score: data.points * (data.multiplier || 1) }),
  'userLeveledUp': (data) => ({ level: data.level }),
  'boss:defeated': (data) => ({
    score: data.scoreGained,
    lastBoss: data.bossName
  }),
  'tutorialCompleted': () => ({ completedTutorial: true })
};
```

## Listening to Engine Events

The engine emits built-in events that you can listen to for notifications, analytics, or custom logic.

### Built-in Events

Four core events are available:

- **`achievement:unlocked`** - Fired when an achievement is unlocked
- **`metric:updated`** - Fired when a metric value changes
- **`state:changed`** - Fired after any state change (metrics or achievements)
- **`error`** - Fired when an error occurs

### Subscribing to Events

Use `engine.on()` to subscribe to events:

```tsx
import { useAchievementEngine } from 'react-achievements';
import { useEffect } from 'react';

function NotificationHandler() {
  const engine = useAchievementEngine();

  useEffect(() => {
    // Listen for achievement unlocks
    const unsubscribe = engine.on('achievement:unlocked', (event) => {
      console.log(`🎉 ${event.achievementTitle}`);
      console.log(event.achievementDescription);

      // Custom notification logic
      // event contains: achievementId, achievementTitle, achievementDescription, achievementIconKey, timestamp
    });

    // Cleanup on unmount
    return () => unsubscribe();
  }, [engine]);

  return null;
}
```

**Event Payloads:**

```typescript
interface AchievementUnlockedEvent {
  achievementId: string;
  achievementTitle: string;
  achievementDescription: string;
  achievementIconKey?: string;
  timestamp: number;
}

interface MetricUpdatedEvent {
  metric: string;
  oldValue: any;
  newValue: any;
}

interface StateChangedEvent {
  metrics: Record<string, any>;
  unlockedAchievements: string[];
}

interface ErrorEvent {
  error: Error;
  context?: string;
}
```

### Multiple Event Listeners

Subscribe to multiple events:

```tsx
useEffect(() => {
  const unsubscribeUnlocked = engine.on('achievement:unlocked', (event) => {
    console.log('Achievement unlocked:', event.achievementTitle);
  });

  const unsubscribeMetric = engine.on('metric:updated', (event) => {
    console.log(`${event.metric}: ${event.oldValue} → ${event.newValue}`);
  });

  const unsubscribeState = engine.on('state:changed', (event) => {
    console.log('State changed:', event);
  });

  return () => {
    unsubscribeUnlocked();
    unsubscribeMetric();
    unsubscribeState();
  };
}, [engine]);
```

### One-Time Listeners

Use `engine.once()` to listen for an event just once:

```tsx
useEffect(() => {
  // Trigger confetti only on first achievement
  engine.once('achievement:unlocked', (event) => {
    console.log('First achievement unlocked!', event.achievementTitle);
    // Show special first-time celebration
  });
}, [engine]);
```

## React Integration

### Emitting from Components

Emit events in response to user actions:

```tsx
function GameControls() {
  const engine = useAchievementEngine();
  const [score, setScore] = useState(0);

  const handleScorePoints = (points: number) => {
    const newScore = score + points;
    setScore(newScore);

    // Emit event instead of direct metric update
    engine.emit('userScored', { points: newScore });
  };

  return (
    <div>
      <p>Score: {score}</p>
      <button onClick={() => handleScorePoints(100)}>+100 Points</button>
      <button onClick={() => handleScorePoints(500)}>+500 Points</button>
    </div>
  );
}
```

### Emitting from Effects

Emit events when React state changes:

```tsx
import { useEffect } from 'react';

function PlayerProgress({ player }) {
  const engine = useAchievementEngine();

  // Track level changes
  useEffect(() => {
    if (player.level > 1) {
      engine.emit('userLeveledUp', { level: player.level });
    }
  }, [player.level, engine]);

  // Track game completion
  useEffect(() => {
    if (player.gameComplete) {
      engine.emit('gameCompleted', {
        difficulty: player.difficulty,
        timeElapsed: player.timeElapsed
      });
    }
  }, [player.gameComplete, engine]);

  return <div>Level: {player.level}</div>;
}
```

### Using with React State

Synchronize events with your application state:

```tsx
function Game() {
  const engine = useAchievementEngine();
  const [gameState, setGameState] = useState({
    score: 0,
    level: 1,
    enemiesDefeated: 0
  });

  const defeatEnemy = () => {
    setGameState(prev => {
      const newState = {
        ...prev,
        enemiesDefeated: prev.enemiesDefeated + 1,
        score: prev.score + 10
      };

      // Emit event with new state
      engine.emit('enemyDefeated', {
        totalEnemies: newState.enemiesDefeated,
        scoreGained: 10
      });

      return newState;
    });
  };

  return (
    <div>
      <p>Score: {gameState.score}</p>
      <p>Enemies Defeated: {gameState.enemiesDefeated}</p>
      <button onClick={defeatEnemy}>Defeat Enemy</button>
    </div>
  );
}
```

## Framework-Agnostic Usage

One of the key benefits of event-based tracking is that the `AchievementEngine` works outside React.

### Vanilla JavaScript

Use the engine in plain JavaScript:

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://unpkg.com/achievements-engine"></script>
</head>
<body>
  <button id="scoreBtn">Score 100 Points</button>

  <script>
    const engine = new AchievementEngine({
      achievements: {
        score: {
          100: { title: 'Century!', description: 'Score 100 points', icon: '🏆' }
        }
      },
      eventMapping: {
        'userScored': (data) => ({ score: data.points })
      },
      storage: 'local'
    });

    // Listen for achievements
    engine.on('achievement:unlocked', (event) => {
      alert(`Achievement Unlocked: ${event.achievementTitle}`);
    });

    // Emit events from vanilla JS
    document.getElementById('scoreBtn').addEventListener('click', () => {
      engine.emit('userScored', { points: 100 });
    });
  </script>
</body>
</html>
```

### Vue Integration

Share the same engine with Vue:

```vue
<template>
  <div>
    <button @click="scorePoints">Score 100 Points</button>
  </div>
</template>

<script>
import { engine } from './achievementEngine';

export default {
  methods: {
    scorePoints() {
      engine.emit('userScored', { points: 100 });
    }
  },

  mounted() {
    this.unsubscribe = engine.on('achievement:unlocked', (event) => {
      console.log('Achievement unlocked:', event.achievementTitle);
    });
  },

  beforeUnmount() {
    this.unsubscribe();
  }
}
</script>
```

### Angular Integration

Use the engine in Angular services:

```typescript
import { Injectable } from '@angular/core';
import { engine } from './achievementEngine';

@Injectable({
  providedIn: 'root'
})
export class AchievementService {
  private unsubscribe: () => void;

  constructor() {
    this.unsubscribe = engine.on('achievement:unlocked', (event) => {
      console.log('Achievement unlocked:', event.achievementTitle);
    });
  }

  scorePoints(points: number) {
    engine.emit('userScored', { points });
  }

  ngOnDestroy() {
    this.unsubscribe();
  }
}
```

## Complete Example

Here's a full working example combining event mapping, event emission, and event listening:

```tsx title="achievementEngine.ts"
import { AchievementEngine } from 'react-achievements';

// Achievement configuration
export const gameAchievements = {
  score: {
    100: { title: 'Century!', description: 'Score 100 points', icon: '🏆' },
    500: { title: 'High Scorer!', description: 'Score 500 points', icon: '⭐' },
    1000: { title: 'Master!', description: 'Score 1000 points', icon: '💎' }
  },
  level: {
    5: { title: 'Leveling Up', description: 'Reach level 5', icon: '📈' },
    10: { title: 'Double Digits', description: 'Reach level 10', icon: '🔟' }
  },
  enemiesDefeated: {
    10: { title: 'Novice Slayer', description: 'Defeat 10 enemies', icon: '⚔️' },
    50: { title: 'Expert Slayer', description: 'Defeat 50 enemies', icon: '🗡️' }
  },
  completedTutorial: {
    true: { title: 'Tutorial Master', description: 'Complete the tutorial', icon: '📚' }
  }
};

// Event mapping
export const eventMapping = {
  'userScored': (data) => ({ score: data.points }),

  'userLeveledUp': (data) => ({ level: data.level }),

  'enemyDefeated': (data, currentMetrics) => ({
    enemiesDefeated: (currentMetrics.enemiesDefeated || 0) + 1
  }),

  'tutorialCompleted': () => ({ completedTutorial: true }),

  // Multi-metric event
  'bossDefeated': (data, currentMetrics) => ({
    score: (currentMetrics.score || 0) + data.scoreGained,
    level: (currentMetrics.level || 1) + 1,
    enemiesDefeated: (currentMetrics.enemiesDefeated || 0) + 1
  })
};

// Create engine instance
export const engine = new AchievementEngine({
  achievements: gameAchievements,
  eventMapping,
  storage: 'local'
});

// Listen for achievement unlocks
engine.on('achievement:unlocked', (event) => {
  console.log(`🎉 ${event.achievementTitle}`);
  console.log(event.achievementDescription);
});
```

```tsx title="App.tsx"
import { AchievementProvider } from 'react-achievements';
import { engine } from './achievementEngine';
import Game from './Game';

function App() {
  return (
    <AchievementProvider engine={engine} useBuiltInUI={true}>
      <Game />
    </AchievementProvider>
  );
}

export default App;
```

```tsx title="Game.tsx"
import { useAchievementEngine } from 'react-achievements';
import { useState } from 'react';

function Game() {
  const engine = useAchievementEngine();
  const [currentScore, setCurrentScore] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);

  const handleScorePoints = (points: number) => {
    const newScore = currentScore + points;
    setCurrentScore(newScore);

    // Emit semantic event
    engine.emit('userScored', { points: newScore });
  };

  const handleLevelUp = () => {
    const newLevel = currentLevel + 1;
    setCurrentLevel(newLevel);

    engine.emit('userLeveledUp', { level: newLevel });
  };

  const handleDefeatEnemy = () => {
    engine.emit('enemyDefeated');
  };

  const handleBossDefeat = () => {
    const scoreGained = 250;
    const newScore = currentScore + scoreGained;
    const newLevel = currentLevel + 1;

    setCurrentScore(newScore);
    setCurrentLevel(newLevel);

    // Single event updates multiple metrics
    engine.emit('bossDefeated', { scoreGained });
  };

  return (
    <div>
      <h1>Game</h1>
      <p>Score: {currentScore}</p>
      <p>Level: {currentLevel}</p>

      <div>
        <button onClick={() => handleScorePoints(100)}>+100 Points</button>
        <button onClick={() => handleScorePoints(500)}>+500 Points</button>
        <button onClick={handleLevelUp}>Level Up</button>
        <button onClick={handleDefeatEnemy}>Defeat Enemy</button>
        <button onClick={handleBossDefeat}>Defeat Boss (Multi-Metric)</button>
        <button onClick={() => engine.emit('tutorialCompleted')}>
          Complete Tutorial
        </button>
      </div>
    </div>
  );
}

export default Game;
```

## When to Use Event-Based Tracking

### Best For

- **Multi-framework projects** - Share the same engine across React, Vue, Angular
- **Large applications** - Better separation of concerns for complex business logic
- **Semantic event names** - "userScored" is clearer than "score: 100"
- **Testability** - Events are easier to mock and test than direct metric updates
- **Domain-driven design** - Events represent business actions

### Advantages

- **Framework agnostic** - Use the same engine anywhere
- **Semantic events** - Better developer experience with meaningful event names
- **Event mapping** - One event can update multiple metrics automatically
- **Easier testing** - Test event emission separately from achievement logic
- **Separation of concerns** - Business logic decoupled from achievement tracking
- **Event listeners** - React to achievements with custom logic

### Trade-offs

- **More setup code** - Creating engine and event mapping requires additional configuration
- **Additional concept** - Need to understand event-driven architecture
- **Slight learning curve** - More concepts than direct updates (engine, mapping, events)

## Migration from Direct Updates

You can migrate from direct updates to event-based tracking incrementally:

### Before (Direct Updates)

```tsx
// Old pattern
<AchievementProvider achievements={config}>
  <App />
</AchievementProvider>

// In component
const { track } = useSimpleAchievements();
track('score', 100);
track('completedTutorial', true);
```

### After (Event-Based)

```tsx
// New pattern - create engine
const engine = new AchievementEngine({
  achievements: config,
  eventMapping: {
    'userScored': (data) => ({ score: data.points }),
    'tutorialCompleted': () => ({ completedTutorial: true })
  }
});

<AchievementProvider engine={engine}>
  <App />
</AchievementProvider>

// In component
const engine = useAchievementEngine();
engine.emit('userScored', { points: 100 });
engine.emit('tutorialCompleted');
```

### Can Both Patterns Coexist?

**No** - The provider enforces one pattern per app. However, you can:
- Use different patterns in different applications
- Migrate one component at a time by creating a new provider with the engine pattern
- The engine created internally by the old pattern can emit events, but doesn't use event mapping

## Comparison with Direct Updates

| Aspect | Direct Updates | Event-Based Tracking |
|--------|---------------|---------------------|
| **Setup** | Pass `achievements` to provider | Create engine, pass to provider |
| **API** | `track('score', 100)` | `engine.emit('userScored', { points: 100 })` |
| **Semantics** | Direct metrics | Business events |
| **Framework** | React-only | Framework-agnostic |
| **Testing** | Test with components | Test events separately |
| **Multi-Metric** | Call `trackMultiple()` | One event with mapping |
| **Event Listeners** | Not available | `engine.on()` available |
| **Best For** | Simple React apps | Large/multi-framework apps |

**Want to try direct updates?** See the [Direct Updates Guide](./direct-updates)

## Next Steps

- **[Direct Updates](./direct-updates)** - Alternative tracking pattern using React hooks
- **[Builder API](./builder-api)** - Advanced achievement configuration patterns
- **[Common Patterns](../recipes/common-patterns)** - Ready-to-use achievement patterns
- **[Data Portability](./data-portability)** - Export and import achievement data
