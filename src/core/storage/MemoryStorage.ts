import { AchievementStorage, AchievementMetrics } from '../types';

export class MemoryStorage implements AchievementStorage {
  private metrics: AchievementMetrics = {};
  private unlockedAchievements: string[] = [];

  constructor() {}

  getMetrics(): AchievementMetrics {
    return this.metrics;
  }

  setMetrics(metrics: AchievementMetrics): void {
    this.metrics = metrics;
  }

  getUnlockedAchievements(): string[] {
    return this.unlockedAchievements;
  }

  setUnlockedAchievements(achievements: string[]): void {
    this.unlockedAchievements = achievements;
  }

  clear(): void {
    this.metrics = {};
    this.unlockedAchievements = [];
  }
} 