import type { AchievementConfetti } from '../core/types';

export interface AchievementProgress {
  current: number;
  target: number;
  percent: number;
}

export interface AchievementDto {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  iconKey?: string;
  isUnlocked: boolean;
  unlockedAt?: string | null;
  progress?: AchievementProgress;
  metadata?: Record<string, unknown>;
  confetti?: AchievementConfetti;
}

export interface AchievementClientSnapshot {
  achievements: AchievementDto[];
  unlockedIds: string[];
  unlockedAchievements: AchievementDto[];
  unlockedCount: number;
  totalCount: number;
  metrics?: Record<string, unknown>;
}

export interface AchievementClientMutationResult {
  snapshot: AchievementClientSnapshot;
  newlyUnlocked: AchievementDto[];
}

export interface AchievementClient {
  getSnapshot(): Promise<AchievementClientSnapshot>;
  track(metric: string, value: unknown): Promise<AchievementClientMutationResult>;
  trackMany?(metrics: Record<string, unknown>): Promise<AchievementClientMutationResult>;
  increment(metric: string, amount?: number): Promise<AchievementClientMutationResult>;
  event(name: string, payload?: unknown): Promise<AchievementClientMutationResult>;
  reset?(): Promise<AchievementClientSnapshot>;
}

