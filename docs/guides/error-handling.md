---
sidebar_position: 5
---

# Error Handling

React Achievements routes achievement and storage errors through `AchievementProvider.onError` and engine `error` events.

## Error Callback

Handle achievement errors once at the provider boundary:

```tsx
import {
  AchievementProvider,
  isAchievementError,
  isRecoverableError,
} from 'react-achievements';

<AchievementProvider
  achievements={achievements}
  onError={(error) => {
    if (isAchievementError(error)) {
      console.error(error.code, error.message);
      console.info(error.remedy);
    }

    if (!isRecoverableError(error)) {
      reportToMonitoring(error);
    }
  }}
>
  <YourApp />
</AchievementProvider>
```

## Error Classes

All built-in achievement errors extend `AchievementError`.

```tsx
import {
  AchievementError,
  ConfigurationError,
  ImportValidationError,
  StorageError,
  StorageQuotaError,
  SyncError,
} from 'react-achievements';
```

### AchievementError

Base class for achievement-specific failures.

```ts
error.code;        // string machine-readable code
error.recoverable; // boolean
error.remedy;      // optional recovery guidance
```

### StorageQuotaError

Raised when browser storage does not have enough space.

```tsx
onError={(error) => {
  if (error instanceof StorageQuotaError) {
    console.warn(`Need ${error.bytesNeeded} more bytes`);
  }
}}
```

### StorageError

Raised when a storage adapter fails outside quota handling.

```tsx
onError={(error) => {
  if (error instanceof StorageError) {
    console.error(error.originalError || error);
  }
}}
```

### ConfigurationError

Raised when achievement configuration cannot be normalized or evaluated.

```tsx
onError={(error) => {
  if (error instanceof ConfigurationError) {
    console.error('Invalid achievement configuration:', error.message);
  }
}}
```

### ImportValidationError

Raised when imported achievement data fails validation.

```tsx
onError={(error) => {
  if (error instanceof ImportValidationError) {
    console.error(error.validationErrors);
  }
}}
```

### SyncError

Raised by network-backed storage when sync fails.

```tsx
onError={(error) => {
  if (error instanceof SyncError) {
    console.error(error.statusCode, error.timeout);
  }
}}
```

## Storage Recovery

For most apps, choose a durable storage option up front and keep a memory fallback for unrecoverable browser storage failures:

```tsx
import { useState } from 'react';
import {
  AchievementProvider,
  StorageError,
  StorageQuotaError,
  StorageType,
} from 'react-achievements';

function AppWithFallback() {
  const [storage, setStorage] = useState(StorageType.Local);

  return (
    <AchievementProvider
      achievements={achievements}
      storage={storage}
      onError={(error) => {
        if (error instanceof StorageQuotaError || error instanceof StorageError) {
          setStorage(StorageType.Memory);
        }
      }}
    >
      <YourApp />
    </AchievementProvider>
  );
}
```

Use `StorageType.IndexedDB` for larger browser datasets:

```tsx
<AchievementProvider achievements={achievements} storage={StorageType.IndexedDB}>
  <YourApp />
</AchievementProvider>
```

Use REST API storage when achievement state belongs on your backend:

```tsx
<AchievementProvider
  achievements={achievements}
  storage={StorageType.RestAPI}
  restApiConfig={{
    baseUrl: '/api/achievements',
    userId,
    headers: { Authorization: `Bearer ${token}` },
  }}
>
  <YourApp />
</AchievementProvider>
```

For offline retry behavior, wrap an async storage implementation with `OfflineQueueStorage` and pass the wrapper as `storage`.

## Engine Error Events

When using an injected `AchievementEngine`, you can also subscribe to engine errors:

```tsx
import { useEffect } from 'react';
import { useAchievementEngine } from 'react-achievements';

function AchievementErrorReporter() {
  const engine = useAchievementEngine();

  useEffect(() => {
    return engine.on('error', (event) => {
      console.error(event.error, event.context);
    });
  }, [engine]);

  return null;
}
```

## Common Checks

If an achievement is not unlocking, inspect the current state through hooks instead of relying on provider debug props:

```tsx
const { metrics, allAchievements, unlockedIds } = useSimpleAchievements();

console.log(metrics);
console.log(allAchievements);
console.log(unlockedIds);
```

Check that:

- The component using hooks is inside `AchievementProvider`
- The metric name in `track`, `increment`, or event mapping matches the config
- Numeric, boolean, and string threshold values match the tracked value type
- Custom condition functions return `true` for the current metrics
- The storage adapter returns arrays for metrics and unlocked achievement IDs

## What's Next?

- [Data Portability](./data-portability) - Export/import for recovery workflows
- [Custom Storage](../advanced/custom-storage) - Build a storage adapter
- [Theming](./theming) - Customize notifications and modals
