import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BadgesButton from '../../components/BadgesButton';
import { defaultStyles } from '../../defaultStyles';
import type { AchievementDetails } from '../../types';

describe('BadgesButton', () => {
  const mockOnClick = jest.fn();
  const mockAchievements: AchievementDetails[] = [
    {
      achievementId: 'achievement1',
      achievementTitle: 'Achievement 1',
      achievementDescription: 'Description 1',
      achievementIconKey: 'star',
    },
    {
      achievementId: 'achievement2',
      achievementTitle: 'Achievement 2',
      achievementDescription: 'Description 2',
      achievementIconKey: 'trophy',
    },
  ];

  const defaultProps = {
    onClick: mockOnClick,
    position: 'top-right' as const,
    styles: defaultStyles.badgesButton,
    unlockedAchievements: mockAchievements,
  };

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  it('renders with default position', () => {
    render(<BadgesButton {...defaultProps} />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveStyle({
      position: 'fixed',
      top: '20px',
      right: '20px',
    });
  });

  it('renders with bottom-left position', () => {
    render(<BadgesButton {...defaultProps} position="bottom-left" />);
    const button = screen.getByRole('button');
    expect(button).toHaveStyle({
      position: 'fixed',
      bottom: '20px',
      left: '20px',
    });
  });

  it('calls onClick handler when clicked', async () => {
    const user = userEvent.setup();
    render(<BadgesButton {...defaultProps} />);
    
    await user.click(screen.getByRole('button'));
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('renders with custom styles', () => {
    const customStyles = {
      ...defaultStyles.badgesButton,
      backgroundColor: 'red',
      borderRadius: '10px',
    };
    
    render(<BadgesButton {...defaultProps} styles={customStyles} />);
    const button = screen.getByRole('button');
    expect(button).toHaveStyle({
      backgroundColor: 'red',
      borderRadius: '10px',
    });
  });

  it('renders with custom icon', () => {
    const customIcon = '🌟';
    render(<BadgesButton {...defaultProps} icon={customIcon} />);
    expect(screen.getByText(customIcon)).toBeInTheDocument();
  });

  it('applies hover styles on mouse over', () => {
    render(<BadgesButton {...defaultProps} />);
    const button = screen.getByRole('button');
    
    fireEvent.mouseEnter(button);
    expect(button).toHaveStyle({ transform: 'scale(1.1)' });
    
    fireEvent.mouseLeave(button);
    expect(button).toHaveStyle({ transform: 'scale(1)' });
  });
});