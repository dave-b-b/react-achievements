import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

export const useAchievementState = () => {
    const metrics = useSelector((state: RootState) => state.achievements.metrics);
    const previouslyAwardedAchievements = useSelector((state: RootState) => state.achievements.previouslyAwardedAchievements);

    return {
        metrics,
        previouslyAwardedAchievements,
    };
};