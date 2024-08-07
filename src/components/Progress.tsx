import React from 'react';
import { useAchievement } from '../context/AchievementContext';

interface ProgressProps {
    style?: React.CSSProperties;
}

const Progress: React.FC<ProgressProps> = ({ style }) => {
    const { metric, levels, achievedLevels } = useAchievement();
    const maxLevel = levels[levels.length - 1];
    const progress = (metric / maxLevel.threshold) * 100;

    const containerStyle: React.CSSProperties = {
        width: '100%',
        backgroundColor: '#e0e0e0',
        borderRadius: '8px',
        overflow: 'hidden',
        ...style,
    };

    const barStyle: React.CSSProperties = {
        width: `${progress}%`,
        height: '20px',
        backgroundColor: '#4caf50',
        transition: 'width 0.5s ease-in-out',
    };

    return (
        <div style={containerStyle}>
            <div style={barStyle} role="progressbar" aria-valuenow={metric} aria-valuemin={0} aria-valuemax={maxLevel.threshold} />
            <p>Level: {achievedLevels.length} / {levels.length}</p>
            <p>Progress: {metric} / {maxLevel.threshold}</p>
        </div>
    );
};

export default React.memo(Progress);