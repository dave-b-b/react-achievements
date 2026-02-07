# React Achievements - Agent Guide

Use this when adding achievements with an AI coding agent. Keep changes minimal and follow the Simple API unless advanced behavior is required.

## Golden Path (Recommended)

```tsx
import { AchievementProvider, useSimpleAchievements, BadgesButtonWithModal } from 'react-achievements';

const achievements = {
  score: {
    100: { title: 'Century!', description: 'Score 100 points', icon: '🏆' },
  }
};

function AchievementsUI() {
  const { track, unlocked } = useSimpleAchievements();

  return (
    <div>
      <button onClick={() => track('score', 100)}>Score 100</button>
      <BadgesButtonWithModal unlockedAchievements={unlocked} />
    </div>
  );
}

export default function App() {
  return (
    <AchievementProvider achievements={achievements} useBuiltInUI={true}>
      <AchievementsUI />
    </AchievementProvider>
  );
}
```

## Recommended API

- Use `useSimpleAchievements` for most apps.
- Use `BadgesButtonWithModal` for a zero-state UI.
- Keep achievement config in a single `achievements.ts` file.

## Common Pitfalls

- Hooks must be inside the `AchievementProvider` tree.
- Use `getAllAchievements()` with `BadgesModal` (not `achievements.all`).
- For Next.js App Router or SSR, ensure components using hooks are client components (`"use client"`).

## Prompt Template

```
Add React Achievements to this app. Use the Simple API. Create an achievements config in achievements.ts, wrap the app with AchievementProvider, and add a BadgesButtonWithModal. Use built-in UI and minimal state.
```
