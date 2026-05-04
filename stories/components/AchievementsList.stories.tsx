import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  AchievementProvider,
  AchievementsList,
  AchievementsWidget,
  StorageType,
  useSimpleAchievements,
} from '../../src';
import type { SimpleAchievementConfig } from '../../src';

const meta: Meta<typeof AchievementsList> = {
  title: 'Components/AchievementsList',
  component: AchievementsList,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Inline achievement list for drawers, profile pages, settings screens, and custom achievement surfaces.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AchievementsList>;

const achievements: SimpleAchievementConfig = {
  score: {
    100: { title: 'Century', description: 'Reach 100 points', icon: '🏆' },
    500: { title: 'High Scorer', description: 'Reach 500 points', icon: '⭐' },
  },
  setupComplete: {
    true: { title: 'Ready', description: 'Complete setup', icon: '✅' },
  },
};

const Actions = () => {
  const { track, reset } = useSimpleAchievements();

  return (
    <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', flexWrap: 'wrap' }}>
      <button style={buttonStyle} onClick={() => track('score', 100)}>Score 100</button>
      <button style={buttonStyle} onClick={() => track('score', 500)}>Score 500</button>
      <button style={buttonStyle} onClick={() => track('setupComplete', true)}>Complete Setup</button>
      <button style={{ ...buttonStyle, background: '#6B7280' }} onClick={reset}>Reset</button>
    </div>
  );
};

const ListProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AchievementProvider
    achievements={achievements}
    storage={StorageType.Memory}
    ui={{ enableNotifications: false, enableConfetti: false }}
  >
    {children}
  </AchievementProvider>
);

export const InlinePanel: Story = {
  render: () => (
    <ListProvider>
      <main style={pageStyle}>
        <Actions />
        <section style={panelStyle}>
          <h2 style={{ marginTop: 0 }}>All Achievements</h2>
          <AchievementsList />
        </section>
      </main>
    </ListProvider>
  ),
};

export const DrawerSurface: Story = {
  render: () => (
    <ListProvider>
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', minHeight: '100vh', fontFamily: pageStyle.fontFamily }}>
        <aside style={{ background: '#111827', color: '#fff', padding: '20px', overflow: 'auto' }}>
          <h2 style={{ marginTop: 0 }}>Achievements</h2>
          <AchievementsList
            styles={{
              achievementList: { gap: '10px' },
              achievementItem: { backgroundColor: 'rgba(255,255,255,0.08)', color: '#fff' },
              lockedAchievementItem: { backgroundColor: 'rgba(255,255,255,0.04)', color: '#9CA3AF' },
              achievementDescription: { color: '#D1D5DB' },
            }}
          />
        </aside>
        <main style={{ padding: '32px' }}>
          <Actions />
          <AchievementsWidget />
        </main>
      </div>
    </ListProvider>
  ),
};

export const UnlockedOnlyInline: Story = {
  render: () => (
    <ListProvider>
      <main style={pageStyle}>
        <Actions />
        <section style={panelStyle}>
          <h2 style={{ marginTop: 0 }}>Unlocked Achievements</h2>
          <AchievementsList showLocked={false} emptyState="No achievements unlocked yet." />
        </section>
      </main>
    </ListProvider>
  ),
};

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  padding: '32px',
  background: '#F4F7FB',
  fontFamily:
    'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

const panelStyle: React.CSSProperties = {
  maxWidth: '720px',
  padding: '20px',
  background: '#fff',
  border: '1px solid #D8E0EA',
  borderRadius: '8px',
};

const buttonStyle: React.CSSProperties = {
  padding: '9px 12px',
  border: 0,
  borderRadius: '6px',
  background: '#246BFE',
  color: '#fff',
  cursor: 'pointer',
};
