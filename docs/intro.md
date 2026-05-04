---
sidebar_position: 0
---

# React Achievements

React Achievements adds gamification to React apps with progress tracking, unlock notifications, confetti, and a ready-made achievement widget.

## v4 Happy Path

```tsx
import {
  AchievementProvider,
  AchievementsWidget,
  useSimpleAchievements,
} from 'react-achievements';

const achievements = {
  score: {
    100: { title: 'Century!', description: 'Score 100 points', icon: '🏆' },
  },
};

function Game() {
  const { track } = useSimpleAchievements();
  return <button onClick={() => track('score', 100)}>Score 100</button>;
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

## What You Get

- A Simple API for numeric, boolean, string, and custom-condition achievements
- Built-in notifications and confetti by default
- `AchievementsWidget` for badge button plus modal
- `AchievementsList` for drawers, sidebars, and settings pages
- Event-based tracking through `AchievementEngine`
- A DOM-free `/headless` entry point for custom UI and React Native preparation

## Next Steps

- [Installation](/docs/getting-started/installation)
- [Quick Start](/docs/getting-started/quick-start)
- [v4 Feature Setup](/docs/getting-started/v4-feature-setup)
- [Direct Updates](/docs/guides/direct-updates)
- [Event-Based Tracking](/docs/guides/event-based-tracking)
