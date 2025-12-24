---
sidebar_position: 5
---

# Error Handling

React Achievements provides comprehensive error handling with type-safe error classes and recovery strategies.

## Overview

The library handles errors gracefully with:

- **Type-safe error classes** for different failure modes
- **onError callback** for centralized error handling
- **Graceful degradation** - achievements continue working even if storage fails
- **Recovery guidance** in error messages

---

## Error Callback

Handle all achievement-related errors in one place:

```tsx
<AchievementProvider
  achievements={achievements}
  onError={(error) => {
    console.error('Achievement error:', error.message);
    // Send to error tracking service
    Sentry.captureException(error);
  }}
>
  <YourApp />
</AchievementProvider>
```

---

## Error Types

### AchievementStorageError

Thrown when storage operations fail (localStorage full, IndexedDB unavailable, etc.).

```tsx
try {
  await storage.save(data);
} catch (error) {
  if (error instanceof AchievementStorageError) {
    console.error('Storage failed:', error.message);
    console.log('Recovery:', error.recoveryHint);
  }
}
```

**Common Causes:**
- localStorage quota exceeded
- IndexedDB not available
- Network failure (REST API storage)
- Permission denied

**Recovery Hints:**
```
"Clear old data or switch to IndexedDB for more capacity"
"Check browser settings - IndexedDB may be disabled"
"Check network connection and retry"
```

### AchievementConfigurationError

Thrown when achievement configuration is invalid.

```tsx
// ❌ Invalid configuration
const achievements = {
  score: {
    100: { /* missing title */ }
  }
};

// Error: AchievementConfigurationError
// Message: "Achievement title is required"
```

**Common Causes:**
- Missing required fields (title, icon)
- Invalid threshold values
- Duplicate achievement IDs
- Invalid condition functions

### AchievementValidationError

Thrown when achievement metrics fail validation.

```tsx
track('score', 'invalid');  // Should be a number

// Error: AchievementValidationError
// Message: "Metric 'score' expected number, got string"
```

**Common Causes:**
- Wrong metric type (string instead of number)
- NaN or Infinity values
- Null/undefined values

---

## Error Handling Patterns

### Basic Error Handling

```tsx
import { useAchievements } from 'react-achievements';

function MyComponent() {
  const { update, error } = useAchievements();

  const handleAction = () => {
    try {
      update({ score: 100 });
    } catch (err) {
      console.error('Failed to update achievement:', err);
    }
  };

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return <button onClick={handleAction}>Score Points</button>;
}
```

### Advanced Error Handling

```tsx
import {
  AchievementStorageError,
  AchievementConfigurationError,
  AchievementValidationError
} from 'react-achievements';

function handleAchievementError(error: Error) {
  if (error instanceof AchievementStorageError) {
    // Storage failure - try fallback
    console.warn('Storage failed, using memory storage');
    // Switch to MemoryStorage
    return { action: 'switch_storage', storage: 'memory' };
  }

  if (error instanceof AchievementConfigurationError) {
    // Configuration error - fix and reload
    console.error('Invalid configuration:', error.message);
    return { action: 'fix_config' };
  }

  if (error instanceof AchievementValidationError) {
    // Validation error - sanitize input
    console.warn('Invalid metric value:', error.message);
    return { action: 'sanitize_input' };
  }

  // Unknown error
  console.error('Unknown achievement error:', error);
  return { action: 'report' };
}
```

### Retry Logic

```tsx
async function updateWithRetry(metrics, maxRetries = 3) {
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      await update(metrics);
      return { success: true };
    } catch (error) {
      attempt++;

      if (error instanceof AchievementStorageError && attempt < maxRetries) {
        // Wait and retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }

      // Max retries reached or non-retryable error
      return { success: false, error };
    }
  }
}
```

---

## Graceful Degradation

React Achievements is designed to degrade gracefully when errors occur:

### Storage Failure

When storage fails, achievements continue to work in memory:

```tsx
<AchievementProvider
  achievements={achievements}
  storage={StorageType.LocalStorage}
  onError={(error) => {
    if (error instanceof AchievementStorageError) {
      // Automatically falls back to memory storage
      console.warn('Switched to memory storage');
    }
  }}
>
  <YourApp />
</AchievementProvider>
```

### Configuration Errors

Invalid achievements are skipped, valid ones still work:

```tsx
const achievements = {
  score: {
    100: { title: 'Century', icon: '🏆' },  // ✅ Valid
    500: { /* missing title */ }             // ❌ Skipped
  }
};

// Only the valid achievement (100) will be tracked
```

### Network Failures (REST API)

Offline queue automatically stores updates locally:

```tsx
<AchievementProvider
  achievements={achievements}
  storage={StorageType.OfflineQueue}
  storageConfig={{
    apiEndpoint: '/api/achievements',
    onSyncError: (error) => {
      // Handle sync failures
      console.error('Sync failed:', error);
    }
  }}
>
  <YourApp />
</AchievementProvider>
```

---

## Type Guards

Use type guards to safely check error types:

```tsx
import {
  isAchievementStorageError,
  isAchievementConfigurationError,
  isAchievementValidationError
} from 'react-achievements';

function handleError(error: unknown) {
  if (isAchievementStorageError(error)) {
    console.log('Storage error:', error.recoveryHint);
  } else if (isAchievementConfigurationError(error)) {
    console.log('Config error:', error.message);
  } else if (isAchievementValidationError(error)) {
    console.log('Validation error:', error.message);
  }
}
```

---

## Error Properties

### AchievementStorageError

```tsx
{
  name: 'AchievementStorageError',
  message: 'Failed to save to localStorage',
  recoveryHint: 'Clear old data or switch to IndexedDB',
  originalError: DOMException,  // The underlying error
  storageType: 'localStorage'
}
```

### AchievementConfigurationError

```tsx
{
  name: 'AchievementConfigurationError',
  message: 'Achievement title is required',
  achievementId: 'score_100',
  field: 'title'
}
```

### AchievementValidationError

```tsx
{
  name: 'AchievementValidationError',
  message: "Metric 'score' expected number, got string",
  metricName: 'score',
  expectedType: 'number',
  receivedType: 'string',
  receivedValue: 'invalid'
}
```

---

## Best Practices

### 1. Always Provide onError Callback

```tsx
// ✅ Good: Centralized error handling
<AchievementProvider
  achievements={achievements}
  onError={(error) => {
    logToService(error);
    showUserNotification(error.message);
  }}
>

// ❌ Bad: No error handling
<AchievementProvider achievements={achievements}>
```

### 2. Log Errors to Monitoring Service

```tsx
<AchievementProvider
  achievements={achievements}
  onError={(error) => {
    // Send to Sentry, LogRocket, etc.
    Sentry.captureException(error, {
      tags: {
        component: 'achievements',
        storage: error.storageType
      },
      extra: {
        recoveryHint: error.recoveryHint
      }
    });
  }}
>
```

### 3. Show User-Friendly Messages

```tsx
function AchievementErrorBoundary({ error }) {
  if (error instanceof AchievementStorageError) {
    return (
      <div className="error">
        <p>Achievement progress couldn't be saved.</p>
        <p>{error.recoveryHint}</p>
        <button onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  return <div>An unexpected error occurred.</div>;
}
```

### 4. Implement Fallback Storage

```tsx
function AppWithFallback() {
  const [storage, setStorage] = useState(StorageType.LocalStorage);

  return (
    <AchievementProvider
      achievements={achievements}
      storage={storage}
      onError={(error) => {
        if (error instanceof AchievementStorageError) {
          // Fallback to memory storage
          setStorage(StorageType.Memory);
        }
      }}
    >
      <YourApp />
    </AchievementProvider>
  );
}
```

---

## Debugging

### Enable Detailed Logging

```tsx
<AchievementProvider
  achievements={achievements}
  debug={true}  // Logs all operations to console
  onError={(error) => {
    console.error('Achievement error:', error);
    console.trace();  // Stack trace
  }}
>
  <YourApp />
</AchievementProvider>
```

### Common Issues and Solutions

#### "LocalStorage quota exceeded"

**Solution:**
```tsx
// Switch to IndexedDB (50MB+ capacity)
<AchievementProvider
  achievements={achievements}
  storage={StorageType.IndexedDB}
>
```

#### "Achievement not unlocking"

**Check:**
1. Condition function is correct
2. Metric value is correct type
3. Achievement ID is unique
4. No configuration errors

```tsx
// Enable debug mode to see all checks
<AchievementProvider achievements={achievements} debug={true}>
```

#### "Notifications not appearing"

**Check:**
1. `useBuiltInUI={true}` is set
2. No JavaScript errors in console
3. Achievement is actually unlocking (check debug logs)

---

## What's Next?

- **[Storage Options](./storage-options)** - Learn about different storage backends
- **[Data Portability](./data-portability)** - Export/import for error recovery
- **[API Reference](../api)** - Complete error class documentation
