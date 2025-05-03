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

// Define your achievements with various data types and conditions
const achievements = {
  // Numeric achievements with thresholds
  score: {
    100: {
      title: 'Century!',
      description: 'Score 100 points',
      icon: 'trophy'
    },
    500: {
      title: 'Half a Thousand!',
      description: 'Score 500 points',
      icon: 'gold',
      condition: (value) => value >= 500
    }
  },

  // Boolean achievements
  completedTutorial: {
    true: {
      title: 'Tutorial Master',
      description: 'Complete the tutorial',
      icon: 'book'
    }
  },

  // String-based achievements
  characterClass: {
    'wizard': {
      title: 'Arcane Scholar',
      description: 'Choose the wizard class',
      icon: 'wand'
    },
    'warrior': {
      title: 'Battle Hardened',
      description: 'Choose the warrior class',
      icon: 'sword'
    }
  },

  // Array-based achievements
  collectedItems: {
    ['sword', 'shield', 'potion']: {
      title: 'Fully Equipped',
      description: 'Collect all essential items',
      icon: 'backpack',
      condition: (items) => ['sword', 'shield', 'potion'].every(item => items.includes(item))
    }
  },

  // Object-based achievements
  playerStats: {
    { strength: 10, intelligence: 10 }: {
      title: 'Balanced Warrior',
      description: 'Achieve balanced stats',
      icon: 'scale',
      condition: (stats) => stats.strength === 10 && stats.intelligence === 10
    }
  },

  // Time-based achievements
  playTime: {
    3600: {
      title: 'Dedicated Player',
      description: 'Play for 1 hour',
      icon: 'clock',
      condition: (seconds) => seconds >= 3600
    }
  },

  // Combination achievements
  combo: {
    { score: 1000, level: 5 }: {
      title: 'Rising Star',
      description: 'Reach level 5 with 1000 points',
      icon: 'star',
      condition: (metrics) => metrics.score >= 1000 && metrics.level >= 5
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

## Default Icons

The package comes with a comprehensive set of default icons that you can use in your achievements. These are available through the `defaultAchievementIcons` export:

```tsx
import { AchievementProvider, defaultAchievementIcons } from 'react-achievements-core';

// Example achievement configuration using default icons
const achievementConfig = {
  pageViews: [
    {
      isConditionMet: (value) => value >= 5,
      achievementDetails: {
        achievementId: 'views-5',
        achievementTitle: 'Getting Started',
        achievementDescription: 'Viewed 5 pages',
        achievementIconKey: 'firstStep' // This will use the 👣 emoji from defaultAchievementIcons
      }
    }
  ]
};

// Create your app component
const App = () => {
  return (
    <AchievementProvider
      achievements={achievementConfig}
      // The provider automatically uses defaultAchievementIcons
    >
      <Game />
    </AchievementProvider>
  );
};
```

### Custom Icons

You can also provide your own custom icons that will override or extend the default ones:

```tsx
import { AchievementProvider, defaultAchievementIcons } from 'react-achievements-core';

// Create custom icons by extending the defaults
const customIcons = {
  ...defaultAchievementIcons, // Include all default icons
  levelUp: '🚀', // Override the default for 'levelUp'
  myCustomIcon: '💻' // Add a new icon not in the defaults
};

const App = () => {
  return (
    <AchievementProvider
      achievements={achievementConfig}
      icons={customIcons} // Pass your custom icons to the provider
    >
      <Game />
    </AchievementProvider>
  );
};
```

### Available Icons

The `defaultAchievementIcons` includes icons in these categories:

- General Progress & Milestones (levelUp, questComplete, etc.)
- Social & Engagement (shared, liked, etc.)
- Time & Activity (activeDay, streak, etc.)
- Creativity & Skill (artist, expert, etc.)
- Achievement Types (bronze, silver, gold, etc.)
- Numbers & Counters (one, ten, hundred, etc.)
- Actions & Interactions (clicked, discovered, etc.)
- Placeholders (default, loading, error, etc.)
- Miscellaneous (trophy, star, gem, etc.)

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