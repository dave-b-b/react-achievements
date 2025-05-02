# React Achievements Core

A flexible and extensible achievement system for React applications. This is the core package that provides the foundation for implementing achievements in React applications.

## Features

- Framework-agnostic achievement system
- Customizable storage implementations
- Built-in local storage support
- Customizable UI components
- Toast notifications
- Confetti animations
- TypeScript support

## Installation

```bash
npm install react-achievements-core
```

## Basic Usage

```tsx
import { AchievementProvider, useAchievements } from 'react-achievements-core';

// Define your achievements
const achievements = {
  score: {
    // Simple numeric threshold
    100: {
      title: 'Century!',
      description: 'Score 100 points',
      icon: 'trophy'
    },
    // Custom condition
    500: {
      title: 'Half a Thousand!',
      description: 'Score 500 points',
      icon: 'gold',
      condition: (value) => value >= 500
    }
  }
};

// Create your app component
const App = () => {
  return (
    <AchievementProvider
      achievements={achievements}
      storage="local" // or "memory" or custom storage
    >
      <Game />
    </AchievementProvider>
  );
};

// Use achievements in your components
const Game = () => {
  const { update, achievements } = useAchievements();

  const handleScoreUpdate = (newScore: number) => {
    update({ score: newScore });
  };

  return (
    <div>
      <h1>Game</h1>
      <p>Unlocked Achievements: {achievements.unlocked.length}</p>
      <button onClick={() => handleScoreUpdate(100)}>
        Score 100 points
      </button>
    </div>
  );
};
```

## Custom Storage

You can implement your own storage solution by implementing the `AchievementStorage` interface:

```typescript
import { AchievementStorage } from 'react-achievements-core';

class CustomStorage implements AchievementStorage {
  getMetrics() {
    // Your implementation
  }

  setMetrics(metrics) {
    // Your implementation
  }

  getUnlockedAchievements() {
    // Your implementation
  }

  setUnlockedAchievements(achievements) {
    // Your implementation
  }

  clear() {
    // Your implementation
  }
}

// Use your custom storage
const App = () => {
  return (
    <AchievementProvider
      achievements={achievements}
      storage={new CustomStorage()}
    >
      <Game />
    </AchievementProvider>
  );
};
```

## Styling

You can customize the appearance of the achievement components:

```tsx
const App = () => {
  return (
    <AchievementProvider
      achievements={achievements}
      theme={{
        colors: {
          primary: '#ff0000',
          background: '#f0f0f0'
        },
        position: 'top-right'
      }}
    >
      <Game />
    </AchievementProvider>
  );
};
```

## API Reference

### AchievementProvider Props

| Prop | Type | Description |
|------|------|-------------|
| achievements | AchievementConfig | Achievement configuration object |
| storage | 'local' \| 'memory' \| AchievementStorage | Storage implementation |
| theme | ThemeConfig | Custom theme configuration |
| onUnlock | (achievement: Achievement) => void | Callback when achievement is unlocked |

### useAchievements Hook

Returns an object with:

- `update`: Function to update achievement metrics
- `achievements`: Object containing unlocked and locked achievements
- `reset`: Function to reset achievement storage

## License

MIT