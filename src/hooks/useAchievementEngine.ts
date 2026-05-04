import { useContext } from 'react';
import { AchievementContext } from '../providers/AchievementProvider';
import type { AchievementEngine } from 'achievements-engine';

/**
 * Access the active AchievementEngine instance.
 *
 * In v4 this works with both provider-created engines (`achievements` prop) and
 * injected engines (`engine` prop).
 */
export const useAchievementEngine = (): AchievementEngine => {
  const context = useContext(AchievementContext);

  if (!context) {
    throw new Error(
      'useAchievementEngine must be used within an AchievementProvider.\n\n' +
        'Wrap your component tree:\n' +
        '<AchievementProvider achievements={achievements}>\n' +
        '  <YourComponent />\n' +
        '</AchievementProvider>'
    );
  }

  return context.engine;
};
