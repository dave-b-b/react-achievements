---
sidebar_position: 6
---

# Data Portability

React Achievements exposes import and export helpers for backups, account migration, support tooling, and cross-device sync.

## Export Data

`exportData()` returns a JSON string representing the active achievement state.

```tsx
import { useAchievements } from 'react-achievements';

function BackupButton() {
  const { exportData } = useAchievements();

  return (
    <button
      onClick={() => {
        const json = exportData();
        console.log(json);
      }}
    >
      Export achievements
    </button>
  );
}
```

Download the export as a file:

```tsx
function DownloadBackup() {
  const { exportData } = useAchievements();

  const handleDownload = () => {
    const json = exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `achievements-backup-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return <button onClick={handleDownload}>Download backup</button>;
}
```

## Import Data

`importData(json, options)` validates and imports a previous export.

```tsx
function RestoreButton({ backupJson }: { backupJson: string }) {
  const { importData } = useAchievements();

  const handleRestore = () => {
    const result = importData(backupJson, { merge: true });

    if (!result.success) {
      console.error(result.errors);
      return;
    }

    console.log('Achievement data restored.');
  };

  return <button onClick={handleRestore}>Restore backup</button>;
}
```

## Import Options

```ts
type ImportOptions = {
  merge?: boolean;
  overwrite?: boolean;
  validateConfig?: boolean;
  expectedConfigHash?: string;
};
```

Common modes:

- `importData(json)` imports the export using the engine defaults.
- `importData(json, { merge: true })` combines imported data with current progress.
- `importData(json, { overwrite: true })` allows imported values to replace current values.
- `importData(json, { validateConfig: true, expectedConfigHash })` validates that the backup matches the expected achievement configuration.

## Import Result

```ts
type ImportResult = {
  success: boolean;
  errors?: string[];
  warnings?: string[];
  mergedMetrics?: AchievementMetrics;
  mergedUnlocked?: string[];
};
```

Always check `success` before showing a success message.

```tsx
const result = importData(json, { merge: true });

if (result.success) {
  toast.success('Achievements restored.');
} else {
  toast.error(result.errors?.join(', ') || 'Import failed.');
}
```

## File Upload

```tsx
function UploadBackup() {
  const { importData } = useAchievements();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const json = e.target?.result as string;
      const result = importData(json, { merge: true });

      if (!result.success) {
        alert(result.errors?.join(', ') || 'Restore failed.');
      }
    };
    reader.readAsText(file);
  };

  return <input type="file" accept="application/json,.json" onChange={handleFileChange} />;
}
```

## Cloud Sync Pattern

Use `exportData()` to send a snapshot to your backend, and `importData()` to restore it.

```tsx
function SyncControls({ userId }: { userId: string }) {
  const { exportData } = useAchievements();

  const syncToServer = async () => {
    await fetch(`/api/users/${userId}/achievements`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: exportData(),
    });
  };

  return <button onClick={syncToServer}>Sync achievements</button>;
}
```

For live multi-device sync, prefer a custom storage adapter or `RestApiStorage`; import/export is best for snapshots, backups, and support workflows.
