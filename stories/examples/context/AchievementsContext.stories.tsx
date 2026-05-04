import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ContextAchievementsProvider } from './AchievementsContext';
import {
  AchievementsList,
  AchievementsModal,
  AchievementsWidget,
  useAchievements,
  useAchievementState,
} from '../../../src/index';

const meta: Meta<typeof ContextAchievementsProvider> = {
  title: 'Examples/Context API',
  component: ContextAchievementsProvider,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Example implementation using React Context API for managing achievements state.'
      }
    }
  },
  tags: ['autodocs'],
};

export default meta;

// Demo component showcasing achievement functionality
const DemoComponent = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const { update, reset, getState } = useAchievements();
  const { unlockedIds, unlockedCount, totalCount } = useAchievementState();

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '280px 1fr',
        minHeight: '100vh',
        fontFamily: 'Arial, sans-serif',
        background: '#f5f7fb',
        color: '#1f2937',
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
        <strong style={{ padding: '8px 10px', fontSize: '18px' }}>Context App</strong>
        <span style={{ padding: '10px', color: '#4b5563' }}>Dashboard</span>
        <span style={{ padding: '10px', color: '#4b5563' }}>Profile</span>
        <AchievementsWidget
          placement="inline"
          label="Achievements"
          buttonStyles={{
            color: '#1f2937',
            backgroundColor: '#eef4ff',
            border: '1px solid #d6e4ff',
          }}
        />
        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            marginTop: 'auto',
            padding: '10px 12px',
            background: 'transparent',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            cursor: 'pointer',
            textAlign: 'left',
            font: 'inherit',
          }}
        >
          Open modal from drawer
        </button>
      </aside>

      <main style={{ padding: '28px', maxWidth: '920px' }}>
        <h1 style={{ marginTop: 0 }}>Achievement Demo (Context API)</h1>
        <p>Trigger achievements and render the v4 UI from common app locations.</p>

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
            onClick={reset}
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
            <h2 style={{ marginTop: 0 }}>Current state</h2>
            <h3>Unlocked ids</h3>
            <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
              {JSON.stringify(unlockedIds, null, 2)}
            </pre>
            <h3>Metrics</h3>
            <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
              {JSON.stringify(getState().metrics, null, 2)}
            </pre>
          </div>
        </section>
      </main>

      <AchievementsWidget position="top-right" label="Floating" />
      <AchievementsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export const Default: StoryObj<typeof ContextAchievementsProvider> = {
  render: () => (
    <ContextAchievementsProvider>
      <DemoComponent />
    </ContextAchievementsProvider>
  )
}; 
