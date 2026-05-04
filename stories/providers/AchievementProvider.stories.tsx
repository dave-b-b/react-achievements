import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  AchievementProvider,
  AchievementsList,
  AchievementsWidget,
  StorageType,
  useAchievements,
  useSimpleAchievements,
} from '../../src';
import type { SimpleAchievementConfig } from '../../src';

/**
 * `AchievementProvider` is the v4 web provider. It creates or accepts an
 * achievement engine, provides hooks, and renders built-in notifications and
 * confetti by default.
 */
const meta: Meta<typeof AchievementProvider> = {
  title: 'Providers/AchievementProvider',
  component: AchievementProvider,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Wrap an app with AchievementProvider, track progress with hooks, and render AchievementsWidget or AchievementsList anywhere in the tree.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    achievements: {
      description: 'Configuration object defining achievements and their unlock conditions',
      control: 'object',
    },
    storage: {
      description: 'Storage type for persisting achievement state',
      control: 'select',
      options: [StorageType.Memory, StorageType.Local],
      table: {
        defaultValue: { summary: StorageType.Memory },
      },
    },
    children: {
      description: 'Child components that can use achievement hooks and UI',
      control: false,
    },
  },
};

export default meta;
type Story = StoryObj<typeof AchievementProvider>;

const achievementConfig: SimpleAchievementConfig = {
  score: {
    100: { title: 'Century', description: 'Score 100 points', icon: '🏆' },
    200: { title: 'Double Century', description: 'Score 200 points', icon: '⭐' },
  },
  login: {
    true: { title: 'First Login', description: 'Log in for the first time', icon: '🔑' },
  },
};

const ProviderDemo = () => {
  const { update, reset, getState } = useAchievements();
  const { unlockedIds, unlockedCount } = useSimpleAchievements();

  return (
    <div style={{ padding: '32px', fontFamily: 'Arial, sans-serif', maxWidth: '920px', margin: '0 auto' }}>
      <h1>Achievement Provider Demo</h1>
      <p>Click the buttons below to update metrics and unlock achievements.</p>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button onClick={() => update({ score: 100 })} style={buttonStyle('#4CAF50')}>
          Score 100
        </button>
        <button onClick={() => update({ score: 200 })} style={buttonStyle('#2196F3')}>
          Score 200
        </button>
        <button onClick={() => update({ login: true })} style={buttonStyle('#7C3AED')}>
          Login
        </button>
        <button onClick={reset} style={buttonStyle('#6B7280')}>
          Reset
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
        <section style={panelStyle}>
          <h2 style={{ marginTop: 0 }}>State</h2>
          <p><strong>Unlocked:</strong> {unlockedCount}</p>
          <pre style={preStyle}>{JSON.stringify(unlockedIds, null, 2)}</pre>
          <pre style={preStyle}>{JSON.stringify(getState().metrics, null, 2)}</pre>
        </section>

        <section style={panelStyle}>
          <h2 style={{ marginTop: 0 }}>Inline List</h2>
          <AchievementsList />
        </section>
      </div>

      <AchievementsWidget />
    </div>
  );
};

const InlineWidgetDemo = () => (
  <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '280px 1fr', fontFamily: 'Arial, sans-serif' }}>
    <aside style={{ background: '#111827', color: '#F9FAFB', padding: '20px', display: 'grid', alignContent: 'start', gap: '8px' }}>
      <strong style={{ padding: '10px 12px' }}>Product Console</strong>
      <span style={drawerItemStyle}>Overview</span>
      <span style={drawerItemStyle}>Reports</span>
      <AchievementsWidget
        placement="inline"
        label="Achievements"
        renderTrigger={({ buttonProps, unlockedCount, totalCount }) => (
          <button
            {...buttonProps}
            style={{
              ...drawerItemStyle,
              color: '#F9FAFB',
              background: 'rgba(255, 255, 255, 0.08)',
              border: 0,
              display: 'flex',
              justifyContent: 'space-between',
              width: '100%',
              cursor: 'pointer',
            }}
          >
            <span>Achievements</span>
            <span>{unlockedCount}/{totalCount}</span>
          </button>
        )}
      />
    </aside>
    <main style={{ padding: '32px' }}>
      <ProviderDemo />
    </main>
  </div>
);

export const WithMemoryStorage: Story = {
  args: {
    achievements: achievementConfig,
    storage: StorageType.Memory,
  },
  render: (args) => (
    <AchievementProvider {...args}>
      <ProviderDemo />
    </AchievementProvider>
  ),
};

export const WithLocalStorage: Story = {
  args: {
    achievements: achievementConfig,
    storage: StorageType.Local,
  },
  render: (args) => (
    <AchievementProvider {...args}>
      <ProviderDemo />
    </AchievementProvider>
  ),
};

export const InlineDrawerWidget: Story = {
  args: {
    achievements: achievementConfig,
    storage: StorageType.Memory,
  },
  render: (args) => (
    <AchievementProvider {...args}>
      <InlineWidgetDemo />
    </AchievementProvider>
  ),
};

export const InlineAchievementsList: Story = {
  args: {
    achievements: achievementConfig,
    storage: StorageType.Memory,
  },
  render: (args) => (
    <AchievementProvider {...args}>
      <div style={{ padding: '32px', maxWidth: '760px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
        <ProviderDemo />
        <section style={{ ...panelStyle, marginTop: '20px' }}>
          <h2 style={{ marginTop: 0 }}>Unlocked Only</h2>
          <AchievementsList showLocked={false} emptyState="No achievements unlocked yet." />
        </section>
      </div>
    </AchievementProvider>
  ),
};

const buttonStyle = (backgroundColor: string): React.CSSProperties => ({
  padding: '10px 15px',
  backgroundColor,
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
});

const panelStyle: React.CSSProperties = {
  padding: '18px',
  backgroundColor: '#fff',
  border: '1px solid #D8E0EA',
  borderRadius: '8px',
};

const preStyle: React.CSSProperties = {
  backgroundColor: '#F5F7FA',
  padding: '10px',
  borderRadius: '6px',
  overflow: 'auto',
};

const drawerItemStyle: React.CSSProperties = {
  padding: '11px 12px',
  borderRadius: '6px',
  color: '#D1D5DB',
};
