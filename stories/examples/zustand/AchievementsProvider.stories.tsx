import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  AchievementsList,
  AchievementsModal,
  AchievementsWidget,
  useAchievements,
  useAchievementState,
} from '../../../src';
import { useAchievementsStore } from './store';
import { ZustandAchievementsProvider } from './AchievementsProvider';

const meta: Meta<typeof ZustandAchievementsProvider> = {
  title: 'Examples/Zustand/AchievementsProvider',
  component: ZustandAchievementsProvider,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof ZustandAchievementsProvider>;

// Demo component showcasing achievement functionality
const DemoComponent = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const { update, reset, getState } = useAchievements();
  const { unlockedCount, totalCount } = useAchievementState();
  const { unlockedAchievements, reset: resetStore } = useAchievementsStore();

  const handleReset = () => {
    reset();
    resetStore();
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '280px 1fr',
        minHeight: '100vh',
        width: '100vw',
        fontFamily: 'Arial, sans-serif',
        background: '#f5f7fb',
        color: '#172033',
      }}
    >
      <aside
        style={{
          background: '#ffffff',
          borderRight: '1px solid #dde5ef',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <strong style={{ padding: '8px 10px', fontSize: '18px' }}>Zustand App</strong>
        <span style={{ padding: '10px', color: '#4b5563' }}>Home</span>
        <span style={{ padding: '10px', color: '#4b5563' }}>Activity</span>
        <AchievementsWidget
          placement="inline"
          label="Achievements"
          buttonStyles={{
            color: '#172033',
            backgroundColor: '#f3f6fb',
            border: '1px solid #d8e0ea',
          }}
        />
        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            marginTop: 'auto',
            background: '#eef4ff',
            color: '#172033',
            border: '1px solid #d6e4ff',
            borderRadius: '6px',
            padding: '10px 12px',
            textAlign: 'left',
            cursor: 'pointer',
            font: 'inherit',
          }}
        >
          Open modal from drawer
        </button>
      </aside>

      <main style={{ padding: '28px', maxWidth: '960px' }}>
        <h1 style={{ marginTop: 0 }}>Achievement Demo (Zustand)</h1>
        <p>Use Zustand storage while rendering v4 inline and modal surfaces from provider state.</p>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <button
            onClick={() => update({ score: 100 })}
            style={{ padding: '10px 15px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            Score 100 points
          </button>

          <button
            onClick={() => update({ login: true })}
            style={{ padding: '10px 15px', backgroundColor: '#7c3aed', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            Login
          </button>

          <button
            onClick={handleReset}
            style={{ padding: '10px 15px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            Reset Achievements
          </button>
        </div>

        <section style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '16px' }}>
          <div style={{ background: '#ffffff', padding: '18px', borderRadius: '8px', border: '1px solid #dde5ef' }}>
            <h2 style={{ marginTop: 0 }}>Inline list</h2>
            <p>{unlockedCount} / {totalCount} unlocked</p>
            <AchievementsList />
          </div>

          <div style={{ background: '#ffffff', padding: '18px', borderRadius: '8px', border: '1px solid #dde5ef' }}>
            <h2 style={{ marginTop: 0 }}>Zustand store snapshot</h2>
            <h3>Unlocked achievement details</h3>
            <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
              {JSON.stringify(unlockedAchievements, null, 2)}
            </pre>
            <h3>Metrics</h3>
            <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
              {JSON.stringify(getState().metrics, null, 2)}
            </pre>
          </div>
        </section>
      </main>

      <AchievementsWidget position="bottom-right" label="Floating" />
      <AchievementsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export const Default: Story = {
  render: () => (
    <ZustandAchievementsProvider>
      <DemoComponent />
    </ZustandAchievementsProvider>
  ),
}; 
