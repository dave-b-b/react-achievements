# React Achievements

**Add gamification to your React app in 5 minutes** - Unlock achievements, celebrate milestones, delight users.

[![Demo video](https://raw.githubusercontent.com/dave-b-b/react-achievements/main/assets/achievements.png)](https://github.com/user-attachments/assets/a33fdae5-439b-4fc9-a388-ccb2f432a3a8)

[📚 Documentation](https://dave-b-b.github.io/react-achievements/) | [🎮 Interactive Demo](https://dave-b-b.github.io/react-achievements/?path=/story/introduction--page) | [📦 npm Package](https://www.npmjs.com/package/react-achievements)

[![npm version](https://img.shields.io/npm/v/react-achievements.svg)](https://www.npmjs.com/package/react-achievements) [![License](https://img.shields.io/badge/license-Dual%20(MIT%20%2B%20Commercial)-blue.svg)](./LICENSE) [![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

## Installation

```bash
npm install react-achievements
```

**Requirements:** React 17.0+, Node.js 16+

---

## Start Here (60 Seconds)

```tsx
import { AchievementProvider, useSimpleAchievements, BadgesButtonWithModal } from 'react-achievements';

const achievements = {
  score: {
    100: { title: 'Century!', description: 'Score 100 points', icon: '🏆' },
  }
};

function AchievementsUI() {
  const { track, unlocked } = useSimpleAchievements();

  return (
    <div>
      <button onClick={() => track('score', 100)}>Score 100</button>
      <BadgesButtonWithModal unlockedAchievements={unlocked} />
    </div>
  );
}

export default function App() {
  return (
    <AchievementProvider achievements={achievements} useBuiltInUI={true}>
      <AchievementsUI />
    </AchievementProvider>
  );
}
```

---

## Usage

React Achievements supports two tracking patterns:

### Pattern 1: Event-Based Tracking

Track achievements using semantic events. Perfect for complex applications or multi-framework projects.

```tsx
// achievementEngine.ts
import { AchievementEngine } from 'react-achievements';

const achievements = {
  score: {
    100: { title: 'Century!', description: 'Score 100 points', icon: '🏆' },
  }
};

const eventMapping = {
  'userScored': (data) => ({ score: data.points }),
};

export const engine = new AchievementEngine({
  achievements,
  eventMapping,
  storage: 'local'
});
```

```tsx
// App.tsx
import { AchievementProvider } from 'react-achievements';
import { engine } from './achievementEngine';

function App() {
  return (
    <AchievementProvider engine={engine} useBuiltInUI={true}>
      <Game />
    </AchievementProvider>
  );
}
```

```tsx
// Game.tsx
import { useAchievementEngine } from 'react-achievements';

function Game() {
  const engine = useAchievementEngine();
  
  return (
    <button onClick={() => engine.emit('userScored', { points: 100 })}>
      Score Points
    </button>
  );
}
```

➡️ **[Event-Based Tracking Guide](https://dave-b-b.github.io/react-achievements/docs/guides/event-based-tracking)**

---

### Pattern 2: Direct Track Updates

Update metrics directly in your React components. Perfect for simple applications or quick prototypes.

```tsx
// achievements.ts
const achievements = {
  score: {
    100: { title: 'Century!', description: 'Score 100 points', icon: '🏆' },
  }
};
```

```tsx
// App.tsx
import { AchievementProvider } from 'react-achievements';

function App() {
  return (
    <AchievementProvider achievements={achievements} useBuiltInUI={true}>
      <Game />
    </AchievementProvider>
  );
}
```

```tsx
// Game.tsx
import { useSimpleAchievements, BadgesButtonWithModal } from 'react-achievements';

function Game() {
  const { track, unlocked } = useSimpleAchievements();

  return (
    <div>
      <button onClick={() => track('score', 100)}>Score Points</button>
      <BadgesButtonWithModal unlockedAchievements={unlocked} />
    </div>
  );
}
```

➡️ **[Direct Updates Guide](https://dave-b-b.github.io/react-achievements/docs/guides/direct-updates)**

---

## Documentation

📚 **[Full Documentation](https://dave-b-b.github.io/react-achievements/)** - Complete guides, API reference, and examples

---

## License

React Achievements is **dual-licensed**:

- **Free for Non-Commercial Use** (MIT License) - Personal projects, education, non-profits, open source
- **Commercial License Required** - Businesses, SaaS, commercial apps, enterprise

**[Get Commercial License →](https://github.com/sponsors/dave-b-b)** | **[License Details](./LICENSE)** | **[Commercial Terms](./COMMERCIAL-LICENSE.md)**

---

**Built with ❤️ by [Dave B](https://github.com/dave-b-b)** | [📚 Documentation](https://dave-b-b.github.io/react-achievements/) | [⭐ Star on GitHub](https://github.com/dave-b-b/react-achievements)

## AI Agents

If you're using AI coding agents, see `AGENTS.md` for a concise integration prompt, pitfalls, and the recommended API.
