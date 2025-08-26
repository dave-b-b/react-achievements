import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AchievementProvider } from '../src/providers/AchievementProvider';
import { useSimpleAchievements } from '../src/hooks/useSimpleAchievements';
import { BadgesButton } from '../src/core/components/BadgesButton';
import { BadgesModal } from '../src/core/components/BadgesModal';
import { StorageType, SimpleAchievementConfig, AchievementDetails } from '../src/core/types';

/**
 * The increment functionality allows you to incrementally increase numeric metrics,
 * which is perfect for tracking repetitive actions like clicks, points scored,
 * or any cumulative activity.
 */
const meta: Meta<typeof AchievementProvider> = {
  title: 'Simple API/Increment Functionality',
  component: AchievementProvider,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Demonstrates the increment functionality for tracking cumulative achievements like clicks, points, or actions.'
      }
    }
  },
  tags: ['autodocs'],
};

export default meta;

// Achievement configuration for increment testing
const incrementAchievements: SimpleAchievementConfig = {
  buttonClicks: {
    1: { title: 'First Click', description: 'Click your first button', icon: '👆' },
    5: { title: 'Clicker', description: 'Click 5 times', icon: '🖱️' },
    10: { title: 'Super Clicker', description: 'Click 10 times', icon: '⚡' },
    25: { title: 'Click Master', description: 'Click 25 times', icon: '🏆' },
    50: { title: 'Click Legend', description: 'Click 50 times', icon: '👑' }
  },
  score: {
    50: { title: 'Getting Points', description: 'Score your first 50 points', icon: '🌟' },
    100: { title: 'Century Club', description: 'Score 100 points', icon: '💯' },
    250: { title: 'High Scorer', description: 'Score 250 points', icon: '🎯' },
    500: { title: 'Point Master', description: 'Score 500 points', icon: '💎' }
  },
  coins: {
    1: { title: 'First Coin', description: 'Collect your first coin', icon: '🪙' },
    10: { title: 'Coin Collector', description: 'Collect 10 coins', icon: '💰' },
    50: { title: 'Treasure Hunter', description: 'Collect 50 coins', icon: '💸' },
    100: { title: 'Rich', description: 'Collect 100 coins', icon: '🏦' }
  }
};

// Demo component showcasing increment functionality
const IncrementDemo = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const { increment, track, unlocked, unlockedCount, reset, getState } = useSimpleAchievements();
  const [metrics, setMetrics] = React.useState({ buttonClicks: 0, score: 0, coins: 0 });

  // Update local metrics display when state changes
  React.useEffect(() => {
    const state = getState();
    setMetrics({
      buttonClicks: Array.isArray(state.metrics.buttonClicks) ? (state.metrics.buttonClicks[0] as number) || 0 : 0,
      score: Array.isArray(state.metrics.score) ? (state.metrics.score[0] as number) || 0 : 0,
      coins: Array.isArray(state.metrics.coins) ? (state.metrics.coins[0] as number) || 0 : 0
    });
  }, [getState, unlocked.length]); // Re-run when achievements unlock

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Increment Functionality Demo</h1>
      <p>Test the increment functionality by clicking buttons to increase metrics and unlock achievements.</p>
      
      {/* Current Metrics Display */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '15px', 
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Button Clicks</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#007bff' }}>{metrics.buttonClicks}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Score</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#28a745' }}>{metrics.score}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Coins</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffc107' }}>{metrics.coins}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Achievements</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#dc3545' }}>{unlockedCount}</div>
        </div>
      </div>

      {/* Increment Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        
        {/* Button Clicks */}
        <div style={{ padding: '20px', border: '2px solid #007bff', borderRadius: '8px', backgroundColor: '#fff' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#007bff' }}>Button Clicks</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button 
              onClick={() => increment('buttonClicks')}
              style={{ 
                padding: '12px 16px', 
                backgroundColor: '#007bff', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500'
              }}
            >
              Click Me! (+1)
            </button>
            <button 
              onClick={() => increment('buttonClicks', 5)}
              style={{ 
                padding: '12px 16px', 
                backgroundColor: '#0056b3', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Bulk Click (+5)
            </button>
          </div>
          <div style={{ marginTop: '15px', fontSize: '12px', color: '#666' }}>
            <strong>Achievements:</strong> 1, 5, 10, 25, 50 clicks
          </div>
        </div>

        {/* Score */}
        <div style={{ padding: '20px', border: '2px solid #28a745', borderRadius: '8px', backgroundColor: '#fff' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#28a745' }}>Score Points</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button 
              onClick={() => increment('score', 10)}
              style={{ 
                padding: '12px 16px', 
                backgroundColor: '#28a745', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500'
              }}
            >
              Score Points (+10)
            </button>
            <button 
              onClick={() => increment('score', 25)}
              style={{ 
                padding: '12px 16px', 
                backgroundColor: '#1e7e34', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Big Score (+25)
            </button>
            <button 
              onClick={() => increment('score', 50)}
              style={{ 
                padding: '12px 16px', 
                backgroundColor: '#155724', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Mega Score (+50)
            </button>
          </div>
          <div style={{ marginTop: '15px', fontSize: '12px', color: '#666' }}>
            <strong>Achievements:</strong> 50, 100, 250, 500 points
          </div>
        </div>

        {/* Coins */}
        <div style={{ padding: '20px', border: '2px solid #ffc107', borderRadius: '8px', backgroundColor: '#fff' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#ffc107' }}>Collect Coins</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button 
              onClick={() => increment('coins')}
              style={{ 
                padding: '12px 16px', 
                backgroundColor: '#ffc107', 
                color: 'black', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500'
              }}
            >
              Find Coin (+1)
            </button>
            <button 
              onClick={() => increment('coins', 3)}
              style={{ 
                padding: '12px 16px', 
                backgroundColor: '#e0a800', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Coin Pouch (+3)
            </button>
            <button 
              onClick={() => increment('coins', 10)}
              style={{ 
                padding: '12px 16px', 
                backgroundColor: '#c69500', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Treasure Chest (+10)
            </button>
          </div>
          <div style={{ marginTop: '15px', fontSize: '12px', color: '#666' }}>
            <strong>Achievements:</strong> 1, 10, 50, 100 coins
          </div>
        </div>
      </div>

      {/* Mixed Actions */}
      <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '30px' }}>
        <h3 style={{ margin: '0 0 15px 0' }}>Combo Actions</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => {
              increment('buttonClicks');
              increment('score', 15);
              increment('coins');
            }}
            style={{ 
              padding: '12px 20px', 
              backgroundColor: '#6f42c1', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            Play Turn (Click +1, Score +15, Coin +1)
          </button>
          <button 
            onClick={() => {
              increment('score', 100);
              increment('coins', 20);
            }}
            style={{ 
              padding: '12px 20px', 
              backgroundColor: '#fd7e14', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            Bonus Round (Score +100, Coins +20)
          </button>
          <button 
            onClick={reset}
            style={{ 
              padding: '12px 20px', 
              backgroundColor: '#6c757d', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Reset All Progress
          </button>
        </div>
      </div>

      {/* Achievement Status */}
      <div style={{ 
        display: 'flex', 
        gap: '20px', 
        marginBottom: '20px' 
      }}>
        <div style={{ 
          flex: 1, 
          padding: '20px', 
          backgroundColor: '#e9ecef', 
          borderRadius: '8px' 
        }}>
          <h3 style={{ margin: '0 0 15px 0' }}>Unlocked Achievements ({unlockedCount})</h3>
          <div style={{ 
            maxHeight: '200px', 
            overflowY: 'auto',
            display: 'grid',
            gap: '8px'
          }}>
            {unlocked.length === 0 ? (
              <p style={{ margin: 0, fontStyle: 'italic', color: '#666' }}>
                No achievements unlocked yet. Start clicking to earn your first achievements!
              </p>
            ) : (
              unlocked.map(id => (
                <div 
                  key={id} 
                  style={{ 
                    padding: '8px 12px',
                    backgroundColor: 'white',
                    borderRadius: '4px',
                    fontSize: '14px', 
                    fontFamily: 'monospace',
                    border: '1px solid #dee2e6'
                  }}
                >
                  🏆 {id}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <BadgesButton 
        position="bottom-right" 
        onClick={() => setIsModalOpen(true)}
        unlockedAchievements={unlocked.map(id => {
          // Convert unlocked IDs back to achievement details for display
          let achievement;
          Object.entries(incrementAchievements).forEach(([metric, thresholds]) => {
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
          Object.entries(incrementAchievements).forEach(([metric, thresholds]) => {
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
 * Interactive demo of the increment functionality with multiple metrics and achievements.
 * Perfect for testing cumulative achievements like clicks, scores, or collected items.
 */
export const InteractiveIncrementDemo: StoryObj<typeof AchievementProvider> = {
  args: {
    achievements: incrementAchievements,
    storage: StorageType.Memory
  },
  render: (args) => (
    <AchievementProvider {...args}>
      <IncrementDemo />
    </AchievementProvider>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo showing how to use the increment function to track cumulative metrics. Click buttons to increment values and unlock achievements!'
      }
    }
  }
};

/**
 * Simple example showing basic increment usage patterns.
 */
export const BasicIncrementExampleStory: StoryObj<typeof AchievementProvider> = {
  args: {
    achievements: {
      clicks: {
        1: { title: 'First Click', icon: '👆' },
        3: { title: 'Trilogy', icon: '🖱️' },
        5: { title: 'High Five', icon: '✋' }
      }
    } as SimpleAchievementConfig,
    storage: StorageType.Memory
  },
  render: (args) => (
    <AchievementProvider {...args}>
      <BasicIncrementExampleComponent />
    </AchievementProvider>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Basic example showing how to increment a metric and unlock achievements based on thresholds.'
      }
    }
  }
};

// Basic example component
const BasicIncrementExampleComponent = () => {
  const { increment, unlocked, unlockedCount, getState } = useSimpleAchievements();
  const clicks = Array.isArray(getState().metrics.clicks) ? (getState().metrics.clicks[0] as number) || 0 : 0;

  return (
    <div style={{ padding: '40px', textAlign: 'center', maxWidth: '400px', margin: '0 auto' }}>
      <h2>Basic Increment Example</h2>
      <div style={{ fontSize: '48px', margin: '20px 0' }}>{clicks}</div>
      <p>Clicks: {clicks} | Achievements: {unlockedCount}</p>
      
      <button 
        onClick={() => increment('clicks')}
        style={{ 
          padding: '15px 30px', 
          fontSize: '18px', 
          backgroundColor: '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '8px', 
          cursor: 'pointer',
          margin: '10px'
        }}
      >
        Click Me!
      </button>

      <div style={{ marginTop: '20px' }}>
        <h4>Unlocked Achievements:</h4>
        {unlocked.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>Click the button to unlock achievements!</p>
        ) : (
          unlocked.map(id => (
            <div key={id} style={{ margin: '5px 0', color: '#28a745', fontWeight: 'bold' }}>
              🏆 {id}
            </div>
          ))
        )}
      </div>
    </div>
  );
};