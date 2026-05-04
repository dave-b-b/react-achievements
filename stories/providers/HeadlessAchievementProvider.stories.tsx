import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  AchievementProvider as HeadlessAchievementProvider,
  StorageType,
  useAchievementState,
  useSimpleAchievements,
} from '../../src/headless';
import type { AchievementWithStatus, SimpleAchievementConfig } from '../../src/headless';

/**
 * `react-achievements/headless` exposes the provider, hooks, engine, storage,
 * and types without importing the built-in web UI components.
 */
const meta: Meta<typeof HeadlessAchievementProvider> = {
  title: 'Providers/HeadlessAchievementProvider',
  component: HeadlessAchievementProvider,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Use the headless entry point when an app needs achievement state and tracking hooks but will render its own web, mobile, or native UI.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    achievements: {
      description: 'Configuration object defining achievements and unlock conditions',
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
      description: 'Custom UI rendered inside the headless provider',
      control: false,
    },
  },
};

export default meta;
type Story = StoryObj<typeof HeadlessAchievementProvider>;

const headlessAchievements: SimpleAchievementConfig = {
  score: {
    100: { title: 'Century', description: 'Reach 100 points', icon: 'trophy' },
    250: { title: 'Breakout Run', description: 'Reach 250 points', icon: 'star' },
  },
  profileComplete: {
    true: { title: 'Profile Ready', description: 'Complete the player profile', icon: 'check' },
  },
  sessions: {
    3: { title: 'Regular', description: 'Complete three sessions', icon: 'calendar' },
  },
};

const HeadlessDashboard = () => {
  const { track, increment, trackMultiple, reset } = useSimpleAchievements();
  const {
    metrics,
    unlockedIds,
    unlockedAchievements,
    allAchievements,
    unlockedCount,
    totalCount,
  } = useAchievementState();
  const unlockFeed = [...unlockedAchievements].reverse().slice(0, 5);

  const score = getMetricValue(metrics, 'score') ?? 0;
  const sessions = getMetricValue(metrics, 'sessions') ?? 0;
  const profileComplete = getMetricValue(metrics, 'profileComplete') === true;

  return (
    <main style={pageStyle}>
      <header style={headerStyle}>
        <div>
          <h1 style={headingStyle}>Headless Achievement Surface</h1>
          <p style={subtleTextStyle}>
            Custom controls, list rows, and unlock activity rendered from headless hooks.
          </p>
        </div>
        <div style={counterStyle} aria-label={`${unlockedCount} of ${totalCount} achievements unlocked`}>
          <strong>{unlockedCount}</strong>
          <span>/ {totalCount}</span>
        </div>
      </header>

      <div style={layoutStyle}>
        <section style={panelStyle} aria-labelledby="headless-controls-title">
          <h2 id="headless-controls-title" style={sectionHeadingStyle}>Controls</h2>
          <div style={metricGridStyle}>
            <MetricReadout label="Score" value={score} />
            <MetricReadout label="Sessions" value={sessions} />
            <MetricReadout label="Profile" value={profileComplete ? 'Complete' : 'Open'} />
          </div>

          <div style={buttonGroupStyle}>
            <button type="button" onClick={() => track('score', 100)} style={buttonStyle('#0F766E')}>
              Score 100
            </button>
            <button type="button" onClick={() => increment('score', 25)} style={buttonStyle('#2563EB')}>
              Add 25 score
            </button>
            <button type="button" onClick={() => increment('sessions')} style={buttonStyle('#7C3AED')}>
              Add session
            </button>
            <button type="button" onClick={() => track('profileComplete', true)} style={buttonStyle('#B45309')}>
              Complete profile
            </button>
            <button
              type="button"
              onClick={() => trackMultiple({ score: 250, profileComplete: true, sessions: 3 })}
              style={buttonStyle('#BE123C')}
            >
              Unlock batch
            </button>
            <button type="button" onClick={reset} style={secondaryButtonStyle}>
              Reset
            </button>
          </div>

          <div style={jsonBlockStyle}>
            <strong>Metrics</strong>
            <pre style={preStyle}>{JSON.stringify(metrics, null, 2)}</pre>
          </div>
        </section>

        <section style={panelStyle} aria-labelledby="headless-list-title">
          <h2 id="headless-list-title" style={sectionHeadingStyle}>Custom Achievement List</h2>
          <div style={achievementListStyle}>
            {allAchievements.map((achievement) => (
              <AchievementRow key={achievement.achievementId} achievement={achievement} />
            ))}
          </div>
        </section>

        <section style={panelStyle} aria-labelledby="headless-feed-title">
          <h2 id="headless-feed-title" style={sectionHeadingStyle}>Unlock Feed</h2>
          {unlockFeed.length > 0 ? (
            <ol style={feedListStyle}>
              {unlockFeed.map((achievement) => (
                <li key={achievement.achievementId} style={feedItemStyle}>
                  <span style={feedIconStyle}>{achievement.achievementIconKey ?? 'achievement'}</span>
                  <span>
                    <strong>{achievement.achievementTitle}</strong>
                    <small style={smallTextStyle}>{achievement.achievementId}</small>
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p style={subtleTextStyle}>No unlocks in this session.</p>
          )}

          <div style={jsonBlockStyle}>
            <strong>Unlocked IDs</strong>
            <pre style={preStyle}>{JSON.stringify(unlockedIds, null, 2)}</pre>
          </div>
        </section>
      </div>
    </main>
  );
};

export const CustomSurface: Story = {
  args: {
    achievements: headlessAchievements,
    storage: StorageType.Memory,
  },
  render: (args) => (
    <HeadlessAchievementProvider {...args}>
      <HeadlessDashboard />
    </HeadlessAchievementProvider>
  ),
};

export const LocalStorageSurface: Story = {
  args: {
    achievements: headlessAchievements,
    storage: StorageType.Local,
  },
  render: (args) => (
    <HeadlessAchievementProvider {...args}>
      <HeadlessDashboard />
    </HeadlessAchievementProvider>
  ),
};

const getMetricValue = (metrics: Record<string, unknown>, key: string) => {
  const value = metrics[key];
  return Array.isArray(value) ? value[0] : value;
};

const MetricReadout = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div style={metricReadoutStyle}>
    <span>{label}</span>
    <strong>{value}</strong>
  </div>
);

const AchievementRow = ({ achievement }: { achievement: AchievementWithStatus }) => (
  <article
    style={{
      ...achievementRowStyle,
      borderColor: achievement.isUnlocked ? '#16A34A' : '#D4DAE3',
      backgroundColor: achievement.isUnlocked ? '#F0FDF4' : '#FFFFFF',
    }}
  >
    <div style={achievementIconStyle}>{achievement.achievementIconKey ?? 'achievement'}</div>
    <div>
      <h3 style={achievementTitleStyle}>{achievement.achievementTitle}</h3>
      <p style={achievementDescriptionStyle}>{achievement.achievementDescription}</p>
      <small style={smallTextStyle}>{achievement.achievementId}</small>
    </div>
    <span
      style={{
        ...statusPillStyle,
        backgroundColor: achievement.isUnlocked ? '#DCFCE7' : '#E5E7EB',
        color: achievement.isUnlocked ? '#166534' : '#4B5563',
      }}
    >
      {achievement.isUnlocked ? 'Unlocked' : 'Locked'}
    </span>
  </article>
);

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  padding: '28px',
  background: '#F6F7F9',
  color: '#111827',
  fontFamily: 'Arial, sans-serif',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '16px',
  alignItems: 'center',
  maxWidth: '1120px',
  margin: '0 auto 20px',
};

const headingStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '28px',
  lineHeight: 1.2,
};

const subtleTextStyle: React.CSSProperties = {
  color: '#5F6B7A',
  margin: '6px 0 0',
};

const counterStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  gap: '4px',
  padding: '10px 14px',
  border: '1px solid #D4DAE3',
  borderRadius: '8px',
  backgroundColor: '#FFFFFF',
};

const layoutStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'minmax(280px, 0.95fr) minmax(340px, 1.2fr) minmax(260px, 0.85fr)',
  gap: '16px',
  maxWidth: '1120px',
  margin: '0 auto',
  alignItems: 'start',
};

const panelStyle: React.CSSProperties = {
  padding: '18px',
  border: '1px solid #D4DAE3',
  borderRadius: '8px',
  backgroundColor: '#FFFFFF',
};

const sectionHeadingStyle: React.CSSProperties = {
  margin: '0 0 14px',
  fontSize: '18px',
  lineHeight: 1.25,
};

const metricGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
  gap: '8px',
  marginBottom: '16px',
};

const metricReadoutStyle: React.CSSProperties = {
  display: 'grid',
  gap: '4px',
  padding: '10px',
  border: '1px solid #E5E7EB',
  borderRadius: '8px',
  backgroundColor: '#F9FAFB',
};

const buttonGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
  marginBottom: '16px',
};

const buttonStyle = (backgroundColor: string): React.CSSProperties => ({
  padding: '10px 12px',
  border: 0,
  borderRadius: '6px',
  backgroundColor,
  color: '#FFFFFF',
  cursor: 'pointer',
  fontWeight: 700,
});

const secondaryButtonStyle: React.CSSProperties = {
  ...buttonStyle('#FFFFFF'),
  border: '1px solid #B8C0CC',
  color: '#1F2937',
};

const jsonBlockStyle: React.CSSProperties = {
  display: 'grid',
  gap: '8px',
  marginTop: '16px',
};

const preStyle: React.CSSProperties = {
  margin: 0,
  padding: '10px',
  minHeight: '58px',
  overflow: 'auto',
  borderRadius: '6px',
  backgroundColor: '#111827',
  color: '#F9FAFB',
  fontSize: '12px',
};

const achievementListStyle: React.CSSProperties = {
  display: 'grid',
  gap: '10px',
};

const achievementRowStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '48px minmax(0, 1fr) auto',
  gap: '12px',
  alignItems: 'center',
  padding: '12px',
  border: '1px solid',
  borderRadius: '8px',
};

const achievementIconStyle: React.CSSProperties = {
  display: 'grid',
  placeItems: 'center',
  minWidth: '48px',
  height: '48px',
  borderRadius: '8px',
  backgroundColor: '#EEF2FF',
  color: '#3730A3',
  fontSize: '11px',
  fontWeight: 700,
  textAlign: 'center',
  overflowWrap: 'anywhere',
};

const achievementTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '15px',
  lineHeight: 1.25,
};

const achievementDescriptionStyle: React.CSSProperties = {
  margin: '4px 0',
  color: '#4B5563',
  fontSize: '13px',
};

const statusPillStyle: React.CSSProperties = {
  justifySelf: 'end',
  padding: '5px 8px',
  borderRadius: '6px',
  fontSize: '12px',
  fontWeight: 700,
};

const feedListStyle: React.CSSProperties = {
  display: 'grid',
  gap: '10px',
  margin: 0,
  padding: 0,
  listStyle: 'none',
};

const feedItemStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '40px minmax(0, 1fr)',
  gap: '10px',
  alignItems: 'center',
  padding: '10px',
  border: '1px solid #BBF7D0',
  borderRadius: '8px',
  backgroundColor: '#F0FDF4',
};

const feedIconStyle: React.CSSProperties = {
  display: 'grid',
  placeItems: 'center',
  width: '40px',
  height: '40px',
  borderRadius: '8px',
  backgroundColor: '#DCFCE7',
  color: '#166534',
  fontSize: '10px',
  fontWeight: 700,
  textAlign: 'center',
  overflowWrap: 'anywhere',
};

const smallTextStyle: React.CSSProperties = {
  display: 'block',
  color: '#6B7280',
  fontSize: '12px',
  marginTop: '2px',
  overflowWrap: 'anywhere',
};
