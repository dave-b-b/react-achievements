---
sidebar_position: 1
---

# Custom Storage

Create your own storage implementation for React Achievements.

## Storage Interface

To create a custom storage backend, implement either the synchronous `AchievementStorage` interface or the asynchronous `AsyncAchievementStorage` interface.

### Synchronous Storage Interface

```typescript
interface AchievementStorage {
  getMetrics(): AchievementMetrics;
  setMetrics(metrics: AchievementMetrics): void;
  getUnlockedAchievements(): string[];
  setUnlockedAchievements(achievements: string[]): void;
  clear(): void;
}
```

### Asynchronous Storage Interface

```typescript
interface AsyncAchievementStorage {
  getMetrics(): Promise<AchievementMetrics>;
  setMetrics(metrics: AchievementMetrics): Promise<void>;
  getUnlockedAchievements(): Promise<string[]>;
  setUnlockedAchievements(achievements: string[]): Promise<void>;
  clear(): Promise<void>;
}
```

## Example: Custom SessionStorage Implementation

```typescript
import { AchievementStorage, AchievementMetrics } from 'react-achievements';

export class SessionStorageAdapter implements AchievementStorage {
  private keyPrefix: string;

  constructor(keyPrefix = 'achievements') {
    this.keyPrefix = keyPrefix;
  }

  private getKey(key: string): string {
    return `${this.keyPrefix}_${key}`;
  }

  getMetrics(): AchievementMetrics {
    const data = sessionStorage.getItem(this.getKey('metrics'));
    return data ? JSON.parse(data) : {};
  }

  setMetrics(metrics: AchievementMetrics): void {
    sessionStorage.setItem(
      this.getKey('metrics'),
      JSON.stringify(metrics)
    );
  }

  getUnlockedAchievements(): string[] {
    const data = sessionStorage.getItem(this.getKey('unlocked'));
    return data ? JSON.parse(data) : [];
  }

  setUnlockedAchievements(achievements: string[]): void {
    sessionStorage.setItem(
      this.getKey('unlocked'),
      JSON.stringify(achievements)
    );
  }

  clear(): void {
    sessionStorage.removeItem(this.getKey('metrics'));
    sessionStorage.removeItem(this.getKey('unlocked'));
  }
}
```

### Usage

```tsx
import { AchievementProvider } from 'react-achievements';
import { SessionStorageAdapter } from './SessionStorageAdapter';

const sessionStorage = new SessionStorageAdapter();

function App() {
  return (
    <AchievementProvider
      achievements={gameAchievements}
      storage={sessionStorage}
    >
      {/* Your app */}
    </AchievementProvider>
  );
}
```

## Example: Firebase Storage Implementation

```typescript
import { AsyncAchievementStorage, AchievementMetrics } from 'react-achievements';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

export class FirebaseStorage implements AsyncAchievementStorage {
  private db;
  private userId: string;

  constructor(userId: string) {
    this.db = getFirestore();
    this.userId = userId;
  }

  private get docRef() {
    return doc(this.db, 'achievements', this.userId);
  }

  async getMetrics(): Promise<AchievementMetrics> {
    const snapshot = await getDoc(this.docRef);
    return snapshot.data()?.metrics || {};
  }

  async setMetrics(metrics: AchievementMetrics): Promise<void> {
    await setDoc(this.docRef, { metrics }, { merge: true });
  }

  async getUnlockedAchievements(): Promise<string[]> {
    const snapshot = await getDoc(this.docRef);
    return snapshot.data()?.unlocked || [];
  }

  async setUnlockedAchievements(achievements: string[]): Promise<void> {
    await setDoc(this.docRef, { unlocked: achievements }, { merge: true });
  }

  async clear(): Promise<void> {
    await setDoc(this.docRef, { metrics: {}, unlocked: [] });
  }
}
```

### Usage with Async Storage

Async storage is automatically wrapped with the `AsyncStorageAdapter`:

```tsx
import { AchievementProvider } from 'react-achievements';
import { FirebaseStorage } from './FirebaseStorage';

const firebaseStorage = new FirebaseStorage('user123');

function App() {
  return (
    <AchievementProvider
      achievements={gameAchievements}
      storage={firebaseStorage}
    >
      {/* Your app */}
    </AchievementProvider>
  );
}
```

The provider automatically detects async storage and wraps it with optimistic updates.

## Example: Supabase Storage

```typescript
import { AsyncAchievementStorage, AchievementMetrics } from 'react-achievements';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export class SupabaseStorage implements AsyncAchievementStorage {
  private supabase: SupabaseClient;
  private userId: string;

  constructor(supabaseUrl: string, supabaseKey: string, userId: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.userId = userId;
  }

  async getMetrics(): Promise<AchievementMetrics> {
    const { data, error } = await this.supabase
      .from('achievements')
      .select('metrics')
      .eq('user_id', this.userId)
      .single();

    if (error || !data) return {};
    return data.metrics;
  }

  async setMetrics(metrics: AchievementMetrics): Promise<void> {
    await this.supabase
      .from('achievements')
      .upsert({
        user_id: this.userId,
        metrics,
        updated_at: new Date().toISOString(),
      });
  }

  async getUnlockedAchievements(): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('achievements')
      .select('unlocked')
      .eq('user_id', this.userId)
      .single();

    if (error || !data) return [];
    return data.unlocked;
  }

  async setUnlockedAchievements(achievements: string[]): Promise<void> {
    await this.supabase
      .from('achievements')
      .upsert({
        user_id: this.userId,
        unlocked: achievements,
        updated_at: new Date().toISOString(),
      });
  }

  async clear(): Promise<void> {
    await this.supabase
      .from('achievements')
      .delete()
      .eq('user_id', this.userId);
  }
}
```

## Best Practices

### 1. Handle Errors Gracefully

```typescript
async getMetrics(): Promise<AchievementMetrics> {
  try {
    const response = await fetch(`${this.apiUrl}/metrics`);
    if (!response.ok) {
      console.error('Failed to fetch metrics');
      return {}; // Return empty metrics on error
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return {};
  }
}
```

### 2. Implement Caching for Async Storage

```typescript
export class CachedStorage implements AsyncAchievementStorage {
  private cache: { metrics?: AchievementMetrics; unlocked?: string[] } = {};
  private underlyingStorage: AsyncAchievementStorage;

  constructor(storage: AsyncAchievementStorage) {
    this.underlyingStorage = storage;
  }

  async getMetrics(): Promise<AchievementMetrics> {
    if (!this.cache.metrics) {
      this.cache.metrics = await this.underlyingStorage.getMetrics();
    }
    return this.cache.metrics;
  }

  async setMetrics(metrics: AchievementMetrics): Promise<void> {
    this.cache.metrics = metrics;
    await this.underlyingStorage.setMetrics(metrics);
  }

  // ... implement other methods similarly
}
```

### 3. Add Migration Support

```typescript
export class MigratableStorage implements AchievementStorage {
  private version = 2;
  private keyPrefix: string;

  constructor(keyPrefix = 'achievements') {
    this.keyPrefix = keyPrefix;
    this.migrateIfNeeded();
  }

  private migrateIfNeeded(): void {
    const currentVersion = localStorage.getItem(`${this.keyPrefix}_version`);

    if (!currentVersion || parseInt(currentVersion) < this.version) {
      this.migrate(parseInt(currentVersion || '0'));
      localStorage.setItem(`${this.keyPrefix}_version`, String(this.version));
    }
  }

  private migrate(fromVersion: number): void {
    if (fromVersion < 2) {
      // Migrate data from version 1 to version 2
      // ... migration logic
    }
  }

  // ... implement storage interface
}
```

## Testing Custom Storage

```typescript
import { render } from '@testing-library/react';
import { AchievementProvider } from 'react-achievements';
import { MyCustomStorage } from './MyCustomStorage';

describe('MyCustomStorage', () => {
  it('should store and retrieve metrics', () => {
    const storage = new MyCustomStorage();
    const metrics = { score: [100] };

    storage.setMetrics(metrics);
    const retrieved = storage.getMetrics();

    expect(retrieved).toEqual(metrics);
  });

  it('should work with AchievementProvider', () => {
    const storage = new MyCustomStorage();

    render(
      <AchievementProvider
        achievements={testAchievements}
        storage={storage}
      >
        <TestComponent />
      </AchievementProvider>
    );

    // ... test your component
  });
});
```

## Related Documentation

- **[Storage Options](/docs/guides/storage-options)** - Built-in storage types
- **[API Reference](/docs/api)** - Complete type definitions
- **[Error Handling](/docs/guides/error-handling)** - Handle storage errors
