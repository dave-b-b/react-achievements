import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { setMetrics } from '../redux/achievementSlice';
import { AchievementMetrics } from '../types';

export const useAchievement = () => {
    const dispatch: AppDispatch = useDispatch();
    const metrics = useSelector((state: RootState) => state.achievements.metrics);
    const unlockedAchievements = useSelector((state: RootState) => state.achievements.unlockedAchievements);
    const notifications = useSelector((state: RootState) => state.notifications.notifications);
    const config = useSelector((state: RootState) => state.achievements.config);

    const updateMetrics = (newMetrics: AchievementMetrics | ((prevMetrics: AchievementMetrics) => AchievementMetrics)) => {
        dispatch(setMetrics(typeof newMetrics === 'function' ? newMetrics(metrics) : newMetrics));
    };

    return {
        metrics,
        unlockedAchievements,
        notifications,
        config,
        updateMetrics,
    };
};