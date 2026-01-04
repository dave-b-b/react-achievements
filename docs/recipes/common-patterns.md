---
sidebar_position: 1
---

# Common Patterns

Ready-to-use code examples for common achievement scenarios.

## Pattern 1: Display Only Unlocked Achievements

Show only achievements the user has earned:

```tsx
import { useAchievements, BadgesModal } from 'react-achievements';
import { useState } from 'react';

function AchievementHistory() {
  const [modalOpen, setModalOpen] = useState(false);
  const { achievements } = useAchievements();

  return (
    <>
      <button onClick={() => setModalOpen(true)}>
        View My Achievements ({achievements.unlocked.length})
      </button>

      <BadgesModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        achievements={achievements.unlocked.map(id => {
          const achievement = achievements.all[id];
          return {
            achievementId: id,
            achievementTitle: achievement.title,
            achievementDescription: achievement.description,
            achievementIconKey: achievement.icon,
          };
        })}
      />
    </>
  );
}
```

## Pattern 2: Display All Achievements (Locked + Unlocked)

Show progress toward locked achievements:

```tsx
import { useAchievements, BadgesModal } from 'react-achievements';
import { useState } from 'react';

function AchievementGallery() {
  const [modalOpen, setModalOpen] = useState(false);
  const { getAllAchievements } = useAchievements();

  return (
    <>
      <button onClick={() => setModalOpen(true)}>
        View All Achievements
      </button>

      <BadgesModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        showAllAchievements={true}
        allAchievements={getAllAchievements()}
        showUnlockConditions={true}
      />
    </>
  );
}
```

## Pattern 3: Export Achievement Data

Allow users to download their achievement progress:

```tsx
import { useAchievements } from 'react-achievements';

function ExportButton() {
  const { exportData } = useAchievements();

  const handleExport = () => {
    const jsonString = exportData();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `achievements-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button onClick={handleExport}>
      Download Achievement Data
    </button>
  );
}
```

## Pattern 4: Import Achievement Data

Restore achievements from a backup file:

```tsx
import { useAchievements } from 'react-achievements';

function ImportButton() {
  const { importData } = useAchievements();

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const result = importData(content, {
        strategy: 'merge', // or 'replace' or 'preserve'
        validate: true,
      });

      if (result.success) {
        alert(`Imported ${result.imported?.achievements} achievements!`);
      } else {
        alert(`Import failed: ${result.errors?.join(', ')}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <input
      type="file"
      accept=".json"
      onChange={handleImport}
    />
  );
}
```

## Pattern 5: Get Current Metrics

Display current progress toward achievements:

```tsx
import { useAchievements } from 'react-achievements';

function ProgressDashboard() {
  const { getState } = useAchievements();

  const handleShowProgress = () => {
    const state = getState();
    console.log('Current metrics:', state.metrics);
    console.log('Unlocked achievements:', state.unlocked);

    // Example: Show progress to next achievement
    const currentScore = state.metrics.score?.[0] ?? 0;
    console.log(`Current score: ${currentScore}`);
    console.log(`Next milestone: 1000 points`);
    console.log(`Progress: ${(currentScore / 1000) * 100}%`);
  };

  return (
    <button onClick={handleShowProgress}>
      Show Progress
    </button>
  );
}
```

## Pattern 6: Achievement Progress Bar

Show visual progress toward a specific achievement:

```tsx
import { useAchievements } from 'react-achievements';

function AchievementProgress({ threshold = 1000 }) {
  const { getState } = useAchievements();
  const state = getState();
  const currentScore = state.metrics.score?.[0] ?? 0;
  const progress = Math.min((currentScore / threshold) * 100, 100);

  return (
    <div>
      <p>Progress to 1000 points: {currentScore} / {threshold}</p>
      <div style={{
        width: '100%',
        height: '20px',
        backgroundColor: '#eee',
        borderRadius: '10px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${progress}%`,
          height: '100%',
          backgroundColor: '#4caf50',
          transition: 'width 0.3s ease'
        }} />
      </div>
    </div>
  );
}
```

## Pattern 7: Reset All Achievements (Development/Testing)

Clear all achievement data:

```tsx
import { useAchievements } from 'react-achievements';

function ResetButton() {
  const { reset } = useAchievements();

  const handleReset = () => {
    if (confirm('Reset all achievement data? This cannot be undone.')) {
      reset();
      alert('All achievements have been reset.');
    }
  };

  return (
    <button onClick={handleReset} style={{ color: 'red' }}>
      Reset All Achievements
    </button>
  );
}
```

## Pattern 8: Event-Based Tracking

Use semantic events instead of direct metric updates:

```tsx
import { useAchievementEngine } from 'react-achievements';

function GameComponent() {
  const engine = useAchievementEngine();

  const handlePlayerAction = (action: string, data: any) => {
    // Emit semantic events
    engine.emit(action, data);
  };

  return (
    <div>
      <button onClick={() => handlePlayerAction('userScored', { points: 100 })}>
        Score Points
      </button>
      <button onClick={() => handlePlayerAction('userLeveledUp', { level: 5 })}>
        Level Up
      </button>
      <button onClick={() => handlePlayerAction('bossDefeated', { bossName: 'Dragon' })}>
        Defeat Boss
      </button>
    </div>
  );
}
```

**When to use:** Multi-framework projects, larger applications, semantic event names

## Pattern 9: Listening to Achievement Events

React to achievement unlocks with custom logic:

```tsx
import { useAchievementEngine } from 'react-achievements';
import { useEffect } from 'react';

function NotificationHandler() {
  const engine = useAchievementEngine();

  useEffect(() => {
    // Subscribe to achievement unlocks
    const unsubscribe = engine.on('achievement:unlocked', (event) => {
      console.log(`Unlocked: ${event.achievementTitle}`);
      console.log(event.achievementDescription);

      // Custom notification logic
      // Send to analytics, trigger custom animations, etc.
    });

    // Cleanup on unmount
    return () => unsubscribe();
  }, [engine]);

  return null;
}
```

**When to use:** Custom notifications, analytics tracking, special celebrations

## More Examples

For more advanced patterns and use cases, see:

- **[API Reference](/docs/api-intro)** - Complete API documentation
- **[Advanced Guide](/docs/advanced/custom-storage)** - Custom implementations
- **[GitHub Examples](https://github.com/YOUR_GITHUB_USERNAME/react-achievements/tree/main/stories/examples)** - Full working demos
