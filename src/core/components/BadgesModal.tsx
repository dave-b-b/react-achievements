import React, { useEffect } from 'react';
import { AchievementDetails, AchievementWithStatus, StylesProps } from '../types';
import { AchievementsModal } from './AchievementsModal';
import { warnDeprecation } from '../utils/deprecation';

export interface BadgesModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievements: AchievementDetails[];
  styles?: StylesProps['badgesModal'];
  icons?: Record<string, string>;
  showAllAchievements?: boolean;
  showUnlockConditions?: boolean;
  allAchievements?: AchievementWithStatus[];
}

/**
 * @deprecated Use `AchievementsModal`, `AchievementsWidget`, or
 * `AchievementsList` for new integrations. This v3 compatibility wrapper will
 * be removed in a future major release.
 */
export const BadgesModal: React.FC<BadgesModalProps> = ({
  isOpen,
  onClose,
  achievements,
  styles = {},
  icons = {},
  showAllAchievements = false,
  showUnlockConditions = false,
  allAchievements,
}) => {
  useEffect(() => {
    warnDeprecation(
      '`BadgesModal` is deprecated. Use `AchievementsWidget` or `AchievementsList` instead. `BadgesModal` will be removed in a future major release.'
    );
  }, []);

  const achievementsToDisplay =
    showAllAchievements && allAchievements
      ? allAchievements
      : achievements.map((achievement) => ({
          ...achievement,
          isUnlocked: true,
        }));

  return (
    <AchievementsModal
      isOpen={isOpen}
      onClose={onClose}
      achievements={achievementsToDisplay}
      styles={styles}
      icons={icons}
      showUnlockConditions={showUnlockConditions}
    />
  );
};
