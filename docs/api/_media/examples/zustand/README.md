# Zustand Implementation Example

This example demonstrates how to integrate the achievements system with Zustand as your state management solution.

## Files

- `store.ts`: Contains the Zustand store configuration and state management logic
- `AchievementsProvider.tsx`: React component that connects Zustand state to the achievements system
- `AchievementsProvider.stories.tsx`: Storybook example showcasing the Zustand implementation

## Implementation Details

The Zustand implementation includes:
- A lightweight store for managing achievement state
- Simple actions for unlocking and resetting achievements
- Seamless integration with the achievements system
- Support for achievement metrics and progress tracking
- Built-in TypeScript support

## Usage

1. First, wrap your app with the Zustand provider:

```typescript
import { ZustandAchievementsProvider } from './AchievementsProvider';

function App() {
  return (
    <ZustandAchievementsProvider>
      <YourApp />
    </ZustandAchievementsProvider>
  );
}
```

2. Use the achievements hooks and components in your app:

```typescript
function YourComponent() {
  const { update, achievements, reset, getState } = useAchievements();
  const { unlockedAchievements, resetAchievements } = useAchievementsStore();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Update achievements
  const handleScore = () => update({ score: 100 });
  
  // Reset achievements (both in context and Zustand)
  const handleReset = () => {
    reset();
    resetAchievements();
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

- zustand

Install this dependency in your project:

```bash
npm install zustand
```

## How it Works

The implementation uses Zustand to create a simple and efficient store for managing achievements state. The `ZustandAchievementsProvider` component connects this store to the achievements system's context provider, making it easy to access and update achievements state throughout your application. Zustand's minimal API and zero-config approach makes it perfect for managing achievement state without the overhead of more complex state management solutions. 