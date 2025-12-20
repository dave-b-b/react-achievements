# React Achievements

A flexible and extensible achievement system for React applications. This package provides the foundation for implementing achievements in React applications with support for multiple state management solutions including Redux, Zustand, and Context API. Check the `stories/examples` directory for implementation examples with different state management solutions.

<p align="center">
  <img src="https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExbnMxdHVqanZvbGR6czJqOTdpejZqc3F3NXh6a2FiM3lmdnB0d3VoOSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/LYXAZelQMeeYpzbgtT/giphy.gif" alt="React Achievements Demo" width="600" />
</p>

## Installation

**NEW in v3.6.0**: Optional built-in UI system available! Choose between the traditional external dependencies or the new lightweight built-in UI.

### Option 1: Traditional External UI (Default)
```bash
npm install react-achievements react-confetti react-modal react-toastify react-use
```

### Option 2: Built-in UI (NEW - Opt-in)
```bash
npm install react-achievements
```

Then explicitly enable built-in UI in your code:
```tsx
<AchievementProvider
  achievements={config}
  useBuiltInUI={true}  // Required to use built-in UI
>
  <YourApp />
</AchievementProvider>
```

**Requirements**: React 16.8+ and react-dom are required (defined as peerDependencies).

**Note**: To maintain backwards compatibility, v3.6.0 defaults to external UI dependencies. The built-in UI system is opt-in via the `useBuiltInUI` prop. In v4.0.0, built-in UI will become the default. See the [Built-in UI System](#built-in-ui-system-new-in-v360) section below.

## Quick Start

Here's a complete working example using the **new Simple API** that shows automatic notifications and achievement tracking:

```tsx
import React, { useState } from 'react';
import { 
  AchievementProvider, 
  useSimpleAchievements, 
  BadgesButton, 
  BadgesModal 
} from 'react-achievements';

// Define achievements with the new three-tier Builder API - 95% less code!
import { AchievementBuilder } from 'react-achievements';

// Simple achievements with the new Simple API
const gameAchievements = {
  score: {
    100: { title: 'Century!', description: 'Score 100 points', icon: '🏆' },
    500: { title: 'High Scorer!', description: 'Score 500 points', icon: '⭐' }
  },
  level: {
    5: { title: 'Leveling Up', description: 'Reach level 5', icon: '📈' }
  },
  completedTutorial: {
    true: { title: 'Tutorial Master', description: 'Complete the tutorial', icon: '📚' }
  },
  buttonClicks: {
    10: { title: 'Clicker', description: 'Click 10 times', icon: '👆' },
    100: { title: 'Super Clicker', description: 'Click 100 times', icon: '🖱️' }
  }
};

// Demo component with all essential features  
const DemoComponent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { track, increment, unlocked, unlockedCount, reset } = useSimpleAchievements();

  return (
    <div>
      <h1>Achievement Demo</h1>
      
      {/* Simple tracking - much easier! */}
      <button onClick={() => track('score', 100)}>
        Score 100 points
      </button>
      <button onClick={() => track('score', 500)}>
        Score 500 points  
      </button>
      <button onClick={() => track('level', 5)}>
        Reach level 5
      </button>      
      <button onClick={() => track('completedTutorial', true)}>
        Complete tutorial
      </button>
      
      {/* Increment tracking - perfect for button clicks */}
      <button onClick={() => increment('buttonClicks')}>
        Click Me! (increments by 1)
      </button>
      <button onClick={() => increment('score', 10)}>
        Bonus Points! (+10)
      </button>
      
      {/* Reset button */}
      <button onClick={reset}>
        Reset Achievements
      </button>
      
      {/* Shows unlocked achievements count */}
      <p>Unlocked: {unlockedCount}</p>
      
      {/* Floating badges button */}
      <BadgesButton 
        position="bottom-right"
        onClick={() => setIsModalOpen(true)}
        unlockedAchievements={[]} // Simplified for demo
      />
      
      {/* Achievement history modal */}
      <BadgesModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        achievements={[]} // Simplified for demo
      />
    </div>
  );
};

// Root component with provider
const App = () => {
  return (
    <AchievementProvider
      achievements={gameAchievements}
      storage="local"
    >
      <DemoComponent />
    </AchievementProvider>
  );
};

export default App;
```

When you click "Score 100 points":
1. A toast notification appears automatically
2. Confetti animation plays
3. The achievement is stored and visible in the badges modal
4. The badges button updates to show the new count

## Built-in UI System (NEW in v3.6.0)

React Achievements v3.6.0 introduces a modern, lightweight UI system with **zero external dependencies**. The built-in components provide beautiful notifications, modals, and confetti animations with full theme customization.

### Key Benefits

- **40KB Bundle Reduction**: Built-in UI is only ~8KB vs ~50KB for external dependencies
- **Modern Design**: Sleek gradients, smooth animations, and polished components
- **Theme System**: 3 built-in themes + extensible registry for custom themes
- **Component Injection**: Replace any UI component with your own implementation
- **Backwards Compatible**: Existing apps work without changes
- **SSR Safe**: Proper window checks for server-side rendering

### Quick Migration

**To use built-in UI** - opt-in with the `useBuiltInUI` prop:
```tsx
<AchievementProvider
  achievements={config}
  useBuiltInUI={true}  // Force built-in UI, ignore external dependencies
>
  <YourApp />
</AchievementProvider>
```

### Built-in Theme Presets

Choose from 3 professionally designed themes:

#### Modern Theme (Default)
```tsx
<AchievementProvider
  achievements={config}
  useBuiltInUI={true}
  ui={{ theme: 'modern' }}
>
```
- Dark gradients with smooth animations
- Green accent colors
- Professional and polished look
- Perfect for productivity apps and games

#### Minimal Theme
```tsx
<AchievementProvider
  achievements={config}
  useBuiltInUI={true}
  ui={{ theme: 'minimal' }}
>
```
- Light, clean design
- Subtle shadows and simple borders
- Reduced motion for accessibility
- Perfect for professional and corporate apps

#### Gamified Theme
```tsx
<AchievementProvider
  achievements={config}
  useBuiltInUI={true}
  ui={{ theme: 'gamified' }}
>
```
- Perfect for games and engaging experiences
- Badges instead of rectangular displays

### Notification Positions

Place notifications anywhere on screen:

```tsx
<AchievementProvider
  achievements={config}
  useBuiltInUI={true}
  ui={{
    theme: 'modern',
    notificationPosition: 'top-center',  // Default
    // Options: 'top-left', 'top-center', 'top-right',
    //          'bottom-left', 'bottom-center', 'bottom-right'
  }}
>
```

### Custom Component Injection

For advanced users who need full customization beyond the 3 built-in themes, you can replace any UI component with your own implementation:

```tsx
import { AchievementProvider, NotificationProps } from 'react-achievements';

// Create your custom notification component
const MyCustomNotification: React.FC<NotificationProps> = ({
  achievement,
  onClose,
  duration,
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="my-custom-notification">
      <h3>{achievement.title}</h3>
      <p>{achievement.description}</p>
      <span>{achievement.icon}</span>
    </div>
  );
};

// Inject your component
<AchievementProvider
  achievements={config}
  ui={{
    NotificationComponent: MyCustomNotification,
    // ModalComponent: MyCustomModal,  // Optional
    // ConfettiComponent: MyCustomConfetti,  // Optional
  }}
>
  <YourApp />
</AchievementProvider>
```

### BadgesButton Placement Modes

**NEW**: BadgesButton now supports both fixed positioning and inline mode:

#### Fixed Positioning (Default)
Traditional floating button:
```tsx
import { BadgesButton } from 'react-achievements';

<BadgesButton
  placement="fixed"  // Default
  position="bottom-right"  // Corner position
  onClick={() => setModalOpen(true)}
  unlockedAchievements={achievements}
/>
```

#### Inline Mode (NEW)
Embed the badge button in drawers, navbars, sidebars:
```tsx
function MyDrawer() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <Drawer>
      <nav>
        <NavItem>Home</NavItem>
        <NavItem>Settings</NavItem>

        {/* Badge button inside drawer - no fixed positioning */}
        <BadgesButton
          placement="inline"
          onClick={() => setModalOpen(true)}
          unlockedAchievements={achievements}
          theme="modern"  // Matches your app theme
        />
      </nav>
    </Drawer>
  );
}
```

**Inline mode benefits:**
- Works in drawers, sidebars, navigation bars
- Flows with your layout (no fixed positioning)
- Themeable to match surrounding UI
- Fully customizable with `styles` prop

### UI Configuration Options

Complete UI configuration reference:

```tsx
<AchievementProvider
  achievements={config}
  useBuiltInUI={true}
  ui={{
    // Theme configuration
    theme: 'modern',  // 'modern' | 'minimal' | 'gamified' | custom theme name

    // Component overrides
    NotificationComponent: MyCustomNotification,  // Optional
    ModalComponent: MyCustomModal,  // Optional
    ConfettiComponent: MyCustomConfetti,  // Optional

    // Notification settings
    notificationPosition: 'top-center',  // Position on screen
    enableNotifications: true,  // Default: true

    // Confetti settings
    enableConfetti: true,  // Default: true

    // Direct theme object (bypasses registry)
    customTheme: {
      name: 'inline-theme',
      notification: { /* ... */ },
      modal: { /* ... */ },
      confetti: { /* ... */ },
    },
  }}
>
  <YourApp />
</AchievementProvider>
```

### Migration Guide

#### Existing Users (v3.5.0 and earlier)

**Option 1: No changes (keep using external dependencies)**
- Your code works exactly as before
- You'll see a deprecation warning in console (once per session)
- Plan to migrate before v4.0.0

**Option 2: Migrate to built-in UI**
1. Add `useBuiltInUI={true}` to your AchievementProvider
2. Test your app (UI will change to modern theme)
3. Optionally customize with `ui={{ theme: 'minimal' }}` if you prefer lighter styling
4. Remove external dependencies:
   ```bash
   npm uninstall react-toastify react-modal react-confetti react-use
   ```

#### New Projects

For new projects using built-in UI, install react-achievements and explicitly opt-in:

```bash
npm install react-achievements
```

```tsx
<AchievementProvider
  achievements={config}
  useBuiltInUI={true}  // Explicitly enable built-in UI
  ui={{ theme: 'modern' }}  // Optional theme customization
>
  {/* Beautiful built-in UI */}
</AchievementProvider>
```

Without `useBuiltInUI={true}`, you'll need to install the external UI dependencies (default behavior for v3.6.0).

### Deprecation Timeline

- **v3.6.0 (current)**: Built-in UI available, external deps optional with deprecation warning
- **v3.7.0-v3.9.0**: Continued support for both systems, refinements based on feedback
- **v4.0.0**: External dependencies fully optional, built-in UI becomes default

## Simple API (Recommended)

Perfect for 90% of use cases - threshold-based achievements with minimal configuration:

```tsx
import { AchievementProvider, useSimpleAchievements } from 'react-achievements';

const achievements = {
  // Numeric thresholds
  score: {
    100: { title: 'Century!', description: 'Score 100 points', icon: '🏆' },
    500: { title: 'High Scorer!', icon: '⭐' }
  },
  
  // Boolean achievements  
  completedTutorial: {
    true: { title: 'Tutorial Master', description: 'Complete the tutorial', icon: '📚' }
  },
  
  // String-based achievements
  characterClass: {
    wizard: { title: 'Arcane Scholar', description: 'Choose the wizard class', icon: '🧙‍♂️' },
    warrior: { title: 'Battle Hardened', description: 'Choose the warrior class', icon: '⚔️' }
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

const { track, increment, unlocked, unlockedCount, reset } = useSimpleAchievements();

// Track achievements easily
track('score', 100);           // Unlocks "Century!" achievement
track('completedTutorial', true);  // Unlocks "Tutorial Master"
track('characterClass', 'wizard'); // Unlocks "Arcane Scholar"

// Increment values - perfect for button clicks, actions, etc.
increment('buttonClicks');     // Adds 1 each time (great for button clicks)
increment('score', 50);        // Adds 50 each time (custom amount)
increment('lives', -1);        // Subtract 1 (negative increment)

// Track multiple metrics for custom conditions
track('score', 1000);
track('accuracy', 100);        // Unlocks "Perfect Combo" if both conditions met
```

### Simple API Comparison Logic

When using the Simple API, achievement conditions use different comparison operators depending on the value type:

| Value Type | Comparison | Example | When Achievement Unlocks |
|------------|------------|---------|-------------------------|
| **Numeric** | `>=` (greater than or equal) | `score: { 100: {...} }` | When `track('score', 100)` or higher |
| **Boolean** | `===` (strict equality) | `completedTutorial: { true: {...} }` | When `track('completedTutorial', true)` |
| **String** | `===` (strict equality) | `characterClass: { wizard: {...} }` | When `track('characterClass', 'wizard')` |

**Important Notes:**
- **Numeric achievements** use `>=` comparison, so they unlock when you reach **or exceed** the threshold
- **Boolean and string achievements** use exact equality matching
- Custom condition functions have full control over comparison logic

**Examples:**
```tsx
// Numeric: Achievement unlocks at 100 or higher
track('score', 150);  // ✅ Unlocks "Century!" (threshold: 100)
track('score', 99);   // ❌ Does not unlock

// Boolean: Must match exactly  
track('completedTutorial', true);   // ✅ Unlocks achievement
track('completedTutorial', false);  // ❌ Does not unlock

// String: Must match exactly
track('characterClass', 'wizard');   // ✅ Unlocks "Arcane Scholar"
track('characterClass', 'Wizard');   // ❌ Does not unlock (case sensitive)
```

## Three-Tier Builder API

The AchievementBuilder provides three levels of complexity to match your needs - from zero-config defaults to full custom logic:

### Tier 1: Smart Defaults (90% of use cases)

Zero configuration needed - just specify what you want to track:

```tsx
import { AchievementBuilder } from 'react-achievements';

// Individual achievements with smart defaults
AchievementBuilder.createScoreAchievement(100);        // "Score 100!" + 🏆
AchievementBuilder.createLevelAchievement(5);          // "Level 5!" + 📈  
AchievementBuilder.createBooleanAchievement('completedTutorial'); // "Completed Tutorial!" + ✅

// Bulk creation with smart defaults
AchievementBuilder.createScoreAchievements([100, 500, 1000]);
AchievementBuilder.createLevelAchievements([5, 10, 25]);

// Mixed: some defaults, some custom awards
const achievements = AchievementBuilder.createScoreAchievements([
  100,  // Uses default "Score 100!" + 🏆
  [500, { title: 'High Scorer!', icon: '⭐' }],  // Custom award
  1000  // Uses default "Score 1000!" + 🏆
]);
```

### Tier 2: Chainable Customization

Start with defaults, then customize awards as needed:

```tsx
// Individual achievements with custom awards
const achievements = AchievementBuilder.combine([
  AchievementBuilder.createScoreAchievement(100)
    .withAward({ title: 'Century!', description: 'Amazing score!', icon: '🏆' }),
    
  AchievementBuilder.createLevelAchievement(5)
    .withAward({ title: 'Getting Started', icon: '🌱' }),
    
  AchievementBuilder.createBooleanAchievement('completedTutorial')
    .withAward({ title: 'Tutorial Master', description: 'You did it!', icon: '📚' }),
    
  AchievementBuilder.createValueAchievement('characterClass', 'wizard')
    .withAward({ title: 'Arcane Scholar', icon: '🧙‍♂️' })
]);
```

### Tier 3: Full Control for Complex Logic

Complete control over achievement conditions for power users:

```tsx
// Handle complex scenarios like Date, null, undefined values
const complexAchievement = AchievementBuilder.create()
  .withId('weekly_login')
  .withMetric('lastLoginDate')
  .withCondition((value, state) => {
    // Handle all possible value types
    if (value === null || value === undefined) return false;
    if (value instanceof Date) {
      return value.getTime() > Date.now() - (7 * 24 * 60 * 60 * 1000);
    }
    return false;
  })
  .withAward({
    title: 'Weekly Warrior',
    description: 'Logged in within the last week',
    icon: '📅'
  })
  .build();

// Multiple complex achievements
const advancedAchievements = AchievementBuilder.combine([
  complexAchievement,
  AchievementBuilder.create()
    .withId('perfect_combo')
    .withMetric('gameState')
    .withCondition((value, state) => {
      return state.score >= 1000 && state.accuracy === 100;
    })
    .withAward({ title: 'Perfect!', icon: '💎' })
    .build()
]);
```

### Key Benefits
- **Progressive complexity**: Start simple, add complexity only when needed
- **Zero configuration**: Works out of the box with smart defaults
- **Chainable customization**: Fine-tune awards without changing logic
- **Type-safe**: Full TypeScript support for complex conditions
- **Handles edge cases**: Date, null, undefined values in Tier 3
- **Combinable**: Mix and match different tiers in one configuration

## State Management Options

This package includes example implementations for different state management solutions in the `stories/examples` directory:

- **Redux**: For large applications with complex state management needs
- **Zustand**: For applications needing a lightweight, modern state solution
- **Context API**: For applications preferring React's built-in solutions

See the [examples directory](./stories/examples) for detailed implementations and instructions for each state management solution.

## Features

- Framework-agnostic achievement system
- Customizable storage implementations
- Built-in local storage support
- Customizable UI components
- Toast notifications
- Confetti animations
- TypeScript support
- **NEW in v3.6.0**: Built-in UI components with zero external dependencies
- **NEW in v3.6.0**: Extensible theme system with 3 built-in themes (modern, minimal, gamified)
- **NEW in v3.6.0**: Theme registry for creating and sharing custom themes
- **NEW in v3.6.0**: Component injection for full UI customization
- **NEW in v3.6.0**: BadgesButton inline mode for drawers and sidebars
- **NEW in v3.6.0**: 40KB bundle reduction for new projects
- **NEW in v3.4.0**: Async storage support (IndexedDB, REST API, Offline Queue)
- **NEW in v3.4.0**: 50MB+ storage capacity with IndexedDB
- **NEW in v3.4.0**: Server-side sync with REST API storage
- **NEW in v3.4.0**: Offline-first capabilities with automatic queue sync
- **NEW in v3.3.0**: Comprehensive error handling system
- **NEW in v3.3.0**: Data export/import for achievement portability
- **NEW in v3.3.0**: Type-safe error classes with recovery guidance

## Achievement Notifications & History

The package provides two ways to display achievements to users:

### Automatic Notifications
When an achievement is unlocked, the system automatically:
- Shows a toast notification in the top-right corner with the achievement details
- Plays a confetti animation to celebrate the achievement

These notifications appear immediately when achievements are unlocked and require no additional setup.

### Achievement History
To allow users to view their achievement history, the package provides two essential components:

1. `BadgesButton`: A floating button that shows the number of unlocked achievements
```tsx
<BadgesButton 
  position="bottom-right" // or "top-right", "top-left", "bottom-left"
  onClick={() => setIsModalOpen(true)}
  unlockedAchievements={achievements.unlocked}
/>
```

2. `BadgesModal`: A modal dialog that displays all unlocked achievements with their details

**Basic Usage** (shows only unlocked achievements):
```tsx
<BadgesModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  achievements={achievements.unlocked}
  icons={customIcons} // Optional custom icons
/>
```

**Show All Achievements** (NEW in v3.5.0): Display both locked and unlocked achievements to motivate users and show them what's available:

```tsx
import { useAchievements, BadgesModal } from 'react-achievements';

function MyComponent() {
  const { getAllAchievements } = useAchievements();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get all achievements with their unlock status
  const allAchievements = getAllAchievements();

  return (
    <BadgesModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      showAllAchievements={true}           // Enable showing locked achievements
      showUnlockConditions={true}          // Show hints on how to unlock
      allAchievements={allAchievements}    // Pass all achievements with status
    />
  );
}
```

**Props for Show All Achievements:**
- `showAllAchievements` (boolean): When `true`, displays both locked and unlocked achievements. Default: `false`
- `showUnlockConditions` (boolean): When `true`, shows unlock requirement hints for locked achievements. Default: `false`
- `allAchievements` (AchievementWithStatus[]): Array of all achievements with their `isUnlocked` status

**Visual Features:**
- Locked achievements appear grayed out with reduced opacity
- Lock icon (🔒) displayed on locked achievements
- Optional unlock condition hints guide users on how to progress
- Fully customizable via the style system

**Use Cases:**
- Show users a roadmap of available achievements
- Motivate progression by revealing future rewards
- Provide clear guidance on unlock requirements
- Create achievement-based progression systems

These components are the recommended way to give users access to their achievement history. While you could build custom UI using the `useAchievements` hook data, these components provide a polished, ready-to-use interface for achievement history.


## Default Icons

The package comes with a comprehensive set of default icons that you can use in your achievements. These are available through the `defaultAchievementIcons` export:

```tsx
import { AchievementProvider } from 'react-achievements';

// Example achievement configuration using direct emoji icons
const achievements = {
  pageViews: {
    5: { 
      title: 'Getting Started', 
      description: 'Viewed 5 pages', 
      icon: '👣'
    }
  }
};

// Create your app component
const App = () => {
  return (
    <AchievementProvider
      achievements={achievements}
      storage="local"
    >
      <Game />
    </AchievementProvider>
  );
};
```

### Using Icons

The Simple API makes icon usage straightforward - just include emojis directly in your achievement definitions:

```tsx
const achievements = {
  score: {
    100: { title: 'Century!', icon: '🏆' },
    500: { title: 'High Scorer!', icon: '⭐' },
    1000: { title: 'Elite Player!', icon: '💎' }
  },
  level: {
    5: { title: 'Getting Started', icon: '🌱' },
    10: { title: 'Rising Star', icon: '🚀' },
    25: { title: 'Expert', icon: '👑' }
  }
};
```

### Fallback Icons

The library provides a small set of essential fallback icons for system use (error states, loading, etc.). These are automatically used when needed and don't require any configuration.

## Async Storage (NEW in v3.4.0)

React Achievements now supports async storage backends for modern applications that need large data capacity, server sync, or offline-first capabilities.

### IndexedDB Storage

Browser-native storage with 50MB+ capacity (vs localStorage's 5-10MB limit):

```tsx
import { AchievementProvider, StorageType } from 'react-achievements';

const App = () => {
  return (
    <AchievementProvider
      achievements={gameAchievements}
      storage={StorageType.IndexedDB}  // Use IndexedDB for large data
    >
      <Game />
    </AchievementProvider>
  );
};
```

**Benefits:**
- ✅ 10x larger capacity than localStorage
- ✅ Structured data storage
- ✅ Better performance for large datasets
- ✅ Non-blocking async operations

### REST API Storage

Sync achievements with your backend server:

```tsx
import { AchievementProvider, StorageType } from 'react-achievements';

const App = () => {
  return (
    <AchievementProvider
      achievements={gameAchievements}
      storage={StorageType.RestAPI}
      restApiConfig={{
        baseUrl: 'https://api.example.com',
        userId: getCurrentUserId(),
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        },
        timeout: 10000  // Optional, default 10s
      }}
    >
      <Game />
    </AchievementProvider>
  );
};
```

**API Endpoints Expected:**
```
GET    /users/:userId/achievements/metrics
PUT    /users/:userId/achievements/metrics
GET    /users/:userId/achievements/unlocked
PUT    /users/:userId/achievements/unlocked
DELETE /users/:userId/achievements
```

**Benefits:**
- ✅ Cross-device synchronization
- ✅ Server-side backup
- ✅ User authentication support
- ✅ Centralized data management

### Offline Queue Storage

Offline-first storage with automatic sync when back online:

```tsx
import {
  AchievementProvider,
  OfflineQueueStorage,
  RestApiStorage
} from 'react-achievements';

// Wrap REST API storage with offline queue
const restApi = new RestApiStorage({
  baseUrl: 'https://api.example.com',
  userId: 'user123',
  headers: { 'Authorization': 'Bearer token' }
});

const offlineStorage = new OfflineQueueStorage(restApi);

const App = () => {
  return (
    <AchievementProvider
      achievements={gameAchievements}
      storage={offlineStorage}
    >
      <Game />
    </AchievementProvider>
  );
};
```

**Benefits:**
- ✅ Works offline - queues operations locally
- ✅ Automatic sync when connection restored
- ✅ Persistent queue survives page refreshes
- ✅ Graceful degradation for poor connectivity

### Custom Async Storage

You can create custom async storage by implementing the `AsyncAchievementStorage` interface:

```tsx
import {
  AsyncAchievementStorage,
  AchievementMetrics,
  AsyncStorageAdapter,
  AchievementProvider
} from 'react-achievements';

class MyCustomAsyncStorage implements AsyncAchievementStorage {
  async getMetrics(): Promise<AchievementMetrics> {
    // Your async implementation (e.g., fetch from database)
    const response = await fetch('/my-api/metrics');
    return response.json();
  }

  async setMetrics(metrics: AchievementMetrics): Promise<void> {
    await fetch('/my-api/metrics', {
      method: 'PUT',
      body: JSON.stringify(metrics)
    });
  }

  async getUnlockedAchievements(): Promise<string[]> {
    const response = await fetch('/my-api/unlocked');
    return response.json();
  }

  async setUnlockedAchievements(achievements: string[]): Promise<void> {
    await fetch('/my-api/unlocked', {
      method: 'PUT',
      body: JSON.stringify(achievements)
    });
  }

  async clear(): Promise<void> {
    await fetch('/my-api/clear', { method: 'DELETE' });
  }
}

// Wrap with adapter for optimistic updates
const customStorage = new MyCustomAsyncStorage();
const adapter = new AsyncStorageAdapter(customStorage, {
  onError: (error) => console.error('Storage error:', error)
});

const App = () => {
  return (
    <AchievementProvider
      achievements={gameAchievements}
      storage={adapter}
    >
      <Game />
    </AchievementProvider>
  );
};
```

**How AsyncStorageAdapter Works:**
- **Optimistic Updates**: Returns cached data immediately (no waiting)
- **Eager Loading**: Preloads data during initialization
- **Background Writes**: All writes happen async without blocking UI
- **Error Handling**: Optional error callback for failed operations

## Custom Storage

You can implement your own synchronous storage solution by implementing the `AchievementStorage` interface:

```tsx
import { AchievementStorage, AchievementMetrics, AchievementProvider } from 'react-achievements';

class CustomStorage implements AchievementStorage {
  getMetrics(): AchievementMetrics {
    // Your implementation
    return {};
  }

  setMetrics(metrics: AchievementMetrics): void {
    // Your implementation
  }

  getUnlockedAchievements(): string[] {
    // Your implementation
    return [];
  }

  setUnlockedAchievements(achievements: string[]): void {
    // Your implementation
  }

  clear(): void {
    // Your implementation
  }
}

// Use your custom storage
const gameAchievements = {
  score: {
    100: { title: 'Century!', icon: '🏆' }
  }
};

const App = () => {
    return (
        <AchievementProvider
            achievements={gameAchievements}
            storage={new CustomStorage()} // Use your custom storage implementation
        >
        </AchievementProvider>
    );
};

export default App;
```

## Error Handling

React Achievements v3.3.0 introduces a comprehensive error handling system with specialized error types, recovery guidance, and graceful degradation.

### Error Types

The library provides 6 specialized error classes for different failure scenarios:

```tsx
import {
  StorageQuotaError,
  ImportValidationError,
  StorageError,
  ConfigurationError,
  SyncError,
  isAchievementError,
  isRecoverableError
} from 'react-achievements';
```

| Error Type | When It Occurs | Recoverable | Use Case |
|-----------|----------------|-------------|----------|
| `StorageQuotaError` | Browser storage quota exceeded | Yes | Prompt user to clear storage or export data |
| `ImportValidationError` | Invalid data during import | Yes | Show validation errors to user |
| `StorageError` | Storage read/write failures | Maybe | Retry operation or fallback to memory storage |
| `ConfigurationError` | Invalid achievement config | No | Fix configuration during development |
| `SyncError` | Multi-device sync failures | Yes | Retry sync or use local data |

### Using the onError Callback

Handle errors gracefully by providing an `onError` callback to the `AchievementProvider`:

```tsx
import { AchievementProvider, AchievementError, StorageQuotaError } from 'react-achievements';

const App = () => {
  const handleAchievementError = (error: AchievementError) => {
    // Check error type
    if (error instanceof StorageQuotaError) {
      console.error(`Storage quota exceeded! Need ${error.bytesNeeded} bytes`);
      console.log('Remedy:', error.remedy);

      // Offer user the option to export and clear data
      if (confirm('Storage full. Export your achievements?')) {
        // Export data before clearing (see Data Export/Import section)
        exportAndClearData();
      }
    }

    // Use type guards
    if (isRecoverableError(error)) {
      // Show user-friendly error message with remedy
      showNotification({
        type: 'error',
        message: error.message,
        remedy: error.remedy
      });
    } else {
      // Log non-recoverable errors
      console.error('Non-recoverable error:', error);
    }
  };

  return (
    <AchievementProvider
      achievements={gameAchievements}
      storage="local"
      onError={handleAchievementError}
    >
      <Game />
    </AchievementProvider>
  );
};
```

### Error Properties

All achievement errors include helpful properties:

```tsx
try {
  // Some operation that might fail
  storage.setMetrics(metrics);
} catch (error) {
  if (isAchievementError(error)) {
    console.log(error.code);        // Machine-readable: "STORAGE_QUOTA_EXCEEDED"
    console.log(error.message);     // Human-readable: "Browser storage quota exceeded"
    console.log(error.recoverable); // true/false - can this be recovered?
    console.log(error.remedy);      // Guidance: "Clear browser storage or..."

    // Error-specific properties
    if (error instanceof StorageQuotaError) {
      console.log(error.bytesNeeded); // How much space is needed
    }
  }
}
```

### Graceful Degradation

If no `onError` callback is provided, errors are automatically logged to the console with full details:

```tsx
// Without onError callback
<AchievementProvider achievements={gameAchievements} storage="local">
  <Game />
</AchievementProvider>

// Errors are automatically logged:
// "Achievement storage error: Browser storage quota exceeded.
//  Remedy: Clear browser storage, reduce the number of achievements..."
```

### Type Guards

Use type guards for type-safe error handling:

```tsx
import { isAchievementError, isRecoverableError } from 'react-achievements';

try {
  await syncAchievements();
} catch (error) {
  if (isAchievementError(error)) {
    // TypeScript knows this is an AchievementError
    console.log(error.code, error.remedy);

    if (isRecoverableError(error)) {
      // Attempt recovery
      retryOperation();
    }
  } else {
    // Handle non-achievement errors
    console.error('Unexpected error:', error);
  }
}
```

## Data Export/Import

Transfer achievements between devices, create backups, or migrate data with the export/import system. Export to local files or cloud storage providers like AWS S3 and Azure Blob Storage.

### Exporting Achievement Data

Export all achievement data including metrics, unlocked achievements, and configuration:

```tsx
import { useAchievements, exportAchievementData } from 'react-achievements';

const MyComponent = () => {
  const { getState } = useAchievements();

  const exportData = () => {
    const state = getState();
    return exportAchievementData(
      state.metrics,
      state.unlockedAchievements,
      achievements // Your achievement configuration
    );
  };

  return (
    <>
      <button onClick={handleExportToFile}>Export to File</button>
      <button onClick={handleExportToAWS}>Export to AWS S3</button>
      <button onClick={handleExportToAzure}>Export to Azure</button>
    </>
  );
};
```

### Export to Local File

Download achievement data as a JSON file:

```tsx
const handleExportToFile = () => {
  const exportedData = exportData();

  const blob = new Blob([JSON.stringify(exportedData)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `achievements-${Date.now()}.json`;
  link.click();
  URL.revokeObjectURL(url);
};
```

### Export to AWS S3

Upload achievement data to Amazon S3 for cloud backup and cross-device sync:

```tsx
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

const handleExportToAWS = async () => {
  const exportedData = exportData();

  const s3Client = new S3Client({
    region: 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  const userId = getCurrentUserId(); // Your user identification logic
  const key = `achievements/${userId}/data.json`;

  try {
    await s3Client.send(new PutObjectCommand({
      Bucket: 'my-app-achievements',
      Key: key,
      Body: JSON.stringify(exportedData),
      ContentType: 'application/json',
      Metadata: {
        version: exportedData.version,
        timestamp: exportedData.timestamp,
      },
    }));

    console.log('Achievements backed up to S3 successfully!');
  } catch (error) {
    console.error('Failed to upload to S3:', error);
  }
};
```

### Import from AWS S3

```tsx
const MyComponent = () => {
  const { update } = useAchievements(); // Get update from hook

  const handleImportFromAWS = async () => {
    const s3Client = new S3Client({ /* config */ });
    const userId = getCurrentUserId();

    try {
      const response = await s3Client.send(new GetObjectCommand({
        Bucket: 'my-app-achievements',
        Key: `achievements/${userId}/data.json`,
      }));

      const data = JSON.parse(await response.Body.transformToString());

      const result = importAchievementData(data, {
        strategy: 'merge',
        achievements: gameAchievements
      });

      if (result.success) {
        update(result.mergedMetrics);
        console.log('Achievements restored from S3!');
      }
    } catch (error) {
      console.error('Failed to import from S3:', error);
    }
  };

  return <button onClick={handleImportFromAWS}>Restore from AWS</button>;
};
```

### Export to Microsoft Azure Blob Storage

Upload achievement data to Azure for enterprise cloud backup:

```tsx
import { BlobServiceClient } from '@azure/storage-blob';

const handleExportToAzure = async () => {
  const exportedData = exportData();

  const blobServiceClient = BlobServiceClient.fromConnectionString(
    process.env.AZURE_STORAGE_CONNECTION_STRING
  );

  const containerClient = blobServiceClient.getContainerClient('achievements');
  const userId = getCurrentUserId();
  const blobName = `${userId}/achievements-${Date.now()}.json`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  try {
    await blockBlobClient.upload(
      JSON.stringify(exportedData),
      JSON.stringify(exportedData).length,
      {
        blobHTTPHeaders: {
          blobContentType: 'application/json',
        },
        metadata: {
          version: exportedData.version,
          timestamp: exportedData.timestamp,
          configHash: exportedData.configHash,
        },
      }
    );

    console.log('Achievements backed up to Azure successfully!');
  } catch (error) {
    console.error('Failed to upload to Azure:', error);
  }
};
```



### Import from Azure Blob Storage

```tsx
const MyComponent = () => {
  const { update } = useAchievements(); // Get update from hook

  const handleImportFromAzure = async () => {
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING
    );

    const containerClient = blobServiceClient.getContainerClient('achievements');
    const userId = getCurrentUserId();

    try {
      // List blobs to find the latest backup
      const blobs = containerClient.listBlobsFlat({ prefix: `${userId}/` });
      let latestBlob = null;

      for await (const blob of blobs) {
        if (!latestBlob || blob.properties.createdOn > latestBlob.properties.createdOn) {
          latestBlob = blob;
        }
      }

      if (latestBlob) {
        const blockBlobClient = containerClient.getBlockBlobClient(latestBlob.name);
        const downloadResponse = await blockBlobClient.download(0);
        const data = JSON.parse(await streamToString(downloadResponse.readableStreamBody));

        const result = importAchievementData(data, {
          strategy: 'merge',
          achievements: gameAchievements
        });

        if (result.success) {
          update(result.mergedMetrics);
          console.log('Achievements restored from Azure!');
        }
      }
    } catch (error) {
      console.error('Failed to import from Azure:', error);
    }
  };

  return <button onClick={handleImportFromAzure}>Restore from Azure</button>;
};

// Helper function to convert stream to string
async function streamToString(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on('data', (data) => chunks.push(data.toString()));
    readableStream.on('end', () => resolve(chunks.join('')));
    readableStream.on('error', reject);
  });
}
```

### Cloud Storage Best Practices

When using cloud storage for achievements:

**Security**:
```tsx
// Never expose credentials in client-side code
// Use environment variables or secure credential management
const credentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,  // Server-side only
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,  // Server-side only
};

// For client-side apps, use temporary credentials via STS or Cognito
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';

const s3Client = new S3Client({
  region: 'us-east-1',
  credentials: fromCognitoIdentityPool({
    client: new CognitoIdentityClient({ region: 'us-east-1' }),
    identityPoolId: 'us-east-1:xxxxx-xxxx-xxxx',
  }),
});
```

**File Naming**:
```tsx
// Use consistent naming for easy retrieval
const generateKey = (userId: string) => {
  const timestamp = new Date().toISOString();
  return `achievements/${userId}/${timestamp}.json`;
};

// Or use latest.json for current data + timestamped backups
const keys = {
  current: `achievements/${userId}/latest.json`,
  backup: `achievements/${userId}/backups/${Date.now()}.json`
};
```

**Error Handling**:
```tsx
const uploadWithRetry = async (data: ExportedData, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await uploadToCloud(data);
      return { success: true };
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
};
```

### Importing Achievement Data

Import previously exported data with validation and merge strategies:

```tsx
import { useAchievements, importAchievementData } from 'react-achievements';

const MyComponent = () => {
  const { update } = useAchievements();

  const handleImport = async (file: File) => {
    try {
      const text = await file.text();
      const importedData = JSON.parse(text);

      const result = importAchievementData(importedData, {
        strategy: 'merge', // 'replace', 'merge', or 'preserve'
        achievements: gameAchievements
      });

      if (result.success) {
        // Apply merged data
        update(result.mergedMetrics);
        console.log(`Imported ${result.importedCount} achievements`);
      } else {
        // Handle validation errors
        console.error('Import failed:', result.errors);
      }
    } catch (error) {
      if (error instanceof ImportValidationError) {
        console.error('Invalid import file:', error.remedy);
      }
    }
  };

  return (
    <input
      type="file"
      accept=".json"
      onChange={(e) => e.target.files?.[0] && handleImport(e.target.files[0])}
    />
  );
};
```

### Merge Strategies

Control how imported data is merged with existing data:

```tsx
// Replace: Completely replace all existing data
const result = importAchievementData(data, {
  strategy: 'replace',
  achievements
});
```

```tsx
// Merge: Combine imported and existing data
// - Takes maximum values for metrics
// - Combines unlocked achievements
const result = importAchievementData(data, {
  strategy: 'merge',
  achievements
});
```

```tsx

// Preserve: Only import new achievements, keep existing data
const result = importAchievementData(data, {
  strategy: 'preserve',
  achievements
});
```

### Export Data Structure

The exported data includes:

```
{
  version: "1.0",                    // Export format version
  timestamp: "2024-12-10T...",       // When data was exported
  configHash: "abc123...",           // Hash of achievement config
  metrics: {                         // All tracked metrics
    score: 1000,
    level: 5
  },
  unlockedAchievements: [           // All unlocked achievement IDs
    "score_100",
    "level_5"
  ]
}
```

### Configuration Validation

Import validation ensures data compatibility:

```tsx
try {
  const result = importAchievementData(importedData, {
    strategy: 'replace',
    achievements
  });

  if (!result.success) {
    // Check for configuration mismatch
    if (result.configMismatch) {
      console.warn('Achievement configuration has changed since export');
      console.log('You can still import with strategy: merge or preserve');
    }

    // Check for validation errors
    console.error('Validation errors:', result.errors);
  }
} catch (error) {
  if (error instanceof ImportValidationError) {
    console.error('Import failed:', error.message, error.remedy);
  }
}
```

### Use Cases

**Backup Before Clearing Storage**:
```tsx
const MyComponent = () => {
  const { getState, reset } = useAchievements();

  // Storage quota exceeded - export before clearing
  const handleStorageQuotaError = (error: StorageQuotaError) => {
    const state = getState();
    const backup = exportAchievementData(state.metrics, state.unlockedAchievements, achievements);

    // Save backup
    localStorage.setItem('achievement-backup', JSON.stringify(backup));

    // Clear storage
    reset();

    alert('Data backed up and storage cleared!');
  };

  return <button onClick={() => handleStorageQuotaError(new StorageQuotaError(1000))}>Test Backup</button>;
};
```

**Cross-Device Transfer**:
```tsx
const MyComponent = () => {
  const { getState, update } = useAchievements();

  // Device 1: Export data
  const exportData = () => {
    const state = getState();
    const data = exportAchievementData(state.metrics, state.unlockedAchievements, achievements);
    // Upload to cloud or save to file
    return data;
  };

  // Device 2: Import data
  const importData = async (cloudData) => {
    const result = importAchievementData(cloudData, {
      strategy: 'merge', // Combine with any local progress
      achievements
    });

    if (result.success) {
      update(result.mergedMetrics);
    }
  };

  return (
    <>
      <button onClick={() => exportData()}>Export for Transfer</button>
      <button onClick={() => importData(/* cloudData */)}>Import from Other Device</button>
    </>
  );
};
```

## Styling

The achievement components use default styling that works well out of the box. For custom styling, you can override the CSS classes or customize individual component props:

```tsx
// Individual component styling
<BadgesButton 
  position="bottom-right"
  style={{ backgroundColor: '#ff0000' }}
  unlockedAchievements={achievements.unlocked}
/>

<BadgesModal 
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  achievements={achievements.unlocked}
  style={{ backgroundColor: '#f0f0f0' }}
/>
```


## API Reference

### AchievementProvider Props

| Prop | Type | Description |
|------|------|-------------|
| achievements | AchievementConfig | Achievement configuration object |
| storage | 'local' \| 'memory' \| AchievementStorage | Storage implementation |
| theme | ThemeConfig | Custom theme configuration |
| onUnlock | (achievement: Achievement) => void | Callback when achievement is unlocked |
| onError | (error: AchievementError) => void | **NEW in v3.3.0**: Callback when errors occur |

### useAchievements Hook

Returns an object with:

- `update`: Function to update achievement metrics
- `achievements`: Object containing unlocked and locked achievements
- `reset`: Function to reset achievement storage

## Advanced: Complex API

For complex scenarios requiring full control over achievement logic, you can use the traditional Complex API with POJO (Plain Old JavaScript Object) configurations:

```tsx
import { AchievementProvider, useAchievements } from 'react-achievements';

// Define your achievements using the traditional complex format
const achievements = {
  score: [{
    isConditionMet: (value: AchievementMetricArrayValue, state: AchievementState) => {
      const numValue = Array.isArray(value) ? value[0] : value;
      return typeof numValue === 'number' && numValue >= 100;
    },
    achievementDetails: {
      achievementId: 'score_100',
      achievementTitle: 'Century!',
      achievementDescription: 'Score 100 points',
      achievementIconKey: 'trophy'
    }
  }],
  
  completedTutorial: [{
    isConditionMet: (value: AchievementMetricArrayValue, state: AchievementState) => {
      const boolValue = Array.isArray(value) ? value[0] : value;
      return typeof boolValue === 'boolean' && boolValue === true;
    },
    achievementDetails: {
      achievementId: 'tutorial_complete',
      achievementTitle: 'Tutorial Master',
      achievementDescription: 'Complete the tutorial',
      achievementIconKey: 'book'
    }
  }]
};

// Create your app component
const App = () => {
  return (
    <AchievementProvider
      achievements={achievements}
      storage="local" // or "memory" or custom storage
    >
      <Game />
    </AchievementProvider>
  );
};

// Use achievements in your components
const Game = () => {
  const { update, achievements } = useAchievements();

  const handleScoreUpdate = (newScore: number) => {
    update({ score: newScore });
  };

  return (
    <div>
      <h1>Game</h1>
      <p>Unlocked Achievements: {achievements.unlocked.length}</p>
      <button onClick={() => handleScoreUpdate(100)}>
        Score 100 points
      </button>
    </div>
  );
};
```

This API provides maximum flexibility for complex achievement logic but requires more verbose configuration. Most users should use the Simple API or Builder API instead.

## Contributing

We welcome contributions to React Achievements! This project includes quality controls to ensure code reliability.

### Git Hooks

The project uses pre-commit hooks to maintain code quality. After cloning the repository, install the hooks:

```bash
npm run install-hooks
```

This will install a pre-commit hook that automatically:
- Runs TypeScript type checking
- Runs the full test suite (154 tests)
- Blocks commits if checks fail

### What the Hook Does

When you run `git commit`, the hook will:
1. Run type checking (~2-5 seconds)
2. Run all tests (~2-3 seconds)
3. Block the commit if either fails
4. Allow the commit if all checks pass

### Bypassing the Hook

Not recommended, but if needed:

```bash
git commit --no-verify
```

Only use this when:
- Committing work-in-progress intentionally
- Reverting a commit that broke tests
- You have a valid reason to skip checks

Never bypass for:
- Failing tests (fix them first!)
- TypeScript errors (fix them first!)

### Running Tests Manually

Before committing, you can run tests manually:

```bash
# Run type checking
npm run type-check

# Run tests
npm run test:unit

# Run both (same as git hook)
npm test
```

### Test Coverage

The library has comprehensive test coverage:
- 154 total tests
- Unit tests for all core functionality
- Integration tests for React components
- Error handling tests (43 tests)
- Data export/import tests

### Troubleshooting

If the hook isn't running:

1. Check if it's installed:
   ```bash
   ls -la .git/hooks/pre-commit
   ```

2. Reinstall if needed:
   ```bash
   npm run install-hooks
   ```

For more details, see [`docs/git-hooks.md`](./docs/git-hooks.md).

## License

MIT