import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  label: string;
  title: string;
  description: ReactNode;
  to: string;
  accent: 'cyan' | 'gold' | 'green';
};

const FeatureList: FeatureItem[] = [
  {
    label: 'Track',
    title: 'Use the v4 Simple API',
    description: (
      <>
        Define score, streak, onboarding, profile, and custom achievements in one config,
        then update progress with `track`, `increment`, or event-based engine calls.
      </>
    ),
    to: '/docs/getting-started/quick-start',
    accent: 'cyan',
  },
  {
    label: 'Display',
    title: 'Ship the widget or inline list',
    description: (
      <>
        Drop in `AchievementsWidget`, open `AchievementsModal` from an existing control,
        or render `AchievementsList` directly inside a drawer, profile page, or dashboard.
      </>
    ),
    to: '/docs/recipes/common-patterns',
    accent: 'gold',
  },
  {
    label: 'Customize',
    title: 'Tune the achievement experience',
    description: (
      <>
        Use compact badge grids, set modal backdrop blur, hide scrollbar chrome, theme the
        built-in UI, or replace notifications, modals, and confetti entirely.
      </>
    ),
    to: '/docs/guides/styling',
    accent: 'green',
  },
];

function Feature({label, title, description, to, accent}: FeatureItem) {
  return (
    <div className={clsx('col col--4', styles.featureColumn)}>
      <div className={styles.featureCard} data-accent={accent}>
        <span className={styles.featureLabel}>{label}</span>
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
        <Link className={styles.featureLink} to={to}>
          Read the guide
        </Link>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <p className={styles.sectionKicker}>Built for real React apps</p>
          <Heading as="h2">Achievement tracking, UI, and persistence in one package.</Heading>
        </div>
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
