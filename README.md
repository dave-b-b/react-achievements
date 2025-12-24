# React Achievements

**Add gamification to your React app in 5 minutes** - Unlock achievements, celebrate milestones, delight users.

[![Demo video](https://raw.githubusercontent.com/dave-b-b/react-achievements/main/assets/achievements.png)](https://github.com/user-attachments/assets/a33fdae5-439b-4fc9-a388-ccb2f432a3a8)

[📚 Documentation](https://dave-b-b.github.io/react-achievements/) | [🎮 Interactive Demo](https://dave-b-b.github.io/react-achievements/?path=/story/introduction--page) | [📦 npm Package](https://www.npmjs.com/package/react-achievements)

[![npm version](https://img.shields.io/npm/v/react-achievements.svg)](https://www.npmjs.com/package/react-achievements) [![License](https://img.shields.io/badge/license-Dual%20(MIT%20%2B%20Commercial)-blue.svg)](./LICENSE) [![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

## Why React Achievements?

- **🎯 Simple API** - 90% less configuration than traditional achievement systems
- **🎨 Built-in UI** - Beautiful notifications & modals with zero external dependencies
- **⚡ 5-Minute Setup** - From installation to first achievement unlock
- **💾 5 Storage Options** - LocalStorage, Memory, IndexedDB, REST API, Offline Queue
- **🎭 3 Themes** - Modern, Minimal, Gamified - or create your own
- **📦 Type-Safe** - Full TypeScript support with comprehensive types

---

## Get Started in 5 Minutes

### 1. Install

```bash
npm install react-achievements
```

### 2. Configure Achievements (Simple API)

```tsx
import {
  AchievementProvider,
  useSimpleAchievements,
  BadgesButtonWithModal
} from 'react-achievements';

// Define achievements - notice how simple this is!
const achievements = {
  score: {
    100: { title: 'Century!', description: 'Score 100 points', icon: '🏆' },
    500: { title: 'High Scorer!', description: 'Score 500 points', icon: '⭐' },
  },
  completedTutorial: {
    true: { title: 'Tutorial Master', description: 'Complete the tutorial', icon: '📚' }
  }
};

function Game() {
  const { track, unlocked } = useSimpleAchievements();

  return (
    <div>
      {/* Track achievements with one line */}
      <button onClick={() => track('score', 100)}>Score Points</button>
      <button onClick={() => track('completedTutorial', true)}>Complete Tutorial</button>

      {/* Built-in UI - no state management needed! */}
      <BadgesButtonWithModal unlockedAchievements={unlocked} />
    </div>
  );
}

function App() {
  return (
    <AchievementProvider achievements={achievements} useBuiltInUI={true}>
      <Game />
    </AchievementProvider>
  );
}
```

### 3. See It Work

When users click "Score Points":
1. ✨ Beautiful notification appears: "🏆 Century! - Score 100 points"
2. 🎉 Confetti animation plays
3. 💾 Achievement saved to localStorage
4. 🏅 Badge button updates with count

**That's it!** You now have a fully functional achievement system.

➡️ **[Full Quick Start Guide](https://dave-b-b.github.io/react-achievements/docs/getting-started/quick-start)** - Step-by-step with all details

---

## Key Features

### 🎯 Simple API - 90% Less Configuration

Traditional achievement systems require verbose configuration. Not anymore:

```tsx
// ❌ Before (Complex API) - 15+ lines per achievement
const achievements = {
  score: [{
    isConditionMet: (value) => value >= 100,
    achievementDetails: {
      achievementId: 'score_100',
      achievementTitle: 'Century!',
      achievementDescription: 'Score 100 points',
      achievementIconKey: 'trophy'
    }
  }]
};

// ✅ After (Simple API) - 1 line per achievement!
const achievements = {
  score: {
    100: { title: 'Century!', description: 'Score 100 points', icon: '🏆' }
  }
};
```

➡️ **[Simple API Guide](https://dave-b-b.github.io/react-achievements/docs/guides/simple-api)**

### 🎨 Built-in UI Components

Zero external dependencies, three beautiful themes:

```tsx
<AchievementProvider
  achievements={achievements}
  useBuiltInUI={true}
  ui={{
    theme: 'modern',  // 'modern' | 'minimal' | 'gamified'
    notificationPosition: 'top-right'
  }}
>
  <YourApp />
</AchievementProvider>
```

**Includes:**
- 🔔 Notifications with smooth animations
- 🎊 Confetti celebrations
- 🏆 Achievement modal with locked/unlocked states
- 🎨 Customizable themes or inject your own components

➡️ **[UI & Theming Guide](https://dave-b-b.github.io/react-achievements/docs/guides/theming)**

### 💾 Flexible Storage - Choose What Fits

| Storage | Capacity | Use Case |
|---------|----------|----------|
| **LocalStorage** | 5-10MB | Simple browser apps (default) |
| **IndexedDB** | 50MB+ | Large datasets, PWAs |
| **REST API** | Unlimited | Multi-device sync, cloud backup |
| **Offline Queue** | Unlimited | Offline-first apps |
| **Memory** | Unlimited | Testing, prototypes |

```tsx
// Change storage with one prop
import { StorageType } from 'react-achievements';

<AchievementProvider
  achievements={achievements}
  storage={StorageType.IndexedDB}
>
  <YourApp />
</AchievementProvider>
```

➡️ **[Storage Options Guide](https://dave-b-b.github.io/react-achievements/docs/guides/storage-options)**

### 📦 TypeScript Support

Full type safety out of the box:

```tsx
import type { AchievementMetrics, AchievementWithStatus } from 'react-achievements';

const metrics: AchievementMetrics = { score: 100, level: 5 };
```

➡️ **[Complete API Reference](https://dave-b-b.github.io/react-achievements/docs/api)**

---

## Common Use Cases

### Tracking User Progress

```tsx
const { track, increment } = useSimpleAchievements();

// Track specific values
track('score', 500);
track('level', 10);
track('completedTutorial', true);

// Increment counters
increment('buttonClicks');      // +1
increment('points', 50);        // +50
```

### Complex Achievements (Multiple Conditions)

```tsx
const achievements = {
  perfectGame: {
    custom: {
      title: 'Perfect Game',
      description: 'Score 1000+ with 100% accuracy',
      icon: '💎',
      condition: (metrics) => metrics.score >= 1000 && metrics.accuracy === 100
    }
  }
};
```

### Export/Import for Backups

```tsx
const { exportData, importData } = useAchievements();

// Backup to file
const backup = exportData();
localStorage.setItem('backup', backup);

// Restore from backup
const result = importData(backup, { strategy: 'merge' });
```

### Show Locked & Unlocked Achievements

```tsx
const { getAllAchievements } = useSimpleAchievements();

<BadgesModal
  isOpen={modalOpen}
  onClose={() => setModalOpen(false)}
  showAllAchievements={true}
  allAchievements={getAllAchievements()}
  showUnlockConditions={true}  // Show hints for locked achievements
/>
```

➡️ **[More Patterns & Recipes](https://dave-b-b.github.io/react-achievements/docs/recipes/common-patterns)**

---

## Installation

```bash
npm install react-achievements
```

**Requirements:**
- React 16.8+ (hooks support)
- Node.js 16+
- TypeScript 4.5+ (optional but recommended)

**Note about Legacy Dependencies:**

As of v3.6.0, React Achievements includes a built-in UI system with **zero external dependencies** when using `useBuiltInUI={true}`. The legacy external UI dependencies (`react-toastify`, `react-modal`, `react-confetti`, `react-use`) are now optional and will be fully deprecated in v4.0.0.

```bash
# Only if using legacy external UI (deprecated in v4.0.0)
npm install react-toastify react-modal react-confetti react-use
```

➡️ **[Installation Guide](https://dave-b-b.github.io/react-achievements/docs/getting-started/installation)** - Full setup with troubleshooting

---

## Documentation

### Getting Started
- 📦 **[Installation](https://dave-b-b.github.io/react-achievements/docs/getting-started/installation)** - Setup and troubleshooting
- 🚀 **[Quick Start](https://dave-b-b.github.io/react-achievements/docs/getting-started/quick-start)** - Build your first achievement system
- 📖 **[Simple API Guide](https://dave-b-b.github.io/react-achievements/docs/guides/simple-api)** - Recommended configuration approach

### Guides
- 🎨 **[Theming & Built-in UI](https://dave-b-b.github.io/react-achievements/docs/guides/theming)** - Customize UI appearance
- 🏗️ **[Builder API](https://dave-b-b.github.io/react-achievements/docs/guides/builder-api)** - Three-tier builder system for complex achievements
- 💾 **[Storage Options](https://dave-b-b.github.io/react-achievements/docs/guides/storage-options)** - Choose the right storage backend
- 🔧 **[Error Handling](https://dave-b-b.github.io/react-achievements/docs/guides/error-handling)** - Handle errors gracefully
- 📤 **[Data Portability](https://dave-b-b.github.io/react-achievements/docs/guides/data-portability)** - Export/import achievements, cloud storage integration
- 🎨 **[Styling](https://dave-b-b.github.io/react-achievements/docs/guides/styling)** - Custom styling patterns

### Recipes & Examples
- 🍳 **[Common Patterns](https://dave-b-b.github.io/react-achievements/docs/recipes/common-patterns)** - Ready-to-use code examples
- 📱 **[State Management](https://dave-b-b.github.io/react-achievements/docs/recipes/state-management)** - Redux, Zustand, Context examples

### API Reference
- 📚 **[Complete API Docs](https://dave-b-b.github.io/react-achievements/docs/api)** - Full TypeScript API reference
- 🪝 **[Hooks](https://dave-b-b.github.io/react-achievements/docs/api/functions/useSimpleAchievements)** - useSimpleAchievements, useAchievements
- 🧱 **[Components](https://dave-b-b.github.io/react-achievements/docs/api/variables/BadgesButton)** - BadgesButton, BadgesModal, etc.

### Advanced
- 🔌 **[Custom Storage](https://dave-b-b.github.io/react-achievements/docs/advanced/custom-storage)** - Implement your own storage backend
- 🏗️ **[Complex API](https://dave-b-b.github.io/react-achievements/docs/advanced/complex-api)** - For power users needing full control

---

## Version & Updates

**Current Version:** 3.7.0

### Recent Highlights

**v3.6.0** - Built-in UI System
- Zero external dependencies with built-in notifications, modals, confetti
- 3 professional themes (modern, minimal, gamified)
- Component injection for custom UI
- Legacy external UI dependencies now optional

**v3.5.0** - Show All Achievements
- Display locked and unlocked achievements
- Unlock condition hints for user guidance
- Enhanced BadgesModal component

**v3.4.0** - Async Storage
- IndexedDB support (50MB+ capacity)
- REST API storage for cloud sync
- Offline Queue for offline-first apps
- Optimistic updates and eager loading

**v3.3.0** - Error Handling & Data Portability
- Type-safe error classes with recovery guidance
- Export/import for backups and cross-device transfer
- AWS S3 and Azure Blob Storage integration

➡️ **[Full Changelog](https://github.com/dave-b-b/react-achievements/releases)**

---

## Examples & Feature Explanation

### Feature Explanation
- 🎮 **[Interactive Storybook](https://dave-b-b.github.io/react-achievements/)** - Explore all components and features
- 🌐 **[Documentation Site](https://dave-b-b.github.io/react-achievements/docs/)** - Comprehensive guides and API docs

### Example Implementations
Explore complete working implementations in the `stories/examples/` directory:

- **[Redux Example](./stories/examples/redux/)** - Integration with Redux Toolkit
- **[Zustand Example](./stories/examples/zustand/)** - Integration with Zustand
- **[Context Example](./stories/examples/context/)** - Pure React Context implementation

Each example includes complete working code you can copy and adapt for your project.

---

## Contributing

We welcome contributions! React Achievements is built with:
- ✅ 154+ comprehensive tests with full coverage
- ✅ Pre-commit hooks (TypeScript + Jest)
- ✅ TypeScript-first development
- ✅ Storybook for component development

### Quick Contribution Steps

1. Fork the repository
2. Install dependencies: `npm install`
3. Install git hooks: `npm run install-hooks`
4. Make your changes
5. Ensure tests pass: `npm test`
6. Open a Pull Request

➡️ **[Contributing Guide](./CONTRIBUTING.md)** - Detailed contribution guidelines

### Development Commands

```bash
npm run build          # Build the library
npm test              # Run TypeScript checks + tests
npm run storybook     # Start Storybook on port 6006
npm run type-check    # TypeScript type checking
```

---

## License

React Achievements is **dual-licensed**:

### Free for Non-Commercial Use (MIT License)

✅ Personal projects
✅ Educational institutions
✅ Non-profit organizations (501(c)(3) or equivalent)
✅ Open source projects (OSI-approved license)
✅ Evaluation, development, and testing

### Commercial License Required

💼 Businesses using the library in revenue-generating products or services
💼 SaaS applications, commercial websites, paid mobile apps
💼 Enterprise software and internal business applications
💼 Freelancers or contractors building paid projects for clients

**[Get Your Commercial License via GitHub Sponsors →](https://github.com/sponsors/dave-b-b)**

#### Pricing Tiers:
- **Indie Developer** ($20/month) - Small businesses, freelancers, startups under $100K revenue
- **Professional** ($50/month) - Growing companies under $1M revenue, priority support
- **Enterprise** ($100/month) - Large companies, unlimited revenue

➡️ **[License Details](./LICENSE)** | **[Commercial License Terms](./COMMERCIAL-LICENSE.md)**

For custom licensing or questions: **reactachievements@gmail.com**

---

**Built with ❤️ by [Dave B](https://github.com/dave-b-b)**

**Questions?** [Open an issue](https://github.com/dave-b-b/react-achievements/issues) | [Join discussions](https://github.com/dave-b-b/react-achievements/discussions) | [⭐ Star on GitHub](https://github.com/dave-b-b/react-achievements)

**Commercial Users**: Support development via [GitHub Sponsors](https://github.com/sponsors/dave-b-b)
