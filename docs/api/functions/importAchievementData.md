# Function: importAchievementData()

> **importAchievementData**(`jsonString`, `currentMetrics`, `currentUnlocked`, `options`): [`ImportResult`](../interfaces/ImportResult.md)

Defined in: [src/core/utils/dataImport.ts:54](https://github.com/dave-b-b/react-achievements/blob/ed4961bef31834b3988ece0af794aa96a6c9fce3/src/core/utils/dataImport.ts#L54)

Imports achievement data from a JSON string

## Parameters

### jsonString

`string`

JSON string containing exported achievement data

### currentMetrics

[`AchievementMetrics`](../interfaces/AchievementMetrics.md)

Current metrics state

### currentUnlocked

`string`[]

Current unlocked achievements

### options

[`ImportOptions`](../interfaces/ImportOptions.md) = `{}`

Import options

## Returns

[`ImportResult`](../interfaces/ImportResult.md)

Import result with success status and any errors

## Example

```typescript
const result = importAchievementData(
  jsonString,
  currentMetrics,
  currentUnlocked,
  { mergeStrategy: 'merge', validate: true }
);

if (result.success) {
  console.log(`Imported ${result.imported.achievements} achievements`);
} else {
  console.error('Import failed:', result.errors);
}
```
