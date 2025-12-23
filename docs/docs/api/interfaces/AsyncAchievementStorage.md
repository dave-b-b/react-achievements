# Interface: AsyncAchievementStorage

Defined in: [src/core/types.ts:70](https://github.com/dave-b-b/react-achievements/blob/3d10e1b67b77878cf7df50ca317f6dc2c677383e/src/core/types.ts#L70)

## Methods

### clear()

> **clear**(): `Promise`\<`void`\>

Defined in: [src/core/types.ts:75](https://github.com/dave-b-b/react-achievements/blob/3d10e1b67b77878cf7df50ca317f6dc2c677383e/src/core/types.ts#L75)

#### Returns

`Promise`\<`void`\>

***

### getMetrics()

> **getMetrics**(): `Promise`\<[`AchievementMetrics`](AchievementMetrics.md)\>

Defined in: [src/core/types.ts:71](https://github.com/dave-b-b/react-achievements/blob/3d10e1b67b77878cf7df50ca317f6dc2c677383e/src/core/types.ts#L71)

#### Returns

`Promise`\<[`AchievementMetrics`](AchievementMetrics.md)\>

***

### getUnlockedAchievements()

> **getUnlockedAchievements**(): `Promise`\<`string`[]\>

Defined in: [src/core/types.ts:73](https://github.com/dave-b-b/react-achievements/blob/3d10e1b67b77878cf7df50ca317f6dc2c677383e/src/core/types.ts#L73)

#### Returns

`Promise`\<`string`[]\>

***

### setMetrics()

> **setMetrics**(`metrics`): `Promise`\<`void`\>

Defined in: [src/core/types.ts:72](https://github.com/dave-b-b/react-achievements/blob/3d10e1b67b77878cf7df50ca317f6dc2c677383e/src/core/types.ts#L72)

#### Parameters

##### metrics

[`AchievementMetrics`](AchievementMetrics.md)

#### Returns

`Promise`\<`void`\>

***

### setUnlockedAchievements()

> **setUnlockedAchievements**(`achievements`): `Promise`\<`void`\>

Defined in: [src/core/types.ts:74](https://github.com/dave-b-b/react-achievements/blob/3d10e1b67b77878cf7df50ca317f6dc2c677383e/src/core/types.ts#L74)

#### Parameters

##### achievements

`string`[]

#### Returns

`Promise`\<`void`\>
