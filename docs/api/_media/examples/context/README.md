# Context API Implementation Example

This example demonstrates how to integrate the achievements system using React's Context API as your state management solution.

## Files

- `AchievementsContext.tsx`: Contains the Context API implementation with reducer pattern and custom hooks
- `AchievementsContext.stories.tsx`: Storybook example showcasing the Context API implementation

## Implementation Details

The Context API implementation includes:
- Pure React solution using built-in Context API
- Reducer pattern for predictable state updates
- Custom hooks for easy state access
- Support for achievement metrics and progress tracking
- Built-in TypeScript support
- Zero external dependencies

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

2. Use the achievements hooks and components in your app:

```typescript
function YourComponent() {
  const { update, achievements, reset, getState } = useAchievements();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const { unlockedAchievements } = useAchievementsState();

  // Update achievements
  const handleScore = () => update({ score: 100 });
  
  // Reset achievements
  const handleReset = () => {
    reset();
  };

  return (
    <div>
      <button onClick={handleScore}>Score 100 points</button>
      <button onClick={handleReset}>Reset</button>
      
      {/* Display achievements using provided components */}
      <BadgesButton 
        position="bottom-right" 
        onClick={() => setIsModalOpen(true)}
        unlockedAchievements={unlockedAchievements}
      />
      
      <BadgesModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        achievements={unlockedAchievements}
        icons={defaultAchievementIcons}
      />
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

The implementation uses React's Context API with the reducer pattern to manage achievements state. The `ContextAchievementsProvider` component creates a context that:

1. Manages achievement state using useReducer
2. Provides achievement data through context
3. Handles unlocking and resetting achievements
4. Tracks achievement metrics and progress
5. Integrates seamlessly with the achievements system's components

The implementation is designed to be lightweight and efficient, perfect for applications that want to avoid external dependencies while maintaining robust achievement tracking functionality. All state updates are handled through the reducer pattern, ensuring predictable state changes and making it easy to debug and maintain. 