# Default Achievement Icons

The `defaultAchievementIcons` object provides a minimal set of essential fallback icons for system use in the React Achievements library.

## Philosophy

With the Simple API, users can include emojis directly in their achievement definitions (e.g., `icon: '🏆'`), making icon management much simpler and more intuitive. The default icons are now limited to essential system fallbacks rather than a comprehensive icon library.

## Available Icons

The library includes only essential fallback icons:

- `default`: ⭐ - Fallback when no icon is provided
- `loading`: ⏳ - For loading states
- `error`: ⚠️ - For error states
- `success`: ✅ - For success states
- `trophy`: 🏆 - Common achievement icon (backward compatibility)
- `star`: ⭐ - Common achievement icon (backward compatibility)

## Usage

### Recommended: Direct Emoji Usage

Use emojis directly in your achievement definitions:

```tsx
import { AchievementProvider } from 'react-achievements';

const achievements = {
  score: {
    100: { title: 'Century!', icon: '🏆' }, // Direct emoji - simple!
    500: { title: 'High Scorer!', icon: '⭐' }
  }
};

function App() {
  return (
    <AchievementProvider achievements={achievements}>
      {/* Your app components */}
    </AchievementProvider>
  );
}
```

### Legacy: Icon Key References

For backward compatibility, you can still reference icon keys:

```tsx
const achievements = {
  score: {
    100: { title: 'Century!', icon: 'trophy' } // References defaultAchievementIcons.trophy
  }
};
```

The system automatically falls back to `defaultAchievementIcons.default` if an icon key is not found.