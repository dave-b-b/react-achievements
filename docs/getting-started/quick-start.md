---
sidebar_position: 2
---

# Quick Start

Build your first achievement system with the v4 Simple API.

## 1. Define Achievements

```tsx title="achievements.ts"
export const achievements = {
  score: {
    100: { title: 'Century!', description: 'Score 100 points', icon: '🏆' },
    500: { title: 'High Scorer!', description: 'Score 500 points', icon: '⭐' },
  },
  completedTutorial: {
    true: { title: 'Tutorial Master', description: 'Complete the tutorial', icon: '📚' },
  },
};
```

## 2. Wrap Your App

```tsx title="App.tsx"
import { AchievementProvider, AchievementsWidget } from 'react-achievements';
import { achievements } from './achievements';
import Game from './Game';

export default function App() {
  return (
    <AchievementProvider achievements={achievements}>
      <Game />
      <AchievementsWidget />
    </AchievementProvider>
  );
}
```

`AchievementsWidget` shows the unlocked count and opens a modal with all locked and unlocked achievements.

## 3. Track Progress

```tsx title="Game.tsx"
import { useSimpleAchievements } from 'react-achievements';

export default function Game() {
  const { track, increment } = useSimpleAchievements();

  return (
    <div>
      <button onClick={() => track('score', 100)}>Score 100</button>
      <button onClick={() => increment('score', 50)}>Add 50</button>
      <button onClick={() => track('completedTutorial', true)}>Complete Tutorial</button>
    </div>
  );
}
```

## 4. Place The Widget Anywhere

Use the default fixed button:

```tsx
<AchievementsWidget />
```

Use inline placement for a drawer, nav bar, or sidebar:

```tsx
<AchievementsWidget placement="inline" />
```

Use your own existing drawer row, nav item, or menu button while keeping the built-in modal:

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

Or control the modal yourself from any existing UI:

```tsx
import { useState } from 'react';
import { AchievementsModal } from 'react-achievements';

function AchievementMenuItem() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>Achievements</button>
      <AchievementsModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
```

Render the achievement content directly:

```tsx
import { AchievementsList } from 'react-achievements';

<AchievementsList />
```

## 5. Tune The Modal

Use compact square badges when you want the modal or list to show more achievements at once:

```tsx
<AchievementsWidget density="compact" />

<AchievementsModal
  isOpen={open}
  onClose={() => setOpen(false)}
  density="compact"
/>

<AchievementsList density="compact" />
```

Control the modal backdrop blur and scrollbar chrome:

```tsx
<AchievementsWidget
  modalBackdropBlur={2}
  hideModalScrollbar
/>

<AchievementsModal
  isOpen={open}
  onClose={() => setOpen(false)}
  backdropBlur="2px"
  hideScrollbar
/>
```

For `backdropBlur`, pass a number for pixels or a CSS length string. Omit it or pass `0` to disable backdrop blur. Scrollbar hiding only removes the visible scrollbar chrome; the modal still scrolls.

## Provider Icons

Custom icon keys can be defined once on the provider:

```tsx
<AchievementProvider
  achievements={{
    login: {
      true: { title: 'First Login', icon: 'login' },
    },
  }}
  icons={{ login: '🔑' }}
>
  <AchievementsWidget />
</AchievementProvider>
```

## Hook State

```tsx
const {
  unlockedIds,
  unlockedAchievements,
  allAchievements,
  unlockedCount,
  totalCount,
} = useSimpleAchievements();
```

`unlocked` remains as a deprecated v3 alias for `unlockedIds` until 4.2.

## Event-Based Alternative

```tsx title="achievementEngine.ts"
import { AchievementEngine } from 'react-achievements';
import { achievements } from './achievements';

export const engine = new AchievementEngine({
  achievements,
  eventMapping: {
    userScored: (data) => ({ score: data.points }),
    tutorialCompleted: () => ({ completedTutorial: true }),
  },
  storage: 'local',
});
```

```tsx title="App.tsx"
import { AchievementProvider, AchievementsWidget } from 'react-achievements';
import { engine } from './achievementEngine';

export default function App() {
  return (
    <AchievementProvider engine={engine}>
      <Game />
      <AchievementsWidget />
    </AchievementProvider>
  );
}
```

```tsx title="Game.tsx"
import { useAchievementEngine } from 'react-achievements';

export default function Game() {
  const engine = useAchievementEngine();

  return (
    <button onClick={() => engine.emit('userScored', { points: 100 })}>
      Score 100
    </button>
  );
}
```

## Full Setup Checklist

See [v4 Feature Setup](/docs/getting-started/v4-feature-setup) for storage, custom UI components, import/export, event-based tracking, headless usage, and React Native guidance.
