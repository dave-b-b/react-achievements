# Class: LocalStorage

Defined in: [src/core/storage/LocalStorage.ts:4](https://github.com/dave-b-b/react-achievements/blob/2283189c3274a15397f543b098b98d32e4fb9597/src/core/storage/LocalStorage.ts#L4)

## Implements

- [`AchievementStorage`](../interfaces/AchievementStorage.md)

## Constructors

### Constructor

> **new LocalStorage**(`storageKey`): `LocalStorage`

Defined in: [src/core/storage/LocalStorage.ts:7](https://github.com/dave-b-b/react-achievements/blob/2283189c3274a15397f543b098b98d32e4fb9597/src/core/storage/LocalStorage.ts#L7)

#### Parameters

##### storageKey

`string`

#### Returns

`LocalStorage`

## Methods

### clear()

> **clear**(): `void`

Defined in: [src/core/storage/LocalStorage.ts:111](https://github.com/dave-b-b/react-achievements/blob/2283189c3274a15397f543b098b98d32e4fb9597/src/core/storage/LocalStorage.ts#L111)

#### Returns

`void`

#### Implementation of

[`AchievementStorage`](../interfaces/AchievementStorage.md).[`clear`](../interfaces/AchievementStorage.md#clear)

***

### getMetrics()

> **getMetrics**(): [`AchievementMetrics`](../interfaces/AchievementMetrics.md)

Defined in: [src/core/storage/LocalStorage.ts:93](https://github.com/dave-b-b/react-achievements/blob/2283189c3274a15397f543b098b98d32e4fb9597/src/core/storage/LocalStorage.ts#L93)

#### Returns

[`AchievementMetrics`](../interfaces/AchievementMetrics.md)

#### Implementation of

[`AchievementStorage`](../interfaces/AchievementStorage.md).[`getMetrics`](../interfaces/AchievementStorage.md#getmetrics)

***

### getUnlockedAchievements()

> **getUnlockedAchievements**(): `string`[]

Defined in: [src/core/storage/LocalStorage.ts:102](https://github.com/dave-b-b/react-achievements/blob/2283189c3274a15397f543b098b98d32e4fb9597/src/core/storage/LocalStorage.ts#L102)

#### Returns

`string`[]

#### Implementation of

[`AchievementStorage`](../interfaces/AchievementStorage.md).[`getUnlockedAchievements`](../interfaces/AchievementStorage.md#getunlockedachievements)

***

### setMetrics()

> **setMetrics**(`metrics`): `void`

Defined in: [src/core/storage/LocalStorage.ts:97](https://github.com/dave-b-b/react-achievements/blob/2283189c3274a15397f543b098b98d32e4fb9597/src/core/storage/LocalStorage.ts#L97)

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

Defined in: [src/core/storage/LocalStorage.ts:106](https://github.com/dave-b-b/react-achievements/blob/2283189c3274a15397f543b098b98d32e4fb9597/src/core/storage/LocalStorage.ts#L106)

#### Parameters

##### achievements

`string`[]

#### Returns

`void`

#### Implementation of

[`AchievementStorage`](../interfaces/AchievementStorage.md).[`setUnlockedAchievements`](../interfaces/AchievementStorage.md#setunlockedachievements)
