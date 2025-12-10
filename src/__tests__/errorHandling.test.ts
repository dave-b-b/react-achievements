import {
  AchievementError,
  StorageQuotaError,
  ImportValidationError,
  StorageError,
  ConfigurationError,
  SyncError,
  isAchievementError,
  isRecoverableError
} from '../core/errors/AchievementErrors';

describe('Error Handling System', () => {
  describe('AchievementError (Base Class)', () => {
    it('should create error with all required properties', () => {
      const error = new AchievementError(
        'Test error message',
        'TEST_CODE',
        true,
        'Test remedy'
      );

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AchievementError);
      expect(error.message).toBe('Test error message');
      expect(error.code).toBe('TEST_CODE');
      expect(error.recoverable).toBe(true);
      expect(error.remedy).toBe('Test remedy');
      expect(error.name).toBe('AchievementError');
    });

    it('should work without remedy', () => {
      const error = new AchievementError(
        'Test error',
        'TEST_CODE',
        false
      );

      expect(error.remedy).toBeUndefined();
    });

    it('should have proper stack trace', () => {
      const error = new AchievementError('Test', 'CODE', true);
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('AchievementError');
    });
  });

  describe('StorageQuotaError', () => {
    it('should create error with correct properties', () => {
      const error = new StorageQuotaError(5000);

      expect(error).toBeInstanceOf(AchievementError);
      expect(error.message).toBe('Browser storage quota exceeded. Achievement data could not be saved.');
      expect(error.code).toBe('STORAGE_QUOTA_EXCEEDED');
      expect(error.recoverable).toBe(true);
      expect(error.bytesNeeded).toBe(5000);
      expect(error.name).toBe('StorageQuotaError');
    });

    it('should include remedy guidance', () => {
      const error = new StorageQuotaError(1000);
      expect(error.remedy).toBeDefined();
      expect(error.remedy).toContain('Clear browser storage');
      expect(error.remedy).toContain('exportData()');
    });

    it('should be recoverable', () => {
      const error = new StorageQuotaError(1000);
      expect(error.recoverable).toBe(true);
    });
  });

  describe('ImportValidationError', () => {
    it('should create error with validation errors array', () => {
      const validationErrors = ['Missing field: version', 'Invalid metrics format'];
      const error = new ImportValidationError(validationErrors);

      expect(error).toBeInstanceOf(AchievementError);
      expect(error.message).toContain('Imported data failed validation');
      expect(error.message).toContain('Missing field: version');
      expect(error.message).toContain('Invalid metrics format');
      expect(error.code).toBe('IMPORT_VALIDATION_ERROR');
      expect(error.recoverable).toBe(true);
      expect(error.validationErrors).toEqual(validationErrors);
      expect(error.name).toBe('ImportValidationError');
    });

    it('should include remedy guidance', () => {
      const error = new ImportValidationError(['test error']);
      expect(error.remedy).toBeDefined();
      expect(error.remedy).toContain('compatible version');
      expect(error.remedy).toContain('achievement configuration');
    });
  });

  describe('StorageError', () => {
    it('should create error with message', () => {
      const error = new StorageError('Failed to save data');

      expect(error).toBeInstanceOf(AchievementError);
      expect(error.message).toBe('Failed to save data');
      expect(error.code).toBe('STORAGE_ERROR');
      expect(error.recoverable).toBe(true);
      expect(error.name).toBe('StorageError');
    });

    it('should store original error', () => {
      const originalError = new Error('Original error');
      const error = new StorageError('Wrapper error', originalError);

      expect(error.originalError).toBe(originalError);
    });

    it('should include remedy guidance', () => {
      const error = new StorageError('Test error');
      expect(error.remedy).toBeDefined();
      expect(error.remedy).toContain('storage permissions');
      expect(error.remedy).toContain('available space');
    });
  });

  describe('ConfigurationError', () => {
    it('should create error with message', () => {
      const error = new ConfigurationError('Invalid achievement configuration');

      expect(error).toBeInstanceOf(AchievementError);
      expect(error.message).toBe('Invalid achievement configuration');
      expect(error.code).toBe('CONFIGURATION_ERROR');
      expect(error.recoverable).toBe(false);
      expect(error.name).toBe('ConfigurationError');
    });

    it('should NOT be recoverable', () => {
      const error = new ConfigurationError('Bad config');
      expect(error.recoverable).toBe(false);
    });

    it('should include remedy guidance', () => {
      const error = new ConfigurationError('Test error');
      expect(error.remedy).toBeDefined();
      expect(error.remedy).toContain('achievement configuration');
      expect(error.remedy).toContain('correct format');
    });
  });

  describe('SyncError', () => {
    it('should create error with message', () => {
      const error = new SyncError('Failed to sync with backend');

      expect(error).toBeInstanceOf(AchievementError);
      expect(error.message).toBe('Failed to sync with backend');
      expect(error.code).toBe('SYNC_ERROR');
      expect(error.recoverable).toBe(true);
      expect(error.name).toBe('SyncError');
    });

    it('should store original error', () => {
      const originalError = new Error('Network error');
      const error = new SyncError('Sync failed', originalError);

      expect(error.originalError).toBe(originalError);
    });

    it('should include remedy guidance', () => {
      const error = new SyncError('Test error');
      expect(error.remedy).toBeDefined();
      expect(error.remedy).toContain('network connection');
      expect(error.remedy).toContain('backend server');
      expect(error.remedy).toContain('retried automatically');
    });
  });

  describe('Type Guards', () => {
    describe('isAchievementError', () => {
      it('should identify AchievementError instances', () => {
        const achievementError = new AchievementError('test', 'CODE', true);
        expect(isAchievementError(achievementError)).toBe(true);
      });

      it('should identify StorageQuotaError as AchievementError', () => {
        const error = new StorageQuotaError(1000);
        expect(isAchievementError(error)).toBe(true);
      });

      it('should identify ImportValidationError as AchievementError', () => {
        const error = new ImportValidationError(['error']);
        expect(isAchievementError(error)).toBe(true);
      });

      it('should identify StorageError as AchievementError', () => {
        const error = new StorageError('error');
        expect(isAchievementError(error)).toBe(true);
      });

      it('should identify ConfigurationError as AchievementError', () => {
        const error = new ConfigurationError('error');
        expect(isAchievementError(error)).toBe(true);
      });

      it('should identify SyncError as AchievementError', () => {
        const error = new SyncError('error');
        expect(isAchievementError(error)).toBe(true);
      });

      it('should reject regular Error', () => {
        const regularError = new Error('regular error');
        expect(isAchievementError(regularError)).toBe(false);
      });

      it('should reject non-Error values', () => {
        expect(isAchievementError(null)).toBe(false);
        expect(isAchievementError(undefined)).toBe(false);
        expect(isAchievementError('string')).toBe(false);
        expect(isAchievementError(123)).toBe(false);
        expect(isAchievementError({})).toBe(false);
      });
    });

    describe('isRecoverableError', () => {
      it('should identify recoverable AchievementErrors', () => {
        const recoverableError = new StorageQuotaError(1000);
        expect(isRecoverableError(recoverableError)).toBe(true);
      });

      it('should identify non-recoverable AchievementErrors', () => {
        const nonRecoverableError = new ConfigurationError('bad config');
        expect(isRecoverableError(nonRecoverableError)).toBe(false);
      });

      it('should return false for regular errors', () => {
        const regularError = new Error('regular');
        expect(isRecoverableError(regularError)).toBe(false);
      });

      it('should return false for non-Error values', () => {
        expect(isRecoverableError(null)).toBe(false);
        expect(isRecoverableError(undefined)).toBe(false);
        expect(isRecoverableError('string')).toBe(false);
      });
    });
  });

  describe('Error Properties Validation', () => {
    const errorTypes = [
      { name: 'StorageQuotaError', create: () => new StorageQuotaError(1000), recoverable: true },
      { name: 'ImportValidationError', create: () => new ImportValidationError(['error']), recoverable: true },
      { name: 'StorageError', create: () => new StorageError('error'), recoverable: true },
      { name: 'ConfigurationError', create: () => new ConfigurationError('error'), recoverable: false },
      { name: 'SyncError', create: () => new SyncError('error'), recoverable: true },
    ];

    errorTypes.forEach(({ name, create, recoverable }) => {
      describe(name, () => {
        it('should have correct error code', () => {
          const error = create();
          expect(error.code).toBeDefined();
          expect(error.code).toBeTruthy();
          expect(typeof error.code).toBe('string');
        });

        it(`should ${recoverable ? '' : 'NOT '}be recoverable`, () => {
          const error = create();
          expect(error.recoverable).toBe(recoverable);
        });

        it('should have remedy guidance', () => {
          const error = create();
          expect(error.remedy).toBeDefined();
          expect(typeof error.remedy).toBe('string');
          expect(error.remedy!.length).toBeGreaterThan(0);
        });

        it('should have meaningful message', () => {
          const error = create();
          expect(error.message).toBeDefined();
          expect(error.message.length).toBeGreaterThan(0);
        });

        it('should be instance of AchievementError', () => {
          const error = create();
          expect(error).toBeInstanceOf(AchievementError);
        });
      });
    });
  });

  describe('Error Message Quality', () => {
    it('all error messages should be user-friendly', () => {
      const errors = [
        new StorageQuotaError(1000),
        new ImportValidationError(['Test error']),
        new StorageError('Test error'),
        new ConfigurationError('Test error'),
        new SyncError('Test error')
      ];

      errors.forEach(error => {
        // Message should not contain technical jargon
        expect(error.message).not.toMatch(/undefined|null|NaN/);
        // Message should be meaningful
        expect(error.message.length).toBeGreaterThan(0);
      });
    });

    it('all remedies should provide actionable guidance', () => {
      const errors = [
        new StorageQuotaError(1000),
        new ImportValidationError(['test']),
        new StorageError('test'),
        new ConfigurationError('test'),
        new SyncError('test')
      ];

      errors.forEach(error => {
        expect(error.remedy).toBeDefined();
        // Remedy should be meaningful
        expect(error.remedy!.length).toBeGreaterThan(20);
      });
    });
  });

  describe('Error Code Uniqueness', () => {
    it('should have unique error codes for each error type', () => {
      const errors = [
        new StorageQuotaError(1000),
        new ImportValidationError(['test']),
        new StorageError('test'),
        new ConfigurationError('test'),
        new SyncError('test')
      ];

      const codes = errors.map(e => e.code);
      const uniqueCodes = new Set(codes);

      expect(uniqueCodes.size).toBe(codes.length);
    });
  });
});
