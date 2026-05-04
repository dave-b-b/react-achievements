# React Achievements

**Add gamification to your React app in minutes** - Track progress, unlock achievements, show badges, and celebrate milestones.

[📚 Documentation](https://dave-b-b.github.io/react-achievements/) | [📦 npm Package](https://www.npmjs.com/package/react-achievements)

[![npm version](https://img.shields.io/npm/v/react-achievements.svg)](https://www.npmjs.com/package/react-achievements) [![License](https://img.shields.io/badge/license-Dual%20(MIT%20%2B%20Commercial)-blue.svg)](./LICENSE) [![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

## Installation

```bash
npm install react-achievements
```

**Requirements:** React 16.8+, Node.js 16+

## Start Here

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

`AchievementsWidget` reads from context, shows the unlocked count, and opens a modal with locked and unlocked achievements. Use `placement="inline"` to put it in a drawer, sidebar, or navigation area. For an exact visual match, pass `renderTrigger` and use your app's own drawer row, nav item, or profile menu button while the widget still controls the modal.

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

// Existing button or drawer row that opens the built-in modal
const [open, setOpen] = useState(false);

<button onClick={() => setOpen(true)}>View achievements</button>
<AchievementsModal isOpen={open} onClose={() => setOpen(false)} />

// Inline achievements page, panel, drawer, or settings section
<AchievementsList showLocked />
```

Storybook includes examples for floating buttons, nav buttons, drawer rows, existing controls that open a modal, dashboard cards, profile menus, and inline lists.

Provider-level icons and UI options are shared across notifications, widgets, modals, and lists:

```tsx
<AchievementProvider
  achievements={achievements}
  icons={{ login: '🔑', streak: '🔥' }}
  ui={{
    theme: 'minimal',
    NotificationComponent: MyNotification,
    ModalComponent: MyAchievementsModal,
    ConfettiComponent: MyConfetti,
  }}
>
  <App />
</AchievementProvider>
```

## Hooks

```tsx
const {
  track,
  increment,
  trackMultiple,
  unlockedIds,
  unlockedAchievements,
  allAchievements,
  unlockedCount,
  totalCount,
} = useSimpleAchievements();
```

Deprecated aliases from v3, including `unlocked`, remain available until `4.2`.

## Event-Based Tracking

For larger apps, create an engine and emit semantic events:

```tsx
import {
  AchievementEngine,
  AchievementProvider,
  AchievementsWidget,
  useAchievementEngine,
} from 'react-achievements';

const engine = new AchievementEngine({
  achievements,
  eventMapping: {
    userScored: (data) => ({ score: data.points }),
  },
  storage: 'local',
});

function Game() {
  const engine = useAchievementEngine();
  return <button onClick={() => engine.emit('userScored', { points: 100 })}>Score</button>;
}

export default function App() {
  return (
    <AchievementProvider engine={engine}>
      <Game />
      <AchievementsWidget />
    </AchievementProvider>
  );
}
```

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
    <AchievementProvider achievements={achievements}>
      <CustomAchievementsPanel />
    </AchievementProvider>
  );
}
```

React Native UI components are not included in `4.0`; use `achievements-engine` or the `/headless` React APIs with your own native UI.

## Entry Points

- `react-achievements` - v4 web API with provider, hooks, built-in effects, widget, modal, and list components
- `react-achievements/web` - explicit web entry point
- `react-achievements/headless` - provider, hooks, engine, storage, and types without DOM UI

## Migrating From v3

- Built-in UI is now the default; `useBuiltInUI` is a deprecated no-op.
- `AchievementsWidget` replaces the legacy manual `BadgesButtonWithModal` setup.
- `useSimpleAchievements()` now returns `unlockedIds`, `unlockedAchievements`, and `allAchievements`.
- External UI peer dependencies are no longer required.
- Deprecated v3 component names remain as compatibility wrappers until `4.2`.

## License

React Achievements is dual-licensed:

- **Free for Non-Commercial Use** (MIT License)
- **Commercial License Required** for businesses, SaaS, commercial apps, and enterprise use

[Get Commercial License](https://github.com/sponsors/dave-b-b) | [License Details](./LICENSE) | [Commercial Terms](./COMMERCIAL-LICENSE.md)

## AI Agents

If you're using AI coding agents, see `AGENTS.md` for the recommended v4 integration prompt.
