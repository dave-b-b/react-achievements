# Class: OfflineQueueStorage

Defined in: [src/core/storage/OfflineQueueStorage.ts:11](https://github.com/dave-b-b/react-achievements/blob/2283189c3274a15397f543b098b98d32e4fb9597/src/core/storage/OfflineQueueStorage.ts#L11)

## Implements

- [`AsyncAchievementStorage`](../interfaces/AsyncAchievementStorage.md)

## Constructors

### Constructor

> **new OfflineQueueStorage**(`innerStorage`): `OfflineQueueStorage`

Defined in: [src/core/storage/OfflineQueueStorage.ts:18](https://github.com/dave-b-b/react-achievements/blob/2283189c3274a15397f543b098b98d32e4fb9597/src/core/storage/OfflineQueueStorage.ts#L18)

#### Parameters

##### innerStorage

[`AsyncAchievementStorage`](../interfaces/AsyncAchievementStorage.md)

#### Returns

`OfflineQueueStorage`

## Methods

### clear()

> **clear**(): `Promise`\<`void`\>

Defined in: [src/core/storage/OfflineQueueStorage.ts:181](https://github.com/dave-b-b/react-achievements/blob/2283189c3274a15397f543b098b98d32e4fb9597/src/core/storage/OfflineQueueStorage.ts#L181)

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`AsyncAchievementStorage`](../interfaces/AsyncAchievementStorage.md).[`clear`](../interfaces/AsyncAchievementStorage.md#clear)

***

### destroy()

> **destroy**(): `void`

Defined in: [src/core/storage/OfflineQueueStorage.ts:218](https://github.com/dave-b-b/react-achievements/blob/2283189c3274a15397f543b098b98d32e4fb9597/src/core/storage/OfflineQueueStorage.ts#L218)

Cleanup listeners (call on unmount)

#### Returns

`void`

***

### getMetrics()

> **getMetrics**(): `Promise`\<[`AchievementMetrics`](../interfaces/AchievementMetrics.md)\>

Defined in: [src/core/storage/OfflineQueueStorage.ts:127](https://github.com/dave-b-b/react-achievements/blob/2283189c3274a15397f543b098b98d32e4fb9597/src/core/storage/OfflineQueueStorage.ts#L127)

#### Returns

`Promise`\<[`AchievementMetrics`](../interfaces/AchievementMetrics.md)\>

#### Implementation of

[`AsyncAchievementStorage`](../interfaces/AsyncAchievementStorage.md).[`getMetrics`](../interfaces/AsyncAchievementStorage.md#getmetrics)

***

### getQueueStatus()

> **getQueueStatus**(): `object`

Defined in: [src/core/storage/OfflineQueueStorage.ts:208](https://github.com/dave-b-b/react-achievements/blob/2283189c3274a15397f543b098b98d32e4fb9597/src/core/storage/OfflineQueueStorage.ts#L208)

Get current queue status (useful for debugging)

#### Returns

`object`

##### operations

> **operations**: `QueuedOperation`[]

##### pending

> **pending**: `number`

***

### getUnlockedAchievements()

> **getUnlockedAchievements**(): `Promise`\<`string`[]\>

Defined in: [src/core/storage/OfflineQueueStorage.ts:154](https://github.com/dave-b-b/react-achievements/blob/2283189c3274a15397f543b098b98d32e4fb9597/src/core/storage/OfflineQueueStorage.ts#L154)

#### Returns

`Promise`\<`string`[]\>

#### Implementation of

[`AsyncAchievementStorage`](../interfaces/AsyncAchievementStorage.md).[`getUnlockedAchievements`](../interfaces/AsyncAchievementStorage.md#getunlockedachievements)

***

### setMetrics()

> **setMetrics**(`metrics`): `Promise`\<`void`\>

Defined in: [src/core/storage/OfflineQueueStorage.ts:139](https://github.com/dave-b-b/react-achievements/blob/2283189c3274a15397f543b098b98d32e4fb9597/src/core/storage/OfflineQueueStorage.ts#L139)

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

Defined in: [src/core/storage/OfflineQueueStorage.ts:166](https://github.com/dave-b-b/react-achievements/blob/2283189c3274a15397f543b098b98d32e4fb9597/src/core/storage/OfflineQueueStorage.ts#L166)

#### Parameters

##### achievements

`string`[]

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`AsyncAchievementStorage`](../interfaces/AsyncAchievementStorage.md).[`setUnlockedAchievements`](../interfaces/AsyncAchievementStorage.md#setunlockedachievements)

***

### sync()

> **sync**(): `Promise`\<`void`\>

Defined in: [src/core/storage/OfflineQueueStorage.ts:201](https://github.com/dave-b-b/react-achievements/blob/2283189c3274a15397f543b098b98d32e4fb9597/src/core/storage/OfflineQueueStorage.ts#L201)

Manually trigger queue processing (useful for testing)

#### Returns

`Promise`\<`void`\>
