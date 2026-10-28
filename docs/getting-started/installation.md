---
sidebar_position: 1
---

# Installation

Install React Achievements with your package manager:

```bash npm2yarn
npm install react-achievements@^6 achievements-engine@^2.1
```

## Requirements

- React 16.8 or higher
- Node.js 16 or higher

## Peer Dependencies

React Achievements 6 requires React 16.8+ and `achievements-engine` 2.1.x. Install both packages together. No additional UI peer dependency is needed because built-in UI is the default.

Built-in confetti is powered by `canvas-confetti`, which is installed as a package dependency of `react-achievements`; you do not need to install `react-confetti` or `react-canvas-confetti`.

## Verify Installation

```tsx title="App.tsx"
import { AchievementProvider, AchievementsWidget } from 'react-achievements';

const achievements = {};

export default function App() {
  return (
    <AchievementProvider achievements={achievements}>
      <div>React Achievements installed successfully.</div>
      <AchievementsWidget />
    </AchievementProvider>
  );
}
```

## Headless Entry Point

For custom UI, non-DOM environments, or React Native preparation:

```tsx title="CustomAchievementsPanel.tsx"
import {
  AchievementProvider,
  useAchievementState,
  useSimpleAchievements,
} from 'react-achievements/headless';

const achievements = {
  score: {
    100: { title: 'Century!', description: 'Score 100 points' },
  },
};

function CustomAchievementsPanel() {
  const { track } = useSimpleAchievements();
  const { allAchievements, unlockedCount, totalCount } = useAchievementState();

  return (
    <section>
      <button onClick={() => track('score', 100)}>Score 100</button>
      <p>{unlockedCount} / {totalCount} unlocked</p>

      {allAchievements.map((achievement) => (
        <div key={achievement.achievementId}>
          {achievement.isUnlocked ? 'Unlocked' : 'Locked'}: {achievement.achievementTitle}
        </div>
      ))}
    </section>
  );
}

export function App() {
  return (
    <AchievementProvider achievements={achievements}>
      <CustomAchievementsPanel />
    </AchievementProvider>
  );
}
```

React Native UI components are not included in the web package. Use the headless APIs or `achievements-engine` with native components.

## Next Steps

- [Quick Start](/docs/getting-started/quick-start)
- [Full Feature Setup](/docs/getting-started/v4-feature-setup)
- [Event-Based Tracking](/docs/guides/event-based-tracking)
- [Styling](/docs/guides/styling)
