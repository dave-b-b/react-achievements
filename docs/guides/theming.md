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

## Notification Stacking

If one update unlocks several achievements, built-in notifications stack in the configured `notificationPosition`.

```tsx
const { trackMultiple } = useSimpleAchievements();

trackMultiple({ score: 500, completedTutorial: true });
```

Custom `NotificationComponent` implementations receive `stackIndex` and can use it to offset each active notification.

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

`useBuiltInUI` is no longer needed. It remains accepted as a deprecated no-op until a future major release.
