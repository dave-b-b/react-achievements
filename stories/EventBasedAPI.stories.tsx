import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  AchievementEngine,
  AchievementProvider,
  AchievementsModal,
  AchievementsWidget,
  StorageType,
  useAchievementEngine,
  useAchievementState,
} from '../src';
import type { EventMapping, SimpleAchievementConfig } from '../src';

/**
 * The Event-Based API provides a framework-agnostic way to track achievements
 * using semantic events rather than direct metric updates. This pattern is more flexible and
 * allows for better separation of concerns.
 *
 * ## Key Benefits
 * - **Semantic Events**: Emit events like 'userScored' or 'levelUp' instead of updating metrics
 * - **Event Mapping**: Map events to metrics automatically
 * - **Framework Agnostic**: Use the same engine in React, Vue, Angular, or vanilla JS
 * - **Better Testing**: Events are easier to mock and test
 * - **Separation of Concerns**: Business logic separated from achievement tracking
 *
 * ## v4 UI
 * Use `AchievementsWidget` for the default modal trigger, `renderTrigger` for
 * app-owned drawer/nav controls, or `AchievementsModal` from any existing button.
 */
const meta: Meta<typeof AchievementProvider> = {
  title: 'Event-Based API/Overview',
  component: AchievementProvider,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Demonstrates event-based achievement tracking with AchievementEngine and the v4 UI components.'
      }
    }
  },
  tags: ['autodocs'],
};

export default meta;

// Achievement configuration (same as simple API)
const achievements: SimpleAchievementConfig = {
  score: {
    100: { title: 'Century!', description: 'Score 100 points', icon: '🏆' },
    500: { title: 'High Scorer!', description: 'Score 500 points', icon: '⭐' },
    1000: { title: 'Master!', description: 'Score 1000 points', icon: '💎' }
  },
  level: {
    5: { title: 'Leveling Up', description: 'Reach level 5', icon: '📈' },
    10: { title: 'Double Digits', description: 'Reach level 10', icon: '🔟' }
  },
  completedTutorial: {
    true: { title: 'Tutorial Master', description: 'Complete the tutorial', icon: '📚' }
  }
};

// Event mapping - maps event names to metric names
const eventMapping: EventMapping = {
  'userScored': (data: any) => ({ score: data.points }),
  'userLeveledUp': (data: any) => ({ level: data.level }),
  'tutorialCompleted': () => ({ completedTutorial: true }),
  'bossDefeated': (data: any) => ({
    score: data.scoreGained,
    level: data.newLevel
  })
};

// Create the engine outside React (framework-agnostic)
const achievementEngine = new AchievementEngine({
  achievements,
  eventMapping,
  storage: StorageType.Local, // or StorageType.Memory, StorageType.IndexedDB, custom storage, etc.
});

// Demo component using the event-based API
const EventBasedDemo = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const engine = useAchievementEngine();
  const { unlockedCount, metrics } = useAchievementState();
  const [currentScore, setCurrentScore] = React.useState(0);
  const [currentLevel, setCurrentLevel] = React.useState(1);

  const tutorialCompleted = Array.isArray(metrics.completedTutorial)
    ? metrics.completedTutorial[0] === true
    : metrics.completedTutorial === true;

  const handleScorePoints = (points: number) => {
    const newScore = currentScore + points;
    setCurrentScore(newScore);

    // Emit semantic event instead of updating metrics directly
    engine.emit('userScored', { points: newScore });
  };

  const handleLevelUp = () => {
    const newLevel = currentLevel + 1;
    setCurrentLevel(newLevel);

    // Emit level up event
    engine.emit('userLeveledUp', { level: newLevel });
  };

  const handleCompleteTutorial = () => {
    // Emit tutorial completion event
    engine.emit('tutorialCompleted');
  };

  const handleBossDefeat = () => {
    const scoreGained = 250;
    const newScore = currentScore + scoreGained;
    const newLevel = currentLevel + 1;

    setCurrentScore(newScore);
    setCurrentLevel(newLevel);

    // Single event can update multiple metrics
    engine.emit('bossDefeated', {
      scoreGained: newScore,
      newLevel: newLevel
    });
  };

  const handleReset = () => {
    engine.reset();
    setCurrentScore(0);
    setCurrentLevel(1);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>Event-Based API Demo</h1>
      <p>
        This demo shows event-based tracking using <code>AchievementEngine</code> and semantic events.
        Instead of updating metrics directly, you emit events that represent business actions.
      </p>

      <div style={{
        padding: '15px',
        backgroundColor: '#f0f7ff',
        border: '1px solid #2196F3',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginTop: 0 }}>Why Use the Event-Based Pattern?</h3>
        <ul style={{ marginBottom: 0 }}>
          <li><strong>Better Semantics:</strong> <code>engine.emit('userScored', data)</code> is clearer than <code>update(&#123; score: 100 &#125;)</code></li>
          <li><strong>Event Mapping:</strong> One event can update multiple metrics automatically</li>
          <li><strong>Framework Agnostic:</strong> Same engine works in React, Vue, Angular, or vanilla JS</li>
          <li><strong>Testing:</strong> Events are easier to mock and test than metric updates</li>
        </ul>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
        <h3 style={{ marginTop: 0 }}>Current Progress</h3>
        <p><strong>Score:</strong> {currentScore} | <strong>Level:</strong> {currentLevel} | <strong>Tutorial:</strong> {tutorialCompleted ? 'Completed' : 'Not Started'}</p>
        <p><strong>Achievements Unlocked:</strong> {unlockedCount}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginBottom: '30px' }}>
        <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>Score Events</h3>
          <p style={{ fontSize: '14px', color: '#666' }}>Emit: <code>engine.emit('userScored', &#123; points &#125;)</code></p>
          <button
            onClick={() => handleScorePoints(100)}
            style={{ padding: '8px 12px', margin: '5px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%' }}
          >
            Score 100 Points
          </button>
          <button
            onClick={() => handleScorePoints(500)}
            style={{ padding: '8px 12px', margin: '5px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%' }}
          >
            Score 500 Points
          </button>
          <button
            onClick={() => handleScorePoints(1000)}
            style={{ padding: '8px 12px', margin: '5px', backgroundColor: '#9C27B0', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%' }}
          >
            Score 1000 Points
          </button>
        </div>

        <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>Level Events</h3>
          <p style={{ fontSize: '14px', color: '#666' }}>Emit: <code>engine.emit('userLeveledUp', &#123; level &#125;)</code></p>
          <button
            onClick={handleLevelUp}
            style={{ padding: '8px 12px', margin: '5px', backgroundColor: '#FF9800', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%' }}
          >
            Level Up
          </button>
          <p style={{ fontSize: '14px', marginTop: '10px' }}>Current Level: {currentLevel}</p>
        </div>

        <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>Tutorial Event</h3>
          <p style={{ fontSize: '14px', color: '#666' }}>Emit: <code>engine.emit('tutorialCompleted')</code></p>
          <button
            onClick={handleCompleteTutorial}
            disabled={tutorialCompleted}
            style={{
              padding: '8px 12px',
              margin: '5px',
              backgroundColor: tutorialCompleted ? '#ccc' : '#009688',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: tutorialCompleted ? 'not-allowed' : 'pointer',
              width: '100%'
            }}
          >
            {tutorialCompleted ? 'Tutorial Completed' : 'Complete Tutorial'}
          </button>
        </div>

        <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>Multi-Metric Event</h3>
          <p style={{ fontSize: '14px', color: '#666' }}>One event updates multiple metrics!</p>
          <button
            onClick={handleBossDefeat}
            style={{ padding: '8px 12px', margin: '5px', backgroundColor: '#F44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%' }}
          >
            Defeat Boss
          </button>
          <p style={{ fontSize: '12px', marginTop: '10px', color: '#666' }}>Triggers both score and level increase</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={() => setIsModalOpen(true)}
          style={{ padding: '10px 20px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          View All Achievements
        </button>
        <button
          onClick={handleReset}
          style={{ padding: '10px 20px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Reset Progress
        </button>
      </div>

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: '8px' }}>
        <h3 style={{ marginTop: 0 }}>Code Example</h3>
        <pre style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '4px', overflow: 'auto' }}>
{`// 1. Create engine outside React (framework-agnostic)
const engine = new AchievementEngine({
  achievements,
  eventMapping: {
    'userScored': (data) => ({ score: data.points }),
    'userLeveledUp': (data) => ({ level: data.level })
  },
  storage: StorageType.Local
});

// 2. Pass engine to provider
<AchievementProvider engine={engine}>
  <YourApp />
</AchievementProvider>

// 3. Use in components
const MyComponent = () => {
  const engine = useAchievementEngine();

  const handleAction = () => {
    // Emit semantic events
    engine.emit('userScored', { points: 100 });
  };
};`}
        </pre>
      </div>

      <AchievementsWidget
        placement="inline"
        label="Inline Achievement Widget"
        buttonStyles={{
          maxWidth: '260px',
          border: '1px solid #d8e0ea',
          color: '#172033',
        }}
      />

      {isModalOpen && (
        <AchievementsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

type Story = StoryObj<typeof meta>;

export const EventBasedPattern: Story = {
  render: () => (
    <AchievementProvider engine={achievementEngine}>
      <EventBasedDemo />
    </AchievementProvider>
  )
};

export const ComparisonWithOldPattern: Story = {
  render: () => (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Pattern Comparison: Direct Metrics vs Event-Based</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '30px' }}>
        <div style={{ padding: '20px', border: '2px solid #4CAF50', borderRadius: '8px' }}>
          <h2 style={{ color: '#4CAF50', marginTop: 0 }}>Direct Metric Tracking</h2>
          <p><strong>Best for:</strong> Simple React apps and quick integrations</p>
          <h3>Setup:</h3>
          <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px', fontSize: '12px', overflow: 'auto' }}>
{`<AchievementProvider achievements={config}>
  <App />
</AchievementProvider>

const { update } = useAchievements();
update({ score: 100 });`}
          </pre>
          <h3>Pros:</h3>
          <ul>
            <li>Simpler for basic use cases</li>
            <li>Less boilerplate code</li>
            <li>Direct metric updates</li>
          </ul>
          <h3>Cons:</h3>
          <ul>
            <li>Tightly coupled to React</li>
            <li>Less semantic (what does "score: 100" mean?)</li>
            <li>Harder to test</li>
          </ul>
        </div>

        <div style={{ padding: '20px', border: '2px solid #2196F3', borderRadius: '8px' }}>
          <h2 style={{ color: '#2196F3', marginTop: 0 }}>Event-Based Tracking</h2>
          <p><strong>Recommended for:</strong> Larger apps, multi-framework projects, event-driven flows</p>
          <h3>Setup:</h3>
          <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px', fontSize: '12px', overflow: 'auto' }}>
{`const engine = new AchievementEngine({
  achievements,
  eventMapping
});

<AchievementProvider engine={engine}>
  <App />
</AchievementProvider>

const engine = useAchievementEngine();
engine.emit('userScored', { points: 100 });`}
          </pre>
          <h3>Pros:</h3>
          <ul>
            <li>Framework agnostic (use anywhere)</li>
            <li>Semantic events (better DX)</li>
            <li>Event mapping (one event → multiple metrics)</li>
            <li>Easier to test and mock</li>
          </ul>
          <h3>Cons:</h3>
          <ul>
            <li>Slightly more setup code</li>
            <li>Additional concept to learn</li>
          </ul>
        </div>
      </div>

      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#e8f5e9', borderRadius: '8px' }}>
        <h2 style={{ marginTop: 0 }}>Migration Guide</h2>
        <p><strong>Can I use both patterns?</strong> Yes! They can coexist in the same app.</p>
        <p><strong>Should I migrate?</strong> Not required. Direct metric tracking is still the recommended path for simple React apps.</p>
        <p><strong>When to use event-based tracking?</strong> Larger apps, framework-agnostic needs, analytics-style event streams, and cleaner isolated tests.</p>
        <p><strong>When to use direct metric tracking?</strong> Simple apps, quick prototypes, and React-only projects.</p>
      </div>
    </div>
  )
};
