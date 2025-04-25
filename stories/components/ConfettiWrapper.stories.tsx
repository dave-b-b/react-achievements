import React, { useState, useEffect } from 'react';
import { StoryFn, Meta } from '@storybook/react';
import ConfettiWrapper from '../../src/components/ConfettiWrapper';

export default {
    title: 'Components/ConfettiWrapper',
    component: ConfettiWrapper,
} as Meta;

const Template: StoryFn = () => {
    const [showConfetti, setShowConfetti] = useState(false);

    return (
        <div style={{ padding: '20px' }}>
            <h2>Confetti Animation Demo</h2>
            <p>Click the button to trigger the confetti animation.</p>
            
            <button 
                onClick={() => {
                    setShowConfetti(true);
                    setTimeout(() => setShowConfetti(false), 5000);
                }}
                style={{
                    padding: '10px 20px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px'
                }}
            >
                Celebrate! 🎉
            </button>

            <ConfettiWrapper show={showConfetti} />

            <div style={{ marginTop: '20px' }}>
                <h3>Component Details:</h3>
                <ul>
                    <li>The confetti animation plays when the <code>show</code> prop is true</li>
                    <li>Animation automatically stops when particles fall off screen</li>
                    <li>Uses window dimensions for full-screen coverage</li>
                    <li>Reacts to window resize events</li>
                </ul>
            </div>
        </div>
    );
};

export const Default = Template.bind({});
Default.parameters = {
    docs: {
        description: {
            story: 'A celebratory confetti animation component used when achievements are unlocked.',
        },
    },
};

// Test rapid toggling of the show prop
const RapidToggleTemplate: StoryFn = () => {
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        let count = 0;
        const interval = setInterval(() => {
            if (count < 5) {
                setShowConfetti(prev => !prev);
                count++;
            } else {
                clearInterval(interval);
                setShowConfetti(false);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            <h2>Rapid Toggle Test</h2>
            <p>Tests the confetti animation with rapid show/hide transitions.</p>
            <ConfettiWrapper show={showConfetti} />
        </div>
    );
};

export const RapidToggle = RapidToggleTemplate.bind({});
RapidToggle.parameters = {
    docs: {
        description: {
            story: 'Tests the component\'s stability when rapidly toggling the show prop.',
        },
    },
};

// Test multiple simultaneous instances
const MultipleInstancesTemplate: StoryFn = () => {
    const [showConfetti1, setShowConfetti1] = useState(false);
    const [showConfetti2, setShowConfetti2] = useState(false);

    return (
        <div style={{ padding: '20px' }}>
            <h2>Multiple Instances Test</h2>
            <p>Tests multiple confetti animations running simultaneously.</p>
            
            <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                    onClick={() => {
                        setShowConfetti1(true);
                        setTimeout(() => setShowConfetti1(false), 5000);
                    }}
                    style={{
                        padding: '10px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px'
                    }}
                >
                    Trigger Confetti 1
                </button>
                
                <button 
                    onClick={() => {
                        setShowConfetti2(true);
                        setTimeout(() => setShowConfetti2(false), 5000);
                    }}
                    style={{
                        padding: '10px',
                        backgroundColor: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px'
                    }}
                >
                    Trigger Confetti 2
                </button>
            </div>

            <ConfettiWrapper show={showConfetti1} />
            <ConfettiWrapper show={showConfetti2} />
        </div>
    );
};

export const MultipleInstances = MultipleInstancesTemplate.bind({});
MultipleInstances.parameters = {
    docs: {
        description: {
            story: 'Tests multiple confetti instances running simultaneously.',
        },
    },
};

// Add window resize test
const WindowResizeTest: StoryFn = () => {
    const [showConfetti, setShowConfetti] = useState(false);
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            <h2>Window Resize Test</h2>
            <p>Current window size: {windowSize.width}x{windowSize.height}</p>
            <p>Try resizing your browser window to see the confetti adapt.</p>
            
            <button 
                onClick={() => {
                    setShowConfetti(true);
                    setTimeout(() => setShowConfetti(false), 5000);
                }}
                style={{
                    padding: '10px 20px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px'
                }}
            >
                Start Confetti
            </button>

            <ConfettiWrapper show={showConfetti} />
        </div>
    );
};

export const ResizeHandling = WindowResizeTest.bind({});
ResizeHandling.parameters = {
    docs: {
        description: {
            story: 'Tests the confetti component\'s ability to adapt to window resize events.',
        },
    },
};