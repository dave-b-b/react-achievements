import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { LevelProgress } from '../../src';

const meta: Meta<typeof LevelProgress> = {
  title: 'Components/LevelProgress',
  component: LevelProgress,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    theme: {
      control: 'select',
      options: ['modern', 'minimal', 'gamified'],
    },
    showValues: {
      control: 'boolean',
    },
    showPercent: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof LevelProgress>;

export const Default: Story = {
  args: {
    level: 3,
    currentXP: 120,
    nextLevelXP: 200,
  },
};

export const MinimalTheme: Story = {
  args: {
    level: 8,
    currentXP: 480,
    nextLevelXP: 800,
    theme: 'minimal',
  },
};

export const GamifiedTheme: Story = {
  args: {
    level: 12,
    currentXP: 920,
    nextLevelXP: 1200,
    theme: 'gamified',
  },
};

export const CustomStyles: Story = {
  args: {
    level: 5,
    currentXP: 75,
    nextLevelXP: 150,
    showPercent: true,
    styles: {
      container: {
        background: '#121212',
        color: '#f5f5f5',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      },
      progressTrack: {
        backgroundColor: 'rgba(255,255,255,0.15)',
      },
      progressBar: {
        backgroundColor: '#ff6b6b',
      },
      progressText: {
        fontWeight: 600,
      },
    },
  },
};

export const NoValues: Story = {
  args: {
    level: 'Master',
    currentXP: 40,
    nextLevelXP: 100,
    showValues: false,
    showPercent: false,
  },
};

const InteractiveProgressDemo = () => {
  const [level, setLevel] = useState(3);
  const [currentXP, setCurrentXP] = useState(120);
  const [nextLevelXP, setNextLevelXP] = useState(200);
  const [theme, setTheme] = useState<'modern' | 'minimal' | 'gamified'>('gamified');

  const addXP = (amount: number) => {
    setCurrentXP((previousXP) => {
      const updatedXP = previousXP + amount;

      if (updatedXP < nextLevelXP) {
        return updatedXP;
      }

      setLevel((previousLevel) => previousLevel + 1);
      setNextLevelXP((previousTarget) => previousTarget + 75);
      return updatedXP - nextLevelXP;
    });
  };

  const completeLevel = () => {
    setLevel((previousLevel) => previousLevel + 1);
    setCurrentXP(0);
    setNextLevelXP((previousTarget) => previousTarget + 75);
  };

  const reset = () => {
    setLevel(3);
    setCurrentXP(120);
    setNextLevelXP(200);
    setTheme('gamified');
  };

  return (
    <div style={interactiveShellStyle}>
      <div style={interactivePanelStyle}>
        <LevelProgress
          level={level}
          currentXP={currentXP}
          nextLevelXP={nextLevelXP}
          theme={theme}
          label="Player level"
        />

        <div style={controlGroupStyle}>
          <label style={controlLabelStyle} htmlFor="level-progress-xp">
            Current XP
          </label>
          <input
            id="level-progress-xp"
            type="range"
            min={0}
            max={nextLevelXP}
            value={currentXP}
            onChange={(event) => setCurrentXP(Number(event.target.value))}
            style={rangeStyle}
          />
        </div>

        <div style={controlGridStyle}>
          <label style={controlLabelStyle} htmlFor="level-progress-theme">
            Theme
          </label>
          <select
            id="level-progress-theme"
            value={theme}
            onChange={(event) =>
              setTheme(event.target.value as 'modern' | 'minimal' | 'gamified')
            }
            style={selectStyle}
          >
            <option value="modern">Modern</option>
            <option value="minimal">Minimal</option>
            <option value="gamified">Gamified</option>
          </select>
        </div>

        <div style={buttonRowStyle}>
          <button type="button" style={buttonStyle} onClick={() => addXP(25)}>
            Add 25 XP
          </button>
          <button type="button" style={buttonStyle} onClick={() => addXP(100)}>
            Add 100 XP
          </button>
          <button type="button" style={buttonStyle} onClick={completeLevel}>
            Complete level
          </button>
          <button type="button" style={secondaryButtonStyle} onClick={reset}>
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export const InteractiveProgress: Story = {
  parameters: {
    layout: 'fullscreen',
  },
  render: () => <InteractiveProgressDemo />,
};

const interactiveShellStyle: React.CSSProperties = {
  minHeight: '100vh',
  padding: '32px',
  background: '#F4F7FB',
  fontFamily:
    'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

const interactivePanelStyle: React.CSSProperties = {
  maxWidth: '640px',
  display: 'grid',
  gap: '18px',
};

const controlGroupStyle: React.CSSProperties = {
  display: 'grid',
  gap: '8px',
};

const controlGridStyle: React.CSSProperties = {
  display: 'grid',
  gap: '8px',
  maxWidth: '220px',
};

const controlLabelStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 600,
  color: '#1F2937',
};

const rangeStyle: React.CSSProperties = {
  width: '100%',
};

const selectStyle: React.CSSProperties = {
  minHeight: '38px',
  borderRadius: '6px',
  border: '1px solid #CBD5E1',
  padding: '0 10px',
  background: '#fff',
};

const buttonRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
};

const buttonStyle: React.CSSProperties = {
  minHeight: '38px',
  padding: '0 12px',
  border: 0,
  borderRadius: '6px',
  background: '#246BFE',
  color: '#fff',
  cursor: 'pointer',
};

const secondaryButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  background: '#6B7280',
};
