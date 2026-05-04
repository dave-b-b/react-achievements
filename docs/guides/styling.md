---
sidebar_position: 4
---

# Styling

The default v4 UI is built in. Most apps can use `AchievementsWidget` as-is and pass small style overrides when needed.

## Widget Styles

Inline widgets inherit surrounding color and typography, which makes them fit drawers, sidebars, menus, and nav bars.

```tsx
<AchievementsWidget
  placement="inline"
  buttonStyles={{
    borderRadius: 8,
    padding: '10px 12px',
  }}
  modalStyles={{
    content: {
      maxWidth: 720,
    },
  }}
/>
```

Use `renderTrigger` when the trigger needs to be the app's own drawer row or menu item:

```tsx
<AchievementsWidget
  placement="inline"
  renderTrigger={({ buttonProps, unlockedCount, totalCount }) => (
    <button {...buttonProps} className="drawer-item">
      Achievements
      <span>{unlockedCount}/{totalCount}</span>
    </button>
  )}
/>
```

You can also open the built-in modal from any existing control:

```tsx
import { AchievementsModal } from 'react-achievements';

<button onClick={() => setOpen(true)}>Achievements</button>
<AchievementsModal isOpen={open} onClose={() => setOpen(false)} />
```

Customize modal title and empty state:

```tsx
<AchievementsModal
  isOpen={open}
  onClose={() => setOpen(false)}
  title="Team achievements"
  emptyState="No achievements yet."
/>
```

Hide scrollbar chrome while keeping the modal scrollable:

```tsx
<AchievementsModal
  isOpen={open}
  onClose={() => setOpen(false)}
  hideScrollbar
/>

<AchievementsWidget hideModalScrollbar />
```

Blur the page behind the modal:

```tsx
<AchievementsModal
  isOpen={open}
  onClose={() => setOpen(false)}
  backdropBlur={2}
/>

<AchievementsWidget modalBackdropBlur={2} />
```

Pass a number for pixels or a CSS length string such as `"0.25rem"`. Omit the prop or pass `0` to disable backdrop blur.

Use compact square achievement badges when the modal or list needs to show more items at once:

```tsx
<AchievementsWidget density="compact" />

<AchievementsModal
  isOpen={open}
  onClose={() => setOpen(false)}
  density="compact"
/>

<AchievementsList density="compact" />
```

`density` defaults to `"comfortable"`. Custom `renderAchievement` functions receive the active `density`, so custom rows can switch between row and badge layouts.

## Inline Lists

Use `AchievementsList` in drawers, profile pages, settings panels, or custom layouts.

```tsx
import { AchievementsList } from 'react-achievements';

<aside>
  <AchievementsList />
</aside>
```

Hide locked achievements:

```tsx
<AchievementsList showLocked={false} />
```

Render list rows yourself:

```tsx
<AchievementsList
  renderAchievement={({ achievement, icon, isLocked }) => (
    <div className={isLocked ? 'achievement locked' : 'achievement'}>
      <span>{icon}</span>
      <strong>{achievement.achievementTitle}</strong>
    </div>
  )}
/>
```

## Custom UI

For complete control, use the headless entry point and render your own components:

```tsx
import { AchievementProvider, useAchievementState } from 'react-achievements/headless';
```

The headless APIs do not import DOM UI components.
