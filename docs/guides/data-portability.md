---
sidebar_position: 6
---

# Data Portability

Export and import achievement data for backups, cross-device sync, and cloud storage integration.

## Overview

React Achievements provides comprehensive data portability:

- **Export** achievement data as JSON
- **Import** data with merge strategies
- **Cloud storage** integration (AWS S3, Azure Blob Storage)
- **Cross-device sync** via REST API
- **Backup and restore** functionality

---

## Basic Export/Import

### Export Data

```tsx
import { useAchievements } from 'react-achievements';

function BackupButton() {
  const { exportData } = useAchievements();

  const handleExport = () => {
    const data = exportData();
    console.log(data);  // JSON string
  };

  return <button onClick={handleExport}>Export Achievements</button>;
}
```

### Import Data

```tsx
function RestoreButton() {
  const { importData } = useAchievements();

  const handleImport = (jsonData) => {
    const result = importData(jsonData);

    if (result.success) {
      console.log(`Imported ${result.count} achievements`);
    } else {
      console.error(`Import failed: ${result.error}`);
    }
  };

  return <button onClick={() => handleImport(backupData)}>Restore</button>;
}
```

---

## Export Options

### Export Everything

```tsx
const data = exportData();  // All achievements and metrics
```

### Export Specific Achievements

```tsx
const data = exportData({
  achievementIds: ['score_100', 'level_10']
});
```

### Export with Metadata

```tsx
const data = exportData({
  includeMetadata: true  // Includes timestamps, version, etc.
});
```

**Exported Format:**

```json
{
  "version": "3.7.0",
  "exportedAt": "2025-12-23T10:30:00.000Z",
  "achievements": {
    "score_100": {
      "id": "score_100",
      "title": "Century!",
      "unlockedAt": "2025-12-22T15:20:00.000Z",
      "isUnlocked": true
    }
  },
  "metrics": {
    "score": 150,
    "level": 5,
    "completedTutorial": true
  }
}
```

---

## Import Strategies

### Replace Strategy (Default)

Completely replaces existing data:

```tsx
importData(jsonData, { strategy: 'replace' });
```

**Use when:**
- Restoring from a known good backup
- Resetting all achievements
- Initial data load

### Merge Strategy

Combines imported data with existing data:

```tsx
importData(jsonData, { strategy: 'merge' });
```

**Merge rules:**
- Unlocked achievements stay unlocked
- Metrics take the higher value
- Timestamps preserve the earliest unlock time

**Use when:**
- Syncing between devices
- Importing partial backups
- Merging multiple saves

### Additive Strategy

Only adds new achievements, never overwrites:

```tsx
importData(jsonData, { strategy: 'additive' });
```

**Use when:**
- Adding achievements from another source
- Importing without losing progress
- Safe imports

---

## Backup to File

### Download as JSON File

```tsx
function DownloadBackup() {
  const { exportData } = useAchievements();

  const handleDownload = () => {
    const data = exportData({ includeMetadata: true });
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `achievements-backup-${Date.now()}.json`;
    link.click();

    URL.revokeObjectURL(url);
  };

  return <button onClick={handleDownload}>Download Backup</button>;
}
```

### Upload from File

```tsx
function UploadBackup() {
  const { importData } = useAchievements();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const jsonData = e.target.result;
      const result = importData(jsonData, { strategy: 'merge' });

      if (result.success) {
        alert(`Restored ${result.count} achievements!`);
      }
    };

    reader.readAsText(file);
  };

  return <input type="file" accept=".json" onChange={handleFileChange} />;
}
```

---

## Cloud Storage Integration

### AWS S3 Integration

```tsx
import { S3 } from 'aws-sdk';

async function backupToS3() {
  const { exportData } = useAchievements();
  const data = exportData({ includeMetadata: true });

  const s3 = new S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'us-east-1'
  });

  const params = {
    Bucket: 'my-achievements-backup',
    Key: `users/${userId}/achievements-${Date.now()}.json`,
    Body: data,
    ContentType: 'application/json',
    ServerSideEncryption: 'AES256'  // Encrypt at rest
  };

  try {
    const result = await s3.putObject(params).promise();
    console.log('Backed up to S3:', result);
    return { success: true, location: result.Location };
  } catch (error) {
    console.error('S3 backup failed:', error);
    return { success: false, error };
  }
}
```

### Restore from S3

```tsx
async function restoreFromS3(backupKey) {
  const { importData } = useAchievements();

  const s3 = new S3({ /* credentials */ });

  const params = {
    Bucket: 'my-achievements-backup',
    Key: backupKey
  };

  try {
    const data = await s3.getObject(params).promise();
    const jsonData = data.Body.toString('utf-8');

    const result = importData(jsonData, { strategy: 'merge' });
    console.log(`Restored ${result.count} achievements from S3`);
    return result;
  } catch (error) {
    console.error('S3 restore failed:', error);
    return { success: false, error };
  }
}
```

### List Available Backups

```tsx
async function listBackups(userId) {
  const s3 = new S3({ /* credentials */ });

  const params = {
    Bucket: 'my-achievements-backup',
    Prefix: `users/${userId}/`
  };

  const data = await s3.listObjectsV2(params).promise();

  return data.Contents.map(item => ({
    key: item.Key,
    size: item.Size,
    lastModified: item.LastModified
  }));
}
```

---

### Azure Blob Storage Integration

```tsx
import { BlobServiceClient } from '@azure/storage-blob';

async function backupToAzure() {
  const { exportData } = useAchievements();
  const data = exportData({ includeMetadata: true });

  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

  const containerName = 'achievements-backup';
  const containerClient = blobServiceClient.getContainerClient(containerName);

  const blobName = `users/${userId}/achievements-${Date.now()}.json`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  try {
    await blockBlobClient.upload(data, data.length, {
      blobHTTPHeaders: { blobContentType: 'application/json' }
    });

    console.log('Backed up to Azure Blob Storage');
    return { success: true, blobName };
  } catch (error) {
    console.error('Azure backup failed:', error);
    return { success: false, error };
  }
}
```

### Restore from Azure

```tsx
async function restoreFromAzure(blobName) {
  const { importData } = useAchievements();

  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

  const containerClient = blobServiceClient.getContainerClient('achievements-backup');
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  try {
    const downloadResponse = await blockBlobClient.download(0);
    const jsonData = await streamToString(downloadResponse.readableStreamBody);

    const result = importData(jsonData, { strategy: 'merge' });
    console.log(`Restored ${result.count} achievements from Azure`);
    return result;
  } catch (error) {
    console.error('Azure restore failed:', error);
    return { success: false, error };
  }
}

async function streamToString(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on('data', (data) => {
      chunks.push(data.toString());
    });
    readableStream.on('end', () => {
      resolve(chunks.join(''));
    });
    readableStream.on('error', reject);
  });
}
```

---

## Automatic Cloud Sync

### Sync on Achievement Unlock

```tsx
<AchievementProvider
  achievements={achievements}
  onAchievementUnlock={async (achievement) => {
    // Backup to cloud whenever an achievement unlocks
    await backupToS3();
  }}
>
  <YourApp />
</AchievementProvider>
```

### Periodic Auto-Backup

```tsx
function AppWithAutoBackup() {
  const { exportData } = useAchievements();

  useEffect(() => {
    // Backup every 5 minutes
    const interval = setInterval(async () => {
      const data = exportData({ includeMetadata: true });
      await backupToS3(data);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [exportData]);

  return <YourApp />;
}
```

### Sync on App Start

```tsx
function AppWithSync() {
  const { importData } = useAchievements();
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    async function syncFromCloud() {
      try {
        const latestBackup = await getLatestBackup(userId);
        const result = await restoreFromS3(latestBackup.key);

        if (result.success) {
          console.log('Synced from cloud');
          setSynced(true);
        }
      } catch (error) {
        console.error('Sync failed:', error);
        setSynced(true);  // Continue anyway
      }
    }

    syncFromCloud();
  }, [importData]);

  if (!synced) {
    return <div>Syncing achievements...</div>;
  }

  return <YourApp />;
}
```

---

## Cross-Device Sync

### REST API Sync

Use REST API storage for automatic cross-device sync:

```tsx
<AchievementProvider
  achievements={achievements}
  storage={StorageType.RestApi}
  storageConfig={{
    apiEndpoint: 'https://api.example.com/achievements',
    userId: currentUser.id,
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }}
>
  <YourApp />
</AchievementProvider>
```

The REST API storage automatically:
- Syncs on every update
- Pulls latest data on app start
- Handles conflicts with merge strategy

---

## Best Practices

### 1. Encrypt Sensitive Data

```tsx
import CryptoJS from 'crypto-js';

function encryptData(data, secret) {
  return CryptoJS.AES.encrypt(data, secret).toString();
}

function decryptData(encryptedData, secret) {
  const bytes = CryptoJS.AES.decrypt(encryptedData, secret);
  return bytes.toString(CryptoJS.enc.Utf8);
}

// Export with encryption
const data = exportData();
const encrypted = encryptData(data, userSecret);
await backupToS3(encrypted);

// Import with decryption
const encrypted = await restoreFromS3(backupKey);
const decrypted = decryptData(encrypted, userSecret);
importData(decrypted);
```

### 2. Version Your Backups

```tsx
const backupKey = `users/${userId}/v${APP_VERSION}/achievements-${Date.now()}.json`;
```

### 3. Keep Multiple Backups

```tsx
// Keep last 10 backups, delete older ones
async function pruneOldBackups(userId, keepCount = 10) {
  const backups = await listBackups(userId);

  if (backups.length > keepCount) {
    const toDelete = backups
      .sort((a, b) => b.lastModified - a.lastModified)
      .slice(keepCount);

    for (const backup of toDelete) {
      await s3.deleteObject({ Bucket: bucket, Key: backup.key }).promise();
    }
  }
}
```

### 4. Validate Before Import

```tsx
function validateBackupData(jsonData) {
  try {
    const parsed = JSON.parse(jsonData);

    if (!parsed.version || !parsed.achievements) {
      return { valid: false, error: 'Invalid backup format' };
    }

    // Check version compatibility
    if (parsed.version !== CURRENT_VERSION) {
      return { valid: false, error: 'Version mismatch' };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: 'Invalid JSON' };
  }
}

// Use before importing
const validation = validateBackupData(data);
if (validation.valid) {
  importData(data);
} else {
  console.error('Invalid backup:', validation.error);
}
```

### 5. Handle Import Errors Gracefully

```tsx
function safeImport(jsonData) {
  try {
    const result = importData(jsonData, { strategy: 'merge' });

    if (!result.success) {
      console.error('Import failed:', result.error);
      // Show user-friendly message
      showNotification('Could not restore backup', 'error');
      return false;
    }

    showNotification(`Restored ${result.count} achievements`, 'success');
    return true;
  } catch (error) {
    console.error('Import error:', error);
    showNotification('Backup file is corrupted', 'error');
    return false;
  }
}
```

---

## Conflict Resolution

### Timestamp-Based Resolution

```tsx
importData(jsonData, {
  strategy: 'merge',
  conflictResolution: 'latest'  // Use most recent timestamp
});
```

### Value-Based Resolution

```tsx
importData(jsonData, {
  strategy: 'merge',
  conflictResolution: 'highest'  // Use highest metric values
});
```

### Custom Resolution

```tsx
importData(jsonData, {
  strategy: 'merge',
  conflictResolution: (local, remote) => {
    // Custom logic
    return local.score > remote.score ? local : remote;
  }
});
```

---

## Complete Backup System Example

```tsx
import { useAchievements } from 'react-achievements';
import { S3 } from 'aws-sdk';

function AchievementBackupSystem() {
  const { exportData, importData } = useAchievements();
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBackupList();
  }, []);

  async function loadBackupList() {
    const list = await listBackups(userId);
    setBackups(list);
  }

  async function createBackup() {
    setLoading(true);
    const data = exportData({ includeMetadata: true });
    const result = await backupToS3(data);

    if (result.success) {
      await loadBackupList();
      alert('Backup created successfully!');
    } else {
      alert('Backup failed: ' + result.error);
    }
    setLoading(false);
  }

  async function restore(backupKey) {
    if (!confirm('This will merge the backup with your current progress. Continue?')) {
      return;
    }

    setLoading(true);
    const result = await restoreFromS3(backupKey);

    if (result.success) {
      alert(`Restored ${result.count} achievements!`);
    } else {
      alert('Restore failed: ' + result.error);
    }
    setLoading(false);
  }

  return (
    <div className="backup-system">
      <h2>Achievement Backups</h2>

      <button onClick={createBackup} disabled={loading}>
        {loading ? 'Processing...' : 'Create Backup'}
      </button>

      <h3>Available Backups</h3>
      <ul>
        {backups.map(backup => (
          <li key={backup.key}>
            {new Date(backup.lastModified).toLocaleString()}
            {' '}
            ({(backup.size / 1024).toFixed(2)} KB)
            <button onClick={() => restore(backup.key)}>Restore</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## What's Next?

- **[Storage Options](./storage-options)** - Learn about storage backends
- **[Error Handling](./error-handling)** - Handle backup failures gracefully
- **[API Reference](../api)** - Complete export/import API docs
