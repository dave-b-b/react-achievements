import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  createLegacyToastNotification,
  createLegacyModalWrapper,
  createLegacyConfettiWrapper,
} from '../../../core/ui/LegacyWrappers';
import type { LegacyLibraries } from '../../../core/ui/legacyDetector';
import type { AchievementWithStatus } from '../../../core/types';

// Mock the built-in components
jest.mock('../../../core/ui/BuiltInNotification', () => ({
  BuiltInNotification: ({ achievement }: { achievement: AchievementWithStatus }) => (
    <div data-testid="built-in-notification">{achievement.achievementTitle}</div>
  ),
}));

jest.mock('../../../core/ui/BuiltInModal', () => ({
  BuiltInModal: ({ achievements }: { achievements: AchievementWithStatus[] }) => (
    <div data-testid="built-in-modal">
      {achievements.map(a => (
        <div key={a.achievementId}>{a.achievementTitle}</div>
      ))}
    </div>
  ),
}));

jest.mock('../../../core/ui/BuiltInConfetti', () => ({
  BuiltInConfetti: ({ show }: { show: boolean }) => (
    show ? <div data-testid="built-in-confetti">Confetti</div> : null
  ),
}));

const mockAchievement: AchievementWithStatus = {
  achievementId: 'test-1',
  achievementTitle: 'Test Achievement',
  achievementDescription: 'Test Description',
  achievementIconKey: 'test-icon',
  isUnlocked: true,
};

describe('Legacy Wrappers', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('createLegacyToastNotification', () => {
    it('should return null when toast is not available (fallback handled by provider)', () => {
      const libraries: LegacyLibraries = {};
      const NotificationComponent = createLegacyToastNotification(libraries);
      
      const { container } = render(
        <NotificationComponent achievement={mockAchievement} />
      );
      
      // Component returns null, rendering is handled by toast library
      expect(container.firstChild).toBeNull();
    });

    it('should call toast.success when toast is available', () => {
      const mockToast = {
        success: jest.fn(),
      };
      const libraries: LegacyLibraries = { toast: mockToast };
      const NotificationComponent = createLegacyToastNotification(libraries);
      
      render(
        <NotificationComponent achievement={mockAchievement} />
      );
      
      act(() => {
        jest.runAllTimers();
      });
      
      // Toast should be called with achievement content
      expect(mockToast.success).toHaveBeenCalled();
      const callArgs = mockToast.success.mock.calls[0];
      expect(callArgs[1]).toMatchObject({
        position: 'top-right',
        autoClose: 5000,
        toastId: 'test-1',
      });
    });

    it('should use icon from icons mapping', () => {
      const mockToast = {
        success: jest.fn(),
      };
      const libraries: LegacyLibraries = { toast: mockToast };
      const NotificationComponent = createLegacyToastNotification(libraries);
      const icons = { 'test-icon': '🚀' };
      
      render(
        <NotificationComponent achievement={mockAchievement} icons={icons} />
      );
      
      act(() => {
        jest.runAllTimers();
      });
      
      expect(mockToast.success).toHaveBeenCalled();
      const callArgs = mockToast.success.mock.calls[0];
      // Check that the React element contains the icon
      const reactElement = callArgs[0] as React.ReactElement;
      expect(reactElement.props.children[0].props.children).toBe('🚀');
    });

    it('should use achievementIconKey as direct emoji if not in mapping', () => {
      const mockToast = {
        success: jest.fn(),
      };
      const libraries: LegacyLibraries = { toast: mockToast };
      const NotificationComponent = createLegacyToastNotification(libraries);
      const achievementWithEmoji: AchievementWithStatus = {
        ...mockAchievement,
        achievementIconKey: '🎉',
      };
      
      render(
        <NotificationComponent achievement={achievementWithEmoji} />
      );
      
      act(() => {
        jest.runAllTimers();
      });
      
      expect(mockToast.success).toHaveBeenCalled();
      const callArgs = mockToast.success.mock.calls[0];
      // Check that the React element contains the emoji
      const reactElement = callArgs[0] as React.ReactElement;
      expect(reactElement.props.children[0].props.children).toBe('🎉');
    });
  });

  describe('createLegacyModalWrapper', () => {
    it('should fall back to BuiltInModal when Modal is not available', () => {
      const libraries: LegacyLibraries = {};
      const ModalComponent = createLegacyModalWrapper(libraries);
      const achievements = [mockAchievement];
      
      render(
        <ModalComponent
          isOpen={true}
          onClose={jest.fn()}
          achievements={achievements}
        />
      );
      
      expect(screen.getByTestId('built-in-modal')).toBeInTheDocument();
      expect(screen.getByText('Test Achievement')).toBeInTheDocument();
    });

    it('should use react-modal when available', () => {
      const mockModal = jest.fn(({ children, isOpen, onRequestClose }) => 
        isOpen ? <div data-testid="react-modal">{children}</div> : null
      );
      const libraries: LegacyLibraries = { Modal: mockModal };
      const ModalComponent = createLegacyModalWrapper(libraries);
      const achievements = [mockAchievement];
      const onClose = jest.fn();
      
      render(
        <ModalComponent
          isOpen={true}
          onClose={onClose}
          achievements={achievements}
        />
      );
      
      expect(mockModal).toHaveBeenCalled();
      expect(screen.getByTestId('react-modal')).toBeInTheDocument();
    });

    it('should render achievements list correctly', () => {
      const libraries: LegacyLibraries = {};
      const ModalComponent = createLegacyModalWrapper(libraries);
      const achievements = [
        mockAchievement,
        {
          ...mockAchievement,
          achievementId: 'test-2',
          achievementTitle: 'Second Achievement',
          isUnlocked: false,
        },
      ];
      
      render(
        <ModalComponent
          isOpen={true}
          onClose={jest.fn()}
          achievements={achievements}
        />
      );
      
      expect(screen.getByText('Test Achievement')).toBeInTheDocument();
      expect(screen.getByText('Second Achievement')).toBeInTheDocument();
    });
  });

  describe('createLegacyConfettiWrapper', () => {
    it('should fall back to BuiltInConfetti when Confetti is not available', () => {
      const libraries: LegacyLibraries = {};
      const ConfettiComponent = createLegacyConfettiWrapper(libraries);
      
      render(
        <ConfettiComponent show={true} />
      );
      
      expect(screen.getByTestId('built-in-confetti')).toBeInTheDocument();
    });

    it('should return null when show is false and Confetti is available', () => {
      const mockConfetti = jest.fn(() => null);
      const libraries: LegacyLibraries = { Confetti: mockConfetti };
      const ConfettiComponent = createLegacyConfettiWrapper(libraries);
      
      const { container } = render(
        <ConfettiComponent show={false} />
      );
      
      expect(container.firstChild).toBeNull();
    });

    it('should use react-confetti when available', () => {
      const mockConfetti = jest.fn(({ width, height, numberOfPieces }) => (
        <div data-testid="react-confetti">
          {width}x{height} - {numberOfPieces} pieces
        </div>
      ));
      const libraries: LegacyLibraries = { Confetti: mockConfetti };
      const ConfettiComponent = createLegacyConfettiWrapper(libraries);
      
      // Mock window dimensions
      Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 768, writable: true });
      
      render(
        <ConfettiComponent show={true} particleCount={50} />
      );
      
      expect(mockConfetti).toHaveBeenCalled();
      expect(screen.getByTestId('react-confetti')).toBeInTheDocument();
    });

    it('should use legacy useWindowSize when available', () => {
      const mockConfetti = jest.fn(() => <div data-testid="react-confetti" />);
      const mockUseWindowSize = jest.fn(() => ({ width: 1920, height: 1080 }));
      const libraries: LegacyLibraries = {
        Confetti: mockConfetti,
        useWindowSize: mockUseWindowSize,
      };
      const ConfettiComponent = createLegacyConfettiWrapper(libraries);
      
      render(
        <ConfettiComponent show={true} />
      );
      
      expect(mockUseWindowSize).toHaveBeenCalled();
      expect(mockConfetti).toHaveBeenCalledWith(
        expect.objectContaining({
          width: 1920,
          height: 1080,
        }),
        expect.anything()
      );
    });

    it('should pass custom colors to confetti', () => {
      const mockConfetti = jest.fn(() => <div data-testid="react-confetti" />);
      const libraries: LegacyLibraries = { Confetti: mockConfetti };
      const ConfettiComponent = createLegacyConfettiWrapper(libraries);
      const colors = ['#ff0000', '#00ff00'];
      
      render(
        <ConfettiComponent show={true} colors={colors} />
      );
      
      expect(mockConfetti).toHaveBeenCalledWith(
        expect.objectContaining({
          colors: colors,
        }),
        expect.anything()
      );
    });
  });
});
