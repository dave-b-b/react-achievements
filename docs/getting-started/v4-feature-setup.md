---
sidebar_position: 3
---

# v4 Feature Setup

This checklist covers the full v4 setup surface: provider, tracking, UI placement, storage, customization, events, portability, and headless usage.

## 1. Provider

Wrap your app once. The root `react-achievements` entry point is the web setup and includes built-in notifications and confetti by default.

```tsx
import { AchievementProvider } from 'react-achievements';
import { achievements } from './achievements';

export function App() {
  return (
    <AchievementProvider achievements={achievements}>
      <YourApp />
    </AchievementProvider>
  );
}
```

Disable built-in effects when you only want state and UI components:

```tsx
<AchievementProvider
  achievements={achievements}
  ui={{ enableNotifications: false, enableConfetti: false }}
>
  <YourApp />
</AchievementProvider>
```

When one update unlocks multiple achievements, the built-in notification UI stacks the notifications instead of replacing earlier unlocks.

## 2. Direct Tracking

Use `useSimpleAchievements` for most React apps.

```tsx
import { useSimpleAchievements } from 'react-achievements';

function QuestButton() {
  const { track, increment, trackMultiple } = useSimpleAchievements();

  return (
    <>
      <button onClick={() => track('score', 100)}>Score 100</button>
      <button onClick={() => increment('tasksCompleted')}>Complete task</button>
      <button onClick={() => trackMultiple({ score: 500, profileComplete: true })}>
        Finish onboarding
      </button>
    </>
  );
}
```

## 3. UI Placement

Use the widget when you want a trigger plus modal.

```tsx
<AchievementsWidget />
<AchievementsWidget placement="inline" label="Badges" />
```

Use `renderTrigger` to make the trigger match your app exactly:

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

Use existing UI with the modal:

```tsx
const [open, setOpen] = useState(false);

<button onClick={() => setOpen(true)}>Achievements</button>
<AchievementsModal isOpen={open} onClose={() => setOpen(false)} />
```

Use inline content for profile, settings, drawer, or dashboard surfaces:

```tsx
<AchievementsList showLocked />
```

## 4. Icons And Themes

Provider-level icons are inherited by notifications, widgets, modals, and lists.

```tsx
<AchievementProvider
  achievements={achievements}
  icons={{ login: '🔑', trophy: '🏆' }}
  ui={{ theme: 'minimal' }}
>
  <YourApp />
  <AchievementsWidget />
</AchievementProvider>
```

Override per component when needed:

```tsx
<AchievementsWidget
  theme="gamified"
  icons={{ streak: '🔥' }}
  modalTitle="Team achievements"
/>
```

## 5. Custom UI Components

Replace built-in notification, modal, or confetti components through `ui`.

```tsx
<AchievementProvider
  achievements={achievements}
  ui={{
    NotificationComponent: MyNotification,
    ModalComponent: MyAchievementsModal,
    ConfettiComponent: MyConfetti,
  }}
>
  <YourApp />
</AchievementProvider>
```

Custom `NotificationComponent` implementations receive `stackIndex` so they can preserve the same stacking behavior for simultaneous unlocks.

For custom inline rows, use `AchievementsList.renderAchievement`.

```tsx
<AchievementsList
  renderAchievement={({ achievement, icon, isLocked }) => (
    <div className={isLocked ? 'muted-row' : 'earned-row'}>
      <span>{icon}</span>
      <span>{achievement.achievementTitle}</span>
    </div>
  )}
/>
```

## 6. Storage

Use built-in storage options:

```tsx
import { StorageType } from 'react-achievements';

<AchievementProvider achievements={achievements} storage={StorageType.Local}>
  <YourApp />
</AchievementProvider>
```

Supported storage options include:

- `StorageType.Local` for browser `localStorage`
- `StorageType.Memory` for non-persistent state
- `StorageType.IndexedDB` for larger browser datasets
- `StorageType.RestAPI` with `restApiConfig` for backend persistence
- `LocalStorage`, `MemoryStorage`, `IndexedDBStorage`, `RestApiStorage`, `OfflineQueueStorage`, and custom sync or async storage adapters

```tsx
<AchievementProvider
  achievements={achievements}
  storage={StorageType.RestAPI}
  restApiConfig={{ baseUrl: '/api/achievements', userId }}
>
  <YourApp />
</AchievementProvider>
```

## 7. Event-Based Tracking

Use an injected engine when your app already has semantic events.

```tsx
import { AchievementEngine, AchievementProvider } from 'react-achievements';

const engine = new AchievementEngine({
  achievements,
  eventMapping: {
    userScored: (data) => ({ score: data.points }),
  },
  storage: 'local',
});

<AchievementProvider engine={engine}>
  <YourApp />
</AchievementProvider>
```

```tsx
const engine = useAchievementEngine();
engine.emit('userScored', { points: 100 });
```

## 8. Import And Export

```tsx
const { exportData, importData } = useAchievements();

const backup = exportData();
const result = importData(backup, { merge: true });
```

## 9. Headless And React Native

The web entry point includes DOM UI. For React Native or fully custom UI, use the DOM-free headless entry point:

```tsx
import {
  AchievementProvider,
  useAchievementState,
  useSimpleAchievements,
} from 'react-achievements/headless';

function CustomAchievementSurface() {
  const { track, reset } = useSimpleAchievements();
  const { allAchievements, unlockedIds, unlockedCount, totalCount } = useAchievementState();

  return (
    <section>
      <button onClick={() => track('score', 100)}>Score 100</button>
      <button onClick={reset}>Reset</button>
      <p>{unlockedCount} / {totalCount} unlocked</p>

      {allAchievements.map((achievement) => (
        <article key={achievement.achievementId}>
          <strong>{achievement.achievementTitle}</strong>
          <span>{achievement.isUnlocked ? 'Unlocked' : 'Locked'}</span>
        </article>
      ))}

      <pre>{JSON.stringify(unlockedIds, null, 2)}</pre>
    </section>
  );
}

<AchievementProvider achievements={achievements}>
  <CustomAchievementSurface />
</AchievementProvider>
```

React Native UI components are not included in v4. Use headless state/hooks with your own native components, or use `achievements-engine` directly outside React.
