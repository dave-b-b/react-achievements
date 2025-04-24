import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import replace from '@rollup/plugin-replace';

// Add the replace plugin to handle `this` issues in libraries like @reduxjs/toolkit
export default {
    input: 'src/index.ts',
    output: [
        {
            file: 'dist/index.cjs.js',
            format: 'cjs',
        },
        {
            file: 'dist/index.esm.js',
            format: 'esm',
        }
    ],
    plugins: [
        replace({
            preventAssignment: true,
            'this': 'undefined',
        }),
        resolve(),
        commonjs(),
        typescript({ tsconfig: './tsconfig.json' })
    ],
    external: ['react', 'react-dom']
};
