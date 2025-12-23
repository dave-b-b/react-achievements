# Class: AchievementBuilder

Defined in: [src/utils/achievementHelpers.ts:183](https://github.com/dave-b-b/react-achievements/blob/ed4961bef31834b3988ece0af794aa96a6c9fce3/src/utils/achievementHelpers.ts#L183)

Main AchievementBuilder with three-tier API
Tier 1: Simple static methods with smart defaults
Tier 2: Chainable customization 
Tier 3: Full builder for complex logic

## Constructors

### Constructor

> **new AchievementBuilder**(): `AchievementBuilder`

#### Returns

`AchievementBuilder`

## Methods

### combine()

> `static` **combine**(`achievements`): [`SimpleAchievementConfig`](../interfaces/SimpleAchievementConfig.md)

Defined in: [src/utils/achievementHelpers.ts:321](https://github.com/dave-b-b/react-achievements/blob/ed4961bef31834b3988ece0af794aa96a6c9fce3/src/utils/achievementHelpers.ts#L321)

Combine multiple achievement configurations

#### Parameters

##### achievements

([`SimpleAchievementConfig`](../interfaces/SimpleAchievementConfig.md) \| `Achievement`)[]

Array of SimpleAchievementConfig objects or Achievement instances

#### Returns

[`SimpleAchievementConfig`](../interfaces/SimpleAchievementConfig.md)

Combined SimpleAchievementConfig

***

### create()

> `static` **create**(): `ComplexAchievementBuilder`

Defined in: [src/utils/achievementHelpers.ts:310](https://github.com/dave-b-b/react-achievements/blob/ed4961bef31834b3988ece0af794aa96a6c9fce3/src/utils/achievementHelpers.ts#L310)

Create a complex achievement builder for power users

#### Returns

`ComplexAchievementBuilder`

ComplexAchievementBuilder for full control

***

### createBooleanAchievement()

> `static` **createBooleanAchievement**(`metric`): `BooleanAchievement`

Defined in: [src/utils/achievementHelpers.ts:278](https://github.com/dave-b-b/react-achievements/blob/ed4961bef31834b3988ece0af794aa96a6c9fce3/src/utils/achievementHelpers.ts#L278)

Create a boolean achievement with smart defaults

#### Parameters

##### metric

`string`

The metric name (e.g., 'completedTutorial')

#### Returns

`BooleanAchievement`

Chainable BooleanAchievement

***

### createLevelAchievement()

> `static` **createLevelAchievement**(`level`): `ThresholdAchievement`

Defined in: [src/utils/achievementHelpers.ts:235](https://github.com/dave-b-b/react-achievements/blob/ed4961bef31834b3988ece0af794aa96a6c9fce3/src/utils/achievementHelpers.ts#L235)

Create a single level achievement with smart defaults

#### Parameters

##### level

`number`

Level threshold to achieve

#### Returns

`ThresholdAchievement`

Chainable ThresholdAchievement

***

### createLevelAchievements()

> `static` **createLevelAchievements**(`levels`): [`SimpleAchievementConfig`](../interfaces/SimpleAchievementConfig.md)

Defined in: [src/utils/achievementHelpers.ts:248](https://github.com/dave-b-b/react-achievements/blob/ed4961bef31834b3988ece0af794aa96a6c9fce3/src/utils/achievementHelpers.ts#L248)

Create multiple level achievements

#### Parameters

##### levels

(`number` \| \[`number`, [`AwardDetails`](../interfaces/AwardDetails.md)\])[]

Array of levels or [level, award] tuples

#### Returns

[`SimpleAchievementConfig`](../interfaces/SimpleAchievementConfig.md)

Complete SimpleAchievementConfig

***

### createScoreAchievement()

> `static` **createScoreAchievement**(`threshold`): `ThresholdAchievement`

Defined in: [src/utils/achievementHelpers.ts:192](https://github.com/dave-b-b/react-achievements/blob/ed4961bef31834b3988ece0af794aa96a6c9fce3/src/utils/achievementHelpers.ts#L192)

Create a single score achievement with smart defaults

#### Parameters

##### threshold

`number`

Score threshold to achieve

#### Returns

`ThresholdAchievement`

Chainable ThresholdAchievement

***

### createScoreAchievements()

> `static` **createScoreAchievements**(`thresholds`): [`SimpleAchievementConfig`](../interfaces/SimpleAchievementConfig.md)

Defined in: [src/utils/achievementHelpers.ts:205](https://github.com/dave-b-b/react-achievements/blob/ed4961bef31834b3988ece0af794aa96a6c9fce3/src/utils/achievementHelpers.ts#L205)

Create multiple score achievements

#### Parameters

##### thresholds

(`number` \| \[`number`, [`AwardDetails`](../interfaces/AwardDetails.md)\])[]

Array of thresholds or [threshold, award] tuples

#### Returns

[`SimpleAchievementConfig`](../interfaces/SimpleAchievementConfig.md)

Complete SimpleAchievementConfig

***

### createValueAchievement()

> `static` **createValueAchievement**(`metric`, `value`): `ValueAchievement`

Defined in: [src/utils/achievementHelpers.ts:295](https://github.com/dave-b-b/react-achievements/blob/ed4961bef31834b3988ece0af794aa96a6c9fce3/src/utils/achievementHelpers.ts#L295)

Create a value-based achievement with smart defaults

#### Parameters

##### metric

`string`

The metric name (e.g., 'characterClass')

##### value

`string`

The value to match (e.g., 'wizard')

#### Returns

`ValueAchievement`

Chainable ValueAchievement
