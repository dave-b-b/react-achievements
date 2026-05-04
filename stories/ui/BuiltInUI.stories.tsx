import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  AchievementProvider,
  AchievementsModal,
  AchievementsWidget,
  BuiltInConfetti,
  BuiltInModal,
  BuiltInNotification,
  StorageType,
  useSimpleAchievements,
} from '../../src';
// Theme system - built-in themes only (modern, minimal, gamified)
import type { AchievementWithStatus, SimpleAchievementConfig } from '../../src';

const meta: Meta = {
  title: 'UI/Built-in Components',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

// Sample achievement data
const sampleAchievements: AchievementWithStatus[] = [
  {
    achievementId: '1',
    achievementTitle: 'First Steps',
    achievementDescription: 'Complete your first lesson',
    achievementIconKey: 'trophy',
    isUnlocked: true,
  },
  {
    achievementId: '2',
    achievementTitle: 'Quick Learner',
    achievementDescription: 'Complete 5 lessons in one day',
    achievementIconKey: 'star',
    isUnlocked: true,
  },
  {
    achievementId: '3',
    achievementTitle: 'Perfectionist',
    achievementDescription: 'Score 100% on a quiz',
    achievementIconKey: 'success',
    isUnlocked: false,
  },
  {
    achievementId: '4',
    achievementTitle: 'Marathon Runner',
    achievementDescription: 'Complete 50 lessons',
    achievementIconKey: 'trophy',
    isUnlocked: false,
  },
];

const widgetAchievements: SimpleAchievementConfig = {
  lessonsCompleted: {
    1: { title: 'First Steps', description: 'Complete your first lesson', icon: '🏆' },
    5: { title: 'Quick Learner', description: 'Complete five lessons', icon: '⭐' },
  },
  quizScore: {
    100: { title: 'Perfectionist', description: 'Score 100% on a quiz', icon: '✅' },
  },
  sessions: {
    10: { title: 'Marathon Runner', description: 'Complete ten sessions', icon: '🏅' },
  },
};

const WidgetControls = () => {
  const { increment, track, reset, unlockedCount, totalCount } = useSimpleAchievements();

  return (
    <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
      <h3 style={{ marginTop: 0 }}>
        Progress: {unlockedCount} / {totalCount} Achievements
      </h3>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={() => increment('lessonsCompleted')}
          style={{ padding: '10px 14px', background: '#2563eb', color: 'white', border: 0, borderRadius: '6px', cursor: 'pointer' }}
        >
          Complete Lesson
        </button>
        <button
          onClick={() => track('quizScore', 100)}
          style={{ padding: '10px 14px', background: '#7c3aed', color: 'white', border: 0, borderRadius: '6px', cursor: 'pointer' }}
        >
          Perfect Quiz
        </button>
        <button
          onClick={() => increment('sessions', 10)}
          style={{ padding: '10px 14px', background: '#0891b2', color: 'white', border: 0, borderRadius: '6px', cursor: 'pointer' }}
        >
          Complete Sessions
        </button>
        <button
          onClick={reset}
          style={{ padding: '10px 14px', background: '#ffffff', color: '#172033', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

// Story 1: Notification - All Themes
const NotificationThemesComponent = () => {
  const [activeTheme, setActiveTheme] = useState('modern');
  const [showNotification, setShowNotification] = useState(false);

  return (
    <div style={{ padding: '20px', minHeight: '100vh', background: '#f5f5f5' }}>
      <h1>Notification Themes</h1>
      <p>Click a theme button to see the notification in that theme</p>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        {['modern', 'minimal', 'gamified'].map((theme) => (
          <button
            key={theme}
            onClick={() => {
              setActiveTheme(theme);
              setShowNotification(true);
              setTimeout(() => setShowNotification(false), 5500);
            }}
            style={{
              padding: '10px 20px',
              background: activeTheme === theme ? '#4CAF50' : '#ddd',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              textTransform: 'capitalize',
            }}
          >
            {theme}
          </button>
        ))}
      </div>

      {showNotification && (
        <BuiltInNotification
          achievement={{
            achievementId: '1',
            achievementTitle: 'Achievement Unlocked!',
            achievementDescription: `This is the ${activeTheme} theme`,
            achievementIconKey: '🏆',
            isUnlocked: true,
          }}
          theme={activeTheme}
          position="top-center"
          duration={5000}
          onClose={() => setShowNotification(false)}
        />
      )}
    </div>
  );
};

export const NotificationThemes: StoryObj = {
  render: () => <NotificationThemesComponent />,
};

// Story 2: Notification - All Positions
const NotificationPositionsComponent = () => {
  const [position, setPosition] = useState<any>('top-center');
  const [showNotification, setShowNotification] = useState(false);

  const positions = [
    'top-left',
    'top-center',
    'top-right',
    'bottom-left',
    'bottom-center',
    'bottom-right',
  ];

  return (
    <div style={{ padding: '20px', minHeight: '100vh', background: '#f5f5f5' }}>
      <h1>Notification Positions</h1>
      <p>Click a position to see where the notification appears</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', maxWidth: '600px' }}>
        {positions.map((pos) => (
          <button
            key={pos}
            onClick={() => {
              setPosition(pos);
              setShowNotification(true);
              setTimeout(() => setShowNotification(false), 5500);
            }}
            style={{
              padding: '10px',
              background: position === pos ? '#4CAF50' : '#ddd',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            {pos}
          </button>
        ))}
      </div>

      {showNotification && (
        <BuiltInNotification
          achievement={{
            achievementId: '1',
            achievementTitle: 'Position Test',
            achievementDescription: `Showing at ${position}`,
            achievementIconKey: '📍',
            isUnlocked: true,
          }}
          position={position}
          duration={5000}
          onClose={() => setShowNotification(false)}
        />
      )}
    </div>
  );
};

export const NotificationPositions: StoryObj = {
  render: () => <NotificationPositionsComponent />,
};

const SimultaneousUnlockControls = () => {
  const { trackMultiple, reset, unlockedCount, totalCount } = useSimpleAchievements();

  return (
    <div style={{ background: 'white', padding: '20px', borderRadius: '8px', maxWidth: '520px' }}>
      <h1 style={{ marginTop: 0 }}>Stacked Notifications</h1>
      <p>
        Progress: {unlockedCount} / {totalCount} Achievements
      </p>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() =>
            trackMultiple({
              lessonsCompleted: 5,
              quizScore: 100,
              sessions: 10,
            })
          }
          style={{ padding: '10px 14px', background: '#2563eb', color: 'white', border: 0, borderRadius: '6px', cursor: 'pointer' }}
        >
          Unlock multiple
        </button>
        <button
          type="button"
          onClick={reset}
          style={{ padding: '10px 14px', background: '#ffffff', color: '#172033', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}
        >
          Reset
        </button>
      </div>
      <AchievementsWidget position="bottom-right" />
    </div>
  );
};

export const SimultaneousUnlockNotifications: StoryObj = {
  render: () => (
    <AchievementProvider
      achievements={widgetAchievements}
      storage={StorageType.Memory}
      ui={{ theme: 'gamified', notificationPosition: 'top-right' }}
    >
      <div style={{ padding: '20px', minHeight: '100vh', background: '#f5f5f5' }}>
        <SimultaneousUnlockControls />
      </div>
    </AchievementProvider>
  ),
};

// Story 3: Modal - All Themes
const ModalThemesComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState('modern');

  return (
    <div style={{ padding: '20px', minHeight: '100vh', background: '#f5f5f5' }}>
      <h1>Modal Themes</h1>
      <p>Select a theme and open the modal</p>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        {['modern', 'minimal', 'gamified'].map((t) => (
          <button
            key={t}
            onClick={() => setTheme(t)}
            style={{
              padding: '10px 20px',
              background: theme === t ? '#4CAF50' : '#ddd',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <button
        onClick={() => setIsOpen(true)}
        style={{
          padding: '12px 24px',
          background: '#2196F3',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: 'bold',
        }}
      >
        Open Modal ({theme})
      </button>

      <BuiltInModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        achievements={sampleAchievements}
        theme={theme}
      />
    </div>
  );
};

export const ModalThemes: StoryObj = {
  render: () => <ModalThemesComponent />,
};

// Story 4: Confetti Demo
const ConfettiDemoComponent = () => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [particleCount, setParticleCount] = useState(50);

  return (
    <div style={{ padding: '20px', minHeight: '100vh', background: '#f5f5f5' }}>
      <h1>Confetti Animation</h1>
      <p>Click the button to trigger confetti celebration</p>

      <div style={{ marginBottom: '20px' }}>
        <label>
          Particle Count: {particleCount}
          <input
            type="range"
            min="20"
            max="150"
            value={particleCount}
            onChange={(e) => setParticleCount(Number(e.target.value))}
            style={{ marginLeft: '10px', width: '200px' }}
          />
        </label>
      </div>

      <button
        onClick={() => {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 5500);
        }}
        style={{
          padding: '12px 24px',
          background: '#FFD700',
          color: '#333',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: 'bold',
        }}
      >
        🎉 Celebrate!
      </button>

      <BuiltInConfetti show={showConfetti} particleCount={particleCount} duration={5000} />
    </div>
  );
};

export const ConfettiDemo: StoryObj = {
  render: () => <ConfettiDemoComponent />,
};

// Story 5: AchievementsWidget - Fixed vs Inline
const AchievementsWidgetPlacementsComponent = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <AchievementProvider
      achievements={widgetAchievements}
      storage={StorageType.Memory}
      ui={{ enableNotifications: false, enableConfetti: false }}
    >
      <div style={{ padding: '20px', minHeight: '100vh', background: '#f5f5f5' }}>
        <h1>AchievementsWidget Placement Modes</h1>
        <WidgetControls />

        <section style={{ marginBottom: '40px' }}>
          <h2>Fixed Placement</h2>
          <p>Floating buttons at screen corners.</p>

          <AchievementsWidget placement="fixed" position="top-left" label="Modern" />
          <AchievementsWidget placement="fixed" position="bottom-right" label="Gamified" theme="gamified" />
        </section>

        <section>
          <h2>Inline Placement</h2>
          <p>Inline triggers can match nav bars, drawers, cards, and custom controls.</p>

          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
            <h3>In a Navigation Bar</h3>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#333', padding: '10px', borderRadius: '8px' }}>
              <span style={{ color: 'white', marginRight: 'auto' }}>MyApp</span>
              <span style={{ color: 'white', cursor: 'pointer' }}>Home</span>
              <span style={{ color: 'white', cursor: 'pointer' }}>Profile</span>
              <div style={{ width: '180px' }}>
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
            </div>
          </div>

          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
            <h3>In a Sidebar/Drawer</h3>
            <div style={{ background: '#2c3e50', padding: '20px', borderRadius: '8px', width: '250px', color: 'white' }}>
              <div style={{ marginBottom: '15px', cursor: 'pointer' }}>Dashboard</div>
              <div style={{ marginBottom: '15px', cursor: 'pointer' }}>Settings</div>
              <div style={{ marginBottom: '15px', cursor: 'pointer' }}>Profile</div>
              <hr style={{ margin: '15px 0', opacity: 0.3 }} />
              <AchievementsWidget
                placement="inline"
                label="Achievements"
                buttonStyles={{
                  width: '100%',
                  color: '#ffffff',
                  backgroundColor: 'transparent',
                  padding: '12px 0',
                }}
              />
              <button
                onClick={() => setModalOpen(true)}
                style={{
                  width: '100%',
                  marginTop: '10px',
                  padding: '12px 0',
                  color: '#ffffff',
                  background: 'transparent',
                  border: 0,
                  borderTop: '1px solid rgba(255,255,255,0.18)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  font: 'inherit',
                }}
              >
                Custom drawer row opens modal
              </button>
            </div>
          </div>

          <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
            <h3>In a Card/Widget</h3>
            <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px', border: '1px solid #ddd' }}>
              <h4 style={{ margin: '0 0 10px 0' }}>Your Progress</h4>
              <p style={{ margin: '0 0 15px 0', color: '#666' }}>Inline widget inside a compact card surface.</p>
              <AchievementsWidget
                placement="inline"
                label="View Achievements"
                theme="gamified"
                buttonStyles={{ width: '100%', justifyContent: 'center', color: '#172033', border: '1px solid #ddd' }}
              />
            </div>
          </div>
        </section>

        <AchievementsModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      </div>
    </AchievementProvider>
  );
};

export const AchievementsWidgetPlacements: StoryObj = {
  render: () => <AchievementsWidgetPlacementsComponent />,
};

// Story 6: Built-in Themes Demo
const BuiltInThemesDemoComponent = () => {
  const [showNotification, setShowNotification] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('modern');

  const themes = ['modern', 'minimal', 'gamified'];

  return (
    <div style={{ padding: '20px', minHeight: '100vh', background: '#f5f5f5' }}>
      <h1>Built-in Theme System</h1>
      <p>Choose from 3 professionally designed themes</p>

      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>Available Themes</h3>
        <ul>
          <li><strong>modern</strong> - Dark gradients with vibrant green accents</li>
          <li><strong>minimal</strong> - Clean, light design with subtle styling</li>
          <li><strong>gamified</strong> - Bold sci-fi aesthetics with cyan and orange</li>
        </ul>
        <p style={{ marginTop: '15px', color: '#666', fontSize: '14px' }}>
          <em>Note: Custom theme support removed to maintain flexibility.
          Advanced users can replace UI components via component injection.</em>
        </p>
      </div>

      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>Try Each Theme ({themes.length} total)</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {themes.map((theme) => (
            <button
              key={theme}
              onClick={() => {
                setCurrentTheme(theme);
                setShowNotification(true);
                setTimeout(() => setShowNotification(false), 5500);
              }}
              style={{
                padding: '10px 20px',
                background: currentTheme === theme ? '#4CAF50' : '#ddd',
                color: currentTheme === theme ? 'white' : '#333',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                textTransform: 'capitalize',
                fontWeight: currentTheme === theme ? 'bold' : 'normal',
              }}
            >
              {theme}
            </button>
          ))}
        </div>
      </div>

      {showNotification && (
        <BuiltInNotification
          achievement={{
            achievementId: '1',
            achievementTitle: `${currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1)} Theme`,
            achievementDescription: `Switched to ${currentTheme} theme!`,
            achievementIconKey: '🎨',
            isUnlocked: true,
          }}
          theme={currentTheme}
          position="top-center"
          duration={5000}
          onClose={() => setShowNotification(false)}
        />
      )}
    </div>
  );
};

export const BuiltInThemesDemo: StoryObj = {
  render: () => <BuiltInThemesDemoComponent />,
};

// Story 7: Complete Integration Demo
const CompleteDemoComponent = () => {
  const [theme, setTheme] = useState('modern');
  const [showNotification, setShowNotification] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [unlockedCount, setUnlockedCount] = useState(2);

  const unlockAchievement = () => {
    if (unlockedCount < sampleAchievements.length) {
      setUnlockedCount(unlockedCount + 1);
      setShowNotification(true);
      setShowConfetti(true);
      setTimeout(() => {
        setShowNotification(false);
        setShowConfetti(false);
      }, 5500);
    }
  };

  const currentAchievements = sampleAchievements.map((ach, idx) => ({
    ...ach,
    isUnlocked: idx < unlockedCount,
  }));

  return (
    <div style={{ padding: '20px', minHeight: '100vh', background: '#f5f5f5' }}>
      <h1>Complete UI System Demo</h1>
      <p>All components working together</p>

      <div style={{ marginBottom: '20px' }}>
        <h3>Theme Selection</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          {['modern', 'minimal', 'gamified'].map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              style={{
                padding: '10px 20px',
                background: theme === t ? '#4CAF50' : '#ddd',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>Progress: {unlockedCount} / {sampleAchievements.length} Achievements</h3>
        <button
          onClick={unlockAchievement}
          disabled={unlockedCount >= sampleAchievements.length}
          style={{
            padding: '12px 24px',
            background: unlockedCount >= sampleAchievements.length ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: unlockedCount >= sampleAchievements.length ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            marginRight: '10px',
          }}
        >
          Unlock Next Achievement
        </button>
        <button
          onClick={() => setModalOpen(true)}
          style={{
            padding: '12px 24px',
            background: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
          }}
        >
          View All Achievements
        </button>
      </div>

      <button
        onClick={() => setModalOpen(true)}
        style={{
          position: 'fixed',
          right: 20,
          bottom: 20,
          padding: '10px 20px',
          background: theme === 'gamified' ? '#00d4ff' : '#2196F3',
          color: theme === 'gamified' ? '#06121f' : '#ffffff',
          border: 0,
          borderRadius: '20px',
          cursor: 'pointer',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        }}
      >
        Achievements ({currentAchievements.filter(a => a.isUnlocked).length})
      </button>

      {/* Notification */}
      {showNotification && (
        <BuiltInNotification
          achievement={sampleAchievements[unlockedCount - 1]}
          theme={theme}
          position="top-center"
          duration={5000}
          onClose={() => setShowNotification(false)}
        />
      )}

      {/* Confetti */}
      <BuiltInConfetti show={showConfetti} duration={5000} />

      {/* Modal */}
      <BuiltInModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        achievements={currentAchievements}
        theme={theme}
      />
    </div>
  );
};

export const CompleteDemo: StoryObj = {
  render: () => <CompleteDemoComponent />,
};
