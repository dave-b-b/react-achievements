# React Achievements

**Display server-backed achievements in React** - fetch achievement state from your app server, track progress through REST calls, show badges, and celebrate unlocks.

[📚 Documentation](https://dave-b-b.github.io/react-achievements/) | [📦 npm Package](https://www.npmjs.com/package/react-achievements)

[![npm version](https://img.shields.io/npm/v/react-achievements.svg)](https://www.npmjs.com/package/react-achievements) [![License](https://img.shields.io/badge/license-Dual%20(MIT%20%2B%20Commercial)-blue.svg)](./LICENSE) [![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

<p align="center">
  <img
    src="https://raw.githubusercontent.com/dave-b-b/react-achievements/main/assets/demo-v4-4.gif"
    alt="React Achievements 4.4 demo showing achievement progress, unlock notifications, configurable confetti, and a compact LearnQuest achievements modal"
    width="900"
  />
</p>

## Installation

```bash
npm install react-achievements
```

**Requirements:** React 16.8+, Node.js 16+

If you want the official JavaScript backend engine, install `achievements-engine` in your server package. React Achievements can also display achievement data from Rails Merit or any backend that implements the same REST contract.

## Start Here

```tsx
import {
  AchievementProvider,
  AchievementsWidget,
  createRestAchievementClient,
  useSimpleAchievements,
} from 'react-achievements';

const achievementsClient = createRestAchievementClient({
  baseUrl: '/api/achievements',
});

function Game() {
  const { track, event } = useSimpleAchievements();

  return (
    <>
      <button onClick={() => track('score', 100)}>Score 100</button>
      <button onClick={() => event('lesson.completed', { lessonId: 'intro' })}>
        Complete lesson
      </button>
    </>
  );
}

export default function App() {
  return (
    <AchievementProvider client={achievementsClient}>
      <Game />
      <AchievementsWidget />
    </AchievementProvider>
  );
}
```

`AchievementsWidget` reads from context, shows the unlocked count, and opens a modal with locked and unlocked achievements. Use `placement="inline"` to put it in a drawer, sidebar, or navigation area. For an exact visual match, pass `renderTrigger` and use your app's own drawer row, nav item, or profile menu button while the widget still controls the modal.

Your server should expose this contract:

```http
GET  /api/achievements
POST /api/achievements/track
POST /api/achievements/increment
POST /api/achievements/event
POST /api/achievements/reset
```

The official `achievements-engine` package can run those routes on your server, but any backend can return the same snapshot shape.

```tsx
<AchievementsWidget
  placement="inline"
  renderTrigger={({ buttonProps, unlockedCount, totalCount }) => (
    <button {...buttonProps} className="drawer-row">
      Achievements
      <span>{unlockedCount}/{totalCount}</span>
    </button>
  )}
/>
```

## Common Placements

Use the same context-aware UI in whichever surface already fits your app:

```tsx
import { useState } from 'react';
import {
  AchievementsList,
  AchievementsModal,
  AchievementsWidget,
} from 'react-achievements';

// Floating launcher in a corner
<AchievementsWidget position="bottom-right" />

// Inline nav, drawer, sidebar, or profile menu item
<AchievementsWidget placement="inline" label="Badges" />

// Compact square badge grid for dense achievement catalogs
<AchievementsWidget density="compact" />

// Optional: blur the page behind the modal
<AchievementsWidget modalBackdropBlur={2} />

// Existing button or drawer row that opens the built-in modal
const [open, setOpen] = useState(false);

<button onClick={() => setOpen(true)}>View achievements</button>

// Optional: hide scrollbar chrome while preserving scroll
<AchievementsModal
  isOpen={open}
  onClose={() => setOpen(false)}
  hideScrollbar
  backdropBlur={2}
/>

// Inline achievements page, panel, drawer, or settings section
<AchievementsList showLocked />
```

For modal blur props, pass a number for pixels or a CSS length string. Omit the prop or pass `0` when you do not want backdrop blur.

Storybook includes examples for floating buttons, nav buttons, drawer rows, existing controls that open a modal, dashboard cards, profile menus, and inline lists.

Provider-level icons and UI options are shared across notifications, widgets, modals, and lists:

```tsx
<AchievementProvider
  client={achievementsClient}
  icons={{ login: '🔑', streak: '🔥' }}
  ui={{
    theme: 'minimal',
    notificationDuration: 8000,
    enableConfetti: true,
    confetti: {
      colors: ['#22d3ee', '#f97316', '#facc15'],
      particleCount: 120,
      spread: 80,
    },
    NotificationComponent: MyNotification,
    ModalComponent: MyAchievementsModal,
    ConfettiComponent: MyConfetti,
  }}
>
  <App />
</AchievementProvider>
```

Set `ui.enableConfetti` to `false` to disable the built-in celebration. Omit `ConfettiComponent` when you only want to tune the default `canvas-confetti` animation through `ui.confetti`.

Rewards returned by your server can optionally include `confetti` to override the global confetti settings. Omit `confetti` to use the provider defaults, or set `confetti: false` for quieter rewards:

```tsx
const achievements = {
  score: {
    100: {
      title: 'Century!',
      description: 'Score 100 points',
      icon: '🏆',
    },
    1000: {
      title: 'Boss Finale!',
      description: 'Score 1,000 points',
      icon: '👑',
      confetti: {
        particleCount: 240,
        spread: 100,
        startVelocity: 60,
        scalar: 1.4,
      },
    },
  },
};
```

## Hooks

```tsx
const {
  track,
  increment,
  event,
  trackMultiple,
  unlockedIds,
  unlockedAchievements,
  allAchievements,
  unlockedCount,
  totalCount,
} = useSimpleAchievements();
```

Deprecated aliases from v3, including `unlocked` and `all`, remain available until 5.0.

## Server Engine Example

Use `achievements-engine` on your server when you want JavaScript rule evaluation and persistence adapters:

```ts
import {
  AchievementService,
  MemoryAchievementRepository,
  createAchievementFetchHandler,
} from 'achievements-engine/server';

const service = new AchievementService({
  achievements,
  repository: new MemoryAchievementRepository(),
  eventMapping: {
    'lesson.completed': () => ({ completedLesson: true }),
  },
});

export const handleAchievementsRequest = createAchievementFetchHandler({
  service,
  basePath: '/api/achievements',
  getSubjectId: (request) => getUserIdFromSession(request),
});
```

For Rails Merit or a custom backend, expose the same REST endpoints and return the same achievement snapshot fields.

## Headless Usage

Use the DOM-free entry point when building custom UI or preparing a React Native integration:

```tsx
import {
  AchievementProvider,
  useAchievementState,
  useSimpleAchievements,
} from 'react-achievements/headless';

function CustomAchievementsPanel() {
  const { track } = useSimpleAchievements();
  const { allAchievements, unlockedCount, totalCount } = useAchievementState();

  return (
    <section>
      <button onClick={() => track('score', 100)}>Score 100</button>
      <p>{unlockedCount} / {totalCount} unlocked</p>

      {allAchievements.map((achievement) => (
        <div key={achievement.achievementId}>
          {achievement.isUnlocked ? 'Unlocked' : 'Locked'}: {achievement.achievementTitle}
        </div>
      ))}
    </section>
  );
}

export function App() {
  return (
    <AchievementProvider client={achievementsClient}>
      <CustomAchievementsPanel />
    </AchievementProvider>
  );
}
```

React Native UI components are not included in the web package; use `achievements-engine` or the `/headless` React APIs with your own native UI.

## Entry Points

- `react-achievements` - v4 web API with provider, hooks, built-in effects, widget, modal, and list components
- `react-achievements/web` - explicit web entry point
- `react-achievements/headless` - provider, hooks, engine, storage, and types without DOM UI

## Migrating From v3

- Built-in UI is now the default; `useBuiltInUI` is a deprecated no-op.
- `AchievementsWidget` replaces the legacy manual `BadgesButtonWithModal` setup.
- `useSimpleAchievements()` now returns `unlockedIds`, `unlockedAchievements`, and `allAchievements`.
- External UI peer dependencies are no longer required.
- Deprecated v3 component names remain as compatibility wrappers until 5.0.

## License

React Achievements is dual-licensed:

- **Free for Non-Commercial Use** (MIT License)
- **Commercial License Required** for businesses, SaaS, commercial apps, and enterprise use

[Get Commercial License](https://github.com/sponsors/dave-b-b) | [License Details](./LICENSE) | [Commercial Terms](./COMMERCIAL-LICENSE.md)

## AI Agents

If you're using AI coding agents, see `AGENTS.md` for the recommended v4 integration prompt.
