import React from 'react';
import type {
  AchievementUIBackdropBlur,
  AchievementUIDensity,
  AchievementWithStatus,
} from '../types';

/**
 * Notification component interface
 * Displays achievement unlock notifications
 */
export interface NotificationProps {
  achievement: AchievementWithStatus;
  onClose?: () => void;
  duration?: number;
  position?: NotificationPosition;
  theme?: string;
  icons?: Record<string, string>;
  /**
   * Position in the active notification stack.
   * Built-in notifications use this to avoid overlap when multiple
   * achievements unlock from the same update.
   */
  stackIndex?: number;
}

export type NotificationComponent = React.FC<NotificationProps>;

/**
 * Modal component interface
 * Displays list of achievements (locked/unlocked)
 */
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievements: AchievementWithStatus[];
  icons?: Record<string, string>;
  theme?: string;
  hideScrollbar?: boolean;
  density?: AchievementUIDensity;
  backdropBlur?: AchievementUIBackdropBlur;
}

export type ModalComponent = React.FC<ModalProps>;

export type ConfettiShape = 'square' | 'circle' | 'star';

export interface ConfettiOptions {
  /**
   * Duration in milliseconds before the built-in confetti marker is removed.
   * Custom confetti components receive this value through `duration`.
   */
  duration?: number;
  particleCount?: number;
  colors?: string[];
  shapes?: ConfettiShape[];
  spread?: number;
  startVelocity?: number;
  gravity?: number;
  scalar?: number;
  zIndex?: number;
}

/**
 * Confetti component interface
 * Displays celebration animation
 */
export interface ConfettiProps extends ConfettiOptions {
  show: boolean;
}

export type ConfettiComponent = React.FC<ConfettiProps>;

/**
 * Notification positioning options
 */
export type NotificationPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

/**
 * Theme configuration interface
 * Defines styling for all UI components
 */
export interface ThemeConfig {
  name: string;
  notification: {
    background: string;
    textColor: string;
    accentColor: string;
    borderRadius: string;
    boxShadow: string;
    fontSize?: {
      header?: string;
      title?: string;
      description?: string;
    };
  };
  modal: {
    overlayColor: string;
    background: string;
    textColor: string;
    accentColor: string;
    borderRadius: string;
    headerFontSize?: string;
    achievementCardBorderRadius?: string; // Optional: for square/badge-like achievement cards
    achievementLayout?: 'horizontal' | 'badge'; // Optional: layout style for achievement cards
  };
  confetti: ConfettiOptions & {
    colors: string[];
    particleCount: number;
  };
}

/**
 * UI Configuration for AchievementProvider
 * Allows customization of all UI components
 */
export interface UIConfig {
  /**
   * Custom notification component
   * If not provided, uses the built-in notification component.
   */
  NotificationComponent?: NotificationComponent;

  /**
   * Custom modal component used by AchievementsWidget and AchievementsModal.
   * If not provided, uses the built-in AchievementsModal implementation.
   */
  ModalComponent?: ModalComponent;

  /**
   * Custom confetti component
   * If not provided, uses the built-in confetti component.
   */
  ConfettiComponent?: ConfettiComponent;

  /**
   * Built-in theme name.
   * Built-in themes: 'modern' (default), 'minimal', 'gamified'
   */
  theme?: string;

  /**
   * Notification positioning
   * @default 'top-center'
   */
  notificationPosition?: NotificationPosition;

  /**
   * Duration in milliseconds before built-in unlock notifications dismiss.
   * Custom notification components receive this value through `duration`.
   * @default 5000
   */
  notificationDuration?: number;

  /**
   * Enable/disable notifications
   * @default true
   */
  enableNotifications?: boolean;

  /**
   * Enable/disable confetti animations
   * @default true
   */
  enableConfetti?: boolean;

  /**
   * Built-in confetti configuration. Ignored when `enableConfetti` is false.
   * Custom confetti components receive these values as props.
   */
  confetti?: ConfettiOptions;
}
