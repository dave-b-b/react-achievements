import React, { useContext, useState } from 'react';
import { AchievementUIContext } from '../../providers/WebAchievementProvider';
import { useAchievementState } from '../../hooks/useAchievementState';
import { AchievementWithStatus, StylesProps } from '../types';
import { builtInThemes, getTheme } from '../ui/themes';
import { AchievementsListProps } from './AchievementsList';
import { AchievementsModal } from './AchievementsModal';

export type AchievementsWidgetPosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';
export type AchievementsWidgetPlacement = 'fixed' | 'inline';

export interface AchievementsWidgetTriggerButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  'data-placement': AchievementsWidgetPlacement;
  'data-testid': string;
}

export interface AchievementsWidgetTriggerProps {
  open: () => void;
  label: string;
  unlockedCount: number;
  totalCount: number;
  unlockedAchievements: AchievementWithStatus[];
  allAchievements: AchievementWithStatus[];
  buttonProps: AchievementsWidgetTriggerButtonProps;
}

export interface AchievementsWidgetProps {
  position?: AchievementsWidgetPosition;
  placement?: AchievementsWidgetPlacement;
  showAllAchievements?: boolean;
  showUnlockConditions?: boolean;
  showCount?: boolean;
  icons?: Record<string, string>;
  theme?: string;
  label?: string;
  icon?: React.ReactNode;
  triggerClassName?: string;
  renderTrigger?: (props: AchievementsWidgetTriggerProps) => React.ReactNode;
  buttonStyles?: React.CSSProperties;
  modalStyles?: StylesProps['badgesModal'];
  modalTitle?: React.ReactNode;
  emptyState?: React.ReactNode;
  renderAchievement?: AchievementsListProps['renderAchievement'];
}

const getPositionStyles = (
  position: AchievementsWidgetPosition
): React.CSSProperties => {
  const base: React.CSSProperties = {
    position: 'fixed',
    margin: '20px',
    zIndex: 1000,
  };

  switch (position) {
    case 'top-left':
      return { ...base, top: 0, left: 0 };
    case 'top-right':
      return { ...base, top: 0, right: 0 };
    case 'bottom-left':
      return { ...base, bottom: 0, left: 0 };
    case 'bottom-right':
      return { ...base, bottom: 0, right: 0 };
  }
};

export const AchievementsWidget: React.FC<AchievementsWidgetProps> = ({
  position = 'bottom-right',
  placement = 'fixed',
  showAllAchievements = true,
  showUnlockConditions = false,
  showCount = true,
  icons,
  theme,
  label = 'Achievements',
  icon = '🏆',
  triggerClassName,
  renderTrigger,
  buttonStyles,
  modalStyles,
  modalTitle,
  emptyState,
  renderAchievement,
}) => {
  const uiContext = useContext(AchievementUIContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { unlockedAchievements, allAchievements, unlockedCount, totalCount } =
    useAchievementState();
  const resolvedTheme = theme || uiContext.ui.theme || 'modern';
  const themeConfig = getTheme(resolvedTheme) || builtInThemes.modern;
  const modalAchievements = showAllAchievements ? allAchievements : unlockedAchievements;
  const openModal = () => setIsModalOpen(true);

  const buttonBaseStyles: React.CSSProperties =
    placement === 'inline'
      ? {
          backgroundColor: 'transparent',
          color: 'inherit',
          padding: '10px 12px',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          font: 'inherit',
          width: '100%',
          textAlign: 'left',
          ...buttonStyles,
        }
      : {
          backgroundColor: themeConfig.notification.accentColor,
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '20px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '16px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
          transition: 'transform 0.2s ease-in-out',
          ...getPositionStyles(position),
          ...buttonStyles,
        };

  const buttonProps: AchievementsWidgetTriggerButtonProps = {
    type: 'button',
    onClick: openModal,
    style: buttonBaseStyles,
    className: triggerClassName,
    'data-placement': placement,
    'data-testid': 'achievements-widget-button',
    'aria-label': `${label}: ${unlockedCount} of ${totalCount} achievements unlocked`,
  };

  return (
    <>
      {renderTrigger ? (
        renderTrigger({
          open: openModal,
          label,
          unlockedCount,
          totalCount,
          unlockedAchievements,
          allAchievements,
          buttonProps,
        })
      ) : (
        <button
          {...buttonProps}
          onMouseEnter={(event) => {
            if (placement !== 'inline') {
              event.currentTarget.style.transform = 'scale(1.05)';
            }
          }}
          onMouseLeave={(event) => {
            if (placement !== 'inline') {
              event.currentTarget.style.transform = 'scale(1)';
            }
          }}
        >
          <span>{icon}</span>
          <span style={{ flex: 1 }}>{label}</span>
          {showCount && <span>{unlockedCount}</span>}
        </button>
      )}
      <AchievementsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        achievements={modalAchievements}
        showUnlockConditions={showUnlockConditions}
        icons={icons}
        styles={modalStyles}
        title={modalTitle}
        emptyState={emptyState}
        renderAchievement={renderAchievement}
        theme={resolvedTheme}
      />
    </>
  );
};
