import type * as Engine from 'achievements-engine';
import type { AchievementConfetti } from '../core/types';

export type { AchievementProgress } from 'achievements-engine';
export type AchievementDto = Engine.AchievementDto<AchievementConfetti>;
export type AchievementClientSnapshot = Engine.AchievementClientSnapshot<AchievementConfetti>;
export type AchievementClientMutationResult = Engine.AchievementClientMutationResult<AchievementConfetti>;
export type AchievementClient = Engine.AchievementClient<AchievementConfetti>;
