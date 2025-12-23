# Interface: AchievementProviderProps

Defined in: [src/core/types.ts:111](https://github.com/dave-b-b/react-achievements/blob/2283189c3274a15397f543b098b98d32e4fb9597/src/core/types.ts#L111)

## Properties

### badgesButtonPosition?

> `optional` **badgesButtonPosition**: `"top-left"` \| `"top-right"` \| `"bottom-left"` \| `"bottom-right"`

Defined in: [src/core/types.ts:116](https://github.com/dave-b-b/react-achievements/blob/2283189c3274a15397f543b098b98d32e4fb9597/src/core/types.ts#L116)

***

### children

> **children**: `ReactNode`

Defined in: [src/core/types.ts:112](https://github.com/dave-b-b/react-achievements/blob/2283189c3274a15397f543b098b98d32e4fb9597/src/core/types.ts#L112)

***

### config

> **config**: [`AchievementConfiguration`](AchievementConfiguration.md)

Defined in: [src/core/types.ts:113](https://github.com/dave-b-b/react-achievements/blob/2283189c3274a15397f543b098b98d32e4fb9597/src/core/types.ts#L113)

***

### icons?

> `optional` **icons**: `Record`\<`string`, `string`\>

Defined in: [src/core/types.ts:118](https://github.com/dave-b-b/react-achievements/blob/2283189c3274a15397f543b098b98d32e4fb9597/src/core/types.ts#L118)

***

### initialState?

> `optional` **initialState**: [`InitialAchievementMetrics`](InitialAchievementMetrics.md) & `object`

Defined in: [src/core/types.ts:114](https://github.com/dave-b-b/react-achievements/blob/2283189c3274a15397f543b098b98d32e4fb9597/src/core/types.ts#L114)

#### Type Declaration

##### previouslyAwardedAchievements?

> `optional` **previouslyAwardedAchievements**: `string`[]

***

### onAchievementUnlocked()?

> `optional` **onAchievementUnlocked**: (`achievement`) => `void`

Defined in: [src/core/types.ts:120](https://github.com/dave-b-b/react-achievements/blob/2283189c3274a15397f543b098b98d32e4fb9597/src/core/types.ts#L120)

#### Parameters

##### achievement

[`AchievementDetails`](AchievementDetails.md)

#### Returns

`void`

***

### storage?

> `optional` **storage**: [`AchievementStorage`](AchievementStorage.md)

Defined in: [src/core/types.ts:119](https://github.com/dave-b-b/react-achievements/blob/2283189c3274a15397f543b098b98d32e4fb9597/src/core/types.ts#L119)

***

### storageKey?

> `optional` **storageKey**: `string`

Defined in: [src/core/types.ts:115](https://github.com/dave-b-b/react-achievements/blob/2283189c3274a15397f543b098b98d32e4fb9597/src/core/types.ts#L115)

***

### styles?

> `optional` **styles**: `Partial`\<[`StylesProps`](StylesProps.md)\>

Defined in: [src/core/types.ts:117](https://github.com/dave-b-b/react-achievements/blob/2283189c3274a15397f543b098b98d32e4fb9597/src/core/types.ts#L117)
