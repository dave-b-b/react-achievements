import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'React Achievements',
  tagline: 'A flexible achievement system for React applications',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://dave-b-b.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/react-achievements/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'dave-b-b', // Usually your GitHub org/user name.
  projectName: 'react-achievements', // Usually your repo name.

  onBrokenLinks: 'warn', // Change to 'throw' for production

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  plugins: [
    [
      'docusaurus-plugin-typedoc',
      {
        entryPoints: ['../src/index.ts'],
        tsconfig: '../tsconfig.json',
        out: 'api-reference',
        hidePageTitle: true,
        readme: 'none',
        plugin: ['typedoc-plugin-markdown', 'typedoc-plugin-frontmatter'],
        exclude: [
          '../src/**/__mocks__/**',
          '../src/**/__tests__/**',
          '../src/**/test-utils/**',
          '../src/**/*.test.ts',
          '../src/**/*.test.tsx',
          '../src/**/setupTests.ts',
        ],
        indexFrontmatter: {
          title: 'API Reference',
          sidebar_label: 'API Index',
        },
      },
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          path: '.', // Look for docs in current directory instead of docs/
          routeBasePath: 'docs',
          sidebarPath: './sidebars.ts',
          exclude: [
            '**/node_modules/**',
            '**/.docusaurus/**',
            '**/build/**',
            '**/src/**',
            '**/static/**',
            '**/*.config.*',
            '**/*.ts',
            '**/*.tsx',
            '**/*.js',
            '**/*.jsx',
            '**/package*.json',
            '**/.gitignore',
            '**/tsconfig.json',
            '**/README.md', // Exclude root README
          ],
          editUrl:
            'https://github.com/dave-b-b/react-achievements/tree/main/docs/',
        },
        blog: false, // Disable blog
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/react-achievements-logo.png',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'React Achievements',
      logo: {
        alt: 'React Achievements Logo',
        src: 'img/react-achievements-logo.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {
          type: 'docSidebar',
          sidebarId: 'apiSidebar',
          position: 'left',
          label: 'API',
        },
        {
          href: 'https://github.com/dave-b-b/react-achievements',
          label: 'GitHub',
          position: 'right',
        },
        {
          type: 'docsVersionDropdown',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Getting Started',
              to: '/docs/intro',
            },
            {
              label: 'API Reference',
              to: '/docs/api-intro',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub Issues',
              href: 'https://github.com/dave-b-b/react-achievements/issues',
            },
            {
              label: 'NPM',
              href: 'https://www.npmjs.com/package/react-achievements',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/dave-b-b/react-achievements',
            },
            {
              label: 'Changelog',
              href: 'https://github.com/dave-b-b/react-achievements/blob/main/CHANGELOG.md',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} React Achievements. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
