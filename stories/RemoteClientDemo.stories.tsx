import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  AchievementProvider,
  AchievementsList,
  AchievementsWidget,
  createRestAchievementClient,
  useSimpleAchievements,
} from '../src';
import type { AchievementClient, AchievementClientSnapshot, SimpleAchievementConfig } from '../src';
import { createMockAchievementClient } from './mocks/achievementClient';

const meta: Meta = {
  title: 'Client/Remote Achievement Client',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Stories for the v5 server-backed client model. Storybook uses mock clients; production apps can use createRestAchievementClient against their own backend.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

const achievements: SimpleAchievementConfig = {
  score: {
    100: { title: 'Century', description: 'Score 100 points', icon: '🏆' },
    500: { title: 'High Scorer', description: 'Score 500 points', icon: '⭐' },
  },
  completedTutorial: {
    true: { title: 'Tutorial Complete', description: 'Complete the tutorial', icon: '📚' },
  },
};

const DemoControls = () => {
  const {
    track,
    increment,
    event,
    reset,
    refresh,
    unlockedCount,
    totalCount,
    isLoading,
    error,
  } = useSimpleAchievements();

  return (
    <main style={pageStyle}>
      <section style={panelStyle}>
        <h1 style={{ marginTop: 0 }}>Remote Achievement Client</h1>
        <p style={mutedTextStyle}>
          These controls call the same client methods a real app would call against
          `/api/achievements`.
        </p>
        <div style={statusRowStyle}>
          <strong>{isLoading ? 'Loading...' : `${unlockedCount} / ${totalCount} unlocked`}</strong>
          {error && <span style={{ color: '#B91C1C' }}>{error.message}</span>}
        </div>
        <div style={buttonGridStyle}>
          <button style={buttonStyle} onClick={() => track('score', 100)}>
            Track score 100
          </button>
          <button style={buttonStyle} onClick={() => increment('score', 100)}>
            Increment score
          </button>
          <button style={buttonStyle} onClick={() => event('tutorial.completed')}>
            Send tutorial event
          </button>
          <button style={secondaryButtonStyle} onClick={() => refresh()}>
            Refresh
          </button>
          <button style={secondaryButtonStyle} onClick={reset}>
            Reset
          </button>
        </div>
      </section>

      <section style={panelStyle}>
        <h2 style={{ marginTop: 0 }}>Current Snapshot</h2>
        <AchievementsList />
      </section>

      <AchievementsWidget />
    </main>
  );
};

const createDemoClient = () => createMockAchievementClient({
  achievements,
  eventMapping: {
    'tutorial.completed': () => ({ completedTutorial: true }),
  },
});

export const MockRemoteClient: Story = {
  render: () => (
    <AchievementProvider client={createDemoClient()}>
      <DemoControls />
    </AchievementProvider>
  ),
};

export const PreloadedSnapshot: Story = {
  render: () => (
    <AchievementProvider
      client={createMockAchievementClient({
        achievements,
        initialMetrics: { score: 500, completedTutorial: true },
        initiallyUnlockedIds: ['score_100', 'score_500', 'completedTutorial_true'],
      })}
      ui={{ enableNotifications: false, enableConfetti: false }}
    >
      <DemoControls />
    </AchievementProvider>
  ),
};

export const ErrorState: Story = {
  render: () => (
    <AchievementProvider client={createErrorClient()}>
      <DemoControls />
    </AchievementProvider>
  ),
};

export const RestClientConfiguration: Story = {
  render: () => {
    const client = createRestAchievementClient({
      baseUrl: '/api/achievements',
      headers: () => ({ Authorization: 'Bearer story-token' }),
    });

    return (
      <main style={pageStyle}>
        <section style={panelStyle}>
          <h1 style={{ marginTop: 0 }}>REST Client Setup</h1>
          <p style={mutedTextStyle}>
            This story shows the production client configuration shape. It does not
            make live network calls in Storybook.
          </p>
          <pre style={preStyle}>
{`const client = createRestAchievementClient({
  baseUrl: '/api/achievements',
  headers: () => ({ Authorization: 'Bearer token' })
});

<AchievementProvider client={client}>
  <App />
</AchievementProvider>`}
          </pre>
          <small style={mutedTextStyle}>Client created: {client ? 'yes' : 'no'}</small>
        </section>
      </main>
    );
  },
};

const createErrorClient = (): AchievementClient => ({
  async getSnapshot(): Promise<AchievementClientSnapshot> {
    throw new Error('Storybook mock API failed');
  },
  async track() {
    throw new Error('Storybook mock API failed');
  },
  async increment() {
    throw new Error('Storybook mock API failed');
  },
  async event() {
    throw new Error('Storybook mock API failed');
  },
});

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  padding: '32px',
  background: '#F4F7FB',
  color: '#172033',
  fontFamily:
    'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

const panelStyle: React.CSSProperties = {
  maxWidth: '840px',
  margin: '0 auto 20px',
  padding: '20px',
  background: '#FFFFFF',
  border: '1px solid #D8E0EA',
  borderRadius: '8px',
  boxShadow: '0 12px 32px rgba(23, 32, 51, 0.08)',
};

const mutedTextStyle: React.CSSProperties = {
  color: '#5D6B7A',
};

const statusRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '16px',
  margin: '18px 0',
};

const buttonGridStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '10px',
};

const buttonStyle: React.CSSProperties = {
  border: '1px solid #246BFE',
  background: '#246BFE',
  color: '#FFFFFF',
  borderRadius: '6px',
  padding: '9px 12px',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
};

const secondaryButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  background: '#FFFFFF',
  color: '#172033',
  border: '1px solid #C6D0DC',
};

const preStyle: React.CSSProperties = {
  background: '#111827',
  color: '#F9FAFB',
  borderRadius: '8px',
  padding: '16px',
  overflow: 'auto',
};

