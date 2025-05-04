# Redux Implementation Example

This example demonstrates how to integrate the achievements system with Redux as your state management solution.

## Files

- `store.ts`: Contains the Redux store configuration, slice definition, and action creators
- `AchievementsProvider.tsx`: React component that connects Redux state to the achievements system

## Usage

1. First, set up your Redux store with the achievements slice:

```typescript
import { store } from './store';
import { ReduxAchievementsProvider } from './AchievementsProvider';

// Wrap your app with the provider
function App() {
  return (
    <ReduxAchievementsProvider>
      <YourApp />
    </ReduxAchievementsProvider>
  );
}
```

2. Access achievements state in your components:

```typescript
import { useSelector } from 'react-redux';
import { RootState } from './store';

function YourComponent() {
  const unlockedAchievements = useSelector((state: RootState) => state.achievements.unlockedAchievements);
  const progress = useSelector((state: RootState) => state.achievements.progress);

  return (
    <div>
      <h2>Unlocked Achievements: {unlockedAchievements.length}</h2>
      {/* Your component content */}
    </div>
  );
}
```

## Dependencies

- @reduxjs/toolkit
- react-redux

Make sure to install these dependencies in your project:

```bash
npm install @reduxjs/toolkit react-redux
```

## How it Works

The implementation uses Redux Toolkit to create a slice for managing achievements state. The `ReduxAchievementsProvider` component connects this Redux state to the achievements system's context provider, handling all state updates through Redux actions. 