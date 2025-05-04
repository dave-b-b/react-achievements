# Context API Implementation Example

This example demonstrates how to integrate the achievements system using React's Context API as your state management solution.

## Files

- `AchievementsContext.tsx`: Contains the Context API implementation with reducer pattern and custom hooks

## Usage

1. First, wrap your app with the Context provider:

```typescript
import { ContextAchievementsProvider } from './AchievementsContext';

function App() {
  return (
    <ContextAchievementsProvider>
      <YourApp />
    </ContextAchievementsProvider>
  );
}
```

2. Access achievements state in your components using the provided hooks:

```typescript
import { useAchievementsState, useAchievementsDispatch } from './AchievementsContext';

function YourComponent() {
  const { unlockedAchievements, progress } = useAchievementsState();
  const dispatch = useAchievementsDispatch();

  // Example of dispatching actions
  const handleAchievement = (achievement) => {
    dispatch({ type: 'UNLOCK_ACHIEVEMENT', achievement });
  };

  const updateProgress = (achievementId, value) => {
    dispatch({ type: 'UPDATE_PROGRESS', achievementId, progress: value });
  };

  return (
    <div>
      <h2>Unlocked Achievements: {unlockedAchievements.length}</h2>
      {/* Your component content */}
    </div>
  );
}
```

## Dependencies

This implementation uses only React's built-in features:
- React Context API
- useReducer hook
- Custom hooks

No additional dependencies are required!

## How it Works

The implementation uses React's Context API with the reducer pattern to manage achievements state. It provides two contexts:
1. `AchievementsStateContext`: Holds the current state
2. `AchievementsDispatchContext`: Provides the dispatch function for updating state

The `ContextAchievementsProvider` component connects these contexts to the achievements system's provider, making it easy to access and update achievements state throughout your application.

Custom hooks (`useAchievementsState` and `useAchievementsDispatch`) are provided for convenient access to the state and dispatch function. 