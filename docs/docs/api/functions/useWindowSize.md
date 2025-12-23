# Function: useWindowSize()

> **useWindowSize**(): `object`

Defined in: [src/core/hooks/useWindowSize.ts:15](https://github.com/dave-b-b/react-achievements/blob/2283189c3274a15397f543b098b98d32e4fb9597/src/core/hooks/useWindowSize.ts#L15)

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
