# Zustand Implementation Example

This example demonstrates how to integrate the achievements system with Zustand as your state management solution.

## Files

- `store.ts`: Contains the Zustand store configuration and state management logic
- `AchievementsProvider.tsx`: React component that connects Zustand state to the achievements system

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

2. Access achievements state in your components:

```typescript
import { useAchievementsStore } from './store';

function YourComponent() {
  const unlockedAchievements = useAchievementsStore((state) => state.unlockedAchievements);
  const progress = useAchievementsStore((state) => state.progress);

  return (
    <div>
      <h2>Unlocked Achievements: {unlockedAchievements.length}</h2>
      {/* Your component content */}
    </div>
  );
}
```

## Dependencies

- zustand

Make sure to install this dependency in your project:

```bash
npm install zustand
```

## How it Works

The implementation uses Zustand to create a simple and efficient store for managing achievements state. The `ZustandAchievementsProvider` component connects this store to the achievements system's context provider, making it easy to access and update achievements state throughout your application. 