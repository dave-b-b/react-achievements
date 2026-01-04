import { useContext } from 'react';
import { AchievementContext } from '../providers/AchievementProvider';

export const useAchievements = () => {
  const context = useContext(AchievementContext);

  if (!context) {
    throw new Error('useAchievements must be used within an AchievementProvider');
  }

  // STRICT CHECK: Detect if Provider has injected engine (new pattern)
  if (!context._isLegacyPattern) {
    throw new Error(
      'Cannot use useAchievements when AchievementProvider has injected engine.\n\n' +
      'You are using the NEW event-based pattern.\n' +
      'useAchievements is for the OLD metric-based pattern only.\n\n' +
      'Use engine.emit() instead:\n' +
      '  const engine = useAchievementEngine();\n' +
      '  engine.emit("eventName", data);\n\n' +
      'Or switch to the old pattern:\n' +
      '  <AchievementProvider achievements={config}>\n' +
      '  const { track } = useAchievements();\n' +
      '  track("score", 100);'
    );
  }

  return context;
}; 