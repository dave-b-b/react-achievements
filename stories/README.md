# Storybook Stories for React Achievements Core

This directory contains Storybook stories that demonstrate the components and providers of the React Achievements Core library.

## Component Stories

### AchievementsWidget

The AchievementsWidget component reads from provider context, shows the unlocked count, and opens the built-in achievements modal.

Stories showcase:
- Floating button placement
- Inline navigation button placement
- Drawer/sidebar placement
- Existing drawer controls that open `AchievementsModal`
- Dashboard card placement
- Profile menu placement
- Custom triggers that inherit the surrounding app style

### AchievementsList

The AchievementsList component renders locked and unlocked achievements inline for drawers, settings screens, profile pages, and custom layouts.

Stories showcase:
- Context-aware rendering
- Inline panel rendering
- Drawer surface rendering
- Unlocked-only lists
- Custom empty states

### LevelProgress

The LevelProgress component renders theme-aware level progress with labels, values, and percentage output.

Stories showcase:
- Default, minimal, and gamified themes
- Custom style overrides
- Hidden values and percent output
- Interactive progress updates with XP controls

### Built-in UI

Built-in UI stories cover notifications, modals, confetti, widgets, and combined provider behavior.

Stories showcase:
- Notification themes and positions
- Stacked notifications for simultaneous unlocks
- Modal and confetti themes
- Widget placement and provider-driven unlock flows

### Compatibility Components

`BadgesButton`, `BadgesModal`, `BadgesButtonWithModal`, and `ConfettiWrapper` are retained as v3 compatibility wrappers and live under the `Compatibility` Storybook group. New integration stories should use `AchievementsWidget`, `AchievementsModal`, and `AchievementsList`.

Stories showcase:
- Legacy fixed and inline button behavior
- Legacy modal behavior
- Legacy combined button-with-modal behavior
- Legacy confetti wrapper behavior

## Provider Stories

### AchievementProvider

The AchievementProvider is the main provider component that manages achievement state.

Stories showcase:
- Memory storage implementation
- Local storage implementation
- Integration with all UI components
- Achievement unlocking workflow
- Inline drawer widgets and inline achievement lists

### HeadlessAchievementProvider

The HeadlessAchievementProvider stories import from `react-achievements/headless` and render custom UI from hooks without built-in web components.

Stories showcase:
- DOM-free provider and hook imports
- Custom controls, achievement rows, and unlock activity
- Memory and local storage surfaces for custom web or native-style UI

## Default Icons

The library includes a comprehensive set of default achievement icons, accessible via `defaultAchievementIcons`. These icons are automatically used by components that display achievements.

The icons are categorized as:
- General Progress & Milestones (levelUp, questComplete, etc.)
- Social & Engagement (shared, liked, etc.)
- Time & Activity (activeDay, streak, etc.)
- Creativity & Skill (artist, expert, etc.)
- Achievement Types (bronze, silver, gold, etc.)
- Numbers & Counters (one, ten, hundred, etc.)
- Actions & Interactions (clicked, discovered, etc.)
- Placeholders (default, loading, error, etc.)
- Miscellaneous (trophy, star, gem, etc.)

You can view these icons in the compatibility component stories and the inline list/widget stories.

## How to Use

Run Storybook to view these stories:

```bash
npm run storybook
```

## Adding New Stories

When adding new components to the library, follow this pattern to create new stories:

1. Create a new file in the appropriate directory (`stories/components/` or `stories/providers/`)
2. Name the file with the pattern `[ComponentName].stories.tsx`
3. Follow the Storybook Component Story Format (CSF)
4. Include multiple story variants to showcase different states and configurations 
