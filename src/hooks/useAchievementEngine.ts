import { useContext } from 'react';
import { AchievementContext } from '../providers/AchievementProvider';
import type { AchievementEngine } from 'achievements-engine';

/**
 * Hook to access the injected AchievementEngine instance (NEW event-based pattern)
 *
 * IMPORTANT: This hook only works when Provider has an externally created engine injected via the `engine` prop.
 * Do NOT use this hook with the old `achievements` prop pattern - use `useAchievements()` instead.
 *
 * @example
 * ```tsx
 * // Create engine outside React
 * import { AchievementEngine } from 'achievements-engine';
 *
 * const myEngine = new AchievementEngine({
 *   achievements: config,
 *   eventMapping: { 'userScored': 'score', 'levelUp': 'level' },
 *   storage: 'local'
 * });
 *
 * // Inject into Provider
 * <AchievementProvider engine={myEngine}>
 *   <App />
 * </AchievementProvider>
 *
 * function App() {
 *   const engine = useAchievementEngine();
 *   engine.emit('userScored', 100);
 *   engine.emit('levelUp', 5);
 * }
 * ```
 *
 * @returns AchievementEngine instance
 * @throws Error if used with old achievements prop pattern
 * @throws Error if used outside AchievementProvider
 * @since 3.8.0
 */
export const useAchievementEngine = (): AchievementEngine => {
  const context = useContext(AchievementContext);

  if (!context) {
    throw new Error(
      'useAchievementEngine must be used within an AchievementProvider.\n\n' +
      'Wrap your component tree:\n' +
      'const myEngine = new AchievementEngine({ achievements, eventMapping });\n' +
      '<AchievementProvider engine={myEngine}>\n' +
      '  <YourComponent />\n' +
      '</AchievementProvider>'
    );
  }

  // STRICT CHECK: Detect if Provider was initialized with achievements (old pattern)
  if (context._isLegacyPattern) {
    throw new Error(
      'Cannot use useAchievementEngine when AchievementProvider has achievements prop.\n\n' +
      'You are using the OLD metric-based pattern.\n' +
      'useAchievementEngine is for the NEW event-based pattern only.\n\n' +
      'Choose one:\n\n' +
      '1. OLD PATTERN (keep current code):\n' +
      '   <AchievementProvider achievements={config}>\n' +
      '   const { track } = useAchievements();\n' +
      '   track("score", 100);\n\n' +
      '2. NEW PATTERN (migrate to events):\n' +
      '   const engine = new AchievementEngine({ achievements, eventMapping });\n' +
      '   <AchievementProvider engine={engine}>\n' +
      '   const engine = useAchievementEngine();\n' +
      '   engine.emit("userScored", 100);'
    );
  }

  if (!context.engine) {
    throw new Error(
      'No engine available. AchievementProvider requires either:\n' +
      '1. achievements prop (old pattern)\n' +
      '2. engine prop (new pattern)'
    );
  }

  return context.engine;
};
