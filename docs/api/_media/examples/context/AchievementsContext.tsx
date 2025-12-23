import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AchievementDetails, AchievementProvider, AchievementConfiguration, AchievementMetricArrayValue, AchievementState, StorageType } from '../../../src/index';

/**
 * Example implementation using React Context API for managing achievements state
 */

// Define the state type
interface AchievementsState {
  unlockedAchievements: AchievementDetails[];
  progress: Record<string, number>;
}

// Define action types
type AchievementsAction =
  | { type: 'UNLOCK_ACHIEVEMENT'; achievement: AchievementDetails }
  | { type: 'UPDATE_PROGRESS'; achievementId: string; progress: number };

// Create the context
const AchievementsStateContext = createContext<AchievementsState | undefined>(undefined);
const AchievementsDispatchContext = createContext<React.Dispatch<AchievementsAction> | undefined>(undefined);

// Create the reducer
function achievementsReducer(state: AchievementsState, action: AchievementsAction): AchievementsState {
  switch (action.type) {
    case 'UNLOCK_ACHIEVEMENT':
      return {
        ...state,
        unlockedAchievements: state.unlockedAchievements.find((a) => a.achievementId === action.achievement.achievementId)
          ? state.unlockedAchievements
          : [...state.unlockedAchievements, action.achievement],
      };
    case 'UPDATE_PROGRESS':
      return {
        ...state,
        progress: {
          ...state.progress,
          [action.achievementId]: action.progress,
        },
      };
    default:
      return state;
  }
}

// Example achievement configuration
const achievementConfig: AchievementConfiguration = {
  score: [{
    isConditionMet: (value: AchievementMetricArrayValue, _state: AchievementState) => {
      const numValue = Array.isArray(value) ? value[0] : value;
      return typeof numValue === 'number' && numValue >= 100;
    },
    achievementDetails: {
      achievementId: 'score_100',
      achievementTitle: 'Century!',
      achievementDescription: 'Score 100 points',
      achievementIconKey: 'trophy'
    }
  }],
  login: [{
    isConditionMet: (value: AchievementMetricArrayValue, _state: AchievementState) => {
      const boolValue = Array.isArray(value) ? value[0] : value;
      return typeof boolValue === 'boolean' && boolValue === true;
    },
    achievementDetails: {
      achievementId: 'first_login',
      achievementTitle: 'First Login',
      achievementDescription: 'You logged in for the first time',
      achievementIconKey: 'login'
    }
  }]
};

// Custom icons
const icons = {
  trophy: '🏆',
  login: '🔑',
  default: '🎖️'
};

// Create the provider component
export const ContextAchievementsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(achievementsReducer, {
    unlockedAchievements: [],
    progress: {},
  });

  const _handleUnlock = (achievement: AchievementDetails) => {
    dispatch({ type: 'UNLOCK_ACHIEVEMENT', achievement });
  };

  const _handleProgress = (achievementId: string, progress: number) => {
    dispatch({ type: 'UPDATE_PROGRESS', achievementId, progress });
  };

  return (
    <AchievementsStateContext.Provider value={state}>
      <AchievementsDispatchContext.Provider value={dispatch}>
        <AchievementProvider
          achievements={achievementConfig}
          storage={StorageType.Memory}
          icons={icons}
        >
          {children}
        </AchievementProvider>
      </AchievementsDispatchContext.Provider>
    </AchievementsStateContext.Provider>
  );
};

// Create hooks for using the context
export function useAchievementsState() {
  const context = useContext(AchievementsStateContext);
  if (context === undefined) {
    throw new Error('useAchievementsState must be used within a ContextAchievementsProvider');
  }
  return context;
}

export function useAchievementsDispatch() {
  const context = useContext(AchievementsDispatchContext);
  if (context === undefined) {
    throw new Error('useAchievementsDispatch must be used within a ContextAchievementsProvider');
  }
  return context;
} 