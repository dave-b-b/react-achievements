/**
 * Base error class for all achievement-related errors
 */
export class AchievementError extends Error {
  constructor(
    message: string,
    public code: string,
    public recoverable: boolean,
    public remedy?: string
  ) {
    super(message);
    this.name = 'AchievementError';

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AchievementError);
    }
  }
}

/**
 * Error thrown when browser storage quota is exceeded
 */
export class StorageQuotaError extends AchievementError {
  constructor(public bytesNeeded: number) {
    super(
      'Browser storage quota exceeded. Achievement data could not be saved.',
      'STORAGE_QUOTA_EXCEEDED',
      true,
      'Clear browser storage, reduce the number of achievements, or use an external database backend. You can export your current data using exportData() before clearing storage.'
    );
    this.name = 'StorageQuotaError';
  }
}

/**
 * Error thrown when imported data fails validation
 */
export class ImportValidationError extends AchievementError {
  constructor(public validationErrors: string[]) {
    super(
      `Imported data failed validation: ${validationErrors.join(', ')}`,
      'IMPORT_VALIDATION_ERROR',
      true,
      'Check that the imported data was exported from a compatible version and matches your current achievement configuration.'
    );
    this.name = 'ImportValidationError';
  }
}

/**
 * Error thrown when storage operations fail
 */
export class StorageError extends AchievementError {
  constructor(message: string, public originalError?: Error) {
    super(
      message,
      'STORAGE_ERROR',
      true,
      'Check browser storage permissions and available space. If using custom storage, verify the implementation is correct.'
    );
    this.name = 'StorageError';
  }
}

/**
 * Error thrown when configuration is invalid
 */
export class ConfigurationError extends AchievementError {
  constructor(message: string) {
    super(
      message,
      'CONFIGURATION_ERROR',
      false,
      'Review your achievement configuration and ensure it follows the correct format.'
    );
    this.name = 'ConfigurationError';
  }
}

/**
 * Error thrown when sync operations fail (for async storage backends)
 */
export class SyncError extends AchievementError {
  constructor(message: string, public originalError?: Error) {
    super(
      message,
      'SYNC_ERROR',
      true,
      'Check your network connection and backend server status. The operation will be retried automatically.'
    );
    this.name = 'SyncError';
  }
}

/**
 * Type guard to check if an error is an AchievementError
 */
export function isAchievementError(error: unknown): error is AchievementError {
  return error instanceof AchievementError;
}

/**
 * Type guard to check if an error is recoverable
 */
export function isRecoverableError(error: unknown): boolean {
  return isAchievementError(error) && error.recoverable;
}