import { AchievementMetrics, AchievementMetricValue } from '../types';
import { ExportedData } from './dataExport';

/**
 * Options for importing achievement data
 */
export interface ImportOptions {
  /** Strategy for merging imported data with existing data */
  mergeStrategy?: 'replace' | 'merge' | 'preserve';
  /** Whether to validate the imported data */
  validate?: boolean;
  /** Optional config hash to validate against */
  expectedConfigHash?: string;
}

/**
 * Result of an import operation
 */
export interface ImportResult {
  success: boolean;
  imported: {
    metrics: number;
    achievements: number;
  };
  errors?: string[];
  warnings?: string[];
}

/**
 * Imports achievement data from a JSON string
 *
 * @param jsonString - JSON string containing exported achievement data
 * @param currentMetrics - Current metrics state
 * @param currentUnlocked - Current unlocked achievements
 * @param options - Import options
 * @returns Import result with success status and any errors
 *
 * @example
 * ```typescript
 * const result = importAchievementData(
 *   jsonString,
 *   currentMetrics,
 *   currentUnlocked,
 *   { mergeStrategy: 'merge', validate: true }
 * );
 *
 * if (result.success) {
 *   console.log(`Imported ${result.imported.achievements} achievements`);
 * } else {
 *   console.error('Import failed:', result.errors);
 * }
 * ```
 */
export function importAchievementData(
  jsonString: string,
  currentMetrics: AchievementMetrics,
  currentUnlocked: string[],
  options: ImportOptions = {}
): ImportResult {
  const {
    mergeStrategy = 'replace',
    validate = true,
    expectedConfigHash
  } = options;

  const _errors: string[] = [];
  const warnings: string[] = [];

  // Parse JSON
  let data: ExportedData;
  try {
    data = JSON.parse(jsonString);
  } catch {
    return {
      success: false,
      imported: { metrics: 0, achievements: 0 },
      errors: ['Invalid JSON format']
    };
  }

  // Validate structure
  if (validate) {
    const validationErrors = validateExportedData(data, expectedConfigHash);
    if (validationErrors.length > 0) {
      return {
        success: false,
        imported: { metrics: 0, achievements: 0 },
        errors: validationErrors
      };
    }
  }

  // Version compatibility check
  if (data.version && data.version !== '3.3.0') {
    warnings.push(`Data exported from version ${data.version}, current version is 3.3.0`);
  }

  // Merge metrics based on strategy
  let mergedMetrics: AchievementMetrics;
  let mergedUnlocked: string[];

  switch (mergeStrategy) {
    case 'replace':
      // Replace all existing data
      mergedMetrics = data.metrics;
      mergedUnlocked = data.unlockedAchievements;
      break;

    case 'merge':
      // Union of both datasets, keeping higher metric values
      mergedMetrics = mergeMetrics(currentMetrics, data.metrics);
      mergedUnlocked = Array.from(new Set([...currentUnlocked, ...data.unlockedAchievements]));
      break;

    case 'preserve':
      // Keep existing values, only add new ones
      mergedMetrics = preserveMetrics(currentMetrics, data.metrics);
      mergedUnlocked = Array.from(new Set([...currentUnlocked, ...data.unlockedAchievements]));
      break;

    default:
      return {
        success: false,
        imported: { metrics: 0, achievements: 0 },
        errors: [`Invalid merge strategy: ${mergeStrategy}`]
      };
  }

  return {
    success: true,
    imported: {
      metrics: Object.keys(mergedMetrics).length,
      achievements: mergedUnlocked.length
    },
    ...(warnings.length > 0 && { warnings }),
    mergedMetrics,
    mergedUnlocked
  } as ImportResult & { mergedMetrics: AchievementMetrics; mergedUnlocked: string[] };
}

/**
 * Validates the structure and content of exported data
 */
function validateExportedData(data: any, expectedConfigHash?: string): string[] {
  const errors: string[] = [];

  // Check required fields
  if (!data.version) {
    errors.push('Missing version field');
  }
  if (!data.timestamp) {
    errors.push('Missing timestamp field');
  }
  if (!data.metrics || typeof data.metrics !== 'object') {
    errors.push('Missing or invalid metrics field');
  }
  if (!Array.isArray(data.unlockedAchievements)) {
    errors.push('Missing or invalid unlockedAchievements field');
  }

  // Validate config hash if provided
  if (expectedConfigHash && data.configHash && data.configHash !== expectedConfigHash) {
    errors.push('Configuration mismatch: imported data may not be compatible with current achievement configuration');
  }

  // Validate metrics structure
  if (data.metrics && typeof data.metrics === 'object') {
    for (const [key, value] of Object.entries(data.metrics)) {
      if (!Array.isArray(value)) {
        errors.push(`Invalid metric format for "${key}": expected array, got ${typeof value}`);
      }
    }
  }

  // Validate achievement IDs are strings
  if (Array.isArray(data.unlockedAchievements)) {
    const invalidIds = data.unlockedAchievements.filter((id: any) => typeof id !== 'string');
    if (invalidIds.length > 0) {
      errors.push('All achievement IDs must be strings');
    }
  }

  return errors;
}

/**
 * Merges two metrics objects, keeping higher values for overlapping keys
 */
function mergeMetrics(
  current: AchievementMetrics,
  imported: AchievementMetrics
): AchievementMetrics {
  const merged: AchievementMetrics = { ...current };

  for (const [key, importedValues] of Object.entries(imported)) {
    if (!merged[key]) {
      // New metric, add it
      merged[key] = importedValues;
    } else {
      // Existing metric, merge values
      merged[key] = mergeMetricValues(merged[key], importedValues);
    }
  }

  return merged;
}

/**
 * Merges two metric value arrays, keeping higher numeric values
 */
function mergeMetricValues(
  current: AchievementMetricValue[],
  imported: AchievementMetricValue[]
): AchievementMetricValue[] {
  // For simplicity, we'll use the imported values if they're "higher"
  // This works for numeric values; for other types, we prefer imported
  const currentValue = current[0];
  const importedValue = imported[0];

  // If both are numbers, keep the higher one
  if (typeof currentValue === 'number' && typeof importedValue === 'number') {
    return currentValue >= importedValue ? current : imported;
  }

  // For non-numeric values, prefer imported (assume it's newer)
  return imported;
}

/**
 * Preserves existing metrics, only adding new ones from imported data
 */
function preserveMetrics(
  current: AchievementMetrics,
  imported: AchievementMetrics
): AchievementMetrics {
  const preserved: AchievementMetrics = { ...current };

  for (const [key, value] of Object.entries(imported)) {
    if (!preserved[key]) {
      // Only add if it doesn't exist
      preserved[key] = value;
    }
    // If it exists, keep current value (preserve strategy)
  }

  return preserved;
}