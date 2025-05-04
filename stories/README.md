# Storybook Stories for React Achievements Core

This directory contains Storybook stories that demonstrate the components and providers of the React Achievements Core library.

## Component Stories

### BadgesButton

The BadgesButton component displays a button that shows the number of unlocked achievements and can open the achievements modal when clicked.

Stories showcase:
- Different positions (top-left, top-right, bottom-left, bottom-right)
- Custom styling
- Empty state (no achievements)

### BadgesModal

The BadgesModal component displays a modal with all the user's unlocked achievements.

Stories showcase:
- Default appearance with achievements
- Empty state (no achievements)
- Custom styling

### ConfettiWrapper

The ConfettiWrapper component displays confetti and a toast notification when an achievement is unlocked.

Stories showcase:
- Active state with confetti and toast
- Hidden state
- Default icons from defaultAchievementIcons
- Custom icons that override default icons

## Provider Stories

### AchievementProvider

The AchievementProvider is the main provider component that manages achievement state.

Stories showcase:
- Memory storage implementation
- Local storage implementation
- Integration with all UI components
- Achievement unlocking workflow

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

You can view these icons in the ConfettiWrapper and BadgesModal stories.

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