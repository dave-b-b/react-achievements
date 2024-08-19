import React from 'react';
import AchievementModal from '../../src/components/AchievementModal';

export default {
    title: 'AchievementModal',
    component: AchievementModal,
};

export const Default = () => (
    <AchievementModal
        show={true}
        achievement={{
            id: 'test_achievement',
            title: 'Test Achievement',
            description: 'This is a test achievement',
            icon: 'test-icon.png',
        }}
        onClose={() => console.log('Modal closed')}
    />
);