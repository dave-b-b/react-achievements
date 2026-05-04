---
sidebar_position: 1
---

# Common Patterns

Ready-to-use v4 examples for common achievement workflows.

## Floating Widget

Use the default widget when you want the fastest badge button plus modal setup:

```tsx
import { AchievementsWidget } from 'react-achievements';

<AchievementsWidget position="bottom-right" />
```

## Drawer Or Navigation Item

Inline placement lets the trigger flow with your layout:

```tsx
<AchievementsWidget placement="inline" label="Badges" />
```

Use `renderTrigger` when the trigger should be one of your existing controls:

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

## Existing Button Opens The Modal

Use `AchievementsModal` when your app already has a button, drawer row, command menu item, or profile-menu action.

```tsx
import { useState } from 'react';
import { AchievementsModal } from 'react-achievements';

function AchievementAction() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>View achievements</button>
      <AchievementsModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
```

`AchievementsModal` reads achievement state from the nearest `AchievementProvider`, so you do not need to map unlocked IDs into achievement objects.

## Compact Badge Modal

Use compact density when the achievement modal should show square badges instead of roomier rows:

```tsx
<AchievementsWidget density="compact" />
```

The same density works when you control the modal yourself:

```tsx
<AchievementsModal
  isOpen={open}
  onClose={() => setOpen(false)}
  density="compact"
/>
```

## Modal Backdrop And Scrollbars

Use a lighter backdrop blur when the app underneath should stay more readable:

```tsx
<AchievementsWidget modalBackdropBlur={2} />

<AchievementsModal
  isOpen={open}
  onClose={() => setOpen(false)}
  backdropBlur="2px"
/>
```

Pass a number for pixels or a CSS length string. Omit the prop or pass `0` to disable backdrop blur.

Hide scrollbar chrome while preserving modal scrolling:

```tsx
<AchievementsWidget hideModalScrollbar />

<AchievementsModal
  isOpen={open}
  onClose={() => setOpen(false)}
  hideScrollbar
/>
```

## Inline Achievement List

Use `AchievementsList` for profile pages, settings pages, drawers, or dashboard panels.

```tsx
import { AchievementsList } from 'react-achievements';

<AchievementsList />
```

Use compact square badges for denser panels:

```tsx
<AchievementsList density="compact" />
```

Only show earned achievements:

```tsx
<AchievementsList showLocked={false} emptyState="No achievements unlocked yet." />
```

Render each row yourself while keeping provider state, filtering, and icon resolution:

```tsx
<AchievementsList
  renderAchievement={({ achievement, icon, isLocked }) => (
    <div className={isLocked ? 'locked-row' : 'unlocked-row'}>
      <span>{icon}</span>
      <strong>{achievement.achievementTitle}</strong>
    </div>
  )}
/>
```

## Provider-Level Icons

Define icon keys once on the provider. Notifications, widgets, modals, and lists can all use them.

```tsx
<AchievementProvider
  achievements={{
    login: {
      true: { title: 'First Login', icon: 'login' },
    },
  }}
  icons={{ login: '🔑' }}
>
  <App />
  <AchievementsWidget />
</AchievementProvider>
```

## Export Achievement Data

Allow users to download their achievement progress:

```tsx
import { useAchievements } from 'react-achievements';

function ExportButton() {
  const { exportData } = useAchievements();

  const handleExport = () => {
    const jsonString = exportData();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `achievements-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return <button onClick={handleExport}>Download achievement data</button>;
}
```

## Import Achievement Data

Restore achievements from a backup file:

```tsx
import { useAchievements } from 'react-achievements';

function ImportButton() {
  const { importData } = useAchievements();

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const result = importData(content, { merge: true });

      if (result.success) {
        alert('Achievement data imported.');
      } else {
        alert(`Import failed: ${result.errors?.join(', ') || 'Unknown error'}`);
      }
    };
    reader.readAsText(file);
  };

  return <input type="file" accept=".json" onChange={handleImport} />;
}
```

## Level Progress

Use the built-in `LevelProgress` component for a ready-made, theme-aware progress bar:

```tsx
import { LevelProgress } from 'react-achievements';

<LevelProgress
  level={3}
  currentXP={120}
  nextLevelXP={200}
  theme="gamified"
/>
```

## Reset All Achievements

Clear all achievement data during development or from a user-facing reset flow:

```tsx
import { useAchievements } from 'react-achievements';

function ResetButton() {
  const { reset } = useAchievements();

  return (
    <button onClick={reset}>
      Reset achievements
    </button>
  );
}
```

## Event-Based Tracking

Use semantic events instead of direct metric updates for larger apps:

```tsx
import { useAchievementEngine } from 'react-achievements';

function GameComponent() {
  const engine = useAchievementEngine();

  return (
    <button onClick={() => engine.emit('userScored', { points: 100 })}>
      Score points
    </button>
  );
}
```

Listen to achievement events for analytics or custom workflows:

```tsx
import { useEffect } from 'react';
import { useAchievementEngine } from 'react-achievements';

function AchievementAnalytics() {
  const engine = useAchievementEngine();

  useEffect(() => {
    return engine.on('achievement:unlocked', (event) => {
      analytics.track('Achievement Unlocked', {
        achievementId: event.achievementId,
      });
    });
  }, [engine]);

  return null;
}
```
