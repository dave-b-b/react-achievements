---
sidebar_position: 0
---

# API Reference

The API reference is generated from the TypeScript source. For v4 application setup, start with the root web entry point and reach for `/headless` only when you do not want DOM UI.

## Entry Points

- `react-achievements` - default web API with provider, hooks, built-in notifications, confetti, widget, modal, and list components
- `react-achievements/web` - explicit alias for the web API
- `react-achievements/headless` - provider, hooks, engine, storage, and types without DOM UI components

## Main v4 Exports

- `AchievementProvider`
- `AchievementsWidget`, `AchievementsModal`, `AchievementsList`
- `useSimpleAchievements`, `useAchievementState`, `useAchievements`, `useAchievementEngine`
- `AchievementEngine` and event types
- `StorageType`, storage classes, `AsyncStorageAdapter`, and `OfflineQueueStorage`
- Import/export helpers and achievement builder utilities
- Error classes and guards such as `AchievementError`, `StorageError`, `isAchievementError`, and `isRecoverableError`

## Common UI Props

- `AchievementsWidget.density` - use `"compact"` for square achievement badges or omit it for the default comfortable layout
- `AchievementsWidget.modalBackdropBlur` - set modal backdrop blur with a number of pixels or a CSS length string
- `AchievementsWidget.hideModalScrollbar` - hide visible modal scrollbar chrome while preserving scroll
- `AchievementsModal.density`, `AchievementsModal.backdropBlur`, and `AchievementsModal.hideScrollbar` - the same controls when opening the modal yourself
- `AchievementsList.density` - render inline achievement content as the same compact square badge grid
- `AchievementProvider.ui.notificationDuration` - set built-in unlock notification auto-dismiss timing in milliseconds

## Browse API Documentation

Use the sidebar to explore generated pages by category:

- Classes - `AchievementBuilder`, storage implementations, and error classes
- Interfaces - configuration, provider, widget, modal, storage, and event types
- Functions - hooks and data utilities
- Type aliases and enumerations - utility types and `StorageType`

## Quick Links

- [Full Documentation](../) - Getting started and guides
- [GitHub Repository](https://github.com/dave-b-b/react-achievements) - Source code
- [Examples](https://github.com/dave-b-b/react-achievements/tree/main/stories/examples) - Redux, Zustand, Context implementations
- [Contributing](https://github.com/dave-b-b/react-achievements/blob/main/CONTRIBUTING.md)
- [License](https://github.com/dave-b-b/react-achievements/blob/main/LICENSE)
