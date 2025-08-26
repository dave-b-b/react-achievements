# React Achievements

A flexible and extensible achievement system for React applications. This package provides the foundation for implementing achievements in React applications with support for multiple state management solutions including Redux, Zustand, and Context API. Check the `stories/examples` directory for implementation examples with different state management solutions.

<p align="center">
  <img src="https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExbnMxdHVqanZvbGR6czJqOTdpejZqc3F3NXh6a2FiM3lmdnB0d3VoOSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/LYXAZelQMeeYpzbgtT/giphy.gif" alt="React Achievements Demo" width="600" />
</p>

## Installation

```bash
npm install react-achievements react react-dom react-confetti react-modal react-toastify react-use
```

Note: React and React DOM should be version 16.8.0 or higher. If you already have some of these packages installed, npm will skip them automatically.

## Quick Start

Here's a complete working example using the **new Simple API** that shows automatic notifications and achievement tracking:

```tsx
import React, { useState } from 'react';
import { 
  AchievementProvider, 
  useSimpleAchievements, 
  BadgesButton, 
  BadgesModal 
} from 'react-achievements';

// Define achievements with the new three-tier Builder API - 95% less code!
import { AchievementBuilder } from 'react-achievements';

const gameAchievements = AchievementBuilder.combine([
  AchievementBuilder.createScoreAchievements([100, 500]), // Smart defaults
  AchievementBuilder.createLevelAchievement(5).withAward({ title: 'Leveling Up', icon: '📈' }), // Chainable customization
  AchievementBuilder.createBooleanAchievement('completedTutorial').withAward({ title: 'Tutorial Master', icon: '📚' })
]);

// Demo component with all essential features  
const DemoComponent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { track, unlocked, unlockedCount, reset } = useSimpleAchievements();

  return (
    <div>
      <h1>Achievement Demo</h1>
      
      {/* Simple tracking - much easier! */}
      <button onClick={() => track('score', 100)}>
        Score 100 points
      </button>
      <button onClick={() => track('score', 500)}>
        Score 500 points  
      </button>
      <button onClick={() => track('level', 5)}>
        Reach level 5
      </button>      
      <button onClick={() => track('completedTutorial', true)}>
        Complete tutorial
      </button>
      
      {/* Reset button */}
      <button onClick={reset}>
        Reset Achievements
      </button>
      
      {/* Shows unlocked achievements count */}
      <p>Unlocked: {unlockedCount}</p>
      
      {/* Floating badges button */}
      <BadgesButton 
        position="bottom-right"
        onClick={() => setIsModalOpen(true)}
        unlockedAchievements={[]} // Simplified for demo
      />
      
      {/* Achievement history modal */}
      <BadgesModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        achievements={[]} // Simplified for demo
      />
    </div>
  );
};

// Root component with provider
const App = () => {
  return (
    <AchievementProvider
      achievements={gameAchievements}
      storage="local"
    >
      <DemoComponent />
    </AchievementProvider>
  );
};

export default App;
```

When you click "Score 100 points":
1. A toast notification appears automatically
2. Confetti animation plays  
3. The achievement is stored and visible in the badges modal
4. The badges button updates to show the new count

## Simple API (Recommended)

Perfect for 90% of use cases - threshold-based achievements with minimal configuration:

```tsx
import { AchievementProvider, useSimpleAchievements } from 'react-achievements';

const achievements = {
  // Numeric thresholds
  score: {
    100: { title: 'Century!', description: 'Score 100 points', icon: '🏆' },
    500: { title: 'High Scorer!', icon: '⭐' }
  },
  
  // Boolean achievements  
  completedTutorial: {
    true: { title: 'Tutorial Master', description: 'Complete the tutorial', icon: '📚' }
  },
  
  // String-based achievements
  characterClass: {
    wizard: { title: 'Arcane Scholar', description: 'Choose the wizard class', icon: '🧙‍♂️' },
    warrior: { title: 'Battle Hardened', description: 'Choose the warrior class', icon: '⚔️' }
  },

  // Custom condition functions for complex logic
  combo: {
    custom: {
      title: 'Perfect Combo',
      description: 'Score 1000+ with 100% accuracy', 
      icon: '💎',
      condition: (metrics) => metrics.score >= 1000 && metrics.accuracy === 100
    }
  }
};

const { track, unlocked, unlockedCount, reset } = useSimpleAchievements();

// Track achievements easily
track('score', 100);           // Unlocks "Century!" achievement
track('completedTutorial', true);  // Unlocks "Tutorial Master"
track('characterClass', 'wizard'); // Unlocks "Arcane Scholar"

// Track multiple metrics for custom conditions
track('score', 1000);
track('accuracy', 100);        // Unlocks "Perfect Combo" if both conditions met
```

### Simple API Comparison Logic

When using the Simple API, achievement conditions use different comparison operators depending on the value type:

| Value Type | Comparison | Example | When Achievement Unlocks |
|------------|------------|---------|-------------------------|
| **Numeric** | `>=` (greater than or equal) | `score: { 100: {...} }` | When `track('score', 100)` or higher |
| **Boolean** | `===` (strict equality) | `completedTutorial: { true: {...} }` | When `track('completedTutorial', true)` |
| **String** | `===` (strict equality) | `characterClass: { wizard: {...} }` | When `track('characterClass', 'wizard')` |

**Important Notes:**
- **Numeric achievements** use `>=` comparison, so they unlock when you reach **or exceed** the threshold
- **Boolean and string achievements** use exact equality matching
- Custom condition functions have full control over comparison logic

**Examples:**
```tsx
// Numeric: Achievement unlocks at 100 or higher
track('score', 150);  // ✅ Unlocks "Century!" (threshold: 100)
track('score', 99);   // ❌ Does not unlock

// Boolean: Must match exactly  
track('completedTutorial', true);   // ✅ Unlocks achievement
track('completedTutorial', false);  // ❌ Does not unlock

// String: Must match exactly
track('characterClass', 'wizard');   // ✅ Unlocks "Arcane Scholar"
track('characterClass', 'Wizard');   // ❌ Does not unlock (case sensitive)
```

## Three-Tier Builder API

The AchievementBuilder provides three levels of complexity to match your needs - from zero-config defaults to full custom logic:

### Tier 1: Smart Defaults (90% of use cases)

Zero configuration needed - just specify what you want to track:

```tsx
import { AchievementBuilder } from 'react-achievements';

// Individual achievements with smart defaults
AchievementBuilder.createScoreAchievement(100);        // "Score 100!" + 🏆
AchievementBuilder.createLevelAchievement(5);          // "Level 5!" + 📈  
AchievementBuilder.createBooleanAchievement('completedTutorial'); // "Completed Tutorial!" + ✅

// Bulk creation with smart defaults
AchievementBuilder.createScoreAchievements([100, 500, 1000]);
AchievementBuilder.createLevelAchievements([5, 10, 25]);

// Mixed: some defaults, some custom awards
const achievements = AchievementBuilder.createScoreAchievements([
  100,  // Uses default "Score 100!" + 🏆
  [500, { title: 'High Scorer!', icon: '⭐' }],  // Custom award
  1000  // Uses default "Score 1000!" + 🏆
]);
```

### Tier 2: Chainable Customization

Start with defaults, then customize awards as needed:

```tsx
// Individual achievements with custom awards
const achievements = AchievementBuilder.combine([
  AchievementBuilder.createScoreAchievement(100)
    .withAward({ title: 'Century!', description: 'Amazing score!', icon: '🏆' }),
    
  AchievementBuilder.createLevelAchievement(5)
    .withAward({ title: 'Getting Started', icon: '🌱' }),
    
  AchievementBuilder.createBooleanAchievement('completedTutorial')
    .withAward({ title: 'Tutorial Master', description: 'You did it!', icon: '📚' }),
    
  AchievementBuilder.createValueAchievement('characterClass', 'wizard')
    .withAward({ title: 'Arcane Scholar', icon: '🧙‍♂️' })
]);
```

### Tier 3: Full Control for Complex Logic

Complete control over achievement conditions for power users:

```tsx
// Handle complex scenarios like Date, null, undefined values
const complexAchievement = AchievementBuilder.create()
  .withId('weekly_login')
  .withMetric('lastLoginDate')
  .withCondition((value, state) => {
    // Handle all possible value types
    if (value === null || value === undefined) return false;
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

// Multiple complex achievements
const advancedAchievements = AchievementBuilder.combine([
  complexAchievement,
  AchievementBuilder.create()
    .withId('perfect_combo')
    .withMetric('gameState')
    .withCondition((value, state) => {
      return state.score >= 1000 && state.accuracy === 100;
    })
    .withAward({ title: 'Perfect!', icon: '💎' })
    .build()
]);
```

### Key Benefits
- **Progressive complexity**: Start simple, add complexity only when needed
- **Zero configuration**: Works out of the box with smart defaults
- **Chainable customization**: Fine-tune awards without changing logic
- **Type-safe**: Full TypeScript support for complex conditions
- **Handles edge cases**: Date, null, undefined values in Tier 3
- **Combinable**: Mix and match different tiers in one configuration

## State Management Options

This package includes example implementations for different state management solutions in the `stories/examples` directory:

- **Redux**: For large applications with complex state management needs
- **Zustand**: For applications needing a lightweight, modern state solution
- **Context API**: For applications preferring React's built-in solutions

See the [examples directory](./stories/examples) for detailed implementations and instructions for each state management solution.

## Features

- Framework-agnostic achievement system
- Customizable storage implementations
- Built-in local storage support
- Customizable UI components
- Toast notifications
- Confetti animations
- TypeScript support

## Achievement Notifications & History

The package provides two ways to display achievements to users:

### Automatic Notifications
When an achievement is unlocked, the system automatically:
- Shows a toast notification in the top-right corner with the achievement details
- Plays a confetti animation to celebrate the achievement

These notifications appear immediately when achievements are unlocked and require no additional setup.

### Achievement History
To allow users to view their achievement history, the package provides two essential components:

1. `BadgesButton`: A floating button that shows the number of unlocked achievements
```tsx
<BadgesButton 
  position="bottom-right" // or "top-right", "top-left", "bottom-left"
  onClick={() => setIsModalOpen(true)}
  unlockedAchievements={achievements.unlocked}
/>
```

2. `BadgesModal`: A modal dialog that displays all unlocked achievements with their details
```tsx
<BadgesModal 
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  achievements={achievements.unlocked}
  icons={customIcons} // Optional custom icons
/>
```

These components are the recommended way to give users access to their achievement history. While you could build custom UI using the `useAchievements` hook data, these components provide a polished, ready-to-use interface for achievement history.


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

## Advanced: Complex API

For complex scenarios requiring full control over achievement logic, you can use the traditional Complex API with POJO (Plain Old JavaScript Object) configurations:

```tsx
import { AchievementProvider, useAchievements } from 'react-achievements';

// Define your achievements using the traditional complex format
const achievements = {
  score: [{
    isConditionMet: (value: AchievementMetricArrayValue, state: AchievementState) => {
      const numValue = Array.isArray(value) ? value[0] : value;
      return typeof numValue === 'number' && numValue >= 100;
    },
    achievementDetails: {
      achievementId: 'score_100',
      achievementTitle: 'Century!',
      achievementDescription: 'Score 100 points',
      achievementIconKey: 'trophy'
    }
  }],
  
  completedTutorial: [{
    isConditionMet: (value: AchievementMetricArrayValue, state: AchievementState) => {
      const boolValue = Array.isArray(value) ? value[0] : value;
      return typeof boolValue === 'boolean' && boolValue === true;
    },
    achievementDetails: {
      achievementId: 'tutorial_complete',
      achievementTitle: 'Tutorial Master',
      achievementDescription: 'Complete the tutorial',
      achievementIconKey: 'book'
    }
  }]
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

This API provides maximum flexibility for complex achievement logic but requires more verbose configuration. Most users should use the Simple API or Builder API instead.

## License

MIT