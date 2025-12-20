import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { BuiltInNotification } from '../../src/core/ui/BuiltInNotification';
import { BuiltInModal } from '../../src/core/ui/BuiltInModal';
import { BuiltInConfetti } from '../../src/core/ui/BuiltInConfetti';
import { BadgesButton } from '../../src/core/components/BadgesButton';
// Theme system - built-in themes only (modern, minimal, gamified)
import type { AchievementWithStatus } from '../../src/core/types';

const meta: Meta = {
  title: 'New UI System/Built-in Components',
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
            id: '1',
            title: 'Achievement Unlocked!',
            description: `This is the ${activeTheme} theme`,
            icon: '🏆',
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
            id: '1',
            title: 'Position Test',
            description: `Showing at ${position}`,
            icon: '📍',
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

// Story 5: BadgesButton - Fixed vs Inline
const BadgesButtonPlacementsComponent = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div style={{ padding: '20px', minHeight: '100vh', background: '#f5f5f5' }}>
      <h1>BadgesButton Placement Modes</h1>

      {/* Fixed Placement Examples */}
      <section style={{ marginBottom: '40px' }}>
        <h2>Fixed Placement (Traditional)</h2>
        <p>Floating buttons at screen corners</p>

        <BadgesButton
          placement="fixed"
          position="top-left"
          onClick={() => setModalOpen(true)}
          unlockedAchievements={sampleAchievements.filter(a => a.isUnlocked)}
          theme="modern"
        />

        <BadgesButton
          placement="fixed"
          position="bottom-right"
          onClick={() => setModalOpen(true)}
          unlockedAchievements={sampleAchievements.filter(a => a.isUnlocked)}
          theme="gamified"
        />
      </section>

      {/* Inline Placement Examples */}
      <section>
        <h2>Inline Placement (NEW!)</h2>
        <p>Can be placed anywhere in your layout</p>

        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
          <h3>In a Navigation Bar</h3>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#333', padding: '10px', borderRadius: '8px' }}>
            <span style={{ color: 'white', marginRight: 'auto' }}>MyApp</span>
            <span style={{ color: 'white', cursor: 'pointer' }}>Home</span>
            <span style={{ color: 'white', cursor: 'pointer' }}>Profile</span>
            <BadgesButton
              placement="inline"
              onClick={() => setModalOpen(true)}
              unlockedAchievements={sampleAchievements.filter(a => a.isUnlocked)}
              theme="modern"
            />
          </div>
        </div>

        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
          <h3>In a Sidebar/Drawer</h3>
          <div style={{ background: '#2c3e50', padding: '20px', borderRadius: '8px', width: '250px', color: 'white' }}>
            <div style={{ marginBottom: '15px', cursor: 'pointer' }}>📊 Dashboard</div>
            <div style={{ marginBottom: '15px', cursor: 'pointer' }}>⚙️ Settings</div>
            <div style={{ marginBottom: '15px', cursor: 'pointer' }}>👤 Profile</div>
            <hr style={{ margin: '15px 0', opacity: 0.3 }} />
            <BadgesButton
              placement="inline"
              onClick={() => setModalOpen(true)}
              unlockedAchievements={sampleAchievements.filter(a => a.isUnlocked)}
              theme="minimal"
              styles={{ width: '100%', justifyContent: 'center' }}
            />
          </div>
        </div>

        <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
          <h3>In a Card/Widget</h3>
          <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px', border: '1px solid #ddd' }}>
            <h4 style={{ margin: '0 0 10px 0' }}>Your Progress</h4>
            <p style={{ margin: '0 0 15px 0', color: '#666' }}>You've unlocked 2 out of 4 achievements!</p>
            <BadgesButton
              placement="inline"
              onClick={() => setModalOpen(true)}
              unlockedAchievements={sampleAchievements.filter(a => a.isUnlocked)}
              theme="gamified"
              styles={{ width: '100%', justifyContent: 'center' }}
            />
          </div>
        </div>
      </section>

      <BuiltInModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        achievements={sampleAchievements}
        theme="modern"
      />
    </div>
  );
};

export const BadgesButtonPlacements: StoryObj = {
  render: () => <BadgesButtonPlacementsComponent />,
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
            id: '1',
            title: `${currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1)} Theme`,
            description: `Switched to ${currentTheme} theme!`,
            icon: '🎨',
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

      {/* Fixed BadgesButton */}
      <BadgesButton
        placement="fixed"
        position="bottom-right"
        onClick={() => setModalOpen(true)}
        unlockedAchievements={currentAchievements.filter(a => a.isUnlocked)}
        theme={theme}
      />

      {/* Notification */}
      {showNotification && (
        <BuiltInNotification
          achievement={{
            id: sampleAchievements[unlockedCount - 1].achievementId,
            title: sampleAchievements[unlockedCount - 1].achievementTitle,
            description: sampleAchievements[unlockedCount - 1].achievementDescription,
            icon: '🏆',
          }}
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
