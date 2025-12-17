# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.4.2] - 2025-12-17

### Changed
- **Documentation**: Added missing changelog entry for version 3.4.1
  - Documented CI/CD pipeline addition
  - Documented ESLint configuration and linting fixes
  - No code changes in this release

---

## [3.4.1] - 2025-12-17

### Added
- **GitHub Actions CI/CD Pipeline**: Automated continuous integration workflow
  - Lint job: Runs ESLint checks on every push and pull request
  - Test job: Executes full test suite with type checking (234 tests)
  - Build job: Validates package builds successfully
  - Runs on Node.js 18 with npm caching for faster builds
  - Triggers on push to main branch and all pull requests

- **ESLint Configuration**: Modern ESLint flat config setup
  - Migrated to `eslint.config.mjs` format
  - TypeScript and React plugin support
  - Consistent code quality standards across the project

### Changed
- **Code Quality**: Fixed linting issues across 20+ files
  - Updated test files to comply with ESLint rules
  - Fixed linting issues in source code and stories
  - Improved code consistency and maintainability

### Developer Experience
- **Automated Quality Gates**: CI now catches linting and test failures before merge
- **Version**: Bumped to 3.4.1 in package.json

---

## [3.4.0] - 2025-12-15

### ✅ Release Notes
- **Testing Status**: **234 of 234 tests passing (100% pass rate)**. All async storage features fully tested and working.
- **Production Ready**: All core functionality validated through comprehensive automated and manual testing. IndexedDB, REST API, and Offline Queue storage working correctly in production environments.
- **Backwards Compatible**: 100% compatible with v3.3.0 - all existing code works without changes.

### Added

#### Async Storage System
- **AsyncAchievementStorage Interface**: New async storage interface with Promise-based operations
  - All storage methods return Promises for async operations
  - Fully compatible with modern async/await patterns
  - Enables integration with async storage backends (IndexedDB, REST APIs, etc.)

- **AsyncStorageAdapter**: Intelligent adapter that bridges async storage to synchronous API
  - **Optimistic Updates**: Returns data immediately from cache while writing in background
  - **Eager Loading**: Preloads data during initialization for instant reads
  - **Background Writes**: All write operations happen asynchronously without blocking UI
  - **Error Handling**: Graceful error handling with optional error callbacks
  - **Flush Support**: Manual flush() method for testing and cleanup

- **IndexedDBStorage**: Browser-native IndexedDB implementation
  - Large data capacity (typically 50MB+ vs localStorage's 5-10MB)
  - Async-first design with Promise-based API
  - Automatic database initialization and schema management
  - Structured storage with typed object stores
  - Full CRUD operations for metrics and achievements

- **RestApiStorage**: Backend server integration
  - RESTful API client for remote achievement storage
  - Configurable base URL, user ID, and custom headers
  - Built-in timeout handling (configurable, default 10s)
  - Automatic error handling with SyncError reporting
  - Standard HTTP methods (GET, PUT, DELETE) for all operations

- **OfflineQueueStorage**: Offline-first wrapper with automatic synchronization
  - Queues write operations when offline
  - Automatic sync when connection restored
  - Persistent queue in localStorage survives page refreshes
  - Online/offline event listeners for automatic mode switching
  - Manual sync() method for forced synchronization
  - Queue status inspection for debugging

#### Type System Enhancements
- **StorageType Enum**: Extended with new async storage types
  - `StorageType.Local` - Synchronous localStorage (existing)
  - `StorageType.Memory` - Synchronous in-memory storage (existing)
  - `StorageType.IndexedDB` - Async IndexedDB storage (new)
  - `StorageType.RestAPI` - Async REST API storage (new)

- **Type Guards**: Added type guard for storage type detection
  - `isAsyncStorage()` - Detect if storage implements async interface

- **Configuration Types**: New types for async storage configuration
  - `RestApiStorageConfig` - Configuration for REST API storage
  - `AnyAchievementStorage` - Union type accepting sync or async storage

#### Provider Enhancements
- **AchievementProvider** now accepts async storage implementations
  - Automatic detection and wrapping of async storage with adapter
  - New `restApiConfig` prop for REST API configuration
  - Seamless integration with existing synchronous storage
  - Error callback support for async storage operations

### Changed
- **Exports**: Added new async storage exports to main package entry
  - `AsyncStorageAdapter` - Adapter for async storage implementations
  - `IndexedDBStorage` - IndexedDB storage implementation
  - `RestApiStorage` - REST API storage implementation
  - `OfflineQueueStorage` - Offline-first storage wrapper
  - `isAsyncStorage` - Type guard for async storage detection
  - `AsyncAchievementStorage` type
  - `AnyAchievementStorage` type
  - `RestApiStorageConfig` type

### Backward Compatibility
- ✅ **100% Backward Compatible**: All existing APIs unchanged
- ✅ Existing storage implementations (LocalStorage, MemoryStorage) work exactly as before
- ✅ All hooks (useAchievements, useSimpleAchievements) unchanged
- ✅ Simple API and Complex API configurations unaffected
- ✅ All v3.3.0 code works without modifications in v3.4.0

### Testing
- **Async Storage Tests**: Added comprehensive test suites for all async implementations
  - AsyncStorageAdapter tests: ✅ 100% passing (optimistic updates, eager loading, error handling)
  - IndexedDBStorage tests: ✅ 100% passing - 19/19 tests (CRUD operations, persistence, large data handling)
  - RestApiStorage tests: ✅ 100% passing - 24/24 tests (HTTP operations, timeout handling, error scenarios)
  - OfflineQueueStorage tests: ✅ 100% passing - 23/23 tests (queue management, sync behavior, persistence)
- **Test Performance**: Optimized test suite using proper fake-indexeddb cleanup (IDBFactory reset pattern)
  - Overall test pass rate: **✅ 100% (234/234 tests passing)**
  - Test suite completes in ~2.5 seconds

### Migration Guide (v3.3.0 → v3.4.0)

No migration needed! Version 3.4.0 is fully backward compatible. However, if you want to use the new async storage features:

```tsx
// NEW: Using IndexedDB storage (async)
import { AchievementProvider, StorageType } from 'react-achievements';

<AchievementProvider
  achievements={gameAchievements}
  storage={StorageType.IndexedDB}  // NEW in v3.4.0
>
  <YourApp />
</AchievementProvider>

// NEW: Using REST API storage (async)
<AchievementProvider
  achievements={gameAchievements}
  storage={StorageType.RestAPI}  // NEW in v3.4.0
  restApiConfig={{
    baseUrl: 'https://api.example.com',
    userId: 'user123',
    headers: { 'Authorization': 'Bearer token' }
  }}
>
  <YourApp />
</AchievementProvider>

// EXISTING: LocalStorage still works (no changes needed)
<AchievementProvider
  achievements={gameAchievements}
  storage="local"  // Still works exactly as before
>
  <YourApp />
</AchievementProvider>
```

---

## [3.3.0] - 2024-12-10

### Added

#### Error Handling System
- **Comprehensive Error Classes**: Added 6 specialized error types for robust error handling:
  - `StorageQuotaError`: Thrown when browser storage quota is exceeded
  - `ImportValidationError`: Thrown when imported data fails validation
  - `StorageError`: General storage operation failures
  - `ConfigurationError`: Invalid achievement configuration errors
  - `SyncError`: Multi-device synchronization errors (for future async storage)
  - `AchievementError`: Base error class for all achievement-related errors

- **Error Properties**: All errors include:
  - `code`: Machine-readable error code for programmatic handling
  - `recoverable`: Boolean indicating if error recovery is possible
  - `remedy`: User-friendly guidance on how to resolve the error
  - Custom properties specific to each error type (e.g., `bytesNeeded` for StorageQuotaError)

- **Type Guards**: Added helper functions for error type checking:
  - `isAchievementError(error)`: Check if error is an achievement-related error
  - `isRecoverableError(error)`: Check if error can be recovered from

- **Provider Integration**:
  - `AchievementProvider` now accepts optional `onError` callback prop
  - Errors are automatically caught and passed to `onError` handler
  - Graceful degradation with console logging when `onError` is not provided

#### Data Export/Import
- **Export Functionality**:
  - `exportAchievementData()`: Export all achievement data as JSON
  - Includes metrics, unlocked achievements, and configuration hash
  - Configuration hash ensures imported data matches achievement setup
  - Timestamp for data versioning

- **Import Functionality**:
  - `importAchievementData(data, options)`: Import previously exported data
  - Three merge strategies:
    - `replace`: Replace all existing data (default)
    - `merge`: Combine imported and existing data
    - `preserve`: Keep existing data, only import new achievements
  - Validates data structure and configuration compatibility
  - Returns detailed import results with merged data

- **Data Portability**:
  - Transfer achievements between devices
  - Backup and restore functionality
  - Migration support for configuration changes

#### Testing
- **Error Handling Tests**: Added 64 comprehensive tests:
  - Unit tests for all 6 error types
  - Type guard validation tests
  - Integration tests with `AchievementProvider`
  - Error callback testing
  - Graceful degradation testing
  - Error message quality validation

- **Data Export/Import Tests**: Enhanced test coverage for data portability
  - Export validation tests
  - Import with different merge strategies
  - Configuration mismatch handling
  - Data validation tests

### Changed
- **Exports**: Updated main exports to include error handling and data utilities:
  - All error classes now exported from main package entry point
  - Export/import utilities available for application use
  - Type definitions for `ExportedData`, `ImportOptions`, and `ImportResult`

- **Storage Implementation**:
  - `LocalStorage` now throws `StorageQuotaError` instead of silent failures
  - Better error messages with actionable remedies
  - Improved error handling in all storage operations

- **Provider Behavior**:
  - Enhanced error handling in achievement updates
  - Better error messages for troubleshooting
  - Graceful fallbacks when storage operations fail

### Documentation
- **New Documentation**:
  - `CHANGELOG.md`: This changelog

- **Updated Documentation**:
  - README updated with error handling examples
  - README updated with data export/import examples

### Developer Experience
- **Version Management**: Version bumped to 3.3.0 in package.json
- **Type Safety**: Improved TypeScript coverage and error handling

---

## Version History

### [3.3.0] - 2024-12-10
First changelog entry. This version adds enterprise-grade error handling, data portability, and quality controls.

Previous versions (0.0.1 - 3.2.1) were released before changelog tracking began.
