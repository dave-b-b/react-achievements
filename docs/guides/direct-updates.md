---
sidebar_position: 1
---

# Direct Metric Updates

Direct updates are the recommended path for most React apps. Call `track`, `increment`, or `trackMultiple` from components inside `AchievementProvider`.

## Setup

```tsx
import {
  AchievementProvider,
  AchievementsWidget,
  useSimpleAchievements,
} from 'react-achievements';

const achievements = {
  score: {
    100: { title: 'Century!', description: 'Score 100 points', icon: '🏆' },
    500: { title: 'High Scorer!', description: 'Score 500 points', icon: '⭐' },
  },
  completedTutorial: {
    true: { title: 'Tutorial Master', description: 'Complete the tutorial', icon: '📚' },
  },
};

function Game() {
  const { track, increment, trackMultiple } = useSimpleAchievements();

  return (
    <div>
      <button onClick={() => track('score', 100)}>Score 100</button>
      <button onClick={() => increment('score', 50)}>Add 50</button>
      <button onClick={() => trackMultiple({ score: 500, completedTutorial: true })}>
        Finish Run
      </button>
    </div>
  );
}

export default function App() {
  return (
    <AchievementProvider achievements={achievements}>
      <Game />
      <AchievementsWidget />
    </AchievementProvider>
  );
}
```

## Achievement Types

### Numeric Thresholds

```tsx
const achievements = {
  score: {
    100: { title: 'Century!', icon: '🏆' },
  },
};

track('score', 100);
```

### Boolean Milestones

```tsx
const achievements = {
  completedTutorial: {
    true: { title: 'Tutorial Master', icon: '📚' },
  },
};

track('completedTutorial', true);
```

### String Values

```tsx
const achievements = {
  difficulty: {
    hard: { title: 'Hard Mode', icon: '💪' },
  },
};

track('difficulty', 'hard');
```

### Custom Conditions

```tsx
const achievements = {
  perfectGame: {
    custom: {
      title: 'Perfect Game',
      description: 'Score 1000+ with 100% accuracy',
      icon: '🎯',
      condition: (metrics) => metrics.score >= 1000 && metrics.accuracy === 100,
    },
  },
};

trackMultiple({ score: 1000, accuracy: 100 });
```

## State Returned By useSimpleAchievements

```tsx
const {
  unlockedIds,
  unlockedAchievements,
  allAchievements,
  unlockedCount,
  totalCount,
  reset,
  exportData,
  importData,
} = useSimpleAchievements();
```

`unlocked` and `all` are deprecated v3 aliases and will be removed in a future major release.

## Custom Placement

```tsx
<AchievementsWidget placement="inline" />
```

Use `AchievementsList` to render achievement content directly in a drawer, profile page, or settings screen.
