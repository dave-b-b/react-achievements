import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
    AchievementProvider,
    useAchievements,
    StorageType,
    IndexedDBStorage,
    RestApiStorage,
    AsyncStorageAdapter,
    OfflineQueueStorage
} from '../src/index';

const meta: Meta = {
    title: 'Async Storage/Live Demos',
    parameters: {
        layout: 'centered',
    },
};

export default meta;

// Simple achievement config for testing
const achievements = {
    clicks: {
        10: { title: 'Clicker', description: 'Click 10 times', icon: '👆' },
        25: { title: 'Super Clicker', description: 'Click 25 times', icon: '🚀' },
        50: { title: 'Click Master', description: 'Click 50 times', icon: '🏆' }
    },
    score: {
        100: { title: 'Century', description: 'Score 100 points', icon: '💯' },
        500: { title: 'High Scorer', description: 'Score 500 points', icon: '⭐' }
    }
};

// Demo component to interact with achievements
const DemoControls: React.FC<{ storageType: string }> = ({ storageType }) => {
    const { update, achievements: state, reset, getState } = useAchievements();
    const [clicks, setClicks] = useState(0);
    const [score, setScore] = useState(0);

    const handleClick = () => {
        const newClicks = clicks + 1;
        setClicks(newClicks);
        update({ clicks: newClicks });
    };

    const handleScore = (amount: number) => {
        const newScore = score + amount;
        setScore(newScore);
        update({ score: newScore });
    };

    const handleReset = () => {
        reset();
        setClicks(0);
        setScore(0);
    };

    const currentState = getState();

    return (
        <div style={{
            padding: '20px',
            border: '2px solid #ddd',
            borderRadius: '8px',
            minWidth: '400px'
        }}>
            <h3 style={{ marginTop: 0 }}>
                Testing: {storageType}
            </h3>

            <div style={{ marginBottom: '20px' }}>
                <p><strong>Instructions:</strong></p>
                <ol style={{ fontSize: '14px', paddingLeft: '20px' }}>
                    <li>Click the buttons to trigger achievements</li>
                    <li>Watch for toast notifications when achievements unlock</li>
                    <li>Refresh the page to verify persistence</li>
                    <li>Open browser DevTools to inspect storage</li>
                </ol>
            </div>

            <div style={{
                display: 'flex',
                gap: '10px',
                marginBottom: '20px',
                flexWrap: 'wrap'
            }}>
                <button
                    onClick={handleClick}
                    style={{
                        padding: '10px 20px',
                        fontSize: '16px',
                        background: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Click Me! ({clicks})
                </button>

                <button
                    onClick={() => handleScore(50)}
                    style={{
                        padding: '10px 20px',
                        fontSize: '16px',
                        background: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    +50 Score
                </button>

                <button
                    onClick={() => handleScore(100)}
                    style={{
                        padding: '10px 20px',
                        fontSize: '16px',
                        background: '#FF9800',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    +100 Score
                </button>
            </div>

            <div style={{
                background: '#f5f5f5',
                padding: '15px',
                borderRadius: '4px',
                marginBottom: '15px'
            }}>
                <h4 style={{ margin: '0 0 10px 0' }}>Current State:</h4>
                <p style={{ margin: '5px 0', fontFamily: 'monospace' }}>
                    Clicks: {clicks}
                </p>
                <p style={{ margin: '5px 0', fontFamily: 'monospace' }}>
                    Score: {score}
                </p>
                <p style={{ margin: '5px 0', fontFamily: 'monospace' }}>
                    Unlocked: {state.unlocked.length} / {Object.values(achievements).flat().length}
                </p>
            </div>

            <div style={{
                background: '#e3f2fd',
                padding: '15px',
                borderRadius: '4px',
                marginBottom: '15px'
            }}>
                <h4 style={{ margin: '0 0 10px 0' }}>Storage Inspection:</h4>
                <details>
                    <summary style={{ cursor: 'pointer', marginBottom: '10px' }}>
                        View Raw Storage Data
                    </summary>
                    <pre style={{
                        fontSize: '12px',
                        overflow: 'auto',
                        maxHeight: '200px',
                        background: 'white',
                        padding: '10px',
                        borderRadius: '4px'
                    }}>
                        {JSON.stringify(currentState, null, 2)}
                    </pre>
                </details>
            </div>

            <button
                onClick={handleReset}
                style={{
                    padding: '10px 20px',
                    fontSize: '14px',
                    background: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    width: '100%'
                }}
            >
                Reset Everything
            </button>
        </div>
    );
};

// Story 1: IndexedDB Storage
export const IndexedDBStorageDemo: StoryObj = {
    render: () => (
        <AchievementProvider
            achievements={achievements}
            storage={StorageType.IndexedDB}
        >
            <DemoControls storageType="IndexedDB (Async)" />
            <div style={{
                marginTop: '20px',
                padding: '10px',
                background: '#fff3cd',
                borderRadius: '4px',
                fontSize: '14px'
            }}>
                <strong>How to verify:</strong>
                <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
                    <li>Open DevTools → Application → IndexedDB</li>
                    <li>Look for database: "react-achievements"</li>
                    <li>Check the "achievements" object store</li>
                    <li>You should see "metrics" and "unlocked" entries</li>
                </ul>
            </div>
        </AchievementProvider>
    ),
};

// Story 2: LocalStorage (baseline comparison)
export const LocalStorageDemo: StoryObj = {
    render: () => (
        <AchievementProvider
            achievements={achievements}
            storage={StorageType.Local}
        >
            <DemoControls storageType="LocalStorage (Sync)" />
            <div style={{
                marginTop: '20px',
                padding: '10px',
                background: '#d1ecf1',
                borderRadius: '4px',
                fontSize: '14px'
            }}>
                <strong>How to verify:</strong>
                <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
                    <li>Open DevTools → Application → Local Storage</li>
                    <li>Look for keys starting with "achievements_"</li>
                    <li>You should see metrics and unlocked arrays</li>
                </ul>
            </div>
        </AchievementProvider>
    ),
};

// Story 3: Mock REST API Storage (simulated)
const MockRestApiStorage = () => {
    const [logs, setLogs] = useState<string[]>([]);

    // Create a mock REST API storage that logs operations
    const mockStorage: RestApiStorage = React.useMemo(() => {
        const addLog = (msg: string) => {
            setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
        };

        return {
            async getMetrics() {
                addLog('GET /metrics');
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 300));
                const stored = localStorage.getItem('mock_api_metrics');
                return stored ? JSON.parse(stored) : {};
            },
            async setMetrics(metrics) {
                addLog(`PUT /metrics - ${JSON.stringify(metrics)}`);
                await new Promise(resolve => setTimeout(resolve, 300));
                localStorage.setItem('mock_api_metrics', JSON.stringify(metrics));
            },
            async getUnlockedAchievements() {
                addLog('GET /unlocked');
                await new Promise(resolve => setTimeout(resolve, 300));
                const stored = localStorage.getItem('mock_api_unlocked');
                return stored ? JSON.parse(stored) : [];
            },
            async setUnlockedAchievements(achievements) {
                addLog(`PUT /unlocked - ${achievements.length} achievements`);
                await new Promise(resolve => setTimeout(resolve, 300));
                localStorage.setItem('mock_api_unlocked', JSON.stringify(achievements));
            },
            async clear() {
                addLog('DELETE /achievements');
                await new Promise(resolve => setTimeout(resolve, 300));
                localStorage.removeItem('mock_api_metrics');
                localStorage.removeItem('mock_api_unlocked');
            }
        } as RestApiStorage;
    }, []);

    return (
        <div>
            <AchievementProvider
                achievements={achievements}
                storage={mockStorage}
            >
                <DemoControls storageType="Mock REST API (Async)" />
            </AchievementProvider>

            <div style={{
                marginTop: '20px',
                padding: '15px',
                background: '#f8f9fa',
                borderRadius: '4px',
                maxHeight: '200px',
                overflow: 'auto'
            }}>
                <h4 style={{ margin: '0 0 10px 0' }}>API Request Log:</h4>
                <div style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                    {logs.length === 0 ? (
                        <p style={{ color: '#999', margin: 0 }}>No requests yet...</p>
                    ) : (
                        logs.map((log, i) => (
                            <div key={i} style={{
                                padding: '4px 0',
                                borderBottom: '1px solid #eee'
                            }}>
                                {log}
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div style={{
                marginTop: '20px',
                padding: '10px',
                background: '#d4edda',
                borderRadius: '4px',
                fontSize: '14px'
            }}>
                <strong>Testing with real API:</strong>
                <ol style={{ margin: '10px 0', paddingLeft: '20px' }}>
                    <li>Set up a backend with these endpoints:
                        <ul style={{ fontSize: '12px' }}>
                            <li>GET/PUT /users/:userId/achievements/metrics</li>
                            <li>GET/PUT /users/:userId/achievements/unlocked</li>
                            <li>DELETE /users/:userId/achievements</li>
                        </ul>
                    </li>
                    <li>Use RestApiStorage with your API URL</li>
                    <li>Test multi-device sync by opening in different browsers</li>
                </ol>
            </div>
        </div>
    );
};

export const MockRestAPIDemo: StoryObj = {
    render: () => <MockRestApiStorage />,
};

// Story 4: Offline Queue Demo
const OfflineQueueDemo = () => {
    const [isOnline, setIsOnline] = useState(true);
    const [queueStatus, setQueueStatus] = useState<{ pending: number; operations: any[] }>({ pending: 0, operations: [] });
    const [logs, setLogs] = useState<string[]>([]);

    const mockStorage = React.useMemo(() => {
        const addLog = (msg: string) => {
            setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
        };

        return {
            async getMetrics() {
                if (!isOnline) throw new Error('Offline');
                addLog('✓ GET /metrics (online)');
                await new Promise(resolve => setTimeout(resolve, 200));
                const stored = localStorage.getItem('offline_queue_metrics');
                return stored ? JSON.parse(stored) : {};
            },
            async setMetrics(metrics: any) {
                if (!isOnline) throw new Error('Offline');
                addLog(`✓ PUT /metrics (online)`);
                await new Promise(resolve => setTimeout(resolve, 200));
                localStorage.setItem('offline_queue_metrics', JSON.stringify(metrics));
            },
            async getUnlockedAchievements() {
                if (!isOnline) throw new Error('Offline');
                addLog('✓ GET /unlocked (online)');
                await new Promise(resolve => setTimeout(resolve, 200));
                const stored = localStorage.getItem('offline_queue_unlocked');
                return stored ? JSON.parse(stored) : [];
            },
            async setUnlockedAchievements(achievements: any) {
                if (!isOnline) throw new Error('Offline');
                addLog(`✓ PUT /unlocked (online)`);
                await new Promise(resolve => setTimeout(resolve, 200));
                localStorage.setItem('offline_queue_unlocked', JSON.stringify(achievements));
            },
            async clear() {
                if (!isOnline) throw new Error('Offline');
                addLog('✓ DELETE /achievements (online)');
                await new Promise(resolve => setTimeout(resolve, 200));
                localStorage.removeItem('offline_queue_metrics');
                localStorage.removeItem('offline_queue_unlocked');
            }
        } as any;
    }, [isOnline]);

    const offlineStorage = React.useMemo(() => {
        const storage = new OfflineQueueStorage(mockStorage);

        // Update queue status periodically
        const interval = setInterval(() => {
            const status = storage.getQueueStatus();
            setQueueStatus(status as any);
        }, 500);

        return { storage, cleanup: () => clearInterval(interval) };
    }, [mockStorage]);

    React.useEffect(() => {
        return () => offlineStorage.cleanup();
    }, [offlineStorage]);

    const toggleOnline = () => {
        const newState = !isOnline;
        setIsOnline(newState);
        setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${newState ? '🟢 ONLINE' : '🔴 OFFLINE'}`]);

        if (newState) {
            // Trigger sync when going back online
            setTimeout(() => {
                offlineStorage.storage.sync().then(() => {
                    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ⚡ Queue synced`]);
                });
            }, 100);
        }
    };

    return (
        <div>
            <AchievementProvider
                achievements={achievements}
                storage={offlineStorage.storage}
            >
                <div style={{ marginBottom: '20px' }}>
                    <button
                        onClick={toggleOnline}
                        style={{
                            padding: '10px 20px',
                            fontSize: '16px',
                            background: isOnline ? '#4CAF50' : '#f44336',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            width: '100%',
                            marginBottom: '10px'
                        }}
                    >
                        {isOnline ? '🟢 ONLINE' : '🔴 OFFLINE'} - Click to toggle
                    </button>

                    <div style={{
                        padding: '10px',
                        background: queueStatus.pending > 0 ? '#fff3cd' : '#d4edda',
                        borderRadius: '4px',
                        fontSize: '14px',
                        marginBottom: '10px'
                    }}>
                        <strong>Queue Status:</strong> {queueStatus.pending} operations pending
                    </div>
                </div>

                <DemoControls storageType="Offline Queue (Async)" />
            </AchievementProvider>

            <div style={{
                marginTop: '20px',
                padding: '15px',
                background: '#f8f9fa',
                borderRadius: '4px',
                maxHeight: '200px',
                overflow: 'auto'
            }}>
                <h4 style={{ margin: '0 0 10px 0' }}>Activity Log:</h4>
                <div style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                    {logs.map((log, i) => (
                        <div key={i} style={{
                            padding: '4px 0',
                            borderBottom: '1px solid #eee'
                        }}>
                            {log}
                        </div>
                    ))}
                </div>
            </div>

            <div style={{
                marginTop: '20px',
                padding: '10px',
                background: '#e7f3ff',
                borderRadius: '4px',
                fontSize: '14px'
            }}>
                <strong>Test Scenario:</strong>
                <ol style={{ margin: '10px 0', paddingLeft: '20px' }}>
                    <li>Click "OFFLINE" button to simulate offline mode</li>
                    <li>Click buttons to unlock achievements while offline</li>
                    <li>Watch queue status increase</li>
                    <li>Click "ONLINE" to go back online</li>
                    <li>Watch operations sync automatically</li>
                </ol>
            </div>
        </div>
    );
};

export const OfflineQueueDemoStory: StoryObj = {
    render: () => <OfflineQueueDemo />,
};
