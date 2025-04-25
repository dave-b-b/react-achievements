import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { useAchievementContext } from '../providers/AchievementProvider';

export const useAchievement = () => {
    const { updateMetrics, unlockedAchievements, resetStorage } = useAchievementContext();
    const metrics = useSelector((state: RootState) => state.achievements.metrics);
    const config = useSelector((state: RootState) => state.achievements.config);

    return {
        metrics,
        unlockedAchievements,
        config,
        updateMetrics,
        resetStorage,
    };
};