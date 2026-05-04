import { rmSync } from 'node:fs';
import { URL } from 'node:url';
import { rollup } from 'rollup';
import configs from '../rollup.config.mjs';

const builds = Array.isArray(configs) ? configs : [configs];
const distDir = new URL('../dist', import.meta.url);

rmSync(distDir, { recursive: true, force: true });

for (const config of builds) {
  const { output, ...inputOptions } = config;
  const outputs = Array.isArray(output) ? output : [output];
  const bundle = await rollup(inputOptions);

  for (const outputOptions of outputs) {
    await bundle.write(outputOptions);
  }

  await bundle.close();
}

globalThis.process?.exit(0);
