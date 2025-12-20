import React from 'react';
import { AchievementWithStatus } from '../types';

/**
 * Notification component interface
 * Displays achievement unlock notifications
 */
export interface NotificationProps {
  achievement: {
    id: string;
    title: string;
    description: string;
    icon: string;
  };
  onClose?: () => void;
  duration?: number;
  position?: NotificationPosition;
  theme?: string;
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
}

export type ModalComponent = React.FC<ModalProps>;

/**
 * Confetti component interface
 * Displays celebration animation
 */
export interface ConfettiProps {
  show: boolean;
  duration?: number;
  particleCount?: number;
  colors?: string[];
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
  confetti: {
    colors: string[];
    particleCount: number;
    shapes?: ('circle' | 'square')[];
  };
}

/**
 * UI Configuration for AchievementProvider
 * Allows customization of all UI components
 */
export interface UIConfig {
  /**
   * Custom notification component
   * If not provided, uses built-in or legacy component based on detection
   */
  NotificationComponent?: NotificationComponent;

  /**
   * Custom modal component
   * If not provided, uses built-in or legacy component based on detection
   */
  ModalComponent?: ModalComponent;

  /**
   * Custom confetti component
   * If not provided, uses built-in or legacy component based on detection
   */
  ConfettiComponent?: ConfettiComponent;

  /**
   * Theme to use (built-in name or registered custom theme name)
   * Built-in themes: 'modern' (default), 'minimal', 'gamified'
   */
  theme?: string;

  /**
   * Direct theme configuration override
   * Takes precedence over theme name
   */
  customTheme?: ThemeConfig;

  /**
   * Notification positioning
   * @default 'top-center'
   */
  notificationPosition?: NotificationPosition;

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
   * Enable/disable modal
   * @default true
   */
  enableModal?: boolean;
}
