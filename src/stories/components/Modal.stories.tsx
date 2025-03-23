import React from 'react';
import { StoryFn, Meta } from '@storybook/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import achievementReducer from '../../redux/achievementSlice';
import notificationReducer, {addNotification} from '../../redux/notificationSlice';
import { AchievementProvider } from '../../providers/AchievementProvider';
import {
    AchievementDetails,
    AchievementConfiguration,
    InitialAchievementMetrics,
    AchievementMetricValue
} from '../../types';
import { useDispatch } from 'react-redux';
import { unlockAchievement } from '../../redux/achievementSlice';
import { defaultAchievementIcons } from '../../assets/defaultIcons';
import AchievementModal from "../../components/AchievementModal";

export default {
    title: 'Providers/AchievementProvider/AchievementModal',
    component: AchievementProvider,
} as Meta;

// Mock Components
const MockBadgesModal = () => <div data-testid="badges-modal">Mock Badges Modal</div>;
const MockBadgesButton = () => <div data-testid="badges-button">Mock Badges Button</div>;
const MockConfettiWrapper = () => <div data-testid="confetti-wrapper">Mock Confetti Wrapper</div>;

const Template: StoryFn<{ config: AchievementConfiguration; initialState: InitialAchievementMetrics }> = (args) => {
    const store = configureStore({
        reducer: {
            achievements: achievementReducer,
            notifications: notificationReducer,
        },
    });

    return (
        <Provider store={store}>
            <AchievementProvider
                config={args.config}
                initialState={args.initialState}
                AchievementModal={(props) => <AchievementModal {...props} />}
                BadgesModal={MockBadgesModal}
                BadgesButton={MockBadgesButton}
                ConfettiWrapper={MockConfettiWrapper}
                icons={defaultAchievementIcons}
            >
                <TestComponent />
            </AchievementProvider>
        </Provider>
    );
};

const TestComponent = () => {
    const dispatch = useDispatch();

    const triggerAchievementModal = () => {
        const achievement: AchievementDetails = {
            achievementId: 'test_achievement',
            achievementTitle: 'Test Achievement',
            achievementDescription: 'This is a test achievement description.',
            achievementIconKey: 'default',
        };

        dispatch(unlockAchievement(achievement.achievementId));
        dispatch(addNotification(achievement));
    };

    return (
        <div>
            <button onClick={triggerAchievementModal}>Trigger Achievement Modal</button>
        </div>
    );
};

export const ModalTest = Template.bind({});
ModalTest.args = {
    config: {
        testMetric: [
            {
                isConditionMet: (value: AchievementMetricValue) => typeof value === 'number' && value >= 1,
                achievementDetails: {
                    achievementId: 'test_achievement',
                    achievementTitle: 'Test Achievement',
                    achievementDescription: 'This is a test achievement description.',
                    achievementIconKey: 'default',
                },
            },
        ],
    },
    initialState: {
        testMetric: 0,
    },
};