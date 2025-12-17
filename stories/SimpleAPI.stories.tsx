import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AchievementProvider } from '../src/providers/AchievementProvider';
import { useSimpleAchievements } from '../src/hooks/useSimpleAchievements';
import { BadgesButton } from '../src/core/components/BadgesButton';
import { BadgesModal } from '../src/core/components/BadgesModal';
import { StorageType, SimpleAchievementConfig, AchievementDetails } from '../src/core/types';

/**
 * The Simple API provides an easier way to define achievements using threshold-based 
 * conditions and custom functions. This approach reduces boilerplate while maintaining
 * full compatibility with the existing complex API.
 * 
 * ## Key Benefits
 * - **90% less configuration code** for common use cases
 * - **Threshold-based achievements** for numeric values
 * - **Boolean and string achievements** 
 * - **Custom condition functions** for complex logic
 * - **Automatic ID generation** from metric names and thresholds
 * - **Built-in defaults** for descriptions and icons
 */
const meta: Meta<typeof AchievementProvider> = {
  title: 'Simple API/Overview',
  component: AchievementProvider,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Demonstrates the new simplified achievement configuration API that reduces complexity while maintaining full functionality.'
      }
    }
  },
  tags: ['autodocs'],
};

export default meta;

// Simple achievement configuration - much cleaner than the complex format
const simpleAchievements: SimpleAchievementConfig = {
  // Numeric threshold achievements
  score: {
    100: { title: 'Century!', description: 'Score 100 points', icon: '🏆' },
    500: { title: 'High Scorer!', description: 'Score 500 points', icon: '⭐' },
    1000: { title: 'Master!', description: 'Score 1000 points', icon: '💎' }
  },
  
  // Level-based achievements  
  level: {
    5: { title: 'Leveling Up', description: 'Reach level 5', icon: '📈' },
    10: { title: 'Double Digits', description: 'Reach level 10', icon: '🔟' },
    25: { title: 'Quarter Century', description: 'Reach level 25', icon: '🎯' }
  },
  
  // Boolean achievements
  completedTutorial: {
    true: { title: 'Tutorial Master', description: 'Complete the tutorial', icon: '📚' }
  },
  
  // String-based achievements
  characterClass: {
    wizard: { title: 'Arcane Scholar', description: 'Choose the wizard class', icon: '🧙‍♂️' },
    warrior: { title: 'Battle Hardened', description: 'Choose the warrior class', icon: '⚔️' },
    rogue: { title: 'Shadow Walker', description: 'Choose the rogue class', icon: '🗡️' }
  }
};

// Demo component showcasing the simple API
const SimpleAPIDemo = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const { track, trackMultiple, unlocked, unlockedCount, reset } = useSimpleAchievements();

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>Simple API Demo</h1>
      <p>This demo shows how easy it is to track achievements with the new simple API.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
        <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>Score Achievements</h3>
          <button 
            onClick={() => track('score', 100)}
            style={{ padding: '8px 12px', margin: '5px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Score 100
          </button>
          <button 
            onClick={() => track('score', 500)}
            style={{ padding: '8px 12px', margin: '5px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Score 500
          </button>
          <button 
            onClick={() => track('score', 1000)}
            style={{ padding: '8px 12px', margin: '5px', backgroundColor: '#9C27B0', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Score 1000
          </button>
        </div>

        <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>Level Achievements</h3>
          <button 
            onClick={() => track('level', 5)}
            style={{ padding: '8px 12px', margin: '5px', backgroundColor: '#FF9800', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Level 5
          </button>
          <button 
            onClick={() => track('level', 10)}
            style={{ padding: '8px 12px', margin: '5px', backgroundColor: '#FF5722', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Level 10
          </button>
          <button 
            onClick={() => track('level', 25)}
            style={{ padding: '8px 12px', margin: '5px', backgroundColor: '#795548', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Level 25
          </button>
        </div>

        <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>Other Achievements</h3>
          <button 
            onClick={() => track('completedTutorial', true)}
            style={{ padding: '8px 12px', margin: '5px', backgroundColor: '#607D8B', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Complete Tutorial
          </button>
          <button 
            onClick={() => track('characterClass', 'wizard')}
            style={{ padding: '8px 12px', margin: '5px', backgroundColor: '#673AB7', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Choose Wizard
          </button>
          <button 
            onClick={() => track('characterClass', 'warrior')}
            style={{ padding: '8px 12px', margin: '5px', backgroundColor: '#F44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Choose Warrior
          </button>
        </div>

        <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>Bulk Actions</h3>
          <button 
            onClick={() => trackMultiple({ score: 1000, level: 25, completedTutorial: true })}
            style={{ padding: '8px 12px', margin: '5px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Unlock Multiple
          </button>
          <button 
            onClick={reset}
            style={{ padding: '8px 12px', margin: '5px', backgroundColor: '#9E9E9E', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Reset All
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div style={{ flex: 1, padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
          <h3>Achievement Status</h3>
          <p><strong>Unlocked Count:</strong> {unlockedCount}</p>
          <p><strong>Unlocked IDs:</strong></p>
          <ul style={{ maxHeight: '150px', overflowY: 'auto' }}>
            {unlocked.map(id => (
              <li key={id} style={{ fontSize: '14px', fontFamily: 'monospace' }}>{id}</li>
            ))}
          </ul>
        </div>
      </div>

      <BadgesButton 
        position="bottom-right" 
        onClick={() => setIsModalOpen(true)}
        unlockedAchievements={unlocked.map(id => {
          // Convert unlocked IDs back to achievement details for display
          let achievement;
          Object.entries(simpleAchievements).forEach(([metric, thresholds]) => {
            Object.entries(thresholds).forEach(([threshold, details]) => {
              if (id === `${metric}_${threshold}`) {
                achievement = {
                  achievementId: id,
                  achievementTitle: details.title,
                  achievementDescription: details.description || `Achieve ${threshold} for ${metric}`,
                  achievementIconKey: details.icon || 'default'
                };
              }
            });
          });
          return achievement;
        }).filter(Boolean) as unknown as AchievementDetails[]}
      />
      
      <BadgesModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        achievements={unlocked.map(id => {
          let achievement;
          Object.entries(simpleAchievements).forEach(([metric, thresholds]) => {
            Object.entries(thresholds).forEach(([threshold, details]) => {
              if (id === `${metric}_${threshold}`) {
                achievement = {
                  achievementId: id,
                  achievementTitle: details.title,
                  achievementDescription: details.description || `Achieve ${threshold} for ${metric}`,
                  achievementIconKey: details.icon || 'default'
                };
              }
            });
          });
          return achievement;
        }).filter(Boolean) as unknown as AchievementDetails[]}
        icons={{}}
      />
    </div>
  );
};

/**
 * Basic threshold-based achievements using the simple API.
 * No need for complex condition functions for common use cases.
 */
export const ThresholdBasedAchievements: StoryObj<typeof AchievementProvider> = {
  args: {
    achievements: simpleAchievements,
    storage: StorageType.Memory
  },
  render: (args) => (
    <AchievementProvider {...args}>
      <SimpleAPIDemo />
    </AchievementProvider>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Shows how to define achievements using simple threshold values. Much cleaner than the complex format!'
      }
    }
  }
};

/**
 * Custom condition achievements for complex logic that can't be expressed as simple thresholds.
 */
export const CustomConditionAchievements: StoryObj<typeof AchievementProvider> = {
  args: {
    achievements: {
      // Mix simple and custom achievements
      score: {
        100: { title: 'Getting Started', icon: '🌱' }
      },
      combo: {
        custom: {
          title: 'Perfect Combo',
          description: 'Score 1000+ with 100% accuracy',
          icon: '💎',
          condition: (_metrics) => _metrics.score >= 1000 && _metrics.accuracy === 100
        }
      },
      gameplay: {
        custom: {
          title: 'Speed Runner',
          description: 'Complete level 10 in under 5 minutes',
          icon: '⚡',
          condition: (_metrics) => _metrics.level >= 10 && _metrics.completionTime < 300
        }
      }
    } as SimpleAchievementConfig,
    storage: StorageType.Memory
  },
  render: (args) => (
    <AchievementProvider {...args}>
      <CustomConditionDemo />
    </AchievementProvider>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates how to use custom condition functions for complex achievement logic while mixing with simple threshold-based achievements.'
      }
    }
  }
};

// Demo component for custom conditions
const CustomConditionDemo = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const { track, trackMultiple, unlocked, unlockedCount, reset } = useSimpleAchievements();

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Custom Condition Demo</h1>
      <p>This demo shows achievements with custom condition functions alongside simple threshold-based ones.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginBottom: '30px' }}>
        <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>Simple Achievement</h3>
          <button 
            onClick={() => track('score', 100)}
            style={{ padding: '8px 12px', margin: '5px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Score 100 (Simple)
          </button>
        </div>

        <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>Perfect Combo (Custom)</h3>
          <p style={{ fontSize: '12px', color: '#666' }}>Requires: score ≥ 1000 AND accuracy = 100</p>
          <button 
            onClick={() => trackMultiple({ score: 999, accuracy: 100 })}
            style={{ padding: '8px 12px', margin: '5px', backgroundColor: '#FF9800', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Almost Perfect (999/100)
          </button>
          <button 
            onClick={() => trackMultiple({ score: 1000, accuracy: 100 })}
            style={{ padding: '8px 12px', margin: '5px', backgroundColor: '#9C27B0', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Perfect! (1000/100)
          </button>
        </div>

        <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>Speed Runner (Custom)</h3>
          <p style={{ fontSize: '12px', color: '#666' }}>Requires: level ≥ 10 AND time &lt; 300s</p>
          <button 
            onClick={() => trackMultiple({ level: 10, completionTime: 350 })}
            style={{ padding: '8px 12px', margin: '5px', backgroundColor: '#FF5722', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Too Slow (10/350s)
          </button>
          <button 
            onClick={() => trackMultiple({ level: 10, completionTime: 250 })}
            style={{ padding: '8px 12px', margin: '5px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Speed Run! (10/250s)
          </button>
        </div>
      </div>

      <div style={{ padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>Achievement Status</h3>
        <p><strong>Unlocked:</strong> {unlockedCount}</p>
        <div style={{ fontSize: '14px', fontFamily: 'monospace' }}>
          {unlocked.map(id => <div key={id}>{id}</div>)}
        </div>
      </div>

      <button 
        onClick={reset}
        style={{ padding: '10px 20px', backgroundColor: '#9E9E9E', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        Reset All
      </button>

      <BadgesButton 
        position="bottom-right" 
        onClick={() => setIsModalOpen(true)}
        unlockedAchievements={[]}
      />
      
      <BadgesModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        achievements={[]}
      />
    </div>
  );
};