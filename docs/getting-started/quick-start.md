---
sidebar_position: 2
---

# Quick Start

Build your first achievement system in 5 minutes.

## Step 1: Install

```bash npm2yarn
npm install react-achievements
```

## Step 2: Define Achievements

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

## Step 3: Wrap Your App

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

## Step 4: Track Progress

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

## Step 5: Display Achievements

Add the `BadgesButton` and `BadgesModal` to show unlocked achievements:

```tsx title="Game.tsx"
import { useSimpleAchievements, BadgesButton, BadgesModal } from 'react-achievements';
import { useState } from 'react';

function Game() {
  const [modalOpen, setModalOpen] = useState(false);
  const { track, unlocked, getAllAchievements } = useSimpleAchievements();

  return (
    <div>
      {/* Your game UI */}
      <button onClick={() => track('score', 100)}>Score 100</button>

      {/* Achievement UI */}
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

## Next Steps

Now that you have the basics working, explore more features:

- **[Simple API Guide](/docs/guides/simple-api)** - Learn all Simple API patterns
- **[Storage Options](/docs/guides/storage-options)** - Choose the right storage backend
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

- Check the [API Reference](/docs/api)
- Browse [Common Patterns](/docs/recipes/common-patterns)
- Open an [issue on GitHub](https://github.com/YOUR_GITHUB_USERNAME/react-achievements/issues)
