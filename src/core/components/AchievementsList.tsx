import React, { useContext } from 'react';
import { AchievementContext } from '../../providers/AchievementProvider';
import { AchievementUIContext } from '../../providers/WebAchievementProvider';
import { AchievementWithStatus, StylesProps } from '../types';
import { defaultAchievementIcons } from '../icons/defaultIcons';
import { defaultStyles } from '../styles/defaultStyles';

export interface AchievementsListRenderItemProps {
  achievement: AchievementWithStatus;
  isLocked: boolean;
  icon: string;
  index: number;
}

export interface AchievementsListProps {
  achievements?: AchievementWithStatus[];
  showLocked?: boolean;
  showUnlockConditions?: boolean;
  icons?: Record<string, string>;
  styles?: StylesProps['badgesModal'];
  emptyState?: React.ReactNode;
  className?: string;
  renderAchievement?: (props: AchievementsListRenderItemProps) => React.ReactNode;
}

const resolveIcon = (
  achievement: AchievementWithStatus,
  icons: Record<string, string>
): string => {
  return (
    (achievement.achievementIconKey && icons[achievement.achievementIconKey]) ||
    achievement.achievementIconKey ||
    icons.default ||
    '⭐'
  );
};

export const AchievementsList: React.FC<AchievementsListProps> = ({
  achievements,
  showLocked = true,
  showUnlockConditions = false,
  icons = {},
  styles = {},
  emptyState,
  className,
  renderAchievement,
}) => {
  const context = useContext(AchievementContext);
  const uiContext = useContext(AchievementUIContext);
  const mergedIcons: Record<string, string> = {
    ...defaultAchievementIcons,
    ...context?.icons,
    ...uiContext.icons,
    ...icons,
  };

  const sourceAchievements = achievements || context?.getAllAchievements();

  if (!sourceAchievements) {
    throw new Error(
      'AchievementsList requires either an achievements prop or an AchievementProvider parent.'
    );
  }

  const achievementsToDisplay = showLocked
    ? sourceAchievements
    : sourceAchievements.filter((achievement) => achievement.isUnlocked);

  if (achievementsToDisplay.length === 0) {
    return (
      <p style={{ textAlign: 'center', color: '#666' }}>
        {emptyState || 'No achievements configured.'}
      </p>
    );
  }

  return (
    <div
      className={className}
      style={{ ...defaultStyles.badgesModal.achievementList, ...styles?.achievementList }}
      data-testid="achievements-list"
    >
      {achievementsToDisplay.map((achievement, index) => {
        const isLocked = !achievement.isUnlocked;
        const icon = resolveIcon(achievement, mergedIcons);

        if (renderAchievement) {
          return (
            <React.Fragment key={achievement.achievementId}>
              {renderAchievement({ achievement, isLocked, icon, index })}
            </React.Fragment>
          );
        }

        return (
          <div
            key={achievement.achievementId}
            style={{
              ...(isLocked
                ? {
                    ...defaultStyles.badgesModal.lockedAchievementItem,
                    ...styles?.lockedAchievementItem,
                  }
                : defaultStyles.badgesModal.achievementItem),
              ...styles?.achievementItem,
              position: 'relative',
            }}
            data-testid="achievement-list-item"
            data-unlocked={achievement.isUnlocked ? 'true' : 'false'}
          >
            <div
              style={{
                ...defaultStyles.badgesModal.achievementIcon,
                ...styles?.achievementIcon,
                opacity: isLocked ? 0.4 : 1,
              }}
            >
              {icon}
            </div>
            <div style={{ flex: 1 }}>
              <h3
                style={{
                  ...defaultStyles.badgesModal.achievementTitle,
                  ...styles?.achievementTitle,
                  color: isLocked ? '#999' : undefined,
                }}
              >
                {achievement.achievementTitle}
              </h3>
              {achievement.achievementDescription && (
                <p
                  style={{
                    ...defaultStyles.badgesModal.achievementDescription,
                    ...styles?.achievementDescription,
                    color: isLocked ? '#aaa' : '#666',
                  }}
                >
                  {achievement.achievementDescription}
                  {showUnlockConditions && isLocked && (
                    <span
                      style={{
                        display: 'block',
                        fontSize: '12px',
                        marginTop: '4px',
                        fontStyle: 'italic',
                        color: '#888',
                      }}
                    >
                      🔓 {achievement.achievementDescription}
                    </span>
                  )}
                </p>
              )}
            </div>
            {isLocked && (
              <div style={{ ...defaultStyles.badgesModal.lockIcon, ...styles?.lockIcon }}>
                🔒
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
