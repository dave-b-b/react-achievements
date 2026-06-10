import type {
  AchievementClient,
  AchievementClientMutationResult,
  AchievementClientSnapshot,
  AchievementDto,
  CustomAchievementDetails,
  SimpleAchievementConfig,
  SimpleAchievementDetails,
} from '../../src';

type MetricValue = unknown;
type Metrics = Record<string, MetricValue>;
type EventMapping = Record<
  string,
  string | ((payload: unknown, currentMetrics: Metrics) => Metrics)
>;

export interface MockAchievementClientOptions {
  achievements: SimpleAchievementConfig;
  initialMetrics?: Metrics;
  initiallyUnlockedIds?: string[];
  eventMapping?: EventMapping;
}

interface MockAchievementRecord {
  metric: string;
  threshold: string;
  id: string;
  details: SimpleAchievementDetails | CustomAchievementDetails;
  isUnlocked: (metrics: Metrics) => boolean;
}

const isCustomAchievement = (
  details: SimpleAchievementDetails | CustomAchievementDetails
): details is CustomAchievementDetails => (
  'condition' in details && typeof details.condition === 'function'
);

const getDefaultDescription = (metric: string, threshold: string): string => {
  const numericThreshold = Number(threshold);

  if (!Number.isNaN(numericThreshold)) {
    return `Reach ${numericThreshold} ${metric}`;
  }

  return `Achieve ${threshold} for ${metric}`;
};

const createRecords = (achievements: SimpleAchievementConfig): MockAchievementRecord[] => (
  Object.entries(achievements).flatMap(([metric, metricAchievements]) =>
    Object.entries(metricAchievements).map(([threshold, details], index) => {
      const id = isCustomAchievement(details)
        ? `${metric}_custom_${threshold === 'custom' ? index + 1 : threshold}`
        : `${metric}_${threshold}`;

      return {
        metric,
        threshold,
        id,
        details,
        isUnlocked: (metrics: Metrics) => {
          if (isCustomAchievement(details)) {
            return details.condition(metrics);
          }

          const value = metrics[metric];
          const numericThreshold = Number(threshold);

          if (!Number.isNaN(numericThreshold)) {
            return typeof value === 'number' && value >= numericThreshold;
          }

          if (threshold === 'true') {
            return value === true;
          }

          if (threshold === 'false') {
            return value === false;
          }

          return value === threshold;
        },
      };
    })
  )
);

export const createSnapshotFromConfig = (
  achievements: SimpleAchievementConfig,
  metrics: Metrics = {},
  unlockedIds: string[] = [],
  unlockedAt: Record<string, string> = {}
): AchievementClientSnapshot => {
  const unlockedIdSet = new Set(unlockedIds);
  const allAchievements = createRecords(achievements).map<AchievementDto>((record) => ({
    id: record.id,
    title: record.details.title,
    description: record.details.description || getDefaultDescription(record.metric, record.threshold),
    icon: record.details.icon,
    iconKey: record.details.icon,
    confetti: record.details.confetti,
    isUnlocked: unlockedIdSet.has(record.id),
    unlockedAt: unlockedAt[record.id] || null,
  }));
  const unlockedAchievements = allAchievements.filter((achievement) => achievement.isUnlocked);

  return {
    achievements: allAchievements,
    unlockedIds: unlockedAchievements.map((achievement) => achievement.id),
    unlockedAchievements,
    unlockedCount: unlockedAchievements.length,
    totalCount: allAchievements.length,
    metrics,
  };
};

export const createMockAchievementClient = ({
  achievements,
  initialMetrics = {},
  initiallyUnlockedIds = [],
  eventMapping = {},
}: MockAchievementClientOptions): AchievementClient => {
  let metrics: Metrics = { ...initialMetrics };
  let unlockedIds = [...initiallyUnlockedIds];
  let unlockedAt: Record<string, string> = {};

  const evaluate = (): AchievementClientMutationResult => {
    const previousUnlockedIds = new Set(unlockedIds);
    const now = new Date().toISOString();
    const records = createRecords(achievements);

    records.forEach((record) => {
      if (!previousUnlockedIds.has(record.id) && record.isUnlocked(metrics)) {
        unlockedIds.push(record.id);
        unlockedAt[record.id] = now;
      }
    });

    const snapshot = createSnapshotFromConfig(achievements, metrics, unlockedIds, unlockedAt);
    const newlyUnlocked = snapshot.unlockedAchievements.filter(
      (achievement) => !previousUnlockedIds.has(achievement.id)
    );

    return { snapshot, newlyUnlocked };
  };

  const getSnapshot = async () => createSnapshotFromConfig(
    achievements,
    metrics,
    unlockedIds,
    unlockedAt
  );

  return {
    getSnapshot,

    async track(metric, value) {
      metrics = { ...metrics, [metric]: value };
      return evaluate();
    },

    async trackMany(nextMetrics) {
      metrics = { ...metrics, ...nextMetrics };
      return evaluate();
    },

    async increment(metric, amount = 1) {
      const current = typeof metrics[metric] === 'number' ? metrics[metric] as number : 0;
      metrics = { ...metrics, [metric]: current + amount };
      return evaluate();
    },

    async event(name, payload) {
      const mapping = eventMapping[name];

      if (!mapping) {
        return { snapshot: await getSnapshot(), newlyUnlocked: [] };
      }

      const nextMetrics = typeof mapping === 'string'
        ? { [mapping]: payload }
        : mapping(payload, { ...metrics });

      metrics = { ...metrics, ...nextMetrics };
      return evaluate();
    },

    async reset() {
      metrics = { ...initialMetrics };
      unlockedIds = [...initiallyUnlockedIds];
      unlockedAt = {};
      return getSnapshot();
    },
  };
};

