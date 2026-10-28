import {
  RestAchievementClient as EngineRestAchievementClient,
  createRestAchievementClient as createEngineRestAchievementClient,
} from 'achievements-engine';
import type { AchievementConfetti } from '../core/types';

// Retain React's established names and typed celebration options.
export const RestAchievementClient = EngineRestAchievementClient<AchievementConfetti>;
export type RestAchievementClient = EngineRestAchievementClient<AchievementConfetti>;
export const createRestAchievementClient = createEngineRestAchievementClient<AchievementConfetti>;
export type { RestAchievementClientConfig } from 'achievements-engine';
