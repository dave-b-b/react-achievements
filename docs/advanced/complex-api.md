---
sidebar_position: 2
---

# Complex API (POJO Configuration)

The Complex API provides low-level, verbose configuration for maximum control over achievement behavior.

## Overview

The Complex API (also called POJO API) is the original configuration format. It provides complete control but requires more code than the Simple API or Builder API.

**When to use:**
- You need maximum control over achievement logic
- You're migrating from an older version (< v3.0)
- You have very specific requirements not covered by Simple/Builder APIs

**When NOT to use:**
- You're starting a new project (use Simple API instead)
- You want quick setup (use Builder API instead)
- You value concise code (90% more verbose than Simple API)

---

## Basic Structure

```tsx
const achievements = {
  metricName: [{
    isConditionMet: (value) => /* condition */,
    achievementDetails: {
      achievementId: 'unique_id',
      achievementTitle: 'Title',
      achievementDescription: 'Description',
      achievementIconKey: 'icon'
    }
  }]
};
```

**Required fields:**
- `isConditionMet`: Function that returns `true` when achievement should unlock
- `achievementDetails.achievementId`: Unique identifier
- `achievementDetails.achievementTitle`: Display title

**Optional fields:**
- `achievementDetails.achievementDescription`: Longer description
- `achievementDetails.achievementIconKey`: Icon (emoji or key from defaultAchievementIcons)

---

## Simple Example

### Complex API (Verbose)

```tsx
const achievements = {
  score: [{
    isConditionMet: (value) => value >= 100,
    achievementDetails: {
      achievementId: 'score_100',
      achievementTitle: 'Century!',
      achievementDescription: 'Score 100 points',
      achievementIconKey: '🏆'
    }
  }]
};
```

### Simple API Equivalent (Concise)

```tsx
const achievements = {
  score: {
    100: { title: 'Century!', description: 'Score 100 points', icon: '🏆' }
  }
};
```

**Result:** 90% less code with Simple API!

---

## Multiple Achievements Per Metric

```tsx
const achievements = {
  score: [
    {
      isConditionMet: (value) => value >= 100,
      achievementDetails: {
        achievementId: 'score_100',
        achievementTitle: 'Century!',
        achievementDescription: 'Score 100 points',
        achievementIconKey: '🏆'
      }
    },
    {
      isConditionMet: (value) => value >= 500,
      achievementDetails: {
        achievementId: 'score_500',
        achievementTitle: 'High Scorer!',
        achievementDescription: 'Score 500 points',
        achievementIconKey: '⭐'
      }
    },
    {
      isConditionMet: (value) => value >= 1000,
      achievementDetails: {
        achievementId: 'score_1000',
        achievementTitle: 'Score Master!',
        achievementDescription: 'Score 1000 points',
        achievementIconKey: '👑'
      }
    }
  ]
};
```

---

## Complex Conditions

### Custom Logic

```tsx
const achievements = {
  score: [{
    isConditionMet: (value) => {
      // Complex logic
      return value >= 1000 && value % 100 === 0;
    },
    achievementDetails: {
      achievementId: 'perfect_thousand',
      achievementTitle: 'Perfect Thousand',
      achievementDescription: 'Score exactly 1000 points',
      achievementIconKey: '💯'
    }
  }]
};
```

### Type Checking

```tsx
const achievements = {
  completedTutorial: [{
    isConditionMet: (value) => {
      // Ensure value is boolean and true
      return typeof value === 'boolean' && value === true;
    },
    achievementDetails: {
      achievementId: 'tutorial_complete',
      achievementTitle: 'Tutorial Master',
      achievementDescription: 'Complete the tutorial',
      achievementIconKey: '📚'
    }
  }]
};
```

---

## Multiple Metrics

The Complex API doesn't directly support multi-metric conditions, but you can work around it:

### Workaround 1: Computed Metrics

```tsx
// In your component
const { update } = useAchievements();

function handleAction() {
  const score = 1000;
  const accuracy = 100;

  // Track individual metrics
  update({ score, accuracy });

  // Track computed metric for multi-condition achievement
  const perfectGame = score >= 1000 && accuracy === 100;
  update({ perfectGame });
}

// Configuration
const achievements = {
  perfectGame: [{
    isConditionMet: (value) => value === true,
    achievementDetails: {
      achievementId: 'perfect_game',
      achievementTitle: 'Perfect Game',
      achievementDescription: 'Score 1000+ with 100% accuracy',
      achievementIconKey: '💎'
    }
  }]
};
```

### Workaround 2: Use Builder API for Multi-Metric

```tsx
import { AchievementBuilder } from 'react-achievements';

const achievements = {
  // Complex API for simple achievements
  score: [{
    isConditionMet: (value) => value >= 100,
    achievementDetails: {
      achievementId: 'score_100',
      achievementTitle: 'Century!',
      achievementIconKey: '🏆'
    }
  }],

  // Builder API for multi-metric achievements
  ...AchievementBuilder.create()
    .withId('perfect_game')
    .withCondition((metrics) =>
      metrics.score >= 1000 && metrics.accuracy === 100
    )
    .withAward({
      title: 'Perfect Game',
      icon: '💎'
    })
    .build()
};
```

---

## Icon System

### Using Emojis

```tsx
achievementDetails: {
  achievementIconKey: '🏆'  // Direct emoji
}
```

### Using Default Icons

```tsx
import { defaultAchievementIcons } from 'react-achievements';

achievementDetails: {
  achievementIconKey: 'trophy'  // Key from defaultAchievementIcons
}

// Available keys:
// 'trophy', 'star', 'medal', 'crown', 'checkmark', 'fire', 'rocket', etc.
```

### Custom Icon Components

```tsx
achievementDetails: {
  achievementIconKey: 'custom_icon'
}

// Provide custom icons to AchievementProvider
<AchievementProvider
  achievements={achievements}
  customIcons={{
    custom_icon: <MyCustomIcon />
  }}
>
```

---

## Migration from Complex to Simple API

### Before (Complex API - 15 lines per achievement)

```tsx
const achievements = {
  score: [
    {
      isConditionMet: (value) => value >= 100,
      achievementDetails: {
        achievementId: 'score_100',
        achievementTitle: 'Century!',
        achievementDescription: 'Score 100 points',
        achievementIconKey: '🏆'
      }
    },
    {
      isConditionMet: (value) => value >= 500,
      achievementDetails: {
        achievementId: 'score_500',
        achievementTitle: 'High Scorer!',
        achievementDescription: 'Score 500 points',
        achievementIconKey: '⭐'
      }
    }
  ]
};
```

### After (Simple API - 1 line per achievement)

```tsx
const achievements = {
  score: {
    100: { title: 'Century!', description: 'Score 100 points', icon: '🏆' },
    500: { title: 'High Scorer!', description: 'Score 500 points', icon: '⭐' }
  }
};
```

### Migration Steps

1. **Identify patterns**: Look for threshold-based achievements
2. **Convert to Simple API**: Replace with threshold syntax
3. **Keep complex logic**: Use Builder API for multi-metric conditions
4. **Test thoroughly**: Ensure all achievements still unlock correctly

---

## Complete Example

```tsx
import { AchievementProvider, useAchievements } from 'react-achievements';

// Complex API configuration
const achievements = {
  // Score achievements
  score: [
    {
      isConditionMet: (value) => value >= 100,
      achievementDetails: {
        achievementId: 'score_100',
        achievementTitle: 'Century!',
        achievementDescription: 'Score 100 points',
        achievementIconKey: '🏆'
      }
    },
    {
      isConditionMet: (value) => value >= 500,
      achievementDetails: {
        achievementId: 'score_500',
        achievementTitle: 'High Scorer!',
        achievementDescription: 'Score 500 points',
        achievementIconKey: '⭐'
      }
    }
  ],

  // Level achievements
  level: [
    {
      isConditionMet: (value) => value >= 5,
      achievementDetails: {
        achievementId: 'level_5',
        achievementTitle: 'Leveling Up',
        achievementDescription: 'Reach level 5',
        achievementIconKey: '📈'
      }
    },
    {
      isConditionMet: (value) => value >= 10,
      achievementDetails: {
        achievementId: 'level_10',
        achievementTitle: 'Double Digits',
        achievementDescription: 'Reach level 10',
        achievementIconKey: '🔟'
      }
    }
  ],

  // Boolean achievement
  completedTutorial: [{
    isConditionMet: (value) => value === true,
    achievementDetails: {
      achievementId: 'tutorial_complete',
      achievementTitle: 'Tutorial Master',
      achievementDescription: 'Complete the tutorial',
      achievementIconKey: '📚'
    }
  }]
};

function App() {
  return (
    <AchievementProvider achievements={achievements}>
      <Game />
    </AchievementProvider>
  );
}

function Game() {
  const { update } = useAchievements();

  return (
    <div>
      <button onClick={() => update({ score: 100 })}>
        Score 100
      </button>
      <button onClick={() => update({ level: 5 })}>
        Reach Level 5
      </button>
      <button onClick={() => update({ completedTutorial: true })}>
        Complete Tutorial
      </button>
    </div>
  );
}
```

---

## Advantages and Disadvantages

### Advantages

✅ **Maximum control** - Full control over condition logic
✅ **Type safety** - Can add complex type checking in conditions
✅ **Explicit** - Every field is clearly defined
✅ **Backward compatible** - Works with all versions

### Disadvantages

❌ **Verbose** - 10-15 lines per achievement vs 1 line with Simple API
❌ **Repetitive** - Lots of boilerplate code
❌ **Error-prone** - Easy to make typos in long configurations
❌ **Hard to read** - Difficult to scan large configurations
❌ **No multi-metric support** - Can't easily check multiple metrics

---

## When to Use Complex API

### ✅ Use Complex API When:

- Migrating from v2.x and don't want to refactor
- You need very specific condition logic
- You're comfortable with verbose configuration
- You need explicit field naming for clarity

### ❌ Don't Use Complex API When:

- Starting a new project (use Simple API)
- You have simple threshold-based achievements (use Simple API)
- You want concise code (use Simple API)
- You need multi-metric conditions (use Builder API)

---

## Recommendation

**For new projects, we recommend:**

1. **Simple API** for 80% of achievements (threshold-based)
2. **Builder API** for 15% of achievements (custom conditions)
3. **Complex API** for 5% of achievements (very specific needs)

**Example:**

```tsx
import { AchievementBuilder } from 'react-achievements';

const achievements = AchievementBuilder.combine([
  // 80%: Simple API for threshold achievements
  {
    score: {
      100: { title: 'Century!', icon: '🏆' },
      500: { title: 'High Scorer!', icon: '⭐' }
    },
    level: {
      5: { title: 'Leveling Up', icon: '📈' },
      10: { title: 'Double Digits', icon: '🔟' }
    }
  },

  // 15%: Builder API for complex conditions
  AchievementBuilder.create()
    .withId('perfect_game')
    .withCondition((m) => m.score >= 1000 && m.accuracy === 100)
    .withAward({ title: 'Perfect Game', icon: '💎' })
    .build(),

  // 5%: Complex API only when absolutely necessary
  {
    customMetric: [{
      isConditionMet: (value) => {
        // Very specific logic that can't be expressed any other way
        return someComplexLogic(value);
      },
      achievementDetails: {
        achievementId: 'special_achievement',
        achievementTitle: 'Special Achievement',
        achievementIconKey: '🌟'
      }
    }]
  }
]);
```

---

## What's Next?

- **[Simple API Guide](../guides/simple-api)** - Learn the recommended lightweight API
- **[Builder API](../guides/builder-api)** - Three-tier builder system
- **[Migration Guide](../guides/migration)** - Migrate from Complex to Simple API
