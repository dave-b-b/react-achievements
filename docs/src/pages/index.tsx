import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const heroImage = useBaseUrl('/img/demo-v4-4.gif');

  return (
    <header className={styles.heroBanner}>
      <div className={clsx('container', styles.heroGrid)}>
        <div className={styles.heroContent}>
          <p className={styles.heroKicker}>React achievement tracking and UI</p>
          <Heading as="h1" className={styles.heroTitle}>
            React Achievements
          </Heading>
          <p className={styles.heroSubtitle}>
            Add progress tracking, unlock notifications, compact badge modals, and celebration
            effects to React apps with one provider and a context-aware widget.
          </p>
          <div className={styles.buttons}>
            <Link
              className={clsx('button button--primary button--lg', styles.primaryButton)}
              to="/docs/getting-started/quick-start">
              Get Started
            </Link>
            <Link
              className={clsx('button button--secondary button--lg', styles.secondaryButton)}
              to="/docs/guides/styling">
              Customize UI
            </Link>
          </div>
          <dl className={styles.heroStats} aria-label="React Achievements highlights">
            <div>
              <dt>v4</dt>
              <dd>Simple API</dd>
            </div>
            <div>
              <dt>3</dt>
              <dd>UI surfaces</dd>
            </div>
            <div>
              <dt>0</dt>
              <dd>external UI peers</dd>
            </div>
          </dl>
        </div>
        <figure className={styles.heroPreview}>
          <img
            className={styles.heroImage}
            src={heroImage}
            alt="React Achievements 4.4 compact badge modal and configurable confetti in a LearnQuest demo app"
          />
        </figure>
      </div>
    </header>
  );
}

function HomepageQuickStart() {
  return (
    <section className={styles.quickStart}>
      <div className={clsx('container', styles.quickStartGrid)}>
        <div>
          <p className={styles.sectionKicker}>Default integration</p>
          <Heading as="h2" className={styles.sectionTitle}>
            One provider. One widget. Built-in achievement history.
          </Heading>
          <p className={styles.sectionText}>
            Use `AchievementsWidget` for the default badge button and modal, switch to
            compact square badges for dense catalogs, or open the same modal from your
            own drawer row, nav item, or profile menu.
          </p>
          <div className={styles.inlineLinks}>
            <Link to="/docs/getting-started/v4-feature-setup">Full setup checklist</Link>
            <Link to="/docs/recipes/common-patterns">Common patterns</Link>
          </div>
        </div>
        <pre className={styles.codePanel}>
          <code>{`<AchievementProvider achievements={achievements}>
  <Game />
  <AchievementsWidget
    density="compact"
    modalBackdropBlur={2}
    hideModalScrollbar
  />
</AchievementProvider>`}</code>
        </pre>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="React Achievements"
      description="Achievement tracking, notifications, badge modals, and gamification UI for React applications.">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <HomepageQuickStart />
      </main>
    </Layout>
  );
}
