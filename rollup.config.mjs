import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';

const entries = [
  { name: 'index', input: 'src/index.ts' },
  { name: 'web', input: 'src/web.ts' },
  { name: 'headless', input: 'src/headless.ts' },
];

const external = ['react', 'achievements-engine', 'canvas-confetti'];

const jsBuilds = entries.map(({ name, input }) => ({
  input,
  external,
  output: [
    {
      file: `dist/${name}.esm.js`,
      format: 'esm',
      sourcemap: true,
    },
    {
      file: `dist/${name}.cjs`,
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
    },
  ],
  plugins: [
    peerDepsExternal(),
    resolve(),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.rollup.json',
      exclude: [
        '**/__tests__/**',
        '**/__mocks__/**',
        '**/*.test.ts',
        '**/*.test.tsx',
        'stories/**/*',
      ],
    }),
  ],
}));

const declarationBuilds = entries.map(({ name, input }) => ({
  input,
  output: [{ file: `dist/${name}.d.ts`, format: 'esm' }],
  plugins: [dts()],
}));

export default [...jsBuilds, ...declarationBuilds];
