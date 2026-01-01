---
sidebar_position: 2
---

# Quick Start

Build your first achievement system in 5 minutes.

## Step 1: Install

```bash npm2yarn
npm install react-achievements
```

## Step 2: Choose Your Tracking Pattern

React Achievements supports two ways to track progress:

### Direct Updates (Recommended for Beginners)

Update metrics directly in your React components. Simple and straightforward.

```tsx
const { track } = useSimpleAchievements();
track('score', 100);
```

**Best for**: Simple apps, React-only projects, quick prototypes

### Event-Based Tracking (Recommended for Larger Apps)

Emit semantic events that get mapped to metric updates.

```tsx
const engine = useAchievementEngine();
engine.emit('userScored', { points: 100 });
```

**Best for**: Multi-framework projects, complex logic, better testing

---

**This guide uses Direct Updates.** For Event-Based, see the [Event-Based Tracking Guide](/docs/guides/event-based-tracking).

## Step 3: Define Achievements

Create an achievements configuration using the Simple API:

```tsx title="achievements.ts"
export const gameAchievements = {
  // Score-based achievements
  score: {
    100: { title: 'Century!', description: 'Score 100 points', icon: '🏆' },
    500: { title: 'High Scorer!', description: 'Score 500 points', icon: '⭐' },
    1000: { title: 'Legend!', description: 'Score 1000 points', icon: '💎' },
  },

  // Boolean achievements
  completedTutorial: {
    true: { title: 'Tutorial Master', description: 'Complete the tutorial', icon: '📚' }
  },

  // Custom condition
  perfectGame: {
    custom: {
      title: 'Perfect Game',
      description: 'Score 1000+ with 100% accuracy',
      icon: '🎯',
      condition: (metrics) => metrics.score >= 1000 && metrics.accuracy === 100
    }
  }
};
```

## Step 4: Wrap Your App

Wrap your application with the `AchievementProvider`:

```tsx title="App.tsx"
import { AchievementProvider } from 'react-achievements';
import { gameAchievements } from './achievements';
import Game from './Game';

function App() {
  return (
    <AchievementProvider
      achievements={gameAchievements}
      useBuiltInUI={true}  // Use built-in UI components
    >
      <Game />
    </AchievementProvider>
  );
}

export default App;
```

## Step 5: Track Progress

Use the `useSimpleAchievements` hook to track user progress:

```tsx title="Game.tsx"
import { useSimpleAchievements } from 'react-achievements';

function Game() {
  const { track, increment } = useSimpleAchievements();

  const handleScorePoints = (points: number) => {
    track('score', points);
  };

  const handleCompleteTutorial = () => {
    track('completedTutorial', true);
  };

  return (
    <div>
      <button onClick={() => handleScorePoints(100)}>Score 100</button>
      <button onClick={() => handleScorePoints(500)}>Score 500</button>
      <button onClick={handleCompleteTutorial}>Complete Tutorial</button>
    </div>
  );
}

export default Game;
```

## Step 6: Display Achievements

Add the `BadgesButtonWithModal` component to show unlocked achievements:

```tsx title="Game.tsx"
import { useSimpleAchievements, BadgesButtonWithModal } from 'react-achievements';

function Game() {
  const { track, unlocked, getAllAchievements } = useSimpleAchievements();

  return (
    <div>
      {/* Your game UI */}
      <button onClick={() => track('score', 100)}>Score 100</button>

      {/* Achievement UI - no state management needed! */}
      <BadgesButtonWithModal
        unlockedAchievements={unlocked}
        showAllAchievements={true}
        allAchievements={getAllAchievements()}
      />
    </div>
  );
}
```

**Advanced: Manual State Management**

For complex scenarios (multiple triggers, custom state), use the separate components:

```tsx title="Game.tsx (Advanced)"
import { useState } from 'react';
import { useSimpleAchievements, BadgesButton, BadgesModal } from 'react-achievements';

function Game() {
  const [modalOpen, setModalOpen] = useState(false);
  const { track, unlocked, getAllAchievements } = useSimpleAchievements();

  return (
    <div>
      {/* Your game UI */}
      <button onClick={() => track('score', 100)}>Score 100</button>

      {/* Achievement UI with manual state */}
      <BadgesButton
        onClick={() => setModalOpen(true)}
        unlockedAchievements={unlocked}
      />

      <BadgesModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        showAllAchievements={true}
        allAchievements={getAllAchievements()}
      />
    </div>
  );
}
```

## What Happens Next?

When a user scores 100 points:

1. **Track**: `track('score', 100)` is called
2. **Evaluate**: Provider checks if any achievements are unlocked
3. **Notify**: A beautiful notification appears: "🏆 Century! - Score 100 points"
4. **Celebrate**: Confetti animation plays
5. **Persist**: Achievement is saved to localStorage

That's it! You've built a complete achievement system.

## Alternative: Event-Based Pattern

Want to try the event-based approach? Here's the same example:

```tsx title="achievementEngine.ts"
import { AchievementEngine } from 'react-achievements';
import { gameAchievements } from './achievements';

// Create engine outside React
export const engine = new AchievementEngine({
  achievements: gameAchievements,
  eventMapping: {
    'userScored': (data) => ({ score: data.points }),
    'tutorialCompleted': () => ({ completedTutorial: true }),
    'gameCompleted': (data) => ({
      score: data.score,
      accuracy: data.accuracy
    })
  },
  storage: 'local'
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
```

```tsx title="Game.tsx"
import { useAchievementEngine } from 'react-achievements';

function Game() {
  const engine = useAchievementEngine();

  const handleScorePoints = (points: number) => {
    // Emit semantic events
    engine.emit('userScored', { points });
  };

  const handleCompleteTutorial = () => {
    engine.emit('tutorialCompleted');
  };

  return (
    <div>
      <button onClick={() => handleScorePoints(100)}>Score 100</button>
      <button onClick={() => handleScorePoints(500)}>Score 500</button>
      <button onClick={handleCompleteTutorial}>Complete Tutorial</button>
    </div>
  );
}
```

**Learn more**: [Event-Based Tracking Guide](/docs/guides/event-based-tracking)

## Next Steps

Now that you have the basics working, explore more features:

- **[Direct Updates Guide](/docs/guides/direct-updates)** - Learn all direct update patterns
- **[Event-Based Tracking](/docs/guides/event-based-tracking)** - Try the event-driven pattern
- **[Theming](/docs/guides/theming)** - Customize the look and feel
- **[Common Patterns](/docs/recipes/common-patterns)** - Ready-to-use code examples

## Common Customizations

### Change Notification Position

```tsx
<AchievementProvider
  achievements={gameAchievements}
  useBuiltInUI={true}
  ui={{
    notificationPosition: 'top-right', // top-left, top-center, top-right, bottom-left, bottom-center, bottom-right
  }}
>
```

### Use a Different Theme

```tsx
<AchievementProvider
  achievements={gameAchievements}
  useBuiltInUI={true}
  ui={{
    theme: 'gamified', // modern, minimal, gamified
  }}
>
```

### Disable Confetti

```tsx
<AchievementProvider
  achievements={gameAchievements}
  useBuiltInUI={true}
  ui={{
    enableConfetti: false,
  }}
>
```

## Troubleshooting

### Achievements not unlocking?

Make sure you're calling `track()` with the correct metric name and value:

```tsx
// ✅ Correct
track('score', 100);

// ❌ Wrong - metric name doesn't match
track('points', 100);
```

### Modal showing "achievements.all" instead of real achievements?

Use `getAllAchievements()` instead of `achievements.all`:

```tsx
// ✅ Correct
<BadgesModal
  showAllAchievements={true}
  allAchievements={getAllAchievements()}
/>

// ❌ Wrong
<BadgesModal
  showAllAchievements={true}
  allAchievements={achievements.all}
/>
```

### Need help?

- Check the [API Reference](/docs/api-intro)
- Browse [Common Patterns](/docs/recipes/common-patterns)
- Open an [issue on GitHub](https://github.com/YOUR_GITHUB_USERNAME/react-achievements/issues)
