---
sidebar_position: 0
---

# Migrating From v3 To v4

React Achievements 4.0 focuses on easier app integration. The root package is web-friendly, built-in UI is the default, and a DOM-free `/headless` entry point is available for custom UI.

## Main Changes

### Install Fewer UI Dependencies

For v4, install the package by itself:

```bash
npm install react-achievements
```

Remove the old optional UI peer dependencies unless your app uses them directly:

- `react-toastify`
- `react-modal`
- `react-confetti`
- `react-use`

### Use AchievementsWidget

```tsx
import { AchievementProvider, AchievementsWidget } from 'react-achievements';

<AchievementProvider achievements={achievements}>
  <App />
  <AchievementsWidget />
</AchievementProvider>
```

You no longer need to pass `unlockedAchievements` into the default badge UI. The widget reads achievement state from context.

```tsx
// v3-style manual composition
const { unlocked } = useSimpleAchievements();
const unlockedBadges = unlocked.map((id) => badgeMap[id]);

<BadgesButtonWithModal unlockedAchievements={unlockedBadges} />;

// v4
<AchievementsWidget />;
```

### Use Explicit Hook Names

```tsx
const {
  unlockedIds,
  unlockedAchievements,
  allAchievements,
  unlockedCount,
  totalCount,
} = useSimpleAchievements();
```

The v3 `unlocked` alias still returns IDs, but it is deprecated and will be removed in a future major release.

### Remove useBuiltInUI

Built-in UI is now the default.

```tsx
// v3
<AchievementProvider achievements={achievements} useBuiltInUI={true}>

// v4
<AchievementProvider achievements={achievements}>
```

`useBuiltInUI` is accepted as a no-op until a future major release.

### Update Custom Icons

Use `icons` on the provider. The value is shared by notifications, widgets, modals, and lists.

```tsx
<AchievementProvider
  achievements={achievements}
  icons={{ login: '🔑', streak: '🔥' }}
>
  <App />
  <AchievementsWidget />
</AchievementProvider>
```

### Use Headless For Custom UI

```tsx
import { AchievementProvider, useAchievementState } from 'react-achievements/headless';
```

The headless entry point does not import DOM UI components and is the recommended base for custom web UI or React Native-specific UI.

## Deprecated Compatibility APIs

- `BadgesButton`
- `BadgesModal`
- `BadgesButtonWithModal`
- `ConfettiWrapper`
- `useBuiltInUI`
- `useSimpleAchievements().unlocked`
- `useSimpleAchievements().all`

Keep these only long enough to migrate. New v4 code should use `AchievementsWidget`, `AchievementsModal`, `AchievementsList`, `unlockedIds`, and `allAchievements`.
