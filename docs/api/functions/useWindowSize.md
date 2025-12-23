# Function: useWindowSize()

> **useWindowSize**(): `object`

Defined in: [src/core/hooks/useWindowSize.ts:15](https://github.com/dave-b-b/react-achievements/blob/ed4961bef31834b3988ece0af794aa96a6c9fce3/src/core/hooks/useWindowSize.ts#L15)

Hook to track window dimensions
Replacement for react-use's useWindowSize

## Returns

`object`

Object with width and height properties

### height

> **height**: `number`

### width

> **width**: `number`

## Example

```tsx
const { width, height } = useWindowSize();
console.log(`Window size: ${width}x${height}`);
```
