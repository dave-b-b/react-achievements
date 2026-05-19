---
sidebar_position: 5
---

# Theming

React Achievements v4 uses built-in UI by default. Configure notifications, confetti, and widget styling through provider `ui` options and widget props.

## Provider Theme

```tsx
<AchievementProvider
  achievements={achievements}
  ui={{
    theme: 'gamified',
    notificationPosition: 'top-right',
    notificationDuration: 8000,
  }}
>
  <App />
  <AchievementsWidget />
</AchievementProvider>
```

`AchievementsWidget` inherits `ui.theme` by default. Pass a `theme` prop only when a specific widget should differ from the provider theme.

Built-in themes:

- `modern`
- `minimal`
- `gamified`

## Disable Notifications Or Confetti

```tsx
<AchievementProvider
  achievements={achievements}
  ui={{
    enableNotifications: false,
    enableConfetti: false,
  }}
>
  <App />
</AchievementProvider>
```

## Customize Built-In Confetti

Built-in confetti uses `canvas-confetti`, respects reduced-motion preferences, and can be tuned without replacing the component.

```tsx
<AchievementProvider
  achievements={achievements}
  ui={{
    confetti: {
      colors: ['#22d3ee', '#f97316', '#facc15'],
      particleCount: 120,
      shapes: ['square', 'circle', 'star'],
      spread: 80,
      startVelocity: 45,
      gravity: 0.9,
      scalar: 1.1,
    },
  }}
>
  <App />
</AchievementProvider>
```

## Per-Reward Confetti

Rewards inherit the provider confetti settings by default. Add `confetti` only when a reward should celebrate differently, or set `confetti: false` to disable confetti for that reward.

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
        colors: ['#facc15', '#f97316', '#ef4444'],
        particleCount: 240,
        spread: 100,
        startVelocity: 60,
        scalar: 1.4,
      },
    },
    25: {
      title: 'Quiet Milestone',
      confetti: false,
    },
  },
};
```

Reward settings override matching `ui.confetti` values and inherit anything they omit. Existing configs that do not include `confetti` continue to use the global/theme defaults.

## Notification Stacking

Built-in unlock notifications auto-dismiss after 5 seconds by default. Use `ui.notificationDuration` to set a different duration in milliseconds. If one update unlocks several achievements, notifications stack in the configured `notificationPosition`.

```tsx
const { trackMultiple } = useSimpleAchievements();

trackMultiple({ score: 500, completedTutorial: true });
```

Custom `NotificationComponent` implementations receive `duration` and `stackIndex`, and can use those props to match the built-in auto-dismiss and offset behavior.

## Custom Components

```tsx
<AchievementProvider
  achievements={achievements}
  ui={{
    NotificationComponent: MyNotification,
    ModalComponent: MyAchievementsModal,
    ConfettiComponent: MyConfetti,
  }}
>
  <App />
</AchievementProvider>
```

`ModalComponent` is used by `AchievementsWidget` and `AchievementsModal`. It receives `isOpen`, `onClose`, `achievements`, `icons`, `theme`, `hideScrollbar`, `density`, and `backdropBlur`.
`ConfettiComponent` receives `show` plus the resolved confetti settings for the unlocked reward.

## Provider Icons

Provider-level icons are shared by built-in notifications, widgets, modals, and inline lists.

```tsx
<AchievementProvider
  achievements={achievements}
  icons={{ login: '🔑', streak: '🔥' }}
>
  <App />
  <AchievementsWidget />
</AchievementProvider>
```

## Widget Placement

```tsx
<AchievementsWidget />
<AchievementsWidget placement="inline" />
```

Use `buttonStyles` and `modalStyles` for targeted overrides:

```tsx
<AchievementsWidget
  buttonStyles={{ borderRadius: 8 }}
  modalStyles={{
    content: { maxWidth: 720 },
  }}
/>
```

Use compact density and modal controls when a themed modal should be denser or let more of the page remain visible:

```tsx
<AchievementsWidget
  density="compact"
  modalBackdropBlur={2}
  hideModalScrollbar
/>
```

## Migration Note

`useBuiltInUI` is no longer needed. It remains accepted as a deprecated no-op until 5.0.
