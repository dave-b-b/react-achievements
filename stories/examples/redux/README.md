# Redux Implementation Example

This example demonstrates how to integrate the achievements system with Redux as your state management solution.

## Files

- `store.ts`: Contains the Redux store configuration, slice definition, and action creators
- `AchievementsProvider.tsx`: React component that connects Redux state to the achievements system
- `AchievementsProvider.stories.tsx`: Storybook example showcasing the Redux implementation

## Implementation Details

The Redux implementation includes:
- A Redux slice for managing achievement state
- Action creators for unlocking achievements and resetting state
- Integration with the achievements system through a custom provider
- Support for achievement metrics and progress tracking
- Built-in TypeScript support

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

2. Use the achievements hooks and components in your app:

```typescript
function YourComponent() {
  const { update, achievements, reset, getState } = useAchievements();
  const dispatch = useDispatch();
  
  // Get achievement details from Redux store
  const unlockedAchievementDetails = useSelector((state: RootState) => 
    state.achievements.unlockedAchievements
  );

  // Update achievements
  const handleScore = () => update({ score: 100 });
  
  // Reset achievements (both in context and Redux)
  const handleReset = () => {
    reset();
    dispatch(resetAchievements());
  };

  return (
    <div>
      <button onClick={handleScore}>Score 100 points</button>
      <button onClick={handleReset}>Reset</button>
      
      {/* Display achievements using provided components */}
      <BadgesButton 
        position="bottom-right" 
        onClick={() => setIsModalOpen(true)}
        unlockedAchievements={unlockedAchievementDetails}
      />
      
      <BadgesModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        achievements={unlockedAchievementDetails}
        icons={defaultAchievementIcons}
      />
    </div>
  );
}
```

## Dependencies

- @reduxjs/toolkit
- react-redux

Install these dependencies in your project:

```bash
npm install @reduxjs/toolkit react-redux
```

## How it Works

The implementation uses Redux Toolkit to create a slice for managing achievements state. The `ReduxAchievementsProvider` component connects this Redux state to the achievements system's context provider, handling all state updates through Redux actions. This ensures that all achievement updates are tracked in Redux state and can be persisted, time-traveled, and debugged using Redux DevTools. 