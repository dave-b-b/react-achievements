import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ReduxAchievementsProvider } from './AchievementsProvider';
import {
  AchievementsList,
  AchievementsModal,
  AchievementsWidget,
  useAchievements,
  useAchievementState,
} from '../../../src';
import { useDispatch, useSelector } from 'react-redux';
import { resetAchievements } from './store';
import type { RootState } from './store';

const meta: Meta<typeof ReduxAchievementsProvider> = {
  title: 'Examples/Redux',
  component: ReduxAchievementsProvider,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Example implementation using Redux for managing achievements state.'
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
  const dispatch = useDispatch();
  
  // Get achievement details directly from Redux store
  const unlockedAchievementDetails = useSelector((state: RootState) => 
    state.achievements.unlockedAchievements
  );

  const handleReset = () => {
    reset();
    dispatch(resetAchievements());
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '280px 1fr',
        minHeight: '100vh',
        fontFamily: 'Arial, sans-serif',
        background: '#f6f8fb',
        color: '#172033',
      }}
    >
      <aside
        style={{
          background: '#182235',
          color: '#ffffff',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <strong style={{ padding: '8px 10px', fontSize: '18px' }}>Redux App</strong>
        <span style={{ padding: '10px', color: '#d1d5db' }}>Dashboard</span>
        <span style={{ padding: '10px', color: '#d1d5db' }}>Reports</span>
        <AchievementsWidget
          placement="inline"
          label="Achievements"
          buttonStyles={{
            color: '#ffffff',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
          }}
        />
        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            marginTop: 'auto',
            color: '#ffffff',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: '6px',
            padding: '10px 12px',
            textAlign: 'left',
            cursor: 'pointer',
            font: 'inherit',
          }}
        >
          Open shared modal
        </button>
      </aside>

      <main style={{ padding: '28px', maxWidth: '960px' }}>
        <h1 style={{ marginTop: 0 }}>Achievement Demo (Redux)</h1>
        <p>Use Redux for external persistence while rendering the v4 widget and inline list from context.</p>

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
          <div style={{ background: '#ffffff', padding: '18px', borderRadius: '8px', border: '1px solid #d8e0ea' }}>
            <h2 style={{ marginTop: 0 }}>Inline list</h2>
            <p>{unlockedCount} / {totalCount} unlocked</p>
            <AchievementsList />
          </div>

          <div style={{ background: '#ffffff', padding: '18px', borderRadius: '8px', border: '1px solid #d8e0ea' }}>
            <h2 style={{ marginTop: 0 }}>State snapshots</h2>
            <h3>Provider ids</h3>
            <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
              {JSON.stringify(unlockedIds, null, 2)}
            </pre>
            <h3>Redux achievement details</h3>
            <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
              {JSON.stringify(unlockedAchievementDetails, null, 2)}
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

export const Default: StoryObj<typeof ReduxAchievementsProvider> = {
  render: () => (
    <ReduxAchievementsProvider>
      <DemoComponent />
    </ReduxAchievementsProvider>
  )
}; 
