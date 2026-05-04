import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  AchievementProvider,
  AchievementsList,
  AchievementsModal,
  AchievementsWidget,
  StorageType,
  useSimpleAchievements,
} from '../../src';
import type { SimpleAchievementConfig } from '../../src';

const meta: Meta<typeof AchievementsWidget> = {
  title: 'Components/AchievementsWidget',
  component: AchievementsWidget,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Context-aware achievement widget for common app integration points: floating buttons, nav bars, drawers, cards, and menus.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    density: {
      control: 'inline-radio',
      options: ['comfortable', 'compact'],
      description: 'Controls the achievement layout in the modal.',
    },
    hideModalScrollbar: {
      control: 'boolean',
      description: 'Hide modal scrollbar chrome while preserving scroll behavior.',
    },
    modalBackdropBlur: {
      control: { type: 'number', min: 0, step: 0.5 },
      description: 'Backdrop blur in pixels when the modal is open.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof AchievementsWidget>;

const demoAchievements: SimpleAchievementConfig = {
  score: {
    100: { title: 'Century', description: 'Reach 100 points', icon: '🏆' },
    500: { title: 'High Scorer', description: 'Reach 500 points', icon: '⭐' },
  },
  tasksCompleted: {
    1: { title: 'First Task', description: 'Complete one task', icon: '✅' },
    5: { title: 'Task Flow', description: 'Complete five tasks', icon: '📋' },
  },
  profileComplete: {
    true: { title: 'Profile Ready', description: 'Complete your profile', icon: '👤' },
  },
};

const scrollbarDemoAchievements: SimpleAchievementConfig = {
  missions: {
    1: { title: 'First Mission', description: 'Complete your first mission', icon: '🚀' },
    2: { title: 'Second Step', description: 'Complete two missions', icon: '✅' },
    3: { title: 'Steady Pace', description: 'Complete three missions', icon: '📈' },
    4: { title: 'Focused', description: 'Complete four missions', icon: '🎯' },
    5: { title: 'On Track', description: 'Complete five missions', icon: '🧭' },
    6: { title: 'Committed', description: 'Complete six missions', icon: '💪' },
    7: { title: 'Persistent', description: 'Complete seven missions', icon: '⭐' },
    8: { title: 'Momentum', description: 'Complete eight missions', icon: '⚡' },
    9: { title: 'Advanced', description: 'Complete nine missions', icon: '🏅' },
    10: { title: 'Champion', description: 'Complete ten missions', icon: '🏆' },
  },
};

const providerStyles: React.CSSProperties = {
  minHeight: '100vh',
  background: '#f4f7fb',
  color: '#172033',
  fontFamily:
    'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

const panelStyles: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid #d8e0ea',
  borderRadius: '8px',
  boxShadow: '0 12px 32px rgba(23, 32, 51, 0.08)',
};

const actionButtonStyles: React.CSSProperties = {
  border: '1px solid #246bfe',
  background: '#246bfe',
  color: '#ffffff',
  borderRadius: '6px',
  padding: '9px 12px',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
};

const secondaryButtonStyles: React.CSSProperties = {
  ...actionButtonStyles,
  background: '#ffffff',
  color: '#172033',
  border: '1px solid #c6d0dc',
};

const DemoActions: React.FC = () => {
  const { increment, track, reset, unlockedCount, totalCount } = useSimpleAchievements();

  return (
    <div
      style={{
        ...panelStyles,
        padding: '16px',
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      <strong style={{ marginRight: 'auto' }}>
        {unlockedCount} / {totalCount} unlocked
      </strong>
      <button style={actionButtonStyles} onClick={() => track('score', 100)}>
        Score 100
      </button>
      <button style={actionButtonStyles} onClick={() => track('score', 500)}>
        Score 500
      </button>
      <button style={actionButtonStyles} onClick={() => increment('tasksCompleted')}>
        Complete Task
      </button>
      <button style={secondaryButtonStyles} onClick={() => track('profileComplete', true)}>
        Complete Profile
      </button>
      <button style={secondaryButtonStyles} onClick={reset}>
        Reset
      </button>
    </div>
  );
};

const MissionActions: React.FC = () => {
  const { increment, track, reset, unlockedCount, totalCount } = useSimpleAchievements();

  return (
    <div
      style={{
        ...panelStyles,
        padding: '14px',
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      <strong style={{ marginRight: 'auto' }}>
        {unlockedCount} / {totalCount} unlocked
      </strong>
      <button style={actionButtonStyles} onClick={() => increment('missions')}>
        Complete Mission
      </button>
      <button style={secondaryButtonStyles} onClick={() => track('missions', 10)}>
        Finish Campaign
      </button>
      <button style={secondaryButtonStyles} onClick={reset}>
        Reset
      </button>
    </div>
  );
};

const WidgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AchievementProvider
    achievements={demoAchievements}
    storage={StorageType.Memory}
    ui={{ enableNotifications: false, enableConfetti: false }}
  >
    <div style={providerStyles}>{children}</div>
  </AchievementProvider>
);

export const FloatingButton: Story = {
  render: () => (
    <WidgetProvider>
      <main style={{ maxWidth: '960px', margin: '0 auto', padding: '32px' }}>
        <h1 style={{ marginTop: 0 }}>Project Dashboard</h1>
        <DemoActions />
        <div style={{ ...panelStyles, marginTop: '20px', padding: '20px' }}>
          <h2 style={{ marginTop: 0 }}>Activity</h2>
          <AchievementsList showLocked={false} />
        </div>
      </main>
      <AchievementsWidget />
    </WidgetProvider>
  ),
};

export const NavigationButton: Story = {
  render: () => (
    <WidgetProvider>
      <header
        style={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          padding: '0 24px',
          background: '#152238',
          color: '#ffffff',
        }}
      >
        <strong style={{ fontSize: '18px' }}>LaunchBoard</strong>
        <nav style={{ display: 'flex', gap: '16px', marginRight: 'auto', color: '#cbd5e1' }}>
          <span>Home</span>
          <span>Tasks</span>
          <span>Reports</span>
        </nav>
        <div style={{ minWidth: '178px' }}>
          <AchievementsWidget
            placement="inline"
            label="Badges"
            buttonStyles={{
              color: '#ffffff',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              justifyContent: 'center',
            }}
          />
        </div>
      </header>
      <main style={{ maxWidth: '960px', margin: '0 auto', padding: '28px' }}>
        <DemoActions />
      </main>
    </WidgetProvider>
  ),
};

export const DrawerItem: Story = {
  render: () => (
    <WidgetProvider>
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', minHeight: '100vh' }}>
        <aside
          style={{
            background: '#111827',
            color: '#ffffff',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <strong style={{ fontSize: '18px', marginBottom: '16px' }}>Workspace</strong>
          <span style={{ padding: '12px 14px', color: '#d1d5db' }}>Overview</span>
          <span style={{ padding: '12px 14px', color: '#d1d5db' }}>Messages</span>
          <span style={{ padding: '12px 14px', color: '#d1d5db' }}>Settings</span>
          <div style={{ marginTop: 'auto' }}>
            <AchievementsWidget
              label="Achievements"
              placement="inline"
              renderTrigger={({ buttonProps, unlockedCount, totalCount }) => (
                <button
                  {...buttonProps}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    color: '#d1d5db',
                    background: 'transparent',
                    border: 0,
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    font: 'inherit',
                    cursor: 'pointer',
                  }}
                >
                  <span>Achievements</span>
                  <span style={{ color: '#ffffff', fontSize: '13px' }}>
                    {unlockedCount}/{totalCount}
                  </span>
                </button>
              )}
            />
          </div>
        </aside>
        <main style={{ padding: '32px' }}>
          <DemoActions />
          <div style={{ ...panelStyles, marginTop: '20px', padding: '20px' }}>
            <h2 style={{ marginTop: 0 }}>Recently Unlocked</h2>
            <AchievementsList showLocked={false} />
          </div>
        </main>
      </div>
    </WidgetProvider>
  ),
};

const ExistingDrawerModalExample: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { unlockedCount, totalCount } = useSimpleAchievements();

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', minHeight: '100vh' }}>
      <aside
        style={{
          background: '#ffffff',
          borderRight: '1px solid #d8e0ea',
          padding: '18px',
          display: 'grid',
          alignContent: 'start',
          gap: '6px',
        }}
      >
        <strong style={{ padding: '10px 12px' }}>Customer Portal</strong>
        {['Overview', 'Billing', 'Team', 'Settings'].map((item) => (
          <button
            key={item}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '11px 12px',
              color: '#263244',
              background: 'transparent',
              border: 0,
              borderRadius: '6px',
              font: 'inherit',
              cursor: 'pointer',
            }}
          >
            {item}
          </button>
        ))}
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: '100%',
            textAlign: 'left',
            padding: '11px 12px',
            color: '#263244',
            background: '#eef4ff',
            border: 0,
            borderRadius: '6px',
            font: 'inherit',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span>Achievements</span>
          <span>
            {unlockedCount}/{totalCount}
          </span>
        </button>
      </aside>
      <main style={{ padding: '32px' }}>
        <DemoActions />
        <div style={{ ...panelStyles, marginTop: '20px', padding: '20px' }}>
          <h2 style={{ marginTop: 0 }}>Inline Content</h2>
          <AchievementsList />
        </div>
      </main>
      <AchievementsModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        hideScrollbar
      />
    </div>
  );
};

export const ExistingDrawerControlOpensModal: Story = {
  render: () => (
    <WidgetProvider>
      <ExistingDrawerModalExample />
    </WidgetProvider>
  ),
};

export const HiddenModalScrollbar: Story = {
  render: () => (
    <AchievementProvider
      achievements={scrollbarDemoAchievements}
      storage={StorageType.Memory}
      ui={{ enableNotifications: false, enableConfetti: false }}
    >
      <div style={providerStyles}>
        <main style={{ maxWidth: '860px', margin: '0 auto', padding: '32px' }}>
          <h1 style={{ marginTop: 0 }}>Achievement Catalog</h1>
          <p style={{ color: '#5d6b7a', maxWidth: '620px' }}>
            Mission milestones, progress badges, and completion rewards.
          </p>
          <AchievementsWidget
            label="Open Achievements"
            hideModalScrollbar
            modalStyles={{
              content: {
                maxHeight: '360px',
              },
            }}
          />
        </main>
      </div>
    </AchievementProvider>
  ),
};

export const CompactAchievementsModal: Story = {
  render: () => (
    <AchievementProvider
      achievements={scrollbarDemoAchievements}
      storage={StorageType.Memory}
      ui={{ enableNotifications: false, enableConfetti: false }}
    >
      <div style={providerStyles}>
        <main style={{ maxWidth: '980px', margin: '0 auto', padding: '32px' }}>
          <h1 style={{ marginTop: 0 }}>Operations Milestones</h1>
          <MissionActions />
          <section
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '18px',
              alignItems: 'start',
              marginTop: '20px',
            }}
          >
            <div style={{ ...panelStyles, padding: '18px' }}>
              <h2 style={{ margin: '0 0 10px' }}>Compact Modal</h2>
              <AchievementsWidget
                density="compact"
                label="Open Compact Achievements"
                hideModalScrollbar
                modalBackdropBlur={2}
                modalStyles={{
                  content: {
                    maxWidth: '440px',
                    maxHeight: '420px',
                  },
                }}
              />
            </div>
            <div style={{ ...panelStyles, padding: '16px' }}>
              <h2 style={{ margin: '0 0 12px' }}>Compact List</h2>
              <AchievementsList density="compact" />
            </div>
          </section>
        </main>
      </div>
    </AchievementProvider>
  ),
};

export const DashboardCard: Story = {
  render: () => (
    <WidgetProvider>
      <main style={{ maxWidth: '1080px', margin: '0 auto', padding: '32px' }}>
        <DemoActions />
        <section
          style={{
            marginTop: '24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: '18px',
          }}
        >
          <div style={{ ...panelStyles, padding: '20px' }}>
            <h2 style={{ margin: '0 0 8px' }}>Weekly Progress</h2>
            <p style={{ color: '#5d6b7a' }}>Points, tasks, and profile milestones.</p>
            <AchievementsWidget
              placement="inline"
              label="View Achievements"
              buttonStyles={{
                marginTop: '14px',
                justifyContent: 'center',
                border: '1px solid #d8e0ea',
                color: '#172033',
              }}
            />
          </div>
          <div style={{ ...panelStyles, padding: '20px' }}>
            <h2 style={{ margin: '0 0 8px' }}>Tasks</h2>
            <p style={{ color: '#5d6b7a' }}>Complete tasks to unlock more badges.</p>
          </div>
          <div style={{ ...panelStyles, padding: '20px' }}>
            <h2 style={{ margin: '0 0 8px' }}>Profile</h2>
            <p style={{ color: '#5d6b7a' }}>Finish setup for onboarding achievements.</p>
          </div>
        </section>
      </main>
    </WidgetProvider>
  ),
};

export const ProfileMenuRow: Story = {
  render: () => (
    <WidgetProvider>
      <main style={{ maxWidth: '860px', margin: '0 auto', padding: '32px' }}>
        <DemoActions />
        <div
          style={{
            ...panelStyles,
            width: '320px',
            marginTop: '24px',
            marginLeft: 'auto',
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '16px', borderBottom: '1px solid #e3e9f0' }}>
            <strong>Avery Stone</strong>
            <div style={{ color: '#6b7786', fontSize: '13px', marginTop: '4px' }}>
              Product team
            </div>
          </div>
          <button style={{ ...secondaryButtonStyles, width: '100%', border: 0, borderRadius: 0 }}>
            Account Settings
          </button>
          <AchievementsWidget
            placement="inline"
            label="My Achievements"
            buttonStyles={{
              color: '#172033',
              borderTop: '1px solid #e3e9f0',
              borderRadius: 0,
              padding: '14px 16px',
            }}
          />
          <button style={{ ...secondaryButtonStyles, width: '100%', border: 0, borderRadius: 0 }}>
            Sign Out
          </button>
        </div>
      </main>
    </WidgetProvider>
  ),
};

export const CommonPlacements: Story = {
  render: () => (
    <WidgetProvider>
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', minHeight: '100vh' }}>
        <aside style={{ background: '#182235', color: '#ffffff', padding: '18px' }}>
          <strong>Acme App</strong>
          <div style={{ marginTop: '24px', display: 'grid', gap: '10px' }}>
            <span>Dashboard</span>
            <span>Projects</span>
            <AchievementsWidget
              placement="inline"
              label="Drawer Badges"
              buttonStyles={{ color: '#ffffff', backgroundColor: 'rgba(255,255,255,0.08)' }}
            />
          </div>
        </aside>
        <div>
          <header
            style={{
              height: '64px',
              background: '#ffffff',
              borderBottom: '1px solid #d8e0ea',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '0 24px',
            }}
          >
            <strong style={{ marginRight: 'auto' }}>Dashboard</strong>
            <div style={{ width: '170px' }}>
              <AchievementsWidget
                placement="inline"
                label="Nav Badges"
                buttonStyles={{ justifyContent: 'center', color: '#172033' }}
              />
            </div>
          </header>
          <main style={{ padding: '24px' }}>
            <DemoActions />
            <div style={{ ...panelStyles, marginTop: '18px', padding: '20px', maxWidth: '420px' }}>
              <h2 style={{ marginTop: 0 }}>Progress Card</h2>
              <AchievementsWidget
                placement="inline"
                label="Card Badges"
                buttonStyles={{ justifyContent: 'center', color: '#172033' }}
              />
            </div>
          </main>
        </div>
      </div>
      <AchievementsWidget label="Floating" />
    </WidgetProvider>
  ),
};
