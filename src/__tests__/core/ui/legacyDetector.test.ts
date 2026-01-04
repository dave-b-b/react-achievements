import { detectLegacyLibraries, hasLegacyLibraries, getCachedLegacyLibraries, resetDetection, LegacyLibraries } from '../../../core/ui/legacyDetector';

// Note: These libraries are installed in devDependencies for testing other components.
// The tests verify that the detector correctly identifies installed libraries.
// We don't mock the dynamic imports because jest.mock() doesn't work with dynamic import() statements.

// Mock console.warn to capture deprecation warnings
const originalWarn = console.warn;
beforeAll(() => {
  console.warn = jest.fn();
});

afterAll(() => {
  console.warn = originalWarn;
});

describe('Legacy Detector', () => {
  beforeEach(() => {
    resetDetection();
    jest.clearAllMocks();
  });

  describe('detectLegacyLibraries', () => {
    it('should detect installed legacy libraries', async () => {
      const libraries = await detectLegacyLibraries();
      // Libraries are installed in devDependencies, so they should be detected
      expect(libraries).toBeDefined();
      expect(typeof libraries).toBe('object');
      // At minimum, verify the structure is correct
      expect(libraries).toHaveProperty('toast');
      expect(libraries).toHaveProperty('Modal');
      expect(libraries).toHaveProperty('Confetti');
      expect(libraries).toHaveProperty('useWindowSize');
    });

    it('should cache results on subsequent calls', async () => {
      const firstCall = await detectLegacyLibraries();
      const secondCall = await detectLegacyLibraries();
      
      // Should return same object reference (cached)
      expect(firstCall).toBe(secondCall);
    });

    it('should show deprecation warning when libraries are found', async () => {
      resetDetection();
      await detectLegacyLibraries();
      // Since libraries are installed, warning should be shown
      expect(console.warn).toHaveBeenCalled();
      const warningMessage = (console.warn as jest.Mock).mock.calls[0][0];
      expect(warningMessage).toContain('DEPRECATION WARNING');
      expect(warningMessage).toContain('react-toastify');
    });
  });

  describe('hasLegacyLibraries', () => {
    it('should return false before detection is attempted', () => {
      resetDetection();
      expect(hasLegacyLibraries()).toBe(false);
    });

    it('should return true after detection when libraries are installed', async () => {
      await detectLegacyLibraries();
      // Since libraries are installed, this should return true
      expect(hasLegacyLibraries()).toBe(true);
    });

    it('should correctly identify when libraries are detected', async () => {
      resetDetection();
      const hasLibrariesBefore = hasLegacyLibraries();
      expect(hasLibrariesBefore).toBe(false);
      
      await detectLegacyLibraries();
      const hasLibrariesAfter = hasLegacyLibraries();
      expect(hasLibrariesAfter).toBe(true);
    });
  });

  describe('getCachedLegacyLibraries', () => {
    it('should return null before detection is attempted', () => {
      resetDetection();
      expect(getCachedLegacyLibraries()).toBeNull();
    });

    it('should return cached libraries after detection', async () => {
      await detectLegacyLibraries();
      const cached = getCachedLegacyLibraries();
      expect(cached).not.toBeNull();
      expect(typeof cached).toBe('object');
    });
  });

  describe('resetDetection', () => {
    it('should reset detection state', async () => {
      await detectLegacyLibraries();
      expect(getCachedLegacyLibraries()).not.toBeNull();
      
      resetDetection();
      expect(getCachedLegacyLibraries()).toBeNull();
      expect(hasLegacyLibraries()).toBe(false);
    });

    it('should allow re-detection after reset', async () => {
      await detectLegacyLibraries();
      const firstResult = getCachedLegacyLibraries();
      
      resetDetection();
      const secondResult = await detectLegacyLibraries();
      
      // Should be able to detect again
      expect(secondResult).toBeDefined();
      // Results might be different objects but should have same structure
      expect(typeof secondResult).toBe('object');
    });
  });

  describe('deprecation warning', () => {
    it('should show warning when libraries are detected', async () => {
      resetDetection();
      jest.clearAllMocks();
      
      // First detection - warning should be shown
      await detectLegacyLibraries();
      expect(console.warn).toHaveBeenCalled();
      const warningMessage = (console.warn as jest.Mock).mock.calls[0][0];
      expect(warningMessage).toContain('DEPRECATION WARNING');
    });

    it('should show warning again after reset (since reset clears the flag)', async () => {
      resetDetection();
      jest.clearAllMocks();
      
      // First detection - warning should be shown
      await detectLegacyLibraries();
      const firstWarnCount = (console.warn as jest.Mock).mock.calls.length;
      expect(firstWarnCount).toBeGreaterThan(0);
      
      // Reset clears the deprecationWarningShown flag
      resetDetection();
      jest.clearAllMocks();
      
      // After reset, warning should be shown again
      await detectLegacyLibraries();
      const secondWarnCount = (console.warn as jest.Mock).mock.calls.length;
      expect(secondWarnCount).toBeGreaterThan(0);
    });
  });
});
