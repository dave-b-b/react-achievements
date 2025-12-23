# Function: exportAchievementData()

> **exportAchievementData**(`metrics`, `unlocked`, `configHash?`): `string`

Defined in: [src/core/utils/dataExport.ts:28](https://github.com/dave-b-b/react-achievements/blob/3d10e1b67b77878cf7df50ca317f6dc2c677383e/src/core/utils/dataExport.ts#L28)

Exports achievement data to a JSON string

## Parameters

### metrics

[`AchievementMetrics`](../interfaces/AchievementMetrics.md)

Current achievement metrics

### unlocked

`string`[]

Array of unlocked achievement IDs

### configHash?

`string`

Optional hash of achievement configuration for validation

## Returns

`string`

JSON string containing all achievement data

## Example

```typescript
const json = exportAchievementData(_metrics, ['score_100', 'level_5']);
// Save json to file or send to server
```
