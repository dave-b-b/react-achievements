# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

React Achievements is a flexible achievement system library for React applications. It provides core functionality for implementing gamification features with support for multiple state management solutions (Redux, Zustand, Context API). The library includes automatic notifications, confetti animations, and customizable UI components.

**Version 3.1.0** introduces the Simple API that reduces configuration complexity by 90% while maintaining full backward compatibility with the existing complex API.

## Development Commands

### Core Commands
- `npm run build` - Build the library using Rollup (outputs to dist/)
- `npm test` - Run Jest tests
- `npm run storybook` - Start Storybook development server on port 6006
- `npm run build-storybook` - Build Storybook for production

### Testing
- Run all tests: `npm test`
- Run tests in watch mode: `npm test -- --watch`
- Run specific test file: `npm test -- ComponentName`
- Jest configuration is in `jest.config.js`
- Tests use `@testing-library/react` and `jsdom` environment
- Test files are located in `src/__tests__/` directories

## Architecture & Structure

### Core Architecture
The library follows a provider-based architecture with these key components:

1. **AchievementProvider** (`src/providers/AchievementProvider.tsx`) - Main context provider that manages:
   - Achievement state and metrics tracking
   - Storage persistence (LocalStorage or MemoryStorage)  
   - Automatic toast notifications and confetti animations
   - Achievement condition evaluation

2. **useAchievements Hook** (`src/hooks/useAchievements.ts`) - Primary consumer interface providing:
   - `update(metrics)` - Update achievement metrics
   - `achievements` - Current unlocked/all achievements
   - `reset()` - Clear all achievement data
   - `getState()` - Get current metrics and unlocked achievements

3. **Storage Layer** (`src/core/storage/`) - Pluggable storage implementations:
   - `LocalStorage.ts` - Browser localStorage persistence
   - `MemoryStorage.ts` - In-memory storage for testing

4. **UI Components** (`src/core/components/`):
   - `BadgesButton.tsx` - Floating achievement count button
   - `BadgesModal.tsx` - Achievement history modal
   - `ConfettiWrapper.tsx` - Celebration animations

### Type System
Core types defined in `src/core/types.ts`:
- `AchievementConfiguration` - Defines achievement conditions and details
- `AchievementCondition` - Individual achievement with condition function
- `AchievementMetrics` - Tracked metric values
- `AchievementStorage` - Storage interface contract

### Achievement Configuration Patterns

#### Simple API (Recommended)
The Simple API dramatically reduces configuration complexity:

```typescript
const achievements = {
  // Threshold-based achievements
  score: {
    100: { title: 'Century!', description: 'Score 100 points', icon: '🏆' },
    500: { title: 'High Scorer!', icon: '⭐' }
  },
  
  // Boolean achievements
  completedTutorial: {
    true: { title: 'Tutorial Master', description: 'Complete the tutorial', icon: '📚' }
  },
  
  // Custom condition functions for complex logic
  combo: {
    custom: {
      title: 'Perfect Combo',
      description: 'Score 1000+ with 100% accuracy',
      icon: '💎',
      condition: (metrics) => metrics.score >= 1000 && metrics.accuracy === 100
    }
  }
};

// Usage with useSimpleAchievements hook
const { track, unlocked, unlockedCount, reset } = useSimpleAchievements();
track('score', 100);  // Simple tracking
```

#### Complex API (Legacy/Advanced)
Traditional configuration for advanced scenarios:

```typescript
const config = {
  score: [{
    isConditionMet: (value) => value >= 100,
    achievementDetails: {
      achievementId: 'score_100',
      achievementTitle: 'Century!',
      achievementDescription: 'Score 100 points',
      achievementIconKey: 'trophy'
    }
  }]
}
```

## Build System

- **Rollup** configuration in `rollup.config.mjs`
- Builds ES modules with TypeScript compilation
- Generates type definitions in `dist/index.d.ts`
- Excludes tests and stories from build
- External dependencies: react, react-dom, react-modal, react-toastify, react-confetti, react-use

## State Management Examples

The `stories/examples/` directory contains complete implementations for different state management solutions:
- `redux/` - Redux Toolkit integration
- `zustand/` - Zustand store integration  
- `context/` - Pure React Context implementation

## Key Implementation Notes

1. **Notifications**: Automatic toast notifications appear when achievements unlock, managed by the provider
2. **Persistence**: Achievement state and "seen notifications" are stored separately to prevent duplicate notifications
3. **Confetti**: Automatic confetti animations trigger with achievement unlocks
4. **Icons**: Default icon set available via `defaultAchievementIcons` export, customizable via provider props
5. **Testing**: Extensive test coverage in `src/__tests__/` using React Testing Library

## Library Structure

- `src/index.ts` - Main export file
- `src/core/` - Core functionality (types, storage, components, styles, icons)
- `src/providers/` - React context providers
- `src/hooks/` - React hooks
- `stories/` - Storybook stories and examples
- `demo/` - Demo application code

## Development Guidelines

### Code Quality Standards
- Favor readable code over clever code - prioritize clarity and maintainability
- Use consistent naming conventions (camelCase for variables/functions, PascalCase for components)
- Keep functions and components focused on single responsibility
- Validate inputs and handle errors gracefully with meaningful error messages
- Write tests for critical functionality using React Testing Library
- Follow accessibility guidelines (WCAG) with proper ARIA attributes and keyboard navigation

### Library-Specific Patterns
- Always validate achievement configuration objects before processing
- Ensure storage implementations properly handle serialization/deserialization
- Test UI components with different achievement states (locked/unlocked, with/without icons)
- Maintain backward compatibility when modifying core APIs