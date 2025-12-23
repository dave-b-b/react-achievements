# Class: AsyncStorageAdapter

Defined in: [src/core/storage/AsyncStorageAdapter.ts:4](https://github.com/dave-b-b/react-achievements/blob/3d10e1b67b77878cf7df50ca317f6dc2c677383e/src/core/storage/AsyncStorageAdapter.ts#L4)

## Implements

- [`AchievementStorage`](../interfaces/AchievementStorage.md)

## Constructors

### Constructor

> **new AsyncStorageAdapter**(`asyncStorage`, `options?`): `AsyncStorageAdapter`

Defined in: [src/core/storage/AsyncStorageAdapter.ts:14](https://github.com/dave-b-b/react-achievements/blob/3d10e1b67b77878cf7df50ca317f6dc2c677383e/src/core/storage/AsyncStorageAdapter.ts#L14)

#### Parameters

##### asyncStorage

[`AsyncAchievementStorage`](../interfaces/AsyncAchievementStorage.md)

##### options?

###### onError?

(`error`) => `void`

#### Returns

`AsyncStorageAdapter`

## Methods

### clear()

> **clear**(): `void`

Defined in: [src/core/storage/AsyncStorageAdapter.ts:131](https://github.com/dave-b-b/react-achievements/blob/3d10e1b67b77878cf7df50ca317f6dc2c677383e/src/core/storage/AsyncStorageAdapter.ts#L131)

SYNC CLEAR: Clears cache immediately, clears storage in background

#### Returns

`void`

#### Implementation of

[`AchievementStorage`](../interfaces/AchievementStorage.md).[`clear`](../interfaces/AchievementStorage.md#clear)

***

### flush()

> **flush**(): `Promise`\<`void`\>

Defined in: [src/core/storage/AsyncStorageAdapter.ts:155](https://github.com/dave-b-b/react-achievements/blob/3d10e1b67b77878cf7df50ca317f6dc2c677383e/src/core/storage/AsyncStorageAdapter.ts#L155)

Wait for all pending writes to complete (useful for testing/cleanup)
NOT part of AchievementStorage interface - utility method

#### Returns

`Promise`\<`void`\>

***

### getMetrics()

> **getMetrics**(): [`AchievementMetrics`](../interfaces/AchievementMetrics.md)

Defined in: [src/core/storage/AsyncStorageAdapter.ts:72](https://github.com/dave-b-b/react-achievements/blob/3d10e1b67b77878cf7df50ca317f6dc2c677383e/src/core/storage/AsyncStorageAdapter.ts#L72)

SYNC READ: Returns cached metrics immediately
Cache is loaded eagerly during construction

#### Returns

[`AchievementMetrics`](../interfaces/AchievementMetrics.md)

#### Implementation of

[`AchievementStorage`](../interfaces/AchievementStorage.md).[`getMetrics`](../interfaces/AchievementStorage.md#getmetrics)

***

### getUnlockedAchievements()

> **getUnlockedAchievements**(): `string`[]

Defined in: [src/core/storage/AsyncStorageAdapter.ts:102](https://github.com/dave-b-b/react-achievements/blob/3d10e1b67b77878cf7df50ca317f6dc2c677383e/src/core/storage/AsyncStorageAdapter.ts#L102)

SYNC READ: Returns cached unlocked achievements immediately

#### Returns

`string`[]

#### Implementation of

[`AchievementStorage`](../interfaces/AchievementStorage.md).[`getUnlockedAchievements`](../interfaces/AchievementStorage.md#getunlockedachievements)

***

### setMetrics()

> **setMetrics**(`metrics`): `void`

Defined in: [src/core/storage/AsyncStorageAdapter.ts:80](https://github.com/dave-b-b/react-achievements/blob/3d10e1b67b77878cf7df50ca317f6dc2c677383e/src/core/storage/AsyncStorageAdapter.ts#L80)

SYNC WRITE: Updates cache immediately, writes to storage in background
Uses optimistic updates - assumes write will succeed

#### Parameters

##### metrics

[`AchievementMetrics`](../interfaces/AchievementMetrics.md)

#### Returns

`void`

#### Implementation of

[`AchievementStorage`](../interfaces/AchievementStorage.md).[`setMetrics`](../interfaces/AchievementStorage.md#setmetrics)

***

### setUnlockedAchievements()

> **setUnlockedAchievements**(`achievements`): `void`

Defined in: [src/core/storage/AsyncStorageAdapter.ts:109](https://github.com/dave-b-b/react-achievements/blob/3d10e1b67b77878cf7df50ca317f6dc2c677383e/src/core/storage/AsyncStorageAdapter.ts#L109)

SYNC WRITE: Updates cache immediately, writes to storage in background

#### Parameters

##### achievements

`string`[]

#### Returns

`void`

#### Implementation of

[`AchievementStorage`](../interfaces/AchievementStorage.md).[`setUnlockedAchievements`](../interfaces/AchievementStorage.md#setunlockedachievements)
