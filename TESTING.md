# Testing Documentation

## Known React act() Warnings

This project uses React Testing Library for testing. Some tests may show `act()` warnings in the console output. These are **known and expected warnings** that don't indicate test failures or bugs.

### Why These Warnings Occur

These warnings occur from component-internal async operations that happen in `useEffect` hooks:

1. **AchievementProvider**: When `useBuiltInUI` is false, the component calls `detectLegacyLibraries()` which is an async function. The promise resolution triggers state updates outside of React's synchronous rendering cycle.

2. **BuiltInConfetti**: The component uses `useEffect` with timers to control animation visibility. The `setTimeout` callbacks trigger state updates asynchronously.

3. **BuiltInNotification**: Similar to BuiltInConfetti, this component uses `setTimeout` in `useEffect` for animation timing, which triggers state updates asynchronously.

### Why They're Safe to Ignore

- All tests pass correctly ✅
- These are component-internal implementation details, not test bugs
- React Testing Library's `render()` automatically wraps most operations in `act()`, but component-internal async operations (promises, timers) can still trigger warnings
- The warnings don't affect test correctness or reliability

### Suppression

These warnings are automatically suppressed in `src/setupTests.ts` to keep test output clean. The suppression only affects these specific known warnings - other errors and warnings will still be displayed.

### If You See New act() Warnings

If you see `act()` warnings from other components or test code (not the ones listed above), those should be investigated and fixed by:

1. Wrapping state updates in `act()` calls
2. Using `waitFor()` for async assertions
3. Ensuring all user interactions are wrapped in `act()`

See the [React Testing Library documentation on act()](https://reactjs.org/link/wrap-tests-with-act) for more information.
