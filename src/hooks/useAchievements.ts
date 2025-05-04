import { useContext } from 'react';
import { AchievementContext } from '../providers/AchievementProvider';

export const useAchievements = () => {
  const context = useContext(AchievementContext);
  if (!context) {
    throw new Error('useAchievements must be used within an AchievementProvider');
  }
  return context;
}; 