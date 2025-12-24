---
sidebar_position: 1
slug: /
---

# Introduction

Welcome to **React Achievements** - a flexible and powerful achievement system for React applications!

## What is React Achievements?

React Achievements is a comprehensive library that makes it easy to add gamification features to your React applications. Track user progress, unlock achievements, and celebrate milestones with beautiful notifications and confetti animations.

### Key Features

- **🎯 Simple API** - Get started in minutes with minimal configuration
- **🎨 Built-in UI** - Beautiful, customizable notification and modal components
- **💾 Flexible Storage** - Choose from 5 storage options (LocalStorage, Memory, IndexedDB, REST API, Offline Queue)
- **🔧 TypeScript** - Full TypeScript support with comprehensive type definitions
- **🎭 Theming** - 3 built-in themes (modern, minimal, gamified) + custom theme support
- **📦 Tiny Bundle** - Zero external UI dependencies when using built-in components
- **⚡ Performance** - Optimistic updates and eager loading for async storage
- **🔄 Data Portability** - Export/import achievement data for backups or migrations

## Quick Example

Here's a complete working example to get you started:

```tsx
import { AchievementProvider, useSimpleAchievements, BadgesButton, BadgesModal } from 'react-achievements';
import { useState } from 'react';

const achievements = {
  score: {
    100: { title: 'Century!', description: 'Score 100 points', icon: '🏆' },
    500: { title: 'High Scorer!', description: 'Score 500 points', icon: '⭐' },
  },
  completedTutorial: {
    true: { title: 'Tutorial Master', description: 'Complete the tutorial', icon: '📚' }
  }
};

function App() {
  const [modalOpen, setModalOpen] = useState(false);
  const { track, unlocked, getAllAchievements } = useSimpleAchievements();

  return (
    <AchievementProvider achievements={achievements} useBuiltInUI={true}>
      <button onClick={() => track('score', 100)}>Score 100</button>
      <button onClick={() => track('completedTutorial', true)}>Complete Tutorial</button>

      <BadgesButton
        onClick={() => setModalOpen(true)}
        unlockedAchievements={unlocked}
      />

      <BadgesModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        showAllAchievements={true}
        allAchievements={getAllAchievements()}
      />
    </AchievementProvider>
  );
}
```

## What's Next?

Ready to add achievements to your app? Here's where to go:

- **[Installation](/docs/getting-started/installation)** - Install and configure React Achievements
- **[Quick Start](/docs/getting-started/quick-start)** - Build your first achievement system
- **[Simple API Guide](/docs/guides/simple-api)** - Learn the recommended API
- **[API Reference](/docs/api-intro)** - Complete API documentation

## Version Information

This documentation is for **React Achievements v3.6+**. The library is actively maintained and fully production-ready with 100% test coverage.

### Recent Updates

- **v3.6.0** - Built-in UI components with theme system (no external dependencies required)
- **v3.5.0** - Show all achievements feature with locked/unlocked states
- **v3.4.0** - Async storage system (IndexedDB, REST API, Offline Queue)
- **v3.3.0** - Error handling system with data export/import

See the [Changelog](https://github.com/YOUR_GITHUB_USERNAME/react-achievements/blob/main/CHANGELOG.md) for complete version history.
