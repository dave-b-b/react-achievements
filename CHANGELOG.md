# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.6.0] - 2025-12-18

### ✅ Release Notes
- **Major Feature**: Built-in UI system with zero external dependencies
- **Bundle Reduction**: ~40KB savings for new projects (50KB external → 8KB built-in)
- **Backwards Compatible**: 100% compatible with v3.5.0 - all existing code works without changes
- **Deprecation Warning**: External UI dependencies (react-toastify, react-modal, react-confetti, react-use) are deprecated and will be fully optional in v4.0.0

### Documentation
- Simplified theme system to 3 built-in themes only
  - Users can choose from 'modern', 'minimal', or 'gamified' themes
  - Removed theme registry API (registerTheme, listThemes) for flexibility
  - Advanced users can replace UI components entirely via component injection
  - No custom theme support to avoid maintenance burden (can add later if user demand)

### Added

#### Built-in UI Components
- **BuiltInNotification**: Modern notification component with smooth animations
  - Supports 6 positions: top/bottom × left/center/right
  - Theme-aware with gradient backgrounds
  - Auto-dismiss with manual close button
  - Slide-in animations with proper timing
  - Zero external dependencies

- **BuiltInModal**: Modern achievement modal with locked/unlocked states
  - Dark overlay with centered content
  - Theme-based styling (modern, minimal, gamified)
  - Body scroll lock when open
  - Scale animation on open/close
  - Lock icon for locked achievements
  - Proper accessibility with ARIA labels

- **BuiltInConfetti**: Lightweight CSS-based confetti animation
  - Configurable particle count and colors per theme
  - Uses custom useWindowSize hook (no react-use dependency)
  - Pure CSS @keyframes animations
  - Performant 60fps animation

#### Theme System
- **Extensible Theme Registry**: Global theme management system
  - `registerTheme(theme)`: Register custom themes globally
  - `getTheme(name)`: Retrieve themes (checks built-in first, then registry)
  - `listThemes()`: List all available themes (built-in + custom)
  - `clearCustomThemes()`: Reset custom theme registry (testing utility)

- **Built-in Theme Presets**: Three professionally designed themes
  - **Modern** (default): Dark gradients, green accents, 50 confetti particles
  - **Minimal**: Light backgrounds, subtle shadows, 30 particles
  - **Gamified**: Purple/gold colors, glowing effects, 100 particles

- **Shareable Theme Packages**: Support for npm-published themes
  - Auto-registration on import for easy distribution
  - Full TypeScript support with ThemeConfig interface
  - Community theme ecosystem enabled

#### Component Customization
- **UIConfig Interface**: Comprehensive UI configuration
  - `NotificationComponent`: Inject custom notification component
  - `ModalComponent`: Inject custom modal component
  - `ConfettiComponent`: Inject custom confetti component
  - `theme`: Select theme by name (built-in or registered)
  - `customTheme`: Provide inline theme object
  - `notificationPosition`: Position on screen
  - `enableNotifications`: Toggle notifications (default: true)
  - `enableConfetti`: Toggle confetti (default: true)

- **BadgesButton Enhancement**: New placement modes
  - `placement="fixed"`: Traditional floating button (default)
  - `placement="inline"`: Embeddable in drawers, sidebars, navbars
  - `theme`: Theme support for consistent styling
  - Inline mode removes fixed positioning for layout flexibility

#### Legacy Detection & Migration
- **Legacy Library Detector**: Automatic detection with graceful fallback
  - Dynamic imports with try/catch for each external library
  - Caching to avoid repeated import attempts
  - Deprecation warning shown once per session
  - SSR-safe with proper window checks

- **Legacy Wrappers**: Backwards compatibility layer
  - `createLegacyToastNotification()`: Wraps react-toastify
  - `createLegacyConfettiWrapper()`: Wraps react-confetti
  - Automatic fallback to built-in if library missing
  - Matches existing behavior exactly (no visual changes)

#### Custom Hooks
- **useWindowSize**: Replaces react-use dependency
  - SSR-safe with window checks
  - Resize event listener with cleanup
  - Used by BuiltInConfetti component

#### Provider Enhancements
- **AchievementProvider** now supports UI configuration
  - `ui?: UIConfig`: Complete UI customization
  - `useBuiltInUI?: boolean`: Force built-in UI (opt-in for v3.x)
  - Automatic component resolution: custom → useBuiltInUI → legacy → built-in
  - State management for current notification display

### Changed
- **Installation**: External UI dependencies now optional
  - New projects: `npm install react-achievements react react-dom`
  - External deps remain as peerDependencies for v3.x compatibility
  - Will move to peerDependenciesMeta.optional in v4.0.0

- **Exports**: Added new UI exports to main package entry
  - `BuiltInNotification`, `BuiltInModal`, `BuiltInConfetti` components
  - `builtInThemes` object with theme presets
  - `registerTheme`, `getTheme`, `listThemes` theme registry functions
  - `useWindowSize` custom hook
  - UI type exports: `NotificationComponent`, `ModalComponent`, `ConfettiComponent`, `UIConfig`, `ThemeConfig`, etc.

- **ConfettiWrapper**: Updated to use custom useWindowSize hook
  - Removed react-use import dependency
  - Maintains same functionality with built-in implementation

### Deprecated
- **External UI Dependencies**: Showing deprecation warnings
  - `react-toastify`: Replaced by BuiltInNotification
  - `react-modal`: Replaced by BuiltInModal
  - `react-confetti`: Replaced by BuiltInConfetti
  - `react-use`: Replaced by custom useWindowSize hook
  - Warning appears once per session when detected
  - Will be fully optional in v4.0.0

### Documentation
- **README.md**: Comprehensive v3.6.0 documentation
  - Installation options (with/without external deps)
  - Built-in UI System section with complete examples
  - Theme preset documentation (modern, minimal, gamified)
  - Custom theme creation guide
  - Shareable theme packages guide
  - Theme registry API reference
  - Component injection examples
  - BadgesButton placement modes (fixed vs inline)
  - Migration guide for existing users
  - Deprecation timeline

- **Storybook**: New interactive stories
  - Notification theme demonstrations
  - Notification position variants
  - Modal theme demonstrations
  - Confetti animation demo
  - BadgesButton placement modes
  - Theme registry demonstration
  - Complete integration demo

### Backward Compatibility
- ✅ **100% Backward Compatible**: All existing v3.5.0 code works without changes
- ✅ External dependencies detected and used automatically if installed
- ✅ All hooks (useAchievements, useSimpleAchievements) unchanged
- ✅ Simple API and Complex API configurations unaffected
- ✅ All v3.5.0 code works without modifications in v3.6.0
- ✅ Opt-in migration path with `useBuiltInUI={true}` prop

### Migration Guide (v3.5.0 → v3.6.0)

**For Existing Projects** - Two options:

Option 1: No changes (keep using external dependencies)
- Your code works exactly as before
- You'll see a one-time deprecation warning in console
- Plan to migrate before v4.0.0

Option 2: Migrate to built-in UI
```tsx
// Add useBuiltInUI prop
<AchievementProvider
  achievements={config}
  useBuiltInUI={true}  // NEW
  ui={{ theme: 'modern' }}  // Optional theme
>
  <YourApp />
</AchievementProvider>

// Test your app, then remove external dependencies:
// npm uninstall react-toastify react-modal react-confetti react-use
```

**For New Projects** - Use built-in UI automatically:
```bash
npm install react-achievements react react-dom
```

### Deprecation Timeline
- **v3.6.0** (current): Built-in UI available, external deps optional with warning
- **v3.7.0-v3.9.0**: Continued support for both systems
- **v4.0.0**: External dependencies fully optional, built-in UI default

---

## [3.5.0] - 2025-12-18

### Added

#### Show All Achievements Feature
- **BadgesModal Enhancement**: New optional props to display both locked and unlocked achievements
  - `showAllAchievements` (boolean): Enable display of all achievements including locked ones (default: `false`)
  - `showUnlockConditions` (boolean): Show unlock requirement hints for locked achievements (default: `false`)
  - `allAchievements` (AchievementWithStatus[]): Array of all achievements with their unlock status

- **Visual Distinction for Locked Achievements**: Clear UI differentiation between locked and unlocked states
  - Grayed out appearance with 50% opacity
  - Lock icon (🔒) displayed on locked achievements
  - Dimmed achievement icons (40% opacity)
  - Lighter text colors for better visual hierarchy
  - Optional unlock condition hints to guide users

- **Provider Enhancement**: New `getAllAchievements()` method
  - Returns all configured achievements with their unlock status
  - Works with both Simple API and Complex API
  - Available through `useAchievements()` and `useSimpleAchievements()` hooks

- **Styling Support**: Extended style customization options
  - `lockIcon`: Custom styles for the lock icon
  - `lockedAchievementItem`: Custom styles for locked achievement items

---

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
