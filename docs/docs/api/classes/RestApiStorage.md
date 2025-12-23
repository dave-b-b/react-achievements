# Class: RestApiStorage

Defined in: [src/core/storage/RestApiStorage.ts:11](https://github.com/dave-b-b/react-achievements/blob/3d10e1b67b77878cf7df50ca317f6dc2c677383e/src/core/storage/RestApiStorage.ts#L11)

## Implements

- [`AsyncAchievementStorage`](../interfaces/AsyncAchievementStorage.md)

## Constructors

### Constructor

> **new RestApiStorage**(`config`): `RestApiStorage`

Defined in: [src/core/storage/RestApiStorage.ts:14](https://github.com/dave-b-b/react-achievements/blob/3d10e1b67b77878cf7df50ca317f6dc2c677383e/src/core/storage/RestApiStorage.ts#L14)

#### Parameters

##### config

[`RestApiStorageConfig`](../interfaces/RestApiStorageConfig.md)

#### Returns

`RestApiStorage`

## Methods

### clear()

> **clear**(): `Promise`\<`void`\>

Defined in: [src/core/storage/RestApiStorage.ts:126](https://github.com/dave-b-b/react-achievements/blob/3d10e1b67b77878cf7df50ca317f6dc2c677383e/src/core/storage/RestApiStorage.ts#L126)

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`AsyncAchievementStorage`](../interfaces/AsyncAchievementStorage.md).[`clear`](../interfaces/AsyncAchievementStorage.md#clear)

***

### getMetrics()

> **getMetrics**(): `Promise`\<[`AchievementMetrics`](../interfaces/AchievementMetrics.md)\>

Defined in: [src/core/storage/RestApiStorage.ts:61](https://github.com/dave-b-b/react-achievements/blob/3d10e1b67b77878cf7df50ca317f6dc2c677383e/src/core/storage/RestApiStorage.ts#L61)

#### Returns

`Promise`\<[`AchievementMetrics`](../interfaces/AchievementMetrics.md)\>

#### Implementation of

[`AsyncAchievementStorage`](../interfaces/AsyncAchievementStorage.md).[`getMetrics`](../interfaces/AsyncAchievementStorage.md#getmetrics)

***

### getUnlockedAchievements()

> **getUnlockedAchievements**(): `Promise`\<`string`[]\>

Defined in: [src/core/storage/RestApiStorage.ts:97](https://github.com/dave-b-b/react-achievements/blob/3d10e1b67b77878cf7df50ca317f6dc2c677383e/src/core/storage/RestApiStorage.ts#L97)

#### Returns

`Promise`\<`string`[]\>

#### Implementation of

[`AsyncAchievementStorage`](../interfaces/AsyncAchievementStorage.md).[`getUnlockedAchievements`](../interfaces/AsyncAchievementStorage.md#getunlockedachievements)

***

### setMetrics()

> **setMetrics**(`metrics`): `Promise`\<`void`\>

Defined in: [src/core/storage/RestApiStorage.ts:82](https://github.com/dave-b-b/react-achievements/blob/3d10e1b67b77878cf7df50ca317f6dc2c677383e/src/core/storage/RestApiStorage.ts#L82)

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

Defined in: [src/core/storage/RestApiStorage.ts:111](https://github.com/dave-b-b/react-achievements/blob/3d10e1b67b77878cf7df50ca317f6dc2c677383e/src/core/storage/RestApiStorage.ts#L111)

#### Parameters

##### achievements

`string`[]

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`AsyncAchievementStorage`](../interfaces/AsyncAchievementStorage.md).[`setUnlockedAchievements`](../interfaces/AsyncAchievementStorage.md#setunlockedachievements)
