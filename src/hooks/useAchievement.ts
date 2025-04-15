import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { useAchievementContext } from '../providers/AchievementProvider';

export const useAchievement = () => {
    const dispatch: AppDispatch = useDispatch();
    const { updateMetrics, unlockedAchievements, resetStorage } = useAchievementContext() || {};
    const metrics = useSelector((state: RootState) => state.achievements.metrics);
    const notifications = useSelector((state: RootState) => state.notifications.notifications);
    const config = useSelector((state: RootState) => state.achievements.config);

    return {
        metrics: metrics,
        unlockedAchievements: unlockedAchievements || [],
        notifications: notifications,
        config: config,
        updateMetrics: updateMetrics || (() => {}),
        resetStorage: resetStorage || (() => {}),
    };
};