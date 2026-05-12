# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [4.2.0] - 2026-05-12

### Added
- **Engine Snapshot Types**: Re-exported `AchievementSnapshot` and `AchievementUpdateResult` from the root and headless entry points.

### Changed
- **Engine Dependency**: Updated `achievements-engine` peer and dev dependency to `^1.2.0`.
- **Snapshot-Backed State**: `AchievementProvider` and `useAchievementState` now read canonical achievement state from the engine snapshot API.
- **Simple Increment**: `useSimpleAchievements().increment()` now delegates to the engine's numeric increment helper.
- **Compatibility Notices**: Deprecated v3 wrapper and alias guidance now points to a future major release.

### Fixed
- **Async Storage Hydration**: Provider state now waits for engine readiness so IndexedDB, REST, and custom async storage hydrate before the UI settles.

---

## [4.1.1] - 2026-05-11

### Documentation
- **README Demo**: Replaced the static compact modal screenshot with an animated demo GIF showing achievement progress and the LearnQuest modal

---

## [4.1.0] - 2026-05-04

### Added
- **Compact Achievement Badges**: `density="compact"` on `AchievementsWidget`, `AchievementsModal`, `AchievementsList`, and `BuiltInModal` renders achievements as compact square badge grids
- **Configurable Modal Backdrop Blur**: `AchievementsModal.backdropBlur`, `AchievementsWidget.modalBackdropBlur`, and `ModalProps.backdropBlur` let apps set the backdrop blur amount with a number of pixels or CSS length
- **Modal Scrollbar Control**: `AchievementsModal.hideScrollbar`, `AchievementsWidget.hideModalScrollbar`, and `ModalProps.hideScrollbar` hide scrollbar chrome while preserving modal scrolling
- **Storybook Examples**: Added compact achievement modal examples and a LearnQuest compact achievement story with lighter backdrop blur

### Changed
- **LearnQuest Modal Styling**: Reduced the default LearnQuest modal backdrop blur from the hard-coded `6px` overlay style to the configurable `2px` default
- **BuiltInModal Compact Layout**: Compact density now uses the badge grid layout instead of compressed horizontal rows

### Documentation
- Documented compact badge density, modal backdrop blur, and modal scrollbar controls in README and the styling guide

---

## [4.0.0] - 2026-05-04

### Added
- **AchievementsWidget**: New v4 happy-path component that reads from `AchievementProvider` context, shows achievement count, and opens a built-in modal with locked and unlocked achievements
- **AchievementsList**: New inline list component for drawers, sidebars, profile pages, and custom layouts
- **AchievementsModal**: Built-in modal implementation used by the new widget and compatibility wrappers
- **useAchievementState**: New state hook with explicit `unlockedIds`, `unlockedAchievements`, `allAchievements`, `unlockedCount`, `totalCount`, and `metrics`
- **Headless Entry Point**: New `react-achievements/headless` export for DOM-free React integration and custom UI foundations
- **Web Entry Point**: New `react-achievements/web` explicit alias for the web UI surface
- **Storybook Widget Examples**: Added `AchievementsWidget` stories for floating buttons, navigation bars, drawers, dashboard cards, profile menus, and combined common placements
- **Storybook Inline Examples**: Added inline `AchievementsList` stories and updated Context, Redux, Zustand, increment, provider, and built-in UI stories to show inline widgets and modal-from-existing-control patterns
- **Storybook Progress Example**: Added an interactive `LevelProgress` story with live XP controls, level completion, reset, and theme switching
- **Storybook Stacking Example**: Added a built-in UI story that unlocks multiple achievements from one update to demonstrate stacked notifications
- **Storybook Headless Example**: Added headless provider stories that import from `react-achievements/headless` and render custom controls, achievement rows, and unlock activity without built-in web UI components
- **Custom Widget Triggers**: `AchievementsWidget.renderTrigger` lets apps use their own drawer row, nav item, or profile menu trigger while keeping the built-in modal behavior
- **Custom List Rows**: `AchievementsList.renderAchievement` supports fully custom inline row rendering while retaining provider state, filtering, and icon resolution
- **Provider-Level UI Extension Points**: Provider `icons`, `ui.ModalComponent`, `ui.NotificationComponent`, and `ui.ConfettiComponent` now flow through the v4 widget/list/modal UI surface

### Changed
- **Built-in UI is now default**: `AchievementProvider` now renders built-in notifications and confetti without `useBuiltInUI`
- **Root package optimized for web adoption**: `react-achievements` exports the web-friendly provider, widget, list, hooks, engine, and compatibility components
- **Simple Hook Shape**: `useSimpleAchievements()` now returns explicit v4 state names while keeping v3 aliases temporarily
- **Engine Hook**: `useAchievementEngine()` now works with both provider-created engines and injected engines
- **Inline Widget Styling**: `AchievementsWidget` inline placement now inherits surrounding color and typography instead of forcing theme text styles
- **Notification Stacking**: Built-in achievement notifications now stack when one update unlocks multiple achievements instead of replacing earlier notifications
- **Context-Aware Modal**: `AchievementsModal` can now read achievements from `AchievementProvider` context, so apps can open the built-in modal from any existing control
- **Build Outputs**: Package now emits root, `/web`, and `/headless` ESM/CJS/type declaration bundles
- **Build Script**: Replaced the Rollup CLI command with a Rollup API runner to ensure the build process exits cleanly
- **Package Contents**: npm package output is restricted to built distribution files and excludes stale test/mock declarations
- **Compatibility Storybook Group**: Deprecated v3 UI wrappers now live under `Compatibility/*` stories so new examples point to the v4 widget/list/modal API

### Deprecated
- `useBuiltInUI` is now a no-op and will be removed in 4.2
- `BadgesButton`, `BadgesModal`, `BadgesButtonWithModal`, and `ConfettiWrapper` remain as compatibility wrappers and will be removed in 4.2
- `useSimpleAchievements().unlocked` and `useSimpleAchievements().all` remain as v3 aliases and will be removed in 4.2

### Removed
- Legacy dynamic detection for `react-toastify`, `react-modal`, `react-confetti`, and `react-use`
- External UI peer dependency requirements for `react-toastify`, `react-modal`, `react-confetti`, and `react-use`

### Documentation
- Rewrote README, quick start, intro, installation, styling, theming, and direct update docs around the v4 `AchievementsWidget` happy path
- Updated Storybook documentation around the v4 widget/list workflow
- Documented stacked notifications and live progress Storybook coverage
- Documented headless custom UI usage with provider, hooks, custom rows, and React Native guidance
- Aligned Builder API documentation with the current `achievements-engine` helpers, including value achievements and bulk score/level helpers
- Added a v3 to v4 migration guide
- Updated `AGENTS.md` with the v4 agent integration prompt

### Breaking Changes
- Built-in UI behavior is the default; legacy external UI libraries are no longer auto-detected or used
- The recommended badge/modal integration is now `AchievementsWidget`, not manually passing `unlocked` IDs into badge components
- Apps using external UI libraries through automatic detection should migrate to custom `ui.NotificationComponent` / `ui.ConfettiComponent` or the built-in UI

---

## [3.9.1] - 2026-02-07

### Added
- **AI Agent Guide**: New `AGENTS.md` with a golden-path snippet, common pitfalls, and a ready-to-use prompt template
- **README Quick Start**: 60-second minimal example and pointer to AI agent guidance

### Fixed
- **Docs Example**: Intro quick example now uses hooks inside the provider tree
- **Documentation Links**: Replaced placeholder GitHub links with the correct repository URLs

---

## [3.9.0] - 2026-02-07

### Added
- **LevelProgress Component**: New built-in, theme-aware level progress bar with style overrides
- **Styling Support**: `StylesProps.levelProgress` for granular customization
- **Storybook**: LevelProgress stories (default + theme + custom styling examples)
- **Documentation**: Added LevelProgress usage to common patterns and styling guide

---

## [3.8.0] - 2025-12-31

### Changed
  - Game engine extracted to [achievements-engine](https://www.npmjs.com/package/achievements-engine)
  - All functionality re-exported from achievements-engine - **full backward compatibility maintained**
  - Fix bug where user icons were not being displayed and were replaced with default icons
  - Add tests for ui and providers
  - Update achievements-engine to v1.1.2


---

## [3.7.0] - 2025-12-23

### Added
- **BadgesButtonWithModal Component**: New convenience component that combines `BadgesButton` and `BadgesModal` with internal state management
  - Manages modal open/close state internally

### Improved
- **Documentation**: Updated README and Docusaurus quick-start guide to showcase the simplified approach
---

## [3.6.5] - 2025-12-23
- **Docusaurus**: added docusaurus to help document API for users

## [3.6.4] - 2025-12-22

### Changed
- **Release Workflow**: Streamlined manual release process with automated validation

---


## [3.6.1 - 3.6.3] 2025-12-22

### Added
- **Comprehensive README Documentation Improvements**: Expanded documentation coverage

### Changed
- **README Demo**: Updated demo GIF/video at top of README
  - Clear comparison: ✅ Correct vs ❌ Incorrect usage
  - Better guidance for users implementing achievement history modals

### Improved
- **Developer Experience**: Better discoverability of all exported APIs
- **TypeScript Support**: Complete type reference documentation for TypeScript users
- **Storage Selection**: Clear decision matrix and use case guidance

---

## [3.6.0] - 2025-12-18

### Added
- Built-in UI components (`BuiltInNotification`, `BuiltInModal`, `BuiltInConfetti`) as alternatives to external dependencies
- Theme system with 3 built-in presets: `modern`, `minimal`, `gamified`
- `UIConfig` interface for comprehensive UI customization
- `useBuiltInUI` prop on `AchievementProvider` to opt-in to built-in UI (v3.6.0 defaults to legacy external deps)
- `BadgesButton` inline placement mode for embedding in drawers/sidebars
- Custom `useWindowSize` hook (replaces react-use dependency)

### Changed
- External UI dependencies (`react-confetti`, `react-modal`, `react-toastify`, `react-use`) marked as **optional peerDependencies** via `peerDependenciesMeta`
- npm will no longer warn if external UI packages are not installed
- Installation simplified: `npm install react-achievements` (React auto-installed by npm 7+)

### Deprecated
- External UI dependencies (`react-toastify`, `react-modal`, `react-confetti`, `react-use`) - will remain optional but built-in UI will become default in v4.0.0
- Deprecation warning shown once per session when external deps are detected

### Breaking Changes (Future)
- **v4.0.0**: Built-in UI will become the default. External UI dependencies will remain supported but require explicit opt-in.

### Backward Compatibility
- ✅ 100% compatible with v3.5.0 - all existing code works without changes
- ✅ External dependencies still used by default if installed
- ✅ Opt-in migration via `useBuiltInUI={true}` prop

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

## [3.2.0] - 2024-08-25

### Added

#### Three-Tier AchievementBuilder API
- **Smart Defaults (Tier 1)**: Zero-config achievement creation with built-in defaults
  - `createScoreAchievement(threshold)` - Instant score achievements with smart titles and icons
  - `createLevelAchievement(level)` - Level-based achievements with automatic formatting
  - `createBooleanAchievement(metric)` - Boolean achievements with camelCase → Title Case conversion
  - `createValueAchievement(metric, value)` - String-based achievements for enums/options
  - Bulk creation methods: `createScoreAchievements([100, 500, 1000])`

- **Chainable Customization (Tier 2)**: Progressive enhancement of default achievements
  - `.withAward({ title, description, icon })` - Override any achievement property
  - Fluent API for readable achievement definitions
  - Mix default and custom awards in bulk operations

- **Full Builder Control (Tier 3)**: Complex achievement logic for power users
  - `AchievementBuilder.create()` - Start a new complex achievement
  - `.withMetric(metric)` - Specify tracked metric
  - `.withCondition(fn)` - Custom condition functions with access to current metrics
  - `.withAward(award)` - Set achievement rewards
  - `.build()` - Finalize achievement configuration
  - Support for complex types: Date, null, undefined handling

- **Utility Methods**:
  - `AchievementBuilder.combine([...])` - Merge multiple achievement configs
  - Mix and match all three tiers in a single configuration
  - Compatible with Simple API configurations

### Benefits
- **95% less code** for common achievement patterns
- **Type-safe** with full TypeScript support
- **Progressive complexity** - start simple, scale as needed
- **Backward compatible** - works alongside existing Simple and Complex APIs

### Example
```tsx
// Tier 1: Smart defaults
const simple = AchievementBuilder.createScoreAchievement(100); // "Score 100!" + 🏆

// Tier 2: Chainable customization
const custom = AchievementBuilder.createScoreAchievement(500)
  .withAward({ title: 'High Scorer!', icon: '⭐' });

// Tier 3: Complex logic
const advanced = AchievementBuilder.create()
  .withMetric('perfect_combo')
  .withCondition((metrics) => metrics.score >= 1000 && metrics.accuracy === 100)
  .withAward({ title: 'Perfect!', icon: '💎' })
  .build();

// Combine all tiers
const achievements = AchievementBuilder.combine([simple, custom, advanced]);
```

---

Previous versions (0.0.1 - 3.2.1) were released before changelog tracking began.
