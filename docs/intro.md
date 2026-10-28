---
sidebar_position: 0
---

# React Achievements

React Achievements 6 adds progress tracking, unlock notifications, confetti, and an achievement widget to React apps. [Try these features in the live LearnQuest demo](https://achievements-starter.vercel.app/).

`achievements-engine` 2.1 owns rules, progress calculation, and REST contracts. `react-achievements` 6 connects those results to React hooks and built-in UI.

## Version 6 Quick Start

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
- Compact square badge grids for dense achievement catalogs
- Modal controls for backdrop blur and hidden scrollbar chrome
- Event-based tracking through `AchievementEngine`
- A DOM-free `/headless` entry point for custom UI and React Native preparation

## Next Steps

- [Installation](/docs/getting-started/installation)
- [Quick Start](/docs/getting-started/quick-start)
- [Full Feature Setup](/docs/getting-started/v4-feature-setup)
- [Direct Updates](/docs/guides/direct-updates)
- [Event-Based Tracking](/docs/guides/event-based-tracking)
