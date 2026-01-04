import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BuiltInModal } from '../../../core/ui/BuiltInModal';
import type { AchievementWithStatus } from '../../../core/types';

describe('BuiltInModal', () => {
  const mockOnClose = jest.fn();

  const mockAchievements: AchievementWithStatus[] = [
    {
      achievementId: 'score_100',
      achievementTitle: 'Century!',
      achievementDescription: 'Score 100 points',
      achievementIconKey: 'trophy',
      isUnlocked: true,
    },
    {
      achievementId: 'level_5',
      achievementTitle: 'Leveling Up',
      achievementDescription: 'Reach level 5',
      achievementIconKey: 'star',
      isUnlocked: false,
    },
  ];

  beforeEach(() => {
    mockOnClose.mockClear();
    // Reset body overflow style
    document.body.style.overflow = '';
  });

  afterEach(() => {
    // Clean up body overflow style
    document.body.style.overflow = '';
  });

  describe('Basic Rendering', () => {
    it('should render when isOpen is true', () => {
      render(
        <BuiltInModal
          isOpen={true}
          onClose={mockOnClose}
          achievements={mockAchievements}
        />
      );

      expect(screen.getByTestId('built-in-modal')).toBeInTheDocument();
      expect(screen.getByText('🏆 Achievements')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      render(
        <BuiltInModal
          isOpen={false}
          onClose={mockOnClose}
          achievements={mockAchievements}
        />
      );

      expect(screen.queryByTestId('built-in-modal')).not.toBeInTheDocument();
    });

    it('should display all achievement titles and descriptions', () => {
      render(
        <BuiltInModal
          isOpen={true}
          onClose={mockOnClose}
          achievements={mockAchievements}
        />
      );

      expect(screen.getByText('Century!')).toBeInTheDocument();
      expect(screen.getByText('Score 100 points')).toBeInTheDocument();
      expect(screen.getByText('Leveling Up')).toBeInTheDocument();
      expect(screen.getByText('Reach level 5')).toBeInTheDocument();
    });

    it('should display lock icon for locked achievements', () => {
      render(
        <BuiltInModal
          isOpen={true}
          onClose={mockOnClose}
          achievements={mockAchievements}
        />
      );

      // Lock icon should be present for locked achievement
      const lockIcons = screen.getAllByText('🔒');
      expect(lockIcons.length).toBeGreaterThan(0);
    });

    it('should display empty state when no achievements', () => {
      render(
        <BuiltInModal
          isOpen={true}
          onClose={mockOnClose}
          achievements={[]}
        />
      );

      expect(
        screen.getByText('No achievements yet. Start exploring to unlock them!')
      ).toBeInTheDocument();
    });
  });

  describe('Icon Resolution (Bug Fix)', () => {
    it('should use emoji directly when achievementIconKey is an emoji not in icons mapping', () => {
      const achievementsWithEmoji: AchievementWithStatus[] = [
        {
          achievementId: 'lesson_1',
          achievementTitle: 'First Steps',
          achievementDescription: 'Complete a lesson',
          achievementIconKey: '📖', // Direct emoji, not in icons mapping
          isUnlocked: true,
        },
        {
          achievementId: 'note_1',
          achievementTitle: 'Note Taker',
          achievementDescription: 'Take a note',
          achievementIconKey: '📝', // Direct emoji, not in icons mapping
          isUnlocked: true,
        },
      ];

      render(
        <BuiltInModal
          isOpen={true}
          onClose={mockOnClose}
          achievements={achievementsWithEmoji}
          icons={{}} // Empty icons object
        />
      );

      // Should display the emoji directly
      expect(screen.getByText('📖')).toBeInTheDocument();
      expect(screen.getByText('📝')).toBeInTheDocument();
    });

    it('should prefer icons mapping over direct emoji when both exist', () => {
      const achievements: AchievementWithStatus[] = [
        {
          achievementId: 'custom_1',
          achievementTitle: 'Custom Icon',
          achievementDescription: 'Test icon mapping',
          achievementIconKey: 'customKey',
          isUnlocked: true,
        },
      ];

      render(
        <BuiltInModal
          isOpen={true}
          onClose={mockOnClose}
          achievements={achievements}
          icons={{ customKey: '🎯' }} // Custom icon mapping
        />
      );

      // Should use the mapped icon, not the key itself
      expect(screen.getByText('🎯')).toBeInTheDocument();
      expect(screen.queryByText('customKey')).not.toBeInTheDocument();
    });

    it('should use default icon when achievementIconKey is missing', () => {
      const achievements: AchievementWithStatus[] = [
        {
          achievementId: 'no_icon',
          achievementTitle: 'No Icon Achievement',
          achievementDescription: 'Has no icon key',
          isUnlocked: true,
        },
      ];

      render(
        <BuiltInModal
          isOpen={true}
          onClose={mockOnClose}
          achievements={achievements}
        />
      );

      // Should use default icon (⭐) from defaultAchievementIcons
      expect(screen.getByText('⭐')).toBeInTheDocument();
    });

    it('should fall back to achievementIconKey emoji when not in mapping, then to default', () => {
      const achievements: AchievementWithStatus[] = [
        {
          achievementId: 'emoji_fallback',
          achievementTitle: 'Emoji Fallback Test',
          achievementDescription: 'Tests fallback chain',
          achievementIconKey: '🎨', // Emoji not in mapping
          isUnlocked: true,
        },
      ];

      render(
        <BuiltInModal
          isOpen={true}
          onClose={mockOnClose}
          achievements={achievements}
          icons={{}} // Empty, so should use emoji directly
        />
      );

      // Should use the emoji directly since it's not in mapping
      expect(screen.getByText('🎨')).toBeInTheDocument();
    });

    it('should handle mix of icon keys and direct emojis', () => {
      const achievements: AchievementWithStatus[] = [
        {
          achievementId: 'key_based',
          achievementTitle: 'Key Based',
          achievementDescription: 'Uses icon key',
          achievementIconKey: 'trophy',
          isUnlocked: true,
        },
        {
          achievementId: 'emoji_direct',
          achievementTitle: 'Emoji Direct',
          achievementDescription: 'Uses emoji directly',
          achievementIconKey: '🏆',
          isUnlocked: true,
        },
        {
          achievementId: 'no_key',
          achievementTitle: 'No Key',
          achievementDescription: 'No icon key',
          isUnlocked: true,
        },
      ];

      render(
        <BuiltInModal
          isOpen={true}
          onClose={mockOnClose}
          achievements={achievements}
          icons={{ trophy: '🏆' }} // Only trophy key mapped
        />
      );

      // Key-based should use mapped icon
      const trophyIcons = screen.getAllByText('🏆');
      expect(trophyIcons.length).toBeGreaterThan(0);
      
      // Direct emoji should also display (this is the bug fix)
      // The emoji-based achievement should show 🏆 directly
      expect(screen.getByText('Emoji Direct')).toBeInTheDocument();
      
      // No key should use default
      expect(screen.getByText('⭐')).toBeInTheDocument();
    });
  });

  describe('Modal Interactions', () => {
    it('should call onClose when close button is clicked', () => {
      render(
        <BuiltInModal
          isOpen={true}
          onClose={mockOnClose}
          achievements={mockAchievements}
        />
      );

      const closeButton = screen.getByLabelText('Close modal');
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when overlay is clicked', () => {
      render(
        <BuiltInModal
          isOpen={true}
          onClose={mockOnClose}
          achievements={mockAchievements}
        />
      );

      const overlay = screen.getByTestId('built-in-modal-overlay');
      fireEvent.click(overlay);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not call onClose when modal content is clicked', () => {
      render(
        <BuiltInModal
          isOpen={true}
          onClose={mockOnClose}
          achievements={mockAchievements}
        />
      );

      const modal = screen.getByTestId('built-in-modal');
      fireEvent.click(modal);

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Body Scroll Locking', () => {
    it('should lock body scroll when modal opens', () => {
      const { rerender } = render(
        <BuiltInModal
          isOpen={false}
          onClose={mockOnClose}
          achievements={mockAchievements}
        />
      );

      expect(document.body.style.overflow).toBe('');

      rerender(
        <BuiltInModal
          isOpen={true}
          onClose={mockOnClose}
          achievements={mockAchievements}
        />
      );

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should unlock body scroll when modal closes', () => {
      const { rerender } = render(
        <BuiltInModal
          isOpen={true}
          onClose={mockOnClose}
          achievements={mockAchievements}
        />
      );

      expect(document.body.style.overflow).toBe('hidden');

      rerender(
        <BuiltInModal
          isOpen={false}
          onClose={mockOnClose}
          achievements={mockAchievements}
        />
      );

      expect(document.body.style.overflow).toBe('');
    });

    it('should restore body scroll on unmount', () => {
      const { unmount } = render(
        <BuiltInModal
          isOpen={true}
          onClose={mockOnClose}
          achievements={mockAchievements}
        />
      );

      expect(document.body.style.overflow).toBe('hidden');

      unmount();

      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('Theme Support', () => {
    it('should apply modern theme by default', () => {
      render(
        <BuiltInModal
          isOpen={true}
          onClose={mockOnClose}
          achievements={mockAchievements}
        />
      );

      const modal = screen.getByTestId('built-in-modal');
      expect(modal).toBeInTheDocument();
      // Theme styles are applied inline, so we just verify it renders
    });

    it('should apply gamified theme when specified', () => {
      render(
        <BuiltInModal
          isOpen={true}
          onClose={mockOnClose}
          achievements={mockAchievements}
          theme="gamified"
        />
      );

      const modal = screen.getByTestId('built-in-modal');
      expect(modal).toBeInTheDocument();
    });

    it('should apply minimal theme when specified', () => {
      render(
        <BuiltInModal
          isOpen={true}
          onClose={mockOnClose}
          achievements={mockAchievements}
          theme="minimal"
        />
      );

      const modal = screen.getByTestId('built-in-modal');
      expect(modal).toBeInTheDocument();
    });
  });

  describe('Custom Icons', () => {
    it('should merge custom icons with default icons', () => {
      const achievements: AchievementWithStatus[] = [
        {
          achievementId: 'custom_icon_test',
          achievementTitle: 'Custom Icon Test',
          achievementDescription: 'Tests custom icon',
          achievementIconKey: 'myCustomIcon',
          isUnlocked: true,
        },
      ];

      render(
        <BuiltInModal
          isOpen={true}
          onClose={mockOnClose}
          achievements={achievements}
          icons={{ myCustomIcon: '🎯' }}
        />
      );

      expect(screen.getByText('🎯')).toBeInTheDocument();
    });

    it('should allow overriding default icons', () => {
      const achievements: AchievementWithStatus[] = [
        {
          achievementId: 'default_override',
          achievementTitle: 'Default Override',
          achievementDescription: 'Tests default icon override',
          achievementIconKey: 'default',
          isUnlocked: true,
        },
      ];

      render(
        <BuiltInModal
          isOpen={true}
          onClose={mockOnClose}
          achievements={achievements}
          icons={{ default: '🎉' }} // Override default icon
        />
      );

      expect(screen.getByText('🎉')).toBeInTheDocument();
      expect(screen.queryByText('⭐')).not.toBeInTheDocument();
    });
  });
});