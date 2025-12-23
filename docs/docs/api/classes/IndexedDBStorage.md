# Class: IndexedDBStorage

Defined in: [src/core/storage/IndexedDBStorage.ts:4](https://github.com/dave-b-b/react-achievements/blob/2283189c3274a15397f543b098b98d32e4fb9597/src/core/storage/IndexedDBStorage.ts#L4)

## Implements

- [`AsyncAchievementStorage`](../interfaces/AsyncAchievementStorage.md)

## Constructors

### Constructor

> **new IndexedDBStorage**(`dbName`): `IndexedDBStorage`

Defined in: [src/core/storage/IndexedDBStorage.ts:10](https://github.com/dave-b-b/react-achievements/blob/2283189c3274a15397f543b098b98d32e4fb9597/src/core/storage/IndexedDBStorage.ts#L10)

#### Parameters

##### dbName

`string` = `'react-achievements'`

#### Returns

`IndexedDBStorage`

## Methods

### clear()

> **clear**(): `Promise`\<`void`\>

Defined in: [src/core/storage/IndexedDBStorage.ts:126](https://github.com/dave-b-b/react-achievements/blob/2283189c3274a15397f543b098b98d32e4fb9597/src/core/storage/IndexedDBStorage.ts#L126)

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`AsyncAchievementStorage`](../interfaces/AsyncAchievementStorage.md).[`clear`](../interfaces/AsyncAchievementStorage.md#clear)

***

### getMetrics()

> **getMetrics**(): `Promise`\<[`AchievementMetrics`](../interfaces/AchievementMetrics.md)\>

Defined in: [src/core/storage/IndexedDBStorage.ts:108](https://github.com/dave-b-b/react-achievements/blob/2283189c3274a15397f543b098b98d32e4fb9597/src/core/storage/IndexedDBStorage.ts#L108)

#### Returns

`Promise`\<[`AchievementMetrics`](../interfaces/AchievementMetrics.md)\>

#### Implementation of

[`AsyncAchievementStorage`](../interfaces/AsyncAchievementStorage.md).[`getMetrics`](../interfaces/AsyncAchievementStorage.md#getmetrics)

***

### getUnlockedAchievements()

> **getUnlockedAchievements**(): `Promise`\<`string`[]\>

Defined in: [src/core/storage/IndexedDBStorage.ts:117](https://github.com/dave-b-b/react-achievements/blob/2283189c3274a15397f543b098b98d32e4fb9597/src/core/storage/IndexedDBStorage.ts#L117)

#### Returns

`Promise`\<`string`[]\>

#### Implementation of

[`AsyncAchievementStorage`](../interfaces/AsyncAchievementStorage.md).[`getUnlockedAchievements`](../interfaces/AsyncAchievementStorage.md#getunlockedachievements)

***

### setMetrics()

> **setMetrics**(`metrics`): `Promise`\<`void`\>

Defined in: [src/core/storage/IndexedDBStorage.ts:113](https://github.com/dave-b-b/react-achievements/blob/2283189c3274a15397f543b098b98d32e4fb9597/src/core/storage/IndexedDBStorage.ts#L113)

#### Parameters

##### metrics

[`AchievementMetrics`](../interfaces/AchievementMetrics.md)

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`AsyncAchievementStorage`](../interfaces/AsyncAchievementStorage.md).[`setMetrics`](../interfaces/AsyncAchievementStorage.md#setmetrics)

***

### setUnlockedAchievements()

> **setUnlockedAchievements**(`achievements`): `Promise`\<`void`\>

Defined in: [src/core/storage/IndexedDBStorage.ts:122](https://github.com/dave-b-b/react-achievements/blob/2283189c3274a15397f543b098b98d32e4fb9597/src/core/storage/IndexedDBStorage.ts#L122)

#### Parameters

##### achievements

`string`[]

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`AsyncAchievementStorage`](../interfaces/AsyncAchievementStorage.md).[`setUnlockedAchievements`](../interfaces/AsyncAchievementStorage.md#setunlockedachievements)
