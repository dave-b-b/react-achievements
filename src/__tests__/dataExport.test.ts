import { exportAchievementData, createConfigHash } from '../core/utils/dataExport';
import { importAchievementData, ImportResult } from '../core/utils/dataImport';
import { AchievementMetrics } from '../core/types';

describe('Data Export/Import', () => {
  const mockMetrics: AchievementMetrics = {
    score: [100],
    level: [5],
  };

  const mockUnlocked = ['score_100', 'level_5'];

  describe('exportAchievementData', () => {
    it('should export data with correct structure', () => {
      const exported = exportAchievementData(mockMetrics, mockUnlocked);
      const parsed = JSON.parse(exported);

      expect(parsed).toHaveProperty('version', '3.3.0');
      expect(parsed).toHaveProperty('timestamp');
      expect(parsed).toHaveProperty('metrics');
      expect(parsed).toHaveProperty('unlockedAchievements');
      expect(parsed.metrics).toEqual(mockMetrics);
      expect(parsed.unlockedAchievements).toEqual(mockUnlocked);
    });

    it('should include config hash when provided', () => {
      const configHash = 'test-hash';
      const exported = exportAchievementData(mockMetrics, mockUnlocked, configHash);
      const parsed = JSON.parse(exported);

      expect(parsed).toHaveProperty('configHash', configHash);
    });
  });

  describe('importAchievementData', () => {
    it('should successfully import valid data with replace strategy', () => {
      const exported = exportAchievementData(mockMetrics, mockUnlocked);
      const result = importAchievementData(
        exported,
        {},
        [],
        { mergeStrategy: 'replace', validate: true }
      );

      expect(result.success).toBe(true);
      expect(result.imported.metrics).toBe(2);
      expect(result.imported.achievements).toBe(2);
    });

    it('should merge data with merge strategy', () => {
      const exported = exportAchievementData(mockMetrics, mockUnlocked);
      const currentMetrics: AchievementMetrics = { coins: [50] };
      const currentUnlocked = ['coins_50'];

      const result = importAchievementData(
        exported,
        currentMetrics,
        currentUnlocked,
        { mergeStrategy: 'merge', validate: true }
      );

      expect(result.success).toBe(true);
      if ('mergedMetrics' in result && 'mergedUnlocked' in result) {
        const typedResult = result as ImportResult & {
          mergedMetrics: AchievementMetrics;
          mergedUnlocked: string[];
        };
        expect(typedResult.mergedMetrics).toHaveProperty('score');
        expect(typedResult.mergedMetrics).toHaveProperty('level');
        expect(typedResult.mergedMetrics).toHaveProperty('coins');
        expect(typedResult.mergedUnlocked).toContain('score_100');
        expect(typedResult.mergedUnlocked).toContain('level_5');
        expect(typedResult.mergedUnlocked).toContain('coins_50');
      }
    });

    it('should preserve existing data with preserve strategy', () => {
      const exported = exportAchievementData(mockMetrics, mockUnlocked);
      const currentMetrics: AchievementMetrics = { score: [200] };
      const currentUnlocked = ['score_200'];

      const result = importAchievementData(
        exported,
        currentMetrics,
        currentUnlocked,
        { mergeStrategy: 'preserve', validate: true }
      );

      expect(result.success).toBe(true);
      if ('mergedMetrics' in result) {
        const typedResult = result as ImportResult & {
          mergedMetrics: AchievementMetrics;
          mergedUnlocked: string[];
        };
        // Should keep current score (200), not imported (100)
        expect(typedResult.mergedMetrics.score).toEqual([200]);
        // Should add level from import
        expect(typedResult.mergedMetrics.level).toEqual([5]);
      }
    });

    it('should reject invalid JSON', () => {
      const result = importAchievementData(
        'invalid json',
        mockMetrics,
        mockUnlocked,
        { validate: true }
      );

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Invalid JSON format');
    });

    it('should validate required fields', () => {
      const invalidData = JSON.stringify({ invalid: 'data' });
      const result = importAchievementData(
        invalidData,
        mockMetrics,
        mockUnlocked,
        { validate: true }
      );

      expect(result.success).toBe(false);
      expect(result.errors?.length).toBeGreaterThan(0);
    });

    it('should warn about config hash mismatch', () => {
      const exported = exportAchievementData(mockMetrics, mockUnlocked, 'hash1');
      const result = importAchievementData(
        exported,
        mockMetrics,
        mockUnlocked,
        { validate: true, expectedConfigHash: 'hash2' }
      );

      expect(result.success).toBe(false);
      expect(result.errors?.some(e => e.includes('Configuration mismatch'))).toBe(true);
    });
  });

  describe('createConfigHash', () => {
    it('should create consistent hash for same config', () => {
      const config = { score: { 100: { title: 'Test' } } };
      const hash1 = createConfigHash(config);
      const hash2 = createConfigHash(config);

      expect(hash1).toBe(hash2);
    });

    it('should create different hash for different configs', () => {
      const config1 = { score: { 100: { title: 'Test 1' } } };
      const config2 = { score: { 100: { title: 'Test 2' } } };
      const hash1 = createConfigHash(config1);
      const hash2 = createConfigHash(config2);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('Round-trip export/import', () => {
    it('should preserve data through export and import cycle', () => {
      // Export
      const exported = exportAchievementData(mockMetrics, mockUnlocked);

      // Import
      const result = importAchievementData(
        exported,
        {},
        [],
        { mergeStrategy: 'replace', validate: true }
      );

      expect(result.success).toBe(true);
      if ('mergedMetrics' in result && 'mergedUnlocked' in result) {
        const typedResult = result as ImportResult & {
          mergedMetrics: AchievementMetrics;
          mergedUnlocked: string[];
        };
        expect(typedResult.mergedMetrics).toEqual(mockMetrics);
        expect(typedResult.mergedUnlocked).toEqual(mockUnlocked);
      }
    });
  });
});