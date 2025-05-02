import { AchievementConfiguration, AchievementMetricValue, AchievementState } from '../types';

export class LocalStorageMock {
  private store: { [key: string]: string };

  constructor() {
    this.store = {};
  }

  clear() {
    this.store = {};
  }

  getItem(key: string) {
    return this.store[key] || null;
  }

  setItem(key: string, value: string) {
    this.store[key] = String(value);
  }

  removeItem(key: string) {
    delete this.store[key];
  }
}

const convertToNumber = (value: AchievementMetricValue): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (value instanceof Date) return value.getTime();
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

export const mockAchievementConfig: AchievementConfiguration = {
  level: [
    {
      isConditionMet: (value: AchievementMetricValue, state?: AchievementState) => {
        const numValue = convertToNumber(value);
        return numValue >= 1;
      },
      achievementDetails: {
        achievementId: 'level_1',
        achievementTitle: 'Novice',
        achievementDescription: 'Reached level 1',
        achievementIconKey: 'star',
      },
    },
  ],
  score: [
    {
      isConditionMet: (value: AchievementMetricValue, state?: AchievementState) => {
        const numValue = convertToNumber(value);
        return numValue >= 100;
      },
      achievementDetails: {
        achievementId: 'high_score',
        achievementTitle: 'High Score',
        achievementDescription: 'Scored 100 points',
        achievementIconKey: 'trophy',
      },
    },
  ],
};

export const mockInitialState = {
  level: [1],
  score: [0],
  previouslyAwardedAchievements: [],
};