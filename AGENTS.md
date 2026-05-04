# React Achievements - Agent Guide

Use this when adding achievements with an AI coding agent. Prefer the v4 Simple API and the context-aware widget.

## Golden Path

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

  return (
    <button onClick={() => track('score', 100)}>
      Score 100
    </button>
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

## Recommended API

- Use `useSimpleAchievements` for most apps.
- Use `AchievementsWidget` for the default badge button and modal.
- Use `AchievementsWidget placement="inline"` for drawers, sidebars, or nav bars.
- Use `AchievementsList` when the app needs achievement content rendered directly.
- Keep achievement config in a single `achievements.ts` file.

## Common Pitfalls

- Hooks must be inside the `AchievementProvider` tree.
- Use `unlockedIds`, `unlockedAchievements`, and `allAchievements`; `unlocked` is a deprecated v3 alias.
- Do not manually map unlocked IDs into badge objects for the default UI; `AchievementsWidget` reads context.
- For Next.js App Router or SSR, ensure components using hooks are client components (`"use client"`).
- For React Native, use `achievements-engine` or `react-achievements/headless` with custom native UI.

## Prompt Template

```text
Add React Achievements to this app. Use the v4 Simple API. Create an achievements config in achievements.ts, wrap the app with AchievementProvider, add an AchievementsWidget, and use useSimpleAchievements for tracking.
```
