import React, { useContext, useEffect } from 'react';
import { AchievementContext } from '../../providers/AchievementProvider';
import { AchievementUIContext } from '../../providers/WebAchievementProvider';
import type {
  AchievementUIBackdropBlur,
  AchievementUIDensity,
  AchievementWithStatus,
  StylesProps,
} from '../types';
import { defaultAchievementIcons } from '../icons/defaultIcons';
import { defaultStyles } from '../styles/defaultStyles';
import { getBackdropBlurFilter, getBackdropBlurStyles } from '../utils/backdropBlur';
import { AchievementsList, AchievementsListProps } from './AchievementsList';

export interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievements?: AchievementWithStatus[];
  title?: React.ReactNode;
  styles?: StylesProps['badgesModal'];
  icons?: Record<string, string>;
  showLocked?: boolean;
  showUnlockConditions?: boolean;
  emptyState?: React.ReactNode;
  renderAchievement?: AchievementsListProps['renderAchievement'];
  theme?: string;
  hideScrollbar?: boolean;
  density?: AchievementUIDensity;
  backdropBlur?: AchievementUIBackdropBlur;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose,
  achievements,
  title = '🏆 Achievements',
  styles = {},
  icons = {},
  showLocked = true,
  showUnlockConditions = false,
  emptyState,
  renderAchievement,
  theme,
  hideScrollbar = false,
  density = 'comfortable',
  backdropBlur,
}) => {
  const context = useContext(AchievementContext);
  const uiContext = useContext(AchievementUIContext);

  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const CustomModal = uiContext.ui.ModalComponent;
  const sourceAchievements = achievements || context?.getAllAchievements();
  const modalAchievements = showLocked
    ? sourceAchievements
    : sourceAchievements?.filter((achievement) => achievement.isUnlocked);
  const resolvedTheme = theme || uiContext.ui.theme || 'modern';
  const backdropBlurFilter = getBackdropBlurFilter(backdropBlur);
  const mergedIcons = {
    ...defaultAchievementIcons,
    ...context?.icons,
    ...uiContext.icons,
    ...icons,
  };

  if (CustomModal) {
    if (!modalAchievements) {
      throw new Error(
        'AchievementsModal requires either an achievements prop or an AchievementProvider parent.'
      );
    }

    return (
      <CustomModal
        isOpen={isOpen}
        onClose={onClose}
        achievements={modalAchievements}
        icons={mergedIcons}
        theme={resolvedTheme}
        hideScrollbar={hideScrollbar}
        density={density}
        backdropBlur={backdropBlur}
      />
    );
  }

  return (
    <div
      style={{
        ...defaultStyles.badgesModal.overlay,
        ...styles?.overlay,
        ...getBackdropBlurStyles(backdropBlur),
      }}
      role="presentation"
      onClick={onClose}
      data-backdrop-blur={backdropBlurFilter}
      data-testid="achievements-modal-overlay"
    >
      {hideScrollbar && (
        <style>
          {`
            [data-react-achievements-modal-content][data-hide-scrollbar="true"] {
              scrollbar-width: none;
              -ms-overflow-style: none;
            }

            [data-react-achievements-modal-content][data-hide-scrollbar="true"]::-webkit-scrollbar {
              display: none;
            }
          `}
        </style>
      )}
      <div
        style={{ ...defaultStyles.badgesModal.content, ...styles?.content }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="achievements-modal-title"
        onClick={(event) => event.stopPropagation()}
        data-hide-scrollbar={hideScrollbar ? 'true' : undefined}
        data-density={density}
        data-react-achievements-modal-content
        data-testid="achievements-modal"
      >
        <div style={{ ...defaultStyles.badgesModal.header, ...styles?.header }}>
          <h2 id="achievements-modal-title" style={{ margin: 0 }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{ ...defaultStyles.badgesModal.closeButton, ...styles?.closeButton }}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <AchievementsList
          achievements={modalAchievements}
          showLocked={showLocked}
          showUnlockConditions={showUnlockConditions}
          icons={icons}
          styles={styles}
          emptyState={emptyState}
          renderAchievement={renderAchievement}
          density={density}
        />
      </div>
    </div>
  );
};
