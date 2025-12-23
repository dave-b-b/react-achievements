# Class: MemoryStorage

Defined in: [src/core/storage/MemoryStorage.ts:3](https://github.com/dave-b-b/react-achievements/blob/ed4961bef31834b3988ece0af794aa96a6c9fce3/src/core/storage/MemoryStorage.ts#L3)

## Implements

- [`AchievementStorage`](../interfaces/AchievementStorage.md)

## Constructors

### Constructor

> **new MemoryStorage**(): `MemoryStorage`

Defined in: [src/core/storage/MemoryStorage.ts:7](https://github.com/dave-b-b/react-achievements/blob/ed4961bef31834b3988ece0af794aa96a6c9fce3/src/core/storage/MemoryStorage.ts#L7)

#### Returns

`MemoryStorage`

## Methods

### clear()

> **clear**(): `void`

Defined in: [src/core/storage/MemoryStorage.ts:25](https://github.com/dave-b-b/react-achievements/blob/ed4961bef31834b3988ece0af794aa96a6c9fce3/src/core/storage/MemoryStorage.ts#L25)

#### Returns

`void`

#### Implementation of

[`AchievementStorage`](../interfaces/AchievementStorage.md).[`clear`](../interfaces/AchievementStorage.md#clear)

***

### getMetrics()

> **getMetrics**(): [`AchievementMetrics`](../interfaces/AchievementMetrics.md)

Defined in: [src/core/storage/MemoryStorage.ts:9](https://github.com/dave-b-b/react-achievements/blob/ed4961bef31834b3988ece0af794aa96a6c9fce3/src/core/storage/MemoryStorage.ts#L9)

#### Returns

[`AchievementMetrics`](../interfaces/AchievementMetrics.md)

#### Implementation of

[`AchievementStorage`](../interfaces/AchievementStorage.md).[`getMetrics`](../interfaces/AchievementStorage.md#getmetrics)

***

### getUnlockedAchievements()

> **getUnlockedAchievements**(): `string`[]

Defined in: [src/core/storage/MemoryStorage.ts:17](https://github.com/dave-b-b/react-achievements/blob/ed4961bef31834b3988ece0af794aa96a6c9fce3/src/core/storage/MemoryStorage.ts#L17)

#### Returns

`string`[]

#### Implementation of

[`AchievementStorage`](../interfaces/AchievementStorage.md).[`getUnlockedAchievements`](../interfaces/AchievementStorage.md#getunlockedachievements)

***

### setMetrics()

> **setMetrics**(`metrics`): `void`

Defined in: [src/core/storage/MemoryStorage.ts:13](https://github.com/dave-b-b/react-achievements/blob/ed4961bef31834b3988ece0af794aa96a6c9fce3/src/core/storage/MemoryStorage.ts#L13)

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

Defined in: [src/core/storage/MemoryStorage.ts:21](https://github.com/dave-b-b/react-achievements/blob/ed4961bef31834b3988ece0af794aa96a6c9fce3/src/core/storage/MemoryStorage.ts#L21)

#### Parameters

##### achievements

`string`[]

#### Returns

`void`

#### Implementation of

[`AchievementStorage`](../interfaces/AchievementStorage.md).[`setUnlockedAchievements`](../interfaces/AchievementStorage.md#setunlockedachievements)
