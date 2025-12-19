/**
 * Legacy UI library detection system
 * Attempts to dynamically import external UI libraries
 * Shows deprecation warnings when detected
 */

export interface LegacyLibraries {
  toast?: any;
  ToastContainer?: any;
  Modal?: any;
  Confetti?: any;
  useWindowSize?: any;
}

let cachedLibraries: LegacyLibraries | null = null;
let detectionAttempted = false;
let deprecationWarningShown = false;

/**
 * Attempts to dynamically import legacy UI libraries
 * Uses try/catch to gracefully handle missing dependencies
 * Caches result to avoid multiple import attempts
 *
 * @returns Promise resolving to LegacyLibraries object
 */
export async function detectLegacyLibraries(): Promise<LegacyLibraries> {
  if (detectionAttempted && cachedLibraries !== null) {
    return cachedLibraries;
  }

  detectionAttempted = true;
  const libraries: LegacyLibraries = {};

  // Try to import react-toastify
  try {
    const toastifyModule = await import('react-toastify');
    libraries.toast = toastifyModule.toast;
    libraries.ToastContainer = toastifyModule.ToastContainer;
  } catch {
    // Not installed, will use built-in notification
  }

  // Try to import react-modal
  try {
    const modalModule = await import('react-modal');
    libraries.Modal = modalModule.default;
  } catch {
    // Not installed, will use built-in modal
  }

  // Try to import react-confetti
  try {
    const confettiModule = await import('react-confetti');
    libraries.Confetti = confettiModule.default;
  } catch {
    // Not installed, will use built-in confetti
  }

  // Try to import react-use (only for useWindowSize)
  try {
    const reactUseModule = await import('react-use');
    libraries.useWindowSize = reactUseModule.useWindowSize;
  } catch {
    // Not installed, will use built-in useWindowSize
  }

  cachedLibraries = libraries;

  // Show deprecation warning if ANY legacy library is found
  if (!deprecationWarningShown && Object.keys(libraries).length > 0) {
    const foundLibraries = [];
    if (libraries.toast) foundLibraries.push('react-toastify');
    if (libraries.Modal) foundLibraries.push('react-modal');
    if (libraries.Confetti) foundLibraries.push('react-confetti');
    if (libraries.useWindowSize) foundLibraries.push('react-use');

    console.warn(
      `[react-achievements] DEPRECATION WARNING: External UI dependencies (${foundLibraries.join(
        ', '
      )}) are deprecated and will become fully optional in v4.0.0.\n\n` +
        `The library now includes built-in UI components with modern design and theme support.\n\n` +
        `To migrate:\n` +
        `1. Add "useBuiltInUI={true}" to your AchievementProvider\n` +
        `2. Test your application (UI will change to modern theme)\n` +
        `3. Optionally customize with theme="minimal" or theme="gamified"\n` +
        `4. Remove external dependencies from package.json\n\n` +
        `To silence this warning, set useBuiltInUI={true} in AchievementProvider.\n\n` +
        `Learn more: https://github.com/dave-b-b/react-achievements#migration-guide`
    );
    deprecationWarningShown = true;
  }

  return libraries;
}

/**
 * Synchronous check if libraries are already loaded
 * Does not trigger detection if not already attempted
 *
 * @returns Boolean indicating if legacy libraries were detected
 */
export function hasLegacyLibraries(): boolean {
  return (
    detectionAttempted &&
    cachedLibraries !== null &&
    Object.keys(cachedLibraries).length > 0
  );
}

/**
 * Get cached legacy libraries without re-detection
 * Returns null if detection hasn't been attempted yet
 *
 * @returns Cached LegacyLibraries or null
 */
export function getCachedLegacyLibraries(): LegacyLibraries | null {
  return cachedLibraries;
}

/**
 * Reset detection state (useful for testing)
 *
 * @internal
 */
export function resetDetection(): void {
  cachedLibraries = null;
  detectionAttempted = false;
  deprecationWarningShown = false;
}
