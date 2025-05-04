# Default Achievement Icons

The `defaultAchievementIcons` object provides a comprehensive set of emoji icons that can be used for achievements in your application. 

## Usage

### Standard Usage

You can reference these icons directly in your achievement configuration by using the key as the `achievementIconKey`:

```tsx
import { AchievementProvider, defaultAchievementIcons } from 'react-achievements';

const achievementConfig = {
  pageViews: [
    {
      isConditionMet: (value) => value >= 5,
      achievementDetails: {
        achievementId: 'views-5',
        achievementTitle: 'Getting Started',
        achievementDescription: 'Viewed 5 pages',
        achievementIconKey: 'firstStep' // This will use the 👣 emoji
      }
    }
  ]
};

// The AchievementProvider will automatically use the default icons
function App() {
  return (
    <AchievementProvider config={achievementConfig}>
      {/* Your app components */}
    </AchievementProvider>
  );
}
```

### Custom Icons

You can also provide your own custom icons, which will override the default ones:

```tsx
import { AchievementProvider, defaultAchievementIcons } from 'react-achievements';

// Create your custom icons by extending or overriding default icons
const customIcons = {
  ...defaultAchievementIcons,
  // Override some default icons
  levelUp: '🚀', // Replace the trophy with a rocket
  // Add your own icons
  myCustomIcon: '💻'
};

function App() {
  return (
    <AchievementProvider 
      config={achievementConfig}
      icons={customIcons}
    >
      {/* Your app components */}
    </AchievementProvider>
  );
}
```

## Available Icons

The package includes icons in these categories:

- General Progress & Milestones (levelUp, questComplete, etc.)
- Social & Engagement (shared, liked, etc.)
- Time & Activity (activeDay, streak, etc.)
- Creativity & Skill (artist, expert, etc.)
- Achievement Types (bronze, silver, gold, etc.)
- Numbers & Counters (one, ten, hundred, etc.)
- Actions & Interactions (clicked, discovered, etc.)
- Placeholders (default, loading, error, etc.)
- Miscellaneous (trophy, star, gem, etc.)

See the `defaultIcons.ts` file for the complete list of available icons. 