# Function: useSimpleAchievements()

> **useSimpleAchievements**(): `object`

Defined in: [src/hooks/useSimpleAchievements.ts:7](https://github.com/dave-b-b/react-achievements/blob/3d10e1b67b77878cf7df50ca317f6dc2c677383e/src/hooks/useSimpleAchievements.ts#L7)

A simplified hook for achievement tracking.
Provides an easier API for common use cases while maintaining access to advanced features.

## Returns

### all

> **all**: `Record`\<`string`, `any`\> = `achievements.all`

All available achievements

### exportData()

> **exportData**: () => `string`

Export achievement data to JSON string

#### Returns

`string`

JSON string containing all achievement data

### getAllAchievements()

> **getAllAchievements**: () => [`AchievementWithStatus`](../interfaces/AchievementWithStatus.md)[]

Get all achievements with their unlock status

#### Returns

[`AchievementWithStatus`](../interfaces/AchievementWithStatus.md)[]

Array of achievements with isUnlocked boolean property

### getState()

> **getState**: () => `object`

Get current state (advanced usage)

#### Returns

`object`

##### metrics

> **metrics**: [`AchievementMetrics`](../interfaces/AchievementMetrics.md)

##### unlocked

> **unlocked**: `string`[]

### importData()

> **importData**: (`jsonString`, `options?`) => [`ImportResult`](../interfaces/ImportResult.md)

Import achievement data from JSON string

#### Parameters

##### jsonString

`string`

JSON string containing exported achievement data

##### options?

[`ImportOptions`](../interfaces/ImportOptions.md)

Import options (merge strategy, validation)

#### Returns

[`ImportResult`](../interfaces/ImportResult.md)

Import result with success status and any errors

### increment()

> **increment**: (`metric`, `amount`) => `void`

Increment a numeric metric by a specified amount

#### Parameters

##### metric

`string`

The metric name (e.g., 'buttonClicks', 'score')

##### amount

`number` = `1`

The amount to increment by (defaults to 1)

#### Returns

`void`

### reset()

> **reset**: () => `void`

Reset all achievement progress

#### Returns

`void`

### track()

> **track**: (`metric`, `value`) => `void`

Track a metric value for achievements

#### Parameters

##### metric

`string`

The metric name (e.g., 'score', 'level')

##### value

`any`

The metric value

#### Returns

`void`

### trackMultiple()

> **trackMultiple**: (`metrics`) => `void`

Track multiple metrics at once

#### Parameters

##### metrics

`Record`\<`string`, `any`\>

Object with metric names as keys and values

#### Returns

`void`

### unlocked

> **unlocked**: `string`[] = `achievements.unlocked`

Array of unlocked achievement IDs

### unlockedCount

> **unlockedCount**: `number` = `achievements.unlocked.length`

Number of unlocked achievements
