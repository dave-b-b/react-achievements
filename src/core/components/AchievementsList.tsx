import React, { useContext } from 'react';
import { AchievementContext } from '../../providers/AchievementProvider';
import { AchievementUIContext } from '../../providers/WebAchievementProvider';
import type { AchievementUIDensity, AchievementWithStatus, StylesProps } from '../types';
import { defaultAchievementIcons } from '../icons/defaultIcons';
import { defaultStyles } from '../styles/defaultStyles';

export interface AchievementsListRenderItemProps {
  achievement: AchievementWithStatus;
  isLocked: boolean;
  icon: string;
  index: number;
  density: AchievementUIDensity;
}

export interface AchievementsListProps {
  achievements?: AchievementWithStatus[];
  showLocked?: boolean;
  showUnlockConditions?: boolean;
  icons?: Record<string, string>;
  styles?: StylesProps['badgesModal'];
  emptyState?: React.ReactNode;
  className?: string;
  density?: AchievementUIDensity;
  renderAchievement?: (props: AchievementsListRenderItemProps) => React.ReactNode;
}

const compactAchievementStyles: StylesProps['badgesModal'] = {
  achievementList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: '10px',
  },
  achievementItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '12px 10px',
    borderRadius: '8px',
    aspectRatio: '1 / 1',
    minHeight: '120px',
    textAlign: 'center',
  },
  lockedAchievementItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '12px 10px',
    borderRadius: '8px',
    aspectRatio: '1 / 1',
    minHeight: '120px',
    textAlign: 'center',
  },
  achievementIcon: {
    fontSize: '34px',
    lineHeight: 1,
    flexShrink: 0,
  },
  achievementTitle: {
    margin: '0',
    fontSize: '13px',
    lineHeight: 1.2,
  },
  achievementDescription: {
    margin: '0',
    fontSize: '11px',
    lineHeight: 1.25,
  },
  lockIcon: {
    fontSize: '15px',
    top: '8px',
    right: '8px',
    transform: 'none',
  },
};

const getDensityStyles = (
  density: AchievementUIDensity
): StylesProps['badgesModal'] => (density === 'compact' ? compactAchievementStyles : {});

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
  density = 'comfortable',
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
  const densityStyles = getDensityStyles(density);

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
      style={{
        ...defaultStyles.badgesModal.achievementList,
        ...densityStyles?.achievementList,
        ...styles?.achievementList,
      }}
      data-density={density}
      data-testid="achievements-list"
    >
      {achievementsToDisplay.map((achievement, index) => {
        const isLocked = !achievement.isUnlocked;
        const icon = resolveIcon(achievement, mergedIcons);

        if (renderAchievement) {
          return (
            <React.Fragment key={achievement.achievementId}>
              {renderAchievement({ achievement, isLocked, icon, index, density })}
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
                    ...densityStyles?.lockedAchievementItem,
                    ...styles?.lockedAchievementItem,
                  }
                : {
                    ...defaultStyles.badgesModal.achievementItem,
                    ...densityStyles?.achievementItem,
                  }),
              ...styles?.achievementItem,
              position: 'relative',
            }}
            data-testid="achievement-list-item"
            data-unlocked={achievement.isUnlocked ? 'true' : 'false'}
          >
            <div
              style={{
                ...defaultStyles.badgesModal.achievementIcon,
                ...densityStyles?.achievementIcon,
                ...styles?.achievementIcon,
                opacity: isLocked ? 0.4 : 1,
              }}
            >
              {icon}
            </div>
            <div style={density === 'compact' ? { width: '100%', minWidth: 0 } : { flex: 1 }}>
              <h3
                style={{
                  ...defaultStyles.badgesModal.achievementTitle,
                  ...densityStyles?.achievementTitle,
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
                    ...densityStyles?.achievementDescription,
                    ...styles?.achievementDescription,
                    color: isLocked ? '#aaa' : '#666',
                  }}
                >
                  {achievement.achievementDescription}
                  {showUnlockConditions && isLocked && (
                    <span
                      style={{
                        display: 'block',
                        fontSize: density === 'compact' ? '11px' : '12px',
                        marginTop: density === 'compact' ? '2px' : '4px',
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
              <div
                style={{
                  ...defaultStyles.badgesModal.lockIcon,
                  ...densityStyles?.lockIcon,
                  ...styles?.lockIcon,
                }}
              >
                🔒
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
