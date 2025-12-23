import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';
import MountainSvg from '@site/static/img/undraw_docusaurus_mountain.svg';
import TreeSvg from '@site/static/img/undraw_docusaurus_tree.svg';
import ReactSvg from '@site/static/img/undraw_docusaurus_react.svg';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Simple API',
    Svg: MountainSvg,
    description: (
      <>
        Get started in minutes with the Simple API. Define achievements using intuitive
        threshold-based configuration that reduces complexity by 90%.
      </>
    ),
  },
  {
    title: 'Framework Agnostic',
    Svg: TreeSvg,
    description: (
      <>
        Works with Redux, Zustand, Context API, or any state management solution.
        Built-in persistence and automatic notifications out of the box.
      </>
    ),
  },
  {
    title: 'Fully Customizable',
    Svg: ReactSvg,
    description: (
      <>
        Customize every aspect from UI components to storage backends. Built with React
        and TypeScript for type-safe achievement tracking.
      </>
    ),
  },
];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
