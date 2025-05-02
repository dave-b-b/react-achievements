import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BadgesModal from '../../components/BadgesModal';
import { defaultStyles } from '../../defaultStyles';

describe('BadgesModal', () => {
  const mockOnClose = jest.fn();
  const mockAchievements = [
    {
      achievementId: 'test1',
      achievementTitle: 'Test Achievement 1',
      achievementDescription: 'Description 1',
      achievementIconKey: 'star',
    },
    {
      achievementId: 'test2',
      achievementTitle: 'Test Achievement 2',
      achievementDescription: 'Description 2',
      achievementIconKey: 'trophy',
    },
  ];

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    achievements: mockAchievements,
    styles: defaultStyles.badgesModal,
    icons: {
      star: '⭐',
      trophy: '🏆',
    },
  };

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('renders when isOpen is true', () => {
    render(<BadgesModal {...defaultProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<BadgesModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('displays achievements with icons', () => {
    render(<BadgesModal {...defaultProps} />);
    mockAchievements.forEach(achievement => {
      expect(screen.getByText(achievement.achievementTitle)).toBeInTheDocument();
      expect(screen.getByText(achievement.achievementDescription)).toBeInTheDocument();
    });
    expect(screen.getByText('⭐')).toBeInTheDocument();
    expect(screen.getByText('🏆')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<BadgesModal {...defaultProps} />);
    
    await user.click(screen.getByRole('button', { name: /close/i }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when clicking outside modal', async () => {
    const user = userEvent.setup();
    render(<BadgesModal {...defaultProps} />);
    
    const overlay = screen.getByTestId('modal-overlay');
    await user.click(overlay);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('renders with custom styles', () => {
    const customStyles = {
      ...defaultStyles.badgesModal,
      content: {
        ...defaultStyles.badgesModal.content,
        backgroundColor: 'red',
      },
      title: {
        ...defaultStyles.badgesModal.title,
        color: 'blue',
      },
    };
    
    render(<BadgesModal {...defaultProps} styles={customStyles} />);
    const modalContent = screen.getByRole('dialog');
    const header = screen.getByRole('heading');
    
    expect(modalContent).toHaveStyle({ backgroundColor: 'red' });
    expect(header).toHaveStyle({ color: 'blue' });
  });

  it('displays empty state when no achievements', () => {
    render(<BadgesModal {...defaultProps} achievements={[]} />);
    expect(screen.getByText(/no achievements yet/i)).toBeInTheDocument();
  });
});