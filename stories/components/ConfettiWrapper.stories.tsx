import React, { useState } from 'react';
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